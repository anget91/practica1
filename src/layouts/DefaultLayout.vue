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
            <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
          </v-list-item-avatar>
  
          <v-list-item-content v-if="!mini">
            <v-list-item-title>John Leider</v-list-item-title>
          </v-list-item-content>
  
          <v-spacer></v-spacer>
  
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>{{ mini ? "mdi-chevron-right" : "mdi-chevron-left" }}</v-icon>
          </v-btn>
        </v-list-item>
  
        <v-divider></v-divider>
  
        <v-list dense nav>
          <v-list-item color="light-blue darken-1"
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
      </v-navigation-drawer>
  
      <v-main>
        <v-container fluid>
          <slot />
        </v-container>
      </v-main>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        drawer: true,
        mini: true,
        items: [
          { title: "Home", icon: "mdi-home", route: "/" },
          { title: "Calendar", icon: "mdi-calendar-blank", route: "/calendar" },
          { title: "Tasks", icon: "mdi-format-list-bulleted", route: "/tasks" },
          { title: "My Account", icon: "mdi-account", route: "/account" },
        ],
      };
    }
  };
  </script>
  
