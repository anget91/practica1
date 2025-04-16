import Vue from 'vue';
import VueRouter from 'vue-router';
import { auth } from '@/main'; // Importa Firebase Auth

Vue.use(VueRouter);

const routes = [
  {
    path: '/singin',
    name: 'singin',
    component: () =>
      import(/* webpackChunkName: "singin" */ '../views/SingIn.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/register',
    name: 'register',
    component: () =>
      import(/* webpackChunkName: "register" */ '../views/Register.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/',
    name: '',
    component: () =>
      import(/* webpackChunkName: "calendar" */ '../views/Calendar.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account',
    name: 'account',
    component: () =>
      import(/* webpackChunkName: "account" */ '../views/Account.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () =>
      import(/* webpackChunkName: "account" */ '../views/Tasks.vue'),
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// Guard global para la autenticación
router.beforeEach((to, from, next) => {
  // Verifica si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = JSON.parse(localStorage.getItem('user')); // Obtén el usuario de localStorage

    if (user) {
      next(); // Si está autenticado, pasa
    } else {
      next({ name: 'singin' }); // Si no está autenticado, redirige al login
    }
  } else {
    next(); // Si la ruta no requiere autenticación, pasa
  }
});

export default router;
