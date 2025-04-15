// src/services/firebaseService.js
import { db } from "@/main";

// Obtener todos los eventos
export const fetchEvents = async () => {
  try {
    const snapshot = await db.collection("events").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    return []; // Devuelve un array vacío si falla
  }
};

// Agregar un nuevo evento
export const createEvent = async (event) => {
  try {
    const docRef = await db.collection("events").add(event);
    return docRef;
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    throw error;
  }
};

// Actualizar un evento existente
export const modifyEvent = async (id, data) => {
  try {
    await db.collection("events").doc(id).update(data);
  } catch (error) {
    console.error(`Error al actualizar el evento con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un evento
export const removeEvent = async (id) => {
  try {
    await db.collection("events").doc(id).delete();
  } catch (error) {
    console.error(`Error al eliminar el evento con ID ${id}:`, error);
    throw error;
  }
};
