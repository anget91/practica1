// services/firebaseService.js
import { db } from "@/main";

export const getEvents = async () => {
  const snapshot = await db.collection("events").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addEvent = async (event) => {
  return db.collection("events").add(event);
};

export const updateEvent = async (id, data) => {
  return db.collection("events").doc(id).update(data);
};

export const deleteEvent = async (id) => {
  return db.collection("events").doc(id).delete();
};
