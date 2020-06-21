import Vue from 'vue'
import App from './App.vue'
import Login from './Login.vue'
import Register from './Register.vue'
import Profile from './Profile.vue'
import Petitions from './Petition.vue'
import ViewPetition from './ViewPetition.vue'
import CreatePetition from './CreatePetition.vue'
import EditPetition from './EditPetition.vue'
import VueRouter from 'vue-router';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuelidate from 'vuelidate'
import EditProfile from "./EditProfile";
Vue.use(Vuelidate)
Vue.use(VueAxios, axios)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.use(VueRouter);


Vue.config.productionTip = false
const token = localStorage.getItem('token');


const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      loggedIn: true
    }
  },
  {
    path: "/register",
    component: Register,
    meta: {
      loggedIn: true
    }
  },
  {
    path: "/editProfile",
    name: "editProfile",
    component: EditProfile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/",
    name: "petiton",
    component: Petitions
  },
  {
    path: "/petition/:id",
    name: "View Petiton",
    component: ViewPetition
  },
  {
    path: "/create",
    name: "Create Petition",
    meta: {
      requiresAuth: true
    },
    component: CreatePetition
  },
  {
    path: "/edit/:id",
    name: "Edit Petition",
    meta: {
      requiresAuth: true
    },
    component: EditPetition
  },
  ];

const router = new VueRouter({
  routes: routes,
  mode:'history'
});
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const strictNoAuth = to.matched.some(record => record.meta.loggedIn);
  const hasToken = localStorage.getItem('token') != null;
  if (requiresAuth && !hasToken) {
      next({name : "login"});
      return;
  } else if (strictNoAuth && hasToken) {
      next({name: "profile"});
      return;
  }
  next();
})


new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})

