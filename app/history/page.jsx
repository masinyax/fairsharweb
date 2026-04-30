"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function HistoryPage() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [billHistory, setBillHistory] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [editingPayee, setEditingPayee] = useState(null);
    const [loading, setLoading] = useState(true);

    const styles = {
        primary: "#FFB7B2",
        primaryLight: "#FFD1DC",
        primaryBg: "#FFF5F7",
        primaryText: "#A0616A",
        green: "#2D6A4F",
        greenBg: "#E2FCEF",
        text: "#3D3D3D",
        subtext: "#ADADAD",
        border: "#F1F1F1",
        white: "#FFFFFF",
        bg: "#FDFCFE",
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession({ user });
                fetchBills(user.uid);
            } else {
                setSession(null);
                setLoading(false);
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchBills = async (userId) => {
        try {
            const q = query(collection(db, "bills"), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const bills = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate().toLocaleDateString("th-TH") || "",
                time: doc.data().createdAt?.toDate().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) || "",
            }));
            setBillHistory(bills);
        } catch (error) {
            console.error("Fetch bills error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (payeeName, newStatus) => {
        try {
            const updatedPayees = (selectedBill.payees || []).map(p =>
                p.name === payeeName ? { ...p, status: newStatus } : p
            );

            const billRef = doc(db, "bills", selectedBill.id);
            await updateDoc(billRef, { payees: updatedPayees });

            const updatedBill = { ...selectedBill, payees: updatedPayees };
            setSelectedBill(updatedBill);
            setBillHistory(prev => prev.map(b => b.id === selectedBill.id ? updatedBill : b));
            setEditingPayee(null);
        } catch (error) {
            console.error("Update status error:", error);
            alert("ไม่สามารถอัปเดตสถานะได้");
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: styles.bg }}>
                <p style={{ color: styles.primary, fontWeight: 700 }}>กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Sarabun', sans-serif", backgroundColor: styles.bg, minHeight: "100vh", color: styles.text }}>
            
            {/* Navbar */}
            <nav style={{ display: "flex", alignItems: "center", padding: "18px 28px", backgroundColor: styles.white, borderBottom: `1px solid ${styles.border}`, sticky: "top", zIndex: 100 }}>
                <button onClick={() => selectedBill ? setSelectedBill(null) : router.push("/dashboard")} style={{ border: "none", background: styles.primaryBg, color: styles.primary, width: 36, height: 36, borderRadius: "50%", cursor: "pointer", marginRight: 16 }}>
                    {selectedBill ? "✕" : "←"}
                </button>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{selectedBill ? "รายละเอียดบิล" : "ประวัติบิล"}</h1>
            </nav>

            <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 20px" }}>
                {!selectedBill ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {billHistory.map(bill => (
                            <div key={bill.id} onClick={() => setSelectedBill(bill)} style={{ backgroundColor: styles.white, padding: "22px 24px", borderRadius: 24, border: `1px solid ${styles.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{bill.title}</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: styles.subtext }}>📅 {bill.date} · 🕒 {bill.time}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: styles.primary }}>฿{bill.totalAmount?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <h2 style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 800 }}>{selectedBill.title}</h2>
                            <span style={{ padding: "8px 22px", borderRadius: 999, backgroundColor: styles.primaryBg, color: styles.primaryText, fontWeight: 700 }}>
                                ยอดรวม ฿{selectedBill.totalAmount?.toLocaleString()}
                            </span>
                        </div>

                        <div style={{ backgroundColor: styles.white, borderRadius: 24, border: `1px solid ${styles.border}`, overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.6fr 0.5fr", padding: "14px 20px", backgroundColor: styles.primaryBg, fontSize: 11, fontWeight: 700, color: styles.primaryText, gap: 8 }}>
                                <span>รายการ</span>
                                <span>ชื่อคน</span>
                                <span style={{ textAlign: "right" }}>ราคา</span>
                                <span style={{ textAlign: "right" }}>ต่อคน</span>
                                <span style={{ textAlign: "center" }}>สถานะ</span>
                                <span />
                            </div>

                            {selectedBill.items?.map((item, itemIdx) => {
                                const perPerson = item.price / (item.payees?.length || 1);
                                return item.payees?.map((pName, pIdx) => {
                                    const pStatus = selectedBill.payees?.find(p => p.name === pName)?.status || "ยังไม่ได้จ่าย";
                                    return (
                                        <div key={`${itemIdx}-${pIdx}`} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.6fr 0.5fr", padding: "14px 20px", borderBottom: `1px solid ${styles.border}`, fontSize: 13, alignItems: "center", gap: 8 }}>
                                            <span style={{ fontWeight: 700, color: pIdx === 0 ? styles.text : "transparent" }}>{item.name}</span>
                                            <span style={{ color: styles.subtext }}>{pName}</span>
                                            <span style={{ textAlign: "right", color: pIdx === 0 ? styles.text : "transparent" }}>{pIdx === 0 ? `฿${item.price}` : ""}</span>
                                            <span style={{ textAlign: "right", fontWeight: 700, color: styles.primary }}>฿{perPerson.toFixed(2)}</span>
                                            <span style={{ textAlign: "center" }}>
                                                <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 6, backgroundColor: pStatus === "จ่ายแล้ว" ? styles.greenBg : styles.primaryBg, color: pStatus === "จ่ายแล้ว" ? styles.green : styles.primary, fontWeight: 700 }}>
                                                    {pStatus}
                                                </span>
                                            </span>
                                            <button onClick={() => setEditingPayee({ name: pName })} style={{ border: "none", background: "none", cursor: "pointer" }}>✏️</button>
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/*Modal แก้ไขสถานะ*/}
            {editingPayee && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
                    <div style={{ backgroundColor: styles.white, padding: 32, borderRadius: 24, width: 280, textAlign: "center" }}>
                        <h3 style={{ margin: "0 0 20px" }}>แก้ไขสถานะ: {editingPayee.name}</h3>
                        <button onClick={() => handleUpdateStatus(editingPayee.name, "จ่ายแล้ว")} style={{ width: "100%", padding: 12, marginBottom: 10, backgroundColor: styles.greenBg, color: styles.green, border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>จ่ายแล้ว</button>
                        <button onClick={() => handleUpdateStatus(editingPayee.name, "ยังไม่ได้จ่าย")} style={{ width: "100%", padding: 12, backgroundColor: styles.primaryBg, color: styles.primary, border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>ยังไม่ได้จ่าย</button>
                        <button onClick={() => setEditingPayee(null)} style={{ marginTop: 15, background: "none", border: "none", color: styles.subtext, cursor: "pointer" }}>ยกเลิก</button>
                    </div>
                </div>
            )}
        </div>
    );
}