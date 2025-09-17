import { defineStore } from 'pinia'

export interface Account {
  id: string
  label: string
  type: 'LDAP' | 'Local'
  login: string
  password: string | null
  labelsArray: { text: string }[]
  isNew?: boolean
}

interface AccountsState {
  accounts: Account[]
}

export const useAccountStore = defineStore('accounts', {
  state: (): AccountsState => ({
    accounts: []
  }),
  actions: {
    loadFromLocalStorage() {
      const savedAccounts = localStorage.getItem('accounts')
      if (savedAccounts) {
        this.accounts = JSON.parse(savedAccounts)
      }
    },
    
    saveToLocalStorage() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts))
    },
    
    addAccount() {
      const newAccount: Account = {
        id: Date.now().toString(),
        label: '',
        type: 'Local',
        login: '',
        password: null,
        labelsArray: [],
        isNew: true
      }
      this.accounts.push(newAccount)
      this.saveToLocalStorage()
    },
    
    updateAccount(updatedAccount: Account) {
      const index = this.accounts.findIndex(a => a.id === updatedAccount.id)
      if (index !== -1) {
        // Сохраняем флаг isNew для анимации
        const isNew = this.accounts[index].isNew
        this.accounts[index] = { ...updatedAccount, isNew }
      }
      this.saveToLocalStorage()
    },
    
    removeAccount(id: string) {
      this.accounts = this.accounts.filter(account => account.id !== id)
      this.saveToLocalStorage()
    },
    
    processLabel(label: string): { text: string }[] {
      return label.split(';')
        .map(text => text.trim())
        .filter(text => text.length > 0)
        .map(text => ({ text }))
    }
  },
  getters: {
    accountTypes: () => ['LDAP', 'Local']
  }
})