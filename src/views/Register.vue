<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">

    <v-card class="mx-auto" style="width: 90%; max-width: 600px">
      <v-card-title class="text-center justify-center">Register</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="formValid">
          <v-text-field label="Name" v-model="name" prepend-inner-icon="person" outlined dense color="primary" :rules="[rules.required]"  clearable
            required />
          <v-text-field label="Email" v-model="email" prepend-inner-icon="email" :rules="[rules.required, rules.email]"  clearable
            required outlined dense color="primary" />
          <v-text-field label="Password" type="password" v-model="password" :rules="[rules.required]" required  clearable
            prepend-inner-icon="lock" outlined dense color="primary" />
          <v-btn :loading="isLoading" @click.prevent="Register(name, email, password)" color="primary"
            block>Register</v-btn>
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
    async submitForm() {
      const isValid = this.$refs.form.validate();
      if (!isValid) {
        this.$toasted.error("Please correct the errors.", { icon: "error" });
        return false;
      }
      return true;
    },
    async Register(name, email, password) {
      const isFormValid = await this.submitForm();
      if (!isFormValid) return;

      this.isLoading = true;
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;
        const uid = user.uid;

        // Guardar los detalles del usuario en Firestore
        await db.collection("users").doc(uid).set({
          email: this.email,
          name: this.name,
          createdAt: new Date(),
        });

        // Iniciar sesión después del registro
        await auth.signInWithEmailAndPassword(this.email, this.password);

        // Redirigir al home después del registro exitoso
        this.$router.push("/");
        this.$toasted.success("Succesfully registered", { icon: 'check' });

      } catch (error) {
        console.error("Error al registrar al usuario:", error.message);

        // Solo mostramos un toast si el email ya está en uso
        if (error.code === "auth/email-already-in-use") {
          this.$toasted.error("Email is already in use. Please try another.", { icon: 'error' });
        } else {
          this.$toasted.error("An error occurred. Please try again.", { icon: 'error' });
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
