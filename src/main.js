import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "@babel/polyfill";
import "vuetify/dist/vuetify.min.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import VueTextAreaAutoSize from "vue-textarea-autosize";

Vue.use(VueTextAreaAutoSize);
const firebaseConfig = {
  apiKey: "AIzaSyCAWk4KYdTVf9ChWKYl6AOCxGNNmZcZWK4",
  authDomain: "calendario-vue-c67a4.firebaseapp.com",
  projectId: "calendario-vue-c67a4",
  storageBucket: "calendario-vue-c67a4.firebasestorage.app",
  messagingSenderId: "591359183777",
  appId: "1:591359183777:web:13b0b621ff2d6ea2f199e0",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    // Guarda el UID del usuario en localStorage
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    // Si no hay usuario, elimina el dato de localStorage
    localStorage.removeItem("user");
  }
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
