<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="mx-auto" style="width: 90%; max-width: 600px">
      <v-card-title class="text-center justify-center">Sing In</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid">
          <v-text-field label="Email" type="email" v-model="email" required :rules="[rules.required, rules.email]"  clearable
            prepend-inner-icon="email" outlined dense color="primary" />
          <v-text-field label="Password" type="password" v-model="password" required :rules="[rules.required]"  clearable
            prepend-inner-icon="lock" outlined dense color="primary" />
          <v-btn :loading="isLoading" @click.prevent="SingIn(email, password)" color="primary" block>Sing In</v-btn>
          <div class="text-center mt-3">
            <a href="/register">Don't have an account? Register</a>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import { auth, db } from "@/main";
import { mapActions } from "vuex";

export default {
  data: () => ({
    email: "",
    password: "",
    user: "",
    isLoading: false,
    formValid: false,
    rules: {
      required: value => !!value || "This field is required.",
      email: value => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || "Invalid email format.";
      },
    },
  }),
  methods: {
    ...mapActions({
      fetchUserNameFromFirestore: "fetchUserNameFromFirestore", // Cargar desde Firestore
      loadUserName: "loadUserName", // Cargar desde localStorage
    }),

    async submitForm() {
      const isValid = this.$refs.form.validate();
      if (!isValid) {
        this.$toasted.error("Please correct the errors.", { icon: "error" });
        return false;
      }
      return true;
    },
    async SingIn(email, password) {
      const isFormValid = await this.submitForm();
      if (!isFormValid) return;
      this.isLoading = true;
      try {

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // Obtener el nombre desde Firestore directamente
        const userDoc = await db.collection("users").doc(uid).get();

        if (userDoc.exists) {
          const name = userDoc.data().name;

          // Guardar en localStorage inmediatamente
          localStorage.setItem("user", JSON.stringify({ uid, name }));

          // Actualizar el estado de Vuex
          this.$store.commit("setUserName", name);
        }

        this.$router.push("/");
        this.$toasted.success("Welcome", { icon: 'check' });

      } catch (error) {
        console.log(error);
        const errorDetails = JSON.parse(error.message);

        // Verificar si el error es de credenciales incorrectas (INVALID_LOGIN_CREDENTIALS)
        if (errorDetails.error.message === "INVALID_LOGIN_CREDENTIALS") {
          this.$toasted.error("Incorrect email or password. Please try again.", { icon: 'error' });
        } else {
          this.$toasted.error("An error occurred. Please try again.", { icon: 'error' });
        }
      } finally {
        this.isLoading = false;
      }
    }

  },
};
</script>