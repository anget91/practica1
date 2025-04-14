<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>

          <v-btn
            outlined
            small
            class="mx-4 red--text"
            color="grey lighten-1 "
            @click="setToday"
          >
            Today
          </v-btn>

          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small> mdi-chevron-left </v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small> mdi-chevron-right </v-icon>
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn icon small class="mr-4" @click="dialog = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-divider class="mx-4" inset vertical></v-divider>
          <div
            class="d-flex justify-end align-center pa-1 grey lighten-4"
            style="gap: 8px; border-radius: 6px"
          >
            <v-btn
              v-for="view in ['day', 'week', 'month']"
              :key="view"
              depressed
              small
              class="btn-view"
              :class="{ 'active-btn': type === view }"
              @click="type = view"
            >
              {{ view.charAt(0).toUpperCase() + view.slice(1) }}
            </v-btn>
          </div>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          locale="en"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>

        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn icon @click.prevent="deleteEvent(selectedEvent)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.title"></v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <v-card-text>
              <v-form v-if="currentlyEditing !== selectedEvent.id">
                {{ selectedEvent.title }} - {{ selectedEvent.description }}
              </v-form>

              <v-form v-else>
                <v-text-field
                  type="text"
                  v-model="selectedEvent.title"
                  label="Title"
                ></v-text-field>
                <textarea-autosize
                  type="text"
                  v-model="selectedEvent.description"
                  style="width: 100%"
                  :min-height="100"
                ></textarea-autosize>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="selectedOpen = false">
                Cancel
              </v-btn>
              <v-btn
                text
                v-if="currentlyEditing !== selectedEvent.id"
                @click.prevent="editEvent(selectedEvent.id)"
                >Edit</v-btn
              >
              <v-btn text v-else @click.prevent="updateEvent(selectedEvent)"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card class="pa-4">
          <v-card-title class="text-h6">Add Schedule</v-card-title>
          <v-form @submit.prevent="addEvent">
            <v-text-field
              color="accent"
              v-model="title"
              label="New event title"
              outlined
              dense
            ></v-text-field>

            <v-text-field
              v-model="start"
              label="Start date"
              type="datetime-local"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="end"
              label="End date"
              type="datetime-local"
              outlined
              dense
            ></v-text-field>

            <v-text-field
              v-model="description"
              label="Add description"
              outlined
              dense
            ></v-text-field>

            <div class="d-flex mt-4" style="gap: 2px">
              <div
                v-for="(c, index) in colors"
                :key="index"
                :style="{
                  backgroundColor: c,
                  border:
                    c === selectedColor
                      ? '2px solid #7b8085'
                      : '1px solid #ccc',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }"
                @click="selectColor(c)"
              ></div>
            </div>

            <v-card-actions class="d-flex justify-end">
              <v-btn text @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit" @click.stop="dialog = false"
                >Save</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>
<script>
import { db } from "../main";
export default {
  data: () => ({
    colors: [
      "#e0f3f9", // Azul claro
      "#dad3ff", // Lila
      "#b6f3c8", // Verde
      "#feeed9", // Naranja suave
      "#dcdcdc", // Gris
    ],
    selectedColor: "#c5a8ff", // Default
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    color: "#ff5733",
    description: null,
    dialog: false,
    start: null,
    end: null,
    title: null,
    currentlyEditing: null,
  }),
  mounted() {
    this.$refs.calendar.checkChange();
  },
  created() {
    this.getEvents();
  },
  methods: {
    selectColor(c) {
      this.selectedColor = c;
      this.color = c; // Actualiza el color del evento al seleccionar uno
    },
    // async addEvent() {
    //   try {
    //     if (this.title && this.start && this.end) {
    //       const response = await db.collection("events").add({
    //         title: this.title,
    //         description: this.description,
    //         start: this.start,
    //         end: this.end,
    //         color: this.color,
    //       });
    //       console.log("respuesta: ", response);
    //       this.getEvents();
    //       this.title = null;
    //       this.description = null;
    //       this.start = null;
    //       this.end = null;
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    // async getEvents() {
    //   try {
    //     const snapshot = await db.collection("events").get();
    //     const events = [];
    //     snapshot.forEach((doc) => {
    //       let eventoData = doc.data();
    //       eventoData.id = doc.id;
    //       events.push(eventoData);
    //       console.log(doc.data());
    //     });
    //     this.events = events;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    // async updateEvent(ev) {
    //   try {
    //     await db.collection("events").doc(ev.id).update({
    //       title: ev.title,
    //       description: ev.description,
    //     });

    //     this.selectedOpen = false;
    //     this.currentlyEditing = null;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    // async deleteEvent(ev) {
    //   console.log("event:", ev);

    //   try {
    //     if (!ev.id) {
    //       console.error("No ID found for the event");
    //       return;
    //     }
    //     await db.collection("events").doc(ev.id).delete();
    //     this.selectedOpen = false;
    //     this.getEvents();
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },

    editEvent(id) {
      this.currentlyEditing = id;
    },

    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      // Aquí puedes cargar eventos reales desde una API o tu backend si lo deseas
      // this.events = []; quitar linea
    },
  },
};
</script>
<style scoped>
.btn {
  border-radius: 6px;
  transition: background-color 0.2s ease;
}
.v-btn.btn-view {
  color: #000;
  background-color: transparent;
}

.v-btn.btn-view.active-btn {
  background-color: white !important;
  color: #000 !important;
}

.v-btn.btn-view:hover {
  background-color: #f5f5f5 !important;
}
</style>
