<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>

          <v-btn outlined small class="mx-4 red--text" color="grey lighten-1 " @click="setToday">
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
          <div class="d-flex justify-end align-center pa-1 grey lighten-4" style="gap: 8px; border-radius: 6px">
            <v-btn v-for="view in ['day', 'week', 'month']" :key="view" depressed small class="btn-view"
              :class="{ 'active-btn': type === view }" @click="type = view">
              {{ view.charAt(0).toUpperCase() + view.slice(1) }}
            </v-btn>
          </div>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar ref="calendar" locale="en" v-model="focus" color="primary" :events="events"
          :event-color="getEventColor" :type="type" @click:event="showEvent" @click:more="viewDay" @click:date="viewDay"
          @change="updateRange" />

        <v-menu v-model="selectedOpen" :close-on-content-click="false" :activator="selectedElement" offset-x>
          <v-card flat color="grey lighten-4" min-width="350px">
            <v-toolbar flat :color="selectedEvent.color" dark>
              <v-btn icon @click.prevent="deleteEvent(selectedEvent)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title>{{ selectedEvent.name }}</v-toolbar-title>

              <v-spacer></v-spacer>
            </v-toolbar>

            <v-card-text>
              <v-form>
                {{ selectedEvent.description }}
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="selectedOpen = false">
                Cancel
              </v-btn>
              <v-btn text @click.prevent="editEvent(selectedEvent.id)">Edit</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card class="pa-4">
          <v-card-title class="text-h6">
            {{ isEditing ? "Edit Event" : "Add Schedule" }}
          </v-card-title>

          <v-form @submit.prevent="addEvent">
            <v-text-field outlined dense color="primary" v-model="name" label="Event title"></v-text-field>
            <v-switch v-model="allday" label="All day" inset />

            <v-text-field outlined dense color="primary" v-model="start" label="Start date"
              :type="allday ? 'date' : 'datetime-local'" :min="minDate"></v-text-field>

            <v-text-field outlined dense color="primary" v-model="end" label="End date"
              :type="allday ? 'date' : 'datetime-local'" :min="start || minDate"></v-text-field>

            <v-text-field outlined dense color="primary" v-model="description" label="Event description"></v-text-field>

            <div class="d-flex mt-4" style="gap: 2px">
              <div v-for="(c, index) in colors" :key="index" :style="{
                backgroundColor: c,
                border:
                  c === selectedColor
                    ? '2px solid #7b8085'
                    : '1px solid #ccc',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
              }" @click="selectColor(c)"></div>
            </div>

            <v-card-actions class="d-flex justify-end">
              <v-btn text @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit">
                {{ isEditing ? "Update" : "Save" }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

    </v-col>
  </v-row>
</template>
<script>
import {
  fetchEvents,
  createEvent,
  modifyEvent,
  removeEvent,
} from "@/services/firebaseService";

export default {
  data: () => ({
    colors: [
      // "#FAD02E",
      // "#F28D35",
      // "#D83367",
      // "#4C9E9F",
      // "#A1D0B6",
      "#D1A6F5",
      "#FFACAC",
      "#C3E0E5",
      "#F0C6A4",
      "#B6D0B6",
    ],
    selectedColor: "#D1A6F5", // Color por defecto

    focus: "",
    type: "month",
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    color: "#ff5733",
    description: null,
    dialog: false,
    start: null,
    day: null,
    end: null,
    name: null,
    isEditing: false,
    editEventId: null,
    allday: false,
  }),

  mounted() {
    this.$refs.calendar.checkChange();
  },

  created() {
    this.loadEvents();
  },
  watch: {
    dialog(value) {
      if (value) {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() - offset);

        if (!this.isEditing) {
          const iso = now.toISOString();
          this.start = this.allday ? iso.split("T")[0] : iso.slice(0, 16);
          this.end = this.start; // Mismo valor por defecto
        }
      } else {
        this.resetForm();

      }
    },
    start(newVal) {
      if (newVal && this.end && new Date(newVal) > new Date(this.end)) {
        this.end = newVal;
      }
    },
    allday(newVal) {
      if (newVal) {
        // Si activa "all day", quitamos la hora
        this.start = this.start?.split("T")[0];
        this.end = this.end?.split("T")[0];
      } else {
        // Si desactiva, agregamos hora por defecto si no la tiene
        const now = new Date();
        const defaultTime = now.toTimeString().slice(0, 5); // hh:mm

        if (this.start && this.start.length === 10) {
          this.start = `${this.start}T${defaultTime}`;
        }

        if (this.end && this.end.length === 10) {
          this.end = `${this.end}T${defaultTime}`;
        }
      }
    },
  },

  computed: {
    minDate() {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      now.setMinutes(now.getMinutes() - offset); // para formato local ISO
      return this.allday
        ? now.toISOString().split("T")[0]
        : now.toISOString().slice(0, 16);
    },
  },

  methods: {
    async loadEvents() {
      const data = await fetchEvents();
      this.events = data;
    },

    async addEvent() {
      const now = new Date();
      let startDate = new Date(this.start);
      let endDate = new Date(this.end);

      // Si es un evento de "Todo el día", ajustamos las horas a las 00:00
      if (this.allday) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
      }

      // Verificamos si la fecha de inicio es menor que la fecha actual
      if (startDate < now && !this.allday) {
        this.$toasted.error("Start date must be today or in the future.", { icon: 'error' });
        return;
      }

      // Verificamos si la fecha de fin es menor que la fecha de inicio
      if (endDate < startDate) {
        this.$toasted.error("End date cannot be earlier than start date.", { icon: 'error' });
        return;
      }

      let eventName = this.name?.trim();
      if (!eventName) {
        eventName = "(Untitled)";
        this.$toasted.info("The event has no title. It will be saved as (Untitled)", { icon: 'info' });
      }

      const newEvent = {
        name: eventName,
        start: this.start,
        end: this.end,
        description: this.description,
        color: this.selectedColor,
        allday: this.allday,
      };

      try {
        if (this.isEditing) {
          await modifyEvent(this.editEventId, newEvent);
          this.loadEvents();
        } else {
          const ref = await createEvent(newEvent);
          this.events.push({ ...newEvent, id: ref.id });
        }
        this.resetForm();
        this.dialog = false;
        this.$toasted.success("Event successfully saved", { icon: 'check' });

      } catch (error) {
        this.$toasted.error("An error occurred while saving the event.", { icon: 'error' });
        console.error("Error al guardar el evento:", error);
      }
    },

    async deleteEvent(event) {
      try {
        await removeEvent(event.id);
        this.events = this.events.filter((e) => e.id !== event.id);
        this.selectedOpen = false;
        this.$toasted.success("Event successfully deleted", { icon: 'check' });
      } catch (error) {
        console.error("No se pudo eliminar el evento:", error);
      }
    },

    editEvent(id) {
      const event = this.events.find((e) => e.id === id);
      if (event) {
        this.name = event.name;
        this.description = event.description;
        this.start = event.allday ? event.start : event.start.slice(0, 16); // Si es todo el día, solo la fecha
        this.end = event.allday ? event.end : event.end.slice(0, 16); // Lo mismo con el end
        this.selectedColor = event.color;
        this.allday = event.allday; // Si es todo el día, activa el switch
        this.isEditing = true;
        this.editEventId = id;
        this.dialog = true;
      }
      this.selectedOpen = false;
    },

    resetForm() {
      this.name = null;
      this.description = null;
      this.start = null;
      this.end = null;
      this.selectedColor = "#D1A6F5";
      this.isEditing = false;
      this.editEventId = null;
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
      // puedes usar estos datos si quieres cargar por rango
    },

    selectColor(c) {
      this.selectedColor = c;
      this.color = c;
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
