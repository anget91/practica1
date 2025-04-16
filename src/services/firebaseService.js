import { auth, db } from "@/main";

// Obtener todos los eventos

// Obtener eventos del usuario actual
export const fetchEvents = async () => {
  try {
    const authUser = auth.currentUser;
    let userId = authUser ? authUser.uid : null;

    // Backup: si auth no está listo, usamos localStorage
    if (!userId) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser && localUser.uid) {
        userId = localUser.uid;
      } else {
        throw new Error("Usuario no autenticado");
      }
    }

    const snapshot = await db.collection("events").where("userId", "==", userId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    return [];
  }
};

// Crear evento para el usuario actual
export const createEvent = async (event) => {
  try {
    const authUser = auth.currentUser;
    let userId = authUser ? authUser.uid : null;

    if (!userId) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser && localUser.uid) {
        userId = localUser.uid;
      } else {
        throw new Error("Usuario no autenticado");
      }
    }

    const docRef = await db.collection("events").add({
      ...event,
      userId,
    });
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
