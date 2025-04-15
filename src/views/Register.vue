<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="mx-auto" style="width: 90%; max-width: 600px">
      <v-card-title class="text-center justify-center">Register</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field label="Name" v-model="name" required />
          <v-text-field label="Email" v-model="email" required />
          <v-text-field label="Password" v-model="password" required />
          <v-btn
            @click.prevent="Register(name, email, password)"
            color="primary"
            block
            >Register</v-btn
          >
          <div class="text-center mt-3">
            <a href="/singin">Already have an account? Sign In</a>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import { auth, db } from "@/main"; // si está definido ahí
export default {
  data: () => ({
    name: "",
    email: "",
    password: "",
  }),
  methods: {
    async Register(name, email, password) {
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;
        const uid = user.uid;

        await db.collection("users").doc(uid).set({
          email: this.email,
          name: this.name,
          createdAt: new Date(),
        });
        console.log("Usuario creado con éxito en Auth y Firestore.");
      } catch (error) {
        console.error("Error al registrar al usuario:", error.message);
      }
    },
  },
};
</script>
