// Базовая инициализация Vue приложения без UI библиотек
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// Используем Pinia для управления состоянием
app.use(pinia)

// Монтируем приложение к элементу с id="app"
app.mount('#app')