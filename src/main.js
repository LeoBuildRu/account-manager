import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Tooltip from 'primevue/tooltip'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(PrimeVue, {
  ripple: true
})

app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Button', Button)

app.directive('tooltip', Tooltip)

app.use(pinia)
app.mount('#app')