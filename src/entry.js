import Selectly from './components/Selectly.vue'
import './style.css'

export { Selectly, install }

function install(app) {
  app.component('Selectly', Selectly)
}
