<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" class="pa-6 rounded-xl">
          <v-card-title class="text-h5 font-weight-bold">My Account</v-card-title>
          <v-divider class="my-4"></v-divider>

          <div class="d-flex align-center mb-6">
            <v-avatar color="primary" size="64">
              <span class="white--text text-h5">{{ initials }}</span>
            </v-avatar>
            <div class="ml-4">
              <div class="text-subtitle-1 font-weight-medium">
                {{ userName || "User" }}
              </div>
              <div class="text-caption grey--text">Personal Information</div>
            </div>
          </div>

          <v-form ref="form" v-model="formValid">
            <v-text-field v-model="name" label="Full Name" outlined dense color="primary" class="mb-4"
              prepend-inner-icon="mdi-account" :rules="[rules.required]"   />

            <div class="d-flex mb-4 flex-wrap">
              <v-text-field v-model="email" label="Email Address" outlined dense color="primary"
                prepend-inner-icon="mdi-email" :rules="[rules.required, rules.email]" disabled    class="flex-grow-1" />
              <v-btn v-if="!emailVerified" color="warning" outlined class="ml-2 mt-2 mt-md-0" @click="verifyEmail">
                <v-icon left>info_outline</v-icon>
                Verify Email
              </v-btn>
            </div>

            <v-btn outlined color="secondary" @click="confirmPasswordReset" :loading="isSendingReset">
              <v-icon left>mdi-lock-reset</v-icon>
              Change Password
            </v-btn>

            <v-divider class="my-4"></v-divider>

            <v-btn color="primary" class="mb-2" @click="updateAccount" :loading="isSaving">
              <v-icon left>mdi-content-save</v-icon>
              Save Changes
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de confirmación antes de enviar el reset -->
    <v-dialog v-model="showPasswordResetConfirmation" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Reset</v-card-title>
        <v-card-text>
          This will send a password reset email and sign you out. Do you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="secondary" @click="showPasswordResetConfirmation = false">Cancel</v-btn>
          <v-btn text color="primary" @click="handlePasswordReset">Accept</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { auth, db } from "@/main";

export default {
  data: () => ({
    name: "",
    email: "",
    isSaving: false,
    isSendingReset: false,
    emailVerified: true,
    showPasswordResetConfirmation: false,
    rules: {
      required: value => !!value || "This field is required.",
      email: value => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) || "Invalid email format.";
      },
    },
    formValid: false,
  }),
  computed: {
    ...mapGetters({
      userName: "getUserName",
      initials: "getUserInitials",
    }),
  },
  methods: {
    ...mapActions(["loadUserName", "fetchUserNameFromFirestore"]),
    async submitForm() {
      const isValid = this.$refs.form.validate();
      if (!isValid) {
        this.$toasted.error("Please correct the errors.", { icon: "error" });
        return false;
      }
      return true;
    },
    async updateAccount() {
      const isFormValid = await this.submitForm();
      if (!isFormValid) return;

      this.isSaving = true;
      try {
        const user = auth.currentUser;
        const uid = user.uid;

        await db.collection("users").doc(uid).update({
          name: this.name,
          email: this.email,
        });

        if (this.email !== user.email) {
          await user.updateEmail(this.email);
        }

        localStorage.setItem("user", JSON.stringify({ uid, name: this.name }));
        this.$store.commit("setUserName", this.name);

        this.$toasted.success("Profile updated", { icon: "check" });
      } catch (error) {
        console.error("Error updating account:", error.message);
        this.$toasted.error(error.message, { icon: "error" });
      } finally {
        this.isSaving = false;
      }
    },

    confirmPasswordReset() {
      this.showPasswordResetConfirmation = true;
    },

    async handlePasswordReset() {
      this.isSendingReset = true;
      try {
        await auth.sendPasswordResetEmail(this.email);
        this.$toasted.success("Password reset email sent.", { icon: "email" });
        this.$router.push("/singin");
      } catch (error) {
        this.$toasted.error(error.message, { icon: "error" });
      } finally {
        this.isSendingReset = false;
        this.showPasswordResetConfirmation = false;
      }
    },

    async verifyEmail() {
      try {
        const user = auth.currentUser;
        await user.sendEmailVerification();
        this.$toasted.success("Verification email sent!", { icon: "email" });
      } catch (error) {
        this.$toasted.error(error.message, { icon: "error" });
      }
    },
  },
  async mounted() {
    this.loadUserName();
    await this.fetchUserNameFromFirestore();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.name = user.name;
      this.email = auth.currentUser?.email || "";
    }

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      this.emailVerified = firebaseUser.emailVerified;
    }
  },
};
</script>
