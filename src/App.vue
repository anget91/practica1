<template>
  <v-app>
    <component :is="layout">
      <router-view />
    </component>
  </v-app>
</template>

<script>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import EmptyLayout from '@/layouts/EmptyLayout.vue';

export default {
  computed: {
    layout() {
      return this.$route.meta.layout === 'empty' ? EmptyLayout : DefaultLayout;
    }
  }
};
</script>
<style >
* {
  font-family: 'Poppins', sans-serif;
}
</style>
