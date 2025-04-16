import { db } from "@/main";
import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/app";
import "firebase/auth";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userName: "", // Almacenaremos el nombre aquí
  },
  mutations: {
    setUserName(state, name) {
      state.userName = name;
    },
    resetUserName(state) {
      state.userName = ""; // Reseteamos el nombre del usuario
    },
  },
  actions: {
    // Acción para obtener el nombre desde localStorage
    loadUserName({ commit }) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.name) {
        commit("setUserName", user.name);
      }
    },

    // Acción para obtener el nombre de Firestore y guardarlo en Vuex
    async fetchUserNameFromFirestore({ commit }) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.uid) {
        try {
          const userDocRef = db.collection("users").doc(user.uid);
          const doc = await userDocRef.get();
          if (doc.exists) {
            commit("setUserName", doc.data().name);
            localStorage.setItem(
              "user",
              JSON.stringify({ uid: user.uid, name: doc.data().name })
            );
          }
        } catch (error) {
          console.error(
            "Error al obtener el nombre del usuario:",
            error.message
          );
        }
      }
    },

    // Acción para cerrar sesión
    async signOut({ commit }) {
      try {
        await firebase.auth().signOut(); // Cerramos sesión con Firebase
        localStorage.removeItem("user"); // Eliminamos el usuario de localStorage
        commit("resetUserName"); // Reseteamos el estado de Vuex
        console.log("Usuario deslogueado");
      } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
      }
    },
  },
  getters: {
    getUserName: (state) => state.userName,
    getUserInitials: (state) => {
      const names = state.userName.split(" ");
      return names.map((n) => n.charAt(0).toUpperCase()).join("");
    },
  },
});
