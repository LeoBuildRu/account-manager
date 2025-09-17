<template>
  <!-- Базовый интерфейс с карточками учетных записей -->
  <div class="app-container">
    <h1>Управление учетными записями</h1>
    <button @click="addAccount">Добавить учетную запись</button>
    
    <div v-if="accounts.length === 0">
      Нет добавленных учетных записей
    </div>
    
    <div v-for="account in accounts" :key="account.id" class="account-item">
      <h3>Учетная запись</h3>
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
      
      <button @click="removeAccount(account.id)">Удалить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAccountStore, Account } from './stores/accounts'

const accountStore = useAccountStore()
const accounts = ref<Account[]>([])

// Загрузка данных при монтировании
onMounted(() => {
  accountStore.loadFromLocalStorage()
  accounts.value = [...accountStore.accounts]
  
  // Подписка на изменения в store
  accountStore.$subscribe((mutation, state) => {
    accounts.value = [...state.accounts]
  })
})

// Добавление новой учетной записи
const addAccount = () => {
  accountStore.addAccount()
}

// Удаление учетной записи
const removeAccount = (id: string) => {
  accountStore.removeAccount(id)
}
</script>

<style scoped>
/* Базовые стили приложения */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>