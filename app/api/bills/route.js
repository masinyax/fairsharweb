import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, total_amount, items } = body

    const docRef = await addDoc(collection(db, "bills"), {
      title: title || "มื้ออาหารใหม่",
      totalAmount: total_amount,
      items: items,
      createdAt: serverTimestamp(),
    })

    return NextResponse.json({ billId: docRef.id }, { status: 200 })
  } catch (error) {
    console.error("Save bill error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}