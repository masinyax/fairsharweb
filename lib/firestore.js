import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveBillToFirestore = async (userId, billData) => {
  try {
    // 1. สร้างเอกสารบิลใหม่
    const docRef = await addDoc(collection(db, "bills"), {
      ownerId: userId,
      title: billData.title,
      totalAmount: billData.totalAmount,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Save Bill Error:", error);
  }
};