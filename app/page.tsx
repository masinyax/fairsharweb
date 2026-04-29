import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore"; // เพิ่ม setDoc, doc
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");

  return null;
}