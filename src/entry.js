import Selectix from './components/Selectix.vue'
import './style.css'

export { Selectix, install }

function install(app) {
  app.component('Selectix', Selectix)
}
