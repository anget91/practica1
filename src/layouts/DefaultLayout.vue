<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      app
      permanent
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <!-- Avatar con iniciales -->
          <v-avatar color="primary" size="40">
            <span class="white--text">{{ initials }}</span>
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content v-if="!mini">
          <v-list-item-title>{{ userName }}</v-list-item-title>
        </v-list-item-content>

        <v-spacer></v-spacer>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>{{ mini ? "mdi-chevron-right" : "mdi-chevron-left" }}</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav rounded>
        <v-list-item
          color="light-blue darken-1"
          v-for="item in items"
          :key="item.title"
          :to="item.route"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content v-if="!mini">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            text
            rounded
            color="red"
            v-if="!mini"
            @click="signOut"
            to="/singin"
          >
            <v-icon left>mdi-logout</v-icon>
            Logout
          </v-btn>
          <v-btn icon v-if="mini" @click="signOut" color="red" to="/singin">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // Para usar Vuex

export default {
  data() {
    return {
      drawer: true,
      mini: true,
      items: [
        { title: "Calendar", icon: "mdi-calendar-blank", route: "/" },
        { title: "Tasks", icon: "mdi-format-list-bulleted", route: "/tasks" },
        { title: "My Account", icon: "mdi-account", route: "/account" },
      ],
    };
  },
  computed: {
    // Mapear getters de Vuex
    ...mapGetters({
      userName: "getUserName", // Nombre del usuario
      initials: "getUserInitials", // Iniciales del usuario
    }),
  },
  methods: {
    // Mapeo correcto de las acciones de Vuex
    ...mapActions({
      loadUserName: "loadUserName", // Asegúrate de que la acción 'loadUserName' esté registrada en Vuex
      fetchUserNameFromFirestore: "fetchUserNameFromFirestore",
      signOut: "signOut",
    }),

    async signOut() {
      try {
        await this.$store.dispatch("signOut");
        console.log("Usuario deslogueado");
      } catch (error) {
        console.log("Error al cerrar sesión:", error.message);
      }
    },
  },
  created() {
    // Al montar, cargar el nombre del usuario desde Vuex
    this.loadUserName(); // Ahora debería funcionar sin errores
    if (!this.userName) {
      this.fetchUserNameFromFirestore(); // Si no lo encuentras en Vuex, cargarlo desde Firestore
    }
  },
};

</script>
