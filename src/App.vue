<template>
  <div class="app-container">
    <div class="table-container animate-scale-in">
      <div class="table-header">
        <h1>
          <i class="pi pi-users text-indigo-600"></i>
          Управление учетными записями
        </h1>
        <div class="table-actions">
          <Button 
            icon="pi pi-plus" 
            class="add-account-button"
            @click="addAccount"
            v-tooltip="{
              content: 'Добавить учетную запись',
              position: 'top'
            }"
            aria-label="Добавить учетную запись"
          />
        </div>
      </div>
      
      <table class="min-w-full">
        <thead class="table-head">
          <tr>
            <th>Метки</th>
            <th>Тип записи</th>
            <th>Логин</th>
            <th>Пароль</th>
            <th class="text-right pr-4"></th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="accounts.length === 0" class="animate-fade-in">
            <td colspan="5">
              <div class="empty-state">
                <i class="pi pi-user"></i>
                <h3>Нет добавленных учетных записей</h3>
                <p>Создайте свою первую учетную запись для управления доступом. Вы можете добавить как локальные, так и LDAP-учетные записи.</p>
                <div class="empty-state-actions">
                  <Button 
                    label="Добавить запись" 
                    icon="pi pi-plus" 
                    @click="addAccount" 
                    class="p-button-primary"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr 
            v-for="account in accounts" 
            :key="account.id" 
            class="account-row"
            :class="{ 'animate-fade-in': account.isNew }"
          >
            <td data-label="Метки">
              <div class="input-group">
                <!-- Скрываем метки в табличном представлении, чтобы не влиять на высоту -->
                <div class="labels-container" style="display: none;">
                  <span 
                    v-for="(label, index) in account.labelsArray" 
                    :key="index"
                    class="label-tag"
                  >
                    {{ label.text }}
                  </span>
                </div>
                <InputText 
                  v-model="account.label" 
                  placeholder="Введите метки через ;" 
                  @blur="validateAndSave(account)"
                  :class="{ 'p-invalid': validationErrors[account.id]?.label }"
                />
                <div class="validation-error" :class="{ 'active': validationErrors[account.id]?.label }">
                  {{ validationErrors[account.id]?.label }}
                </div>
              </div>
            </td>
            
            <td data-label="Тип записи">
              <div class="input-group">
                <Dropdown 
                  v-model="account.type" 
                  :options="accountTypes" 
                  @change="onTypeChange(account)"
                  :class="{ 'p-invalid': validationErrors[account.id]?.type }"
                />
                <div class="validation-error" :class="{ 'active': validationErrors[account.id]?.type }">
                  {{ validationErrors[account.id]?.type }}
                </div>
              </div>
            </td>
            
            <td data-label="Логин">
              <div class="input-group">
                <InputText 
                  v-model="account.login" 
                  @blur="validateAndSave(account)"
                  :class="{ 'p-invalid': validationErrors[account.id]?.login }"
                />
                <div class="validation-error" :class="{ 'active': validationErrors[account.id]?.login }">
                  {{ validationErrors[account.id]?.login }}
                </div>
              </div>
            </td>
            
            <td data-label="Пароль">
              <div class="input-group" v-if="account.type === 'Local'">
                <InputText 
                  v-model="account.password" 
                  type="password"
                  @blur="validateAndSave(account)"
                  :class="{ 'p-invalid': validationErrors[account.id]?.password }"
                />
                <div class="validation-error" :class="{ 'active': validationErrors[account.id]?.password }">
                  {{ validationErrors[account.id]?.password }}
                </div>
              </div>
              <div v-else class="text-gray-500 italic flex items-center">
                <i class="pi pi-lock mr-2"></i>Пароль скрыт для LDAP
              </div>
            </td>
            
            <td data-label="Действия" class="text-right pr-4">
              <Button 
                icon="pi pi-trash" 
                class="p-button-text p-button-rounded p-button-lg p-button-danger hover:bg-red-50"
                @click="removeAccount(account.id)"
                aria-label="Удалить"
                v-tooltip="{
                  content: 'Удалить учетную запись',
                  position: 'top'
                }"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAccountStore, Account } from './stores/accounts'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

const accountStore = useAccountStore()
const accounts = ref<Account[]>([])
const validationErrors = ref<Record<string, any>>({})
const newAccountAnimationTimeouts = ref<Record<string, number>>({})

// Загружаем данные при монтировании
onMounted(() => {
  accountStore.loadFromLocalStorage()
  initializeAccounts()
  
  // Подписываемся на изменения в store
  const unsubscribe = accountStore.$subscribe((mutation, state) => {
    initializeAccounts()
  })
  
  // Очистка подписки при размонтировании
  onUnmounted(unsubscribe)
})

const initializeAccounts = () => {
  accounts.value = accountStore.accounts.map(account => ({
    ...account,
    isNew: account.isNew || false
  }))
  
  // Очищаем флаг isNew после анимации
  accountStore.accounts.forEach(account => {
    if (account.isNew && newAccountAnimationTimeouts.value[account.id]) {
      clearTimeout(newAccountAnimationTimeouts.value[account.id])
    }
    
    if (account.isNew) {
      newAccountAnimationTimeouts.value[account.id] = window.setTimeout(() => {
        const index = accountStore.accounts.findIndex(a => a.id === account.id)
        if (index !== -1) {
          accountStore.accounts[index].isNew = false
        }
      }, 300) as unknown as number
    }
  })
}

// Добавляем новый аккаунт
const addAccount = () => {
  accountStore.addAccount()
}

// Обработка изменения типа записи
const onTypeChange = (account: Account) => {
  if (account.type === 'LDAP') {
    account.password = null
  }
  validateAndSave(account)
}

// Валидация полей
const validateFields = (account: Account): boolean => {
  let isValid = true
  if (!validationErrors.value[account.id]) {
    validationErrors.value[account.id] = {}
  }
  
  const errors = validationErrors.value[account.id]
  errors.label = ''
  errors.login = ''
  errors.password = ''
  errors.type = ''

  // Валидация метки
  if (account.label && account.label.length > 50) {
    errors.label = 'Метка не должна превышать 50 символов'
    isValid = false
  }

  // Валидация логина
  if (!account.login) {
    errors.login = 'Логин обязателен для заполнения'
    isValid = false
  } else if (account.login.length > 100) {
    errors.login = 'Логин не должен превышать 100 символов'
    isValid = false
  }

  // Валидация пароля (только для локального типа)
  if (account.type === 'Local') {
    if (!account.password) {
      errors.password = 'Пароль обязателен для заполнения'
      isValid = false
    } else if (account.password && account.password.length > 100) {
      errors.password = 'Пароль не должен превышать 100 символов'
      isValid = false
    }
  }

  return isValid
}

// Валидация и сохранение учетной записи
const validateAndSave = (account: Account) => {
  if (validateFields(account)) {
    // Преобразуем метку в массив объектов
    const labelsArray = accountStore.processLabel(account.label)
    
    const updatedAccount: Account = {
      ...account,
      labelsArray
    }
    
    accountStore.updateAccount(updatedAccount)
    // Очищаем ошибки после успешного сохранения
    validationErrors.value[account.id] = {}
    return true
  }
  return false
}

// Удаление учетной записи
const removeAccount = (id: string) => {
  // Добавляем анимацию перед удалением
  const accountIndex = accounts.value.findIndex(a => a.id === id)
  if (accountIndex !== -1) {
    accounts.value[accountIndex].isNew = true
    
    setTimeout(() => {
      accountStore.removeAccount(id)
    }, 300)
  }
}

// Получаем типы записей
const accountTypes = ['LDAP', 'Local']
</script>

<style scoped>
/* Дополнительные стили для компонента */
.app-container {
  animation: fadeIn 0.4s ease-out;
  min-height: 100vh;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.account-row {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Мягкая анимация для ховера */
.account-row:hover {
  background-color: rgba(79, 70, 229, 0.03);
  transition: background-color 0.3s ease;
}

/* Современные эффекты для кнопок */
.p-button {
  will-change: transform, box-shadow;
}

.p-button:hover {
  will-change: unset;
}

/* Гарантируем правильное выравнивание заголовка и кнопки */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Ключевое исправление: все поля теперь имеют одинаковую высоту */
.input-group {
  height: var(--input-height) !important;
}

.p-inputtext, .p-dropdown {
  height: var(--input-height) !important;
}
</style>