<template>
  <div class="account-item">
    <div class="account-header">
      <h3>Учетная запись</h3>
      <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="removeAccount" />
    </div>
    
    <div class="p-field">
      <label class="flex items-center">
        Метка
        <span 
          v-tooltip="{
            content: 'Максимум 50 символов. Вводите текстовые метки, разделенные знаком ;',
            position: 'top'
          }" 
          class="input-hint ml-2"
          data-testid="label-hint"
        >
          ?
        </span>
      </label>
      <InputText 
        v-model="tempAccount.label" 
        placeholder="Введите метки через ;" 
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.label }"
      />
      <div class="validation-error" :class="{ 'active': validationErrors.label }">
        {{ validationErrors.label }}
      </div>
    </div>
    
    <div class="p-field">
      <label class="flex items-center">
        Тип записи
        <span 
          v-tooltip="{
            content: 'Выберите тип учетной записи из предопределенных вариантов',
            position: 'top'
          }" 
          class="input-hint ml-2"
          data-testid="type-hint"
        >
          ?
        </span>
      </label>
      <Dropdown 
        v-model="tempAccount.type" 
        :options="accountTypes" 
        placeholder="Выберите тип"
        @change="onTypeChange"
        :class="{ 'p-invalid': validationErrors.type }"
      />
      <div class="validation-error" :class="{ 'active': validationErrors.type }">
        {{ validationErrors.type }}
      </div>
    </div>
    
    <div class="p-field">
      <label class="flex items-center">
        Логин
        <span 
          v-tooltip="{
            content: 'Обязательное поле, максимум 100 символов',
            position: 'top'
          }" 
          class="input-hint ml-2"
          data-testid="login-hint"
        >
          ?
        </span>
      </label>
      <InputText 
        v-model="tempAccount.login" 
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.login }"
      />
      <div class="validation-error" :class="{ 'active': validationErrors.login }">
        {{ validationErrors.login }}
      </div>
    </div>
    
    <div class="p-field" v-if="tempAccount.type === 'Local'">
      <label class="flex items-center">
        Пароль
        <span 
          v-tooltip="{
            content: 'Обязательное поле, максимум 100 символов',
            position: 'top'
          }" 
          class="input-hint ml-2"
          data-testid="password-hint"
        >
          ?
        </span>
      </label>
      <InputText 
        v-model="tempAccount.password" 
        type="password"
        @blur="validateAndSave"
        :class="{ 'p-invalid': validationErrors.password }"
      />
      <div class="validation-error" :class="{ 'active': validationErrors.password }">
        {{ validationErrors.password }}
      </div>
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
  password: '',
  type: ''
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
  validationErrors.value = { label: '', login: '', password: '', type: '' }

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
    } else if (tempAccount.value.password && tempAccount.value.password.length > 100) {
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