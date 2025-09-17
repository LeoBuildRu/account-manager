// Базовый store для управления учетными записями
import { defineStore } from 'pinia'

export interface Account {
  id: string
  label: string
  type: 'LDAP' | 'Local'
  login: string
  password: string | null
  labelsArray: { text: string }[]
}

interface AccountsState {
  accounts: Account[]
}

export const useAccountStore = defineStore('accounts', {
  state: (): AccountsState => ({
    accounts: []
  }),
  actions: {
    // Загрузка данных из localStorage
    loadFromLocalStorage() {
      const savedAccounts = localStorage.getItem('accounts')
      if (savedAccounts) {
        this.accounts = JSON.parse(savedAccounts)
      }
    },
    
    // Сохранение данных в localStorage
    saveToLocalStorage() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts))
    },
    
    // Добавление новой учетной записи
    addAccount() {
      const newAccount: Account = {
        id: Date.now().toString(),
        label: '',
        type: 'Local',
        login: '',
        password: null,
        labelsArray: []
      }
      this.accounts.push(newAccount)
      this.saveToLocalStorage()
    },
    
    // Обновление учетной записи
    updateAccount(updatedAccount: Account) {
      const index = this.accounts.findIndex(a => a.id === updatedAccount.id)
      if (index !== -1) {
        this.accounts[index] = updatedAccount
      }
      this.saveToLocalStorage()
    },
    
    // Удаление учетной записи
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(account => account.id !== id)
      this.saveToLocalStorage()
    },
    
    // Преобразование строки меток в массив объектов
    processLabel(label: string): { text: string }[] {
      return label.split(';')
        .map(text => text.trim())
        .filter(text => text.length > 0)
        .map(text => ({ text }))
    }
  },
  getters: {
    // Доступные типы учетных записей
    accountTypes: () => ['LDAP', 'Local']
  }
})