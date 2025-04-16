<template>
  <div class="board">
    <div class="column" v-for="(list, index) in lists" :key="index" @drop="onDrop($event, list.id)" @dragover.prevent
      @dragenter.prevent>
      <h3>{{ list.name }}</h3>

      <div class="task" v-for="item in getItemsByList(list.id)" :key="item.id" draggable
        @dragstart="startDrag($event, item)">
        {{ item.title }}
      </div>

      <input v-model="newTask[list.id]" @keyup.enter="addTask(list.id)" placeholder="Nueva tarea..." />
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      items: [
        { id: 0, title: 'Comprar pan', list: 1 },
        { id: 1, title: 'Revisar emails', list: 1 },
        { id: 2, title: 'Hacer ejercicio', list: 2 },
        { id: 3, title: 'Leer un libro', list: 3 },
      ],
      lists: [
        { id: 1, name: 'Por hacer' },
        { id: 2, name: 'En progreso' },
        { id: 3, name: 'Hecho' },
      ],
      newTask: {
        1: '',
        2: '',
        3: '',
      },
    }
  },
  methods: {
    startDrag(evt, item) {
      evt.dataTransfer.setData('itemID', item.id)
    },
    onDrop(evt, targetListId) {
      const itemID = evt.dataTransfer.getData('itemID')
      const item = this.items.find((i) => i.id == itemID)
      if (item) item.list = targetListId
    },
    getItemsByList(listId) {
      return this.items.filter(item => item.list === listId)
    },
    addTask(listId) {
      const title = this.newTask[listId].trim()
      if (!title) return
      const newId = this.items.length ? Math.max(...this.items.map(i => i.id)) + 1 : 0
      this.items.push({ id: newId, title, list: listId })
      this.newTask[listId] = ''
    },
  },
}

</script>
<style scoped>
.board {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
}

.task {
  background: white;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: move;
}

input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}
</style>
