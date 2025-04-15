<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="mx-auto" style="width: 90%; max-width: 600px">
      <v-card-title class="text-center justify-center">Sing In</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Email" v-model="email" required />
          <v-text-field label="Password" v-model="password" required />
          <v-btn @click.prevent="SingIn(email, password)" color="primary" block
            >Sing In</v-btn
          >
          <div class="text-center mt-3">
            <a href="/register">Don't have an account? Register</a>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import { auth } from "@/main"; // si está definido ahí
export default {
  data: () => ({
    email: "",
    password: "",
    user: "",
  }),
  methods: {
    async SingIn(email, password) {
      try {
        const userCredential = await auth.signInWithEmailAndPassword(
          email,
          password
        );
        const uid = userCredential.user.uid;

        console.log("Usuario logueado con UID:", uid);

        // Podés guardar el UID en el state o redirigir
      } catch (error) {
        console.log("Error al iniciar sesión:", error.message);
      }
    },
  },
};
</script>
