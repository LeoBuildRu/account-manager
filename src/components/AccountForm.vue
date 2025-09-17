<template>
  <!-- Базовая форма учетной записи без валидации -->
  <div class="account-item">
    <div class="account-header">
      <h3>Учетная запись</h3>
      <button @click="removeAccount">Удалить</button>
    </div>
    
    <div>
      <label>Метка</label>
      <input v-model="account.label" placeholder="Введите метки через ;" />
    </div>
    
    <div>
      <label>Тип записи</label>
      <select v-model="account.type">
        <option value="LDAP">LDAP</option>
        <option value="Local">Локальная</option>
      </select>
    </div>
    
    <div>
      <label>Логин</label>
      <input v-model="account.login" />
    </div>
    
    <div v-if="account.type === 'Local'">
      <label>Пароль</label>
      <input v-model="account.password" type="password" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Account } from '@/stores/accounts'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits(['update', 'remove'])

// Удаление учетной записи
const removeAccount = () => {
  emit('remove', props.account.id)
}
</script>

<style scoped>
/* Базовые стили для карточки учетной записи */
.account-item {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.account-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
</style>