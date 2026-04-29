"use client"

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

        console.log("User data saved/updated in Firestore");
    } catch (error) {
        console.error("Login error:", error);
    }
};

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        FairShare
      </h1>
      <p style={{ color: '#9ca3af', marginBottom: '40px', fontSize: '14px' }}>
        หารบิลกับเพื่อนได้ง่ายๆ
      </p>
      <button
        onClick={handleGoogleSignIn}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '12px 24px',
          border: '1px solid #e5e7eb', borderRadius: '999px',
          backgroundColor: 'white', cursor: 'pointer',
          width: '240px', color: '#374151'
        }}
      >
        <img src="/google.png" alt="Google" style={{ width: '18px' }} />
        <span style={{ fontWeight: '500' }}>Continue with Google</span>
      </button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}