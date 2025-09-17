<template>
  <!-- Табличный интерфейс управления учетными записями -->
  <div class="app-container">
    <div class="table-container">
      <div class="table-header">
        <h1>Управление учетными записями</h1>
        <div class="table-actions">
          <Button 
            label="Добавить учетную запись" 
            icon="pi pi-plus" 
            @click="addAccount" 
            class="p-button-primary"
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
            <th></th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="accounts.length === 0">
            <td colspan="5" class="text-center p-8">
              Нет добавленных учетных записей
            </td>
          </tr>
          <tr v-for="account in accounts" :key="account.id">
            <td>
              <InputText 
                v-model="account.label" 
                placeholder="Введите метки через ;" 
                @blur="validateAndSave(account)"
                :class="{ 'p-invalid': validationErrors[account.id]?.label }"
              />
              <small class="p-error" v-if="validationErrors[account.id]?.label">
                {{ validationErrors[account.id].label }}
              </small>
              <small>Максимум 50 символов</small>
            </td>
            <td>
              <Dropdown 
                v-model="account.type" 
                :options="accountTypes" 
                placeholder="Выберите тип"
                @change="onTypeChange(account)"
              />
            </td>
            <td>
              <InputText 
                v-model="account.login" 
                @blur="validateAndSave(account)"
                :class="{ 'p-invalid': validationErrors[account.id]?.login }"
              />
              <small class="p-error" v-if="validationErrors[account.id]?.login">
                {{ validationErrors[account.id].login }}
              </small>
              <small>Обязательное поле, максимум 100 символов</small>
            </td>
            <td>
              <InputText 
                v-if="account.type === 'Local'" 
                v-model="account.password" 
                type="password"
                @blur="validateAndSave(account)"
                :class="{ 'p-invalid': validationErrors[account.id]?.password }"
              />
              <small class="p-error" v-if="validationErrors[account.id]?.password">
                {{ validationErrors[account.id].password }}
              </small>
              <small v-if="account.type === 'Local'">Обязательное поле, максимум 100 символов</small>
              <span v-else class="text-gray-500">Пароль скрыт для LDAP</span>
            </td>
            <td>
              <Button 
                icon="pi pi-trash" 
                class="p-button-text p-button-danger" 
                @click="removeAccount(account.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAccountStore, Account } from './stores/accounts'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

const accountStore = useAccountStore()
const accounts = ref<Account[]>([])
const validationErrors = ref<Record<string, any>>({})

onMounted(() => {
  accountStore.loadFromLocalStorage()
  accounts.value = [...accountStore.accounts]
  
  // Подписываемся на изменения в store
  accountStore.$subscribe((mutation, state) => {
    accounts.value = [...state.accounts]
  })
})

const addAccount = () => {
  accountStore.addAccount()
}

const onTypeChange = (account: Account) => {
  if (account.type === 'LDAP') {
    account.password = null
  }
  validateAndSave(account)
}

const validateFields = (account: Account): boolean => {
  let isValid = true
  if (!validationErrors.value[account.id]) {
    validationErrors.value[account.id] = {}
  }
  
  const errors = validationErrors.value[account.id]
  errors.label = ''
  errors.login = ''
  errors.password = ''

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

const removeAccount = (id: string) => {
  accountStore.removeAccount(id)
}

const accountTypes = ['LDAP', 'Local']
</script>