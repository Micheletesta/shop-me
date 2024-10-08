import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js';
import { createStore } from 'vuex'

/* Theme variables */
//import './theme/variables.css';
// import { state, mutations, actions, getters } from './store/index.js'
// const store = createStore({
//   state: state,
//   mutations: mutations,
//   actions: actions,
//   getters: getters
// })
const app = createApp(App)
  .use(router)
// .use(store)
router.isReady().then(() => {
  app.mount('#app');
});
