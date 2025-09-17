<template>
  <!-- Улучшенная форма с базовой валидацией -->
  <div class="account-item">
    <div class="account-header">
      <h3>Учетная запись</h3>
      <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="removeAccount" />
    </div>
    
    <div class="p-field">
      <label>Метка</label>
      <InputText 
        v-model="tempAccount.label" 
        placeholder="Введите метки через ;" 
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.label }"
      />
      <small class="p-error">{{ validationErrors.label }}</small>
      <small>Максимум 50 символов</small>
    </div>
    
    <div class="p-field">
      <label>Тип записи</label>
      <Dropdown 
        v-model="tempAccount.type" 
        :options="accountTypes" 
        placeholder="Выберите тип"
        @change="onTypeChange"
      />
    </div>
    
    <div class="p-field">
      <label>Логин</label>
      <InputText 
        v-model="tempAccount.login" 
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.login }"
      />
      <small class="p-error">{{ validationErrors.login }}</small>
      <small>Обязательное поле, максимум 100 символов</small>
    </div>
    
    <div class="p-field" v-if="tempAccount.type === 'Local'">
      <label>Пароль</label>
      <InputText 
        v-model="tempAccount.password" 
        type="password"
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.password }"
      />
      <small class="p-error">{{ validationErrors.password }}</small>
      <small>Обязательное поле, максимум 100 символов</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountStore, Account } from '@/stores/accounts'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits(['update', 'remove'])

const accountStore = useAccountStore()
const tempAccount = ref<Account>({ ...props.account })
const validationErrors = ref({
  label: '',
  login: '',
  password: ''
})

// Получаем доступ к типам записей из store
const accountTypes = computed(() => accountStore.accountTypes)

// При изменении типа записи обрабатываем скрытие пароля
const onTypeChange = () => {
  if (tempAccount.value.type === 'LDAP') {
    tempAccount.value.password = null
  }
  validateAndSave()
}

// Валидация полей
const validateFields = (): boolean => {
  let isValid = true
  validationErrors.value = { label: '', login: '', password: '' }

  // Валидация метки
  if (tempAccount.value.label && tempAccount.value.label.length > 50) {
    validationErrors.value.label = 'Метка не должна превышать 50 символов'
    isValid = false
  }

  // Валидация логина
  if (!tempAccount.value.login) {
    validationErrors.value.login = 'Логин обязателен для заполнения'
    isValid = false
  } else if (tempAccount.value.login.length > 100) {
    validationErrors.value.login = 'Логин не должен превышать 100 символов'
    isValid = false
  }

  // Валидация пароля (только для локального типа)
  if (tempAccount.value.type === 'Local') {
    if (!tempAccount.value.password) {
      validationErrors.value.password = 'Пароль обязателен для заполнения'
      isValid = false
    } else if (tempAccount.value.password.length > 100) {
      validationErrors.value.password = 'Пароль не должен превышать 100 символов'
      isValid = false
    }
  }

  return isValid
}

// Валидация и сохранение учетной записи
const validateAndSave = () => {
  if (validateFields()) {
    // Преобразуем метку в массив объектов
    const labelsArray = accountStore.processLabel(tempAccount.value.label)
    
    const updatedAccount: Account = {
      ...tempAccount.value,
      labelsArray
    }
    
    emit('update', updatedAccount)
    return true
  }
  return false
}

// Удаление учетной записи
const removeAccount = () => {
  emit('remove', props.account.id)
}

// Синхронизация с изменениями из родителя
watch(() => props.account, (newVal) => {
  tempAccount.value = { ...newVal }
})

// При монтировании сразу проверяем валидность
onMounted(() => {
  validateAndSave()
})
</script>