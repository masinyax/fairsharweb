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
    }, []);

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
        if (!selectedBill) return;

        const prevBill = selectedBill;
        const updatedPayees = (prevBill.payees || []).map(p => p.name === payeeName ? { ...p, status: newStatus } : p);
        const updatedBill = { ...prevBill, payees: updatedPayees };

        setSelectedBill(updatedBill);
        setBillHistory(bh => bh.map(b => b.id === prevBill.id ? updatedBill : b));

        await updateDoc(doc(db, "bills", prevBill.id), { payees: updatedPayees });
        setEditingPayee(null);
    };

    const styles = {
        // ── palette ──────────────────────────────────────────────
        primary:      "#FFB7B2",
        primaryLight: "#FFD1DC",
        primaryBg:    "#FFF5F7",
        primaryText:  "#A0616A",
        green:        "#2D6A4F",
        greenBg:      "#E2FCEF",
        text:         "#3D3D3D",
        subtext:      "#ADADAD",
        border:       "#F1F1F1",
        white:        "#FFFFFF",
        bg:           "#FDFCFE",
    };

    if (loading) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                minHeight: "100vh", backgroundColor: styles.bg,
                fontFamily: "'Sarabun', -apple-system, sans-serif",
            }}>
                <p style={{ color: styles.primary, fontWeight: 700, fontSize: 16 }}>กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'Sarabun', -apple-system, sans-serif",
            backgroundColor: styles.bg,
            minHeight: "100vh",
            color: styles.text,
        }}>

            {/* ── Navbar ── */}
            <nav style={{
                display: "flex", alignItems: "center",
                padding: "18px 28px",
                backgroundColor: styles.white,
                borderBottom: `1px solid ${styles.border}`,
                position: "sticky", top: 0, zIndex: 100,
            }}>
                <button
                    onClick={() => selectedBill ? setSelectedBill(null) : router.push("/dashboard")}
                    style={{
                        border: "none", background: "none",
                        fontSize: 20, cursor: "pointer",
                        marginRight: 16,
                        color: styles.primary,
                        width: 36, height: 36,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: styles.primaryBg,
                        transition: "opacity .15s",
                    }}
                >
                    {selectedBill ? "✕" : "←"}
                </button>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: styles.text }}>
                    {selectedBill ? "รายละเอียดบิล" : "ประวัติบิล"}
                </h1>
            </nav>

            <div style={{ maxWidth: 540, margin: "0 auto", padding: "28px 20px" }}>

                {/* ── Empty state ── */}
                {billHistory.length === 0 ? (
                    <div style={{
                        textAlign: "center", marginTop: 80,
                        padding: "52px 32px",
                        backgroundColor: styles.white,
                        borderRadius: 32,
                        border: `1px solid ${styles.border}`,
                        boxShadow: "0 12px 40px rgba(255,183,178,.12)",
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>📄</div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700 }}>ยังไม่มีบิลที่บันทึก</h3>
                        <p style={{ color: styles.subtext, margin: "0 0 28px", fontSize: 14 }}>เริ่มสร้างบิลแรกของคุณได้เลย</p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            style={{
                                padding: "13px 36px", borderRadius: 16,
                                border: "none",
                                backgroundColor: styles.primaryLight,
                                color: styles.primaryText,
                                fontWeight: 700, fontSize: 15,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            ไปสร้างบิลกันเลย! 🎉
                        </button>
                    </div>

                ) : !selectedBill ? (
                    /* ── Bill list ── */
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {billHistory.map(bill => (
                            <div
                                key={bill.id}
                                onClick={() => setSelectedBill(bill)}
                                style={{
                                    backgroundColor: styles.white,
                                    padding: "22px 24px",
                                    borderRadius: 24,
                                    border: `1px solid ${styles.border}`,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 20px rgba(255,183,178,.10)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "box-shadow .2s",
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700 }}>{bill.title}</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: styles.subtext }}>
                                        📅 {bill.date} &nbsp;·&nbsp; 🕒 {bill.time}
                                    </p>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: styles.primary }}>
                                        ฿{bill.totalAmount?.toLocaleString()}
                                    </div>
                                    <p style={{ margin: "4px 0 0", fontSize: 11, color: styles.primaryLight }}>ดูรายละเอียด ›</p>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    /* ── Bill detail ── */
                    <div>
                        {/* Header card */}
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <p style={{ margin: "0 0 6px", fontSize: 12, color: styles.subtext }}>
                                {selectedBill.date} &nbsp;·&nbsp; {selectedBill.time}
                            </p>
                            <h2 style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 800 }}>
                                {selectedBill.title}
                            </h2>
                            <span style={{
                                display: "inline-block",
                                padding: "8px 22px",
                                borderRadius: 999,
                                backgroundColor: styles.primaryBg,
                                color: styles.primaryText,
                                fontWeight: 700,
                                fontSize: 15,
                            }}>
                                ยอดรวม ฿{selectedBill.totalAmount?.toLocaleString()}
                            </span>
                        </div>

                        {/* Table card */}
                        <div style={{
                            backgroundColor: styles.white,
                            borderRadius: 24,
                            border: `1px solid ${styles.border}`,
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(255,183,178,.10)",
                        }}>
                            {/* Table header */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.6fr 0.5fr",
                                padding: "14px 20px",
                                backgroundColor: styles.primaryBg,
                                fontSize: 12,
                                fontWeight: 700,
                                color: styles.primaryText,
                                gap: 8,
                            }}>
                                <span>รายการ</span>
                                <span>ชื่อคน</span>
                                <span style={{ textAlign: "right" }}>ราคา</span>
                                <span style={{ textAlign: "right" }}>ต่อคน</span>
                                <span style={{ textAlign: "center" }}>สถานะ</span>
                                <span />
                            </div>

                            {/* Rows */}
                            {selectedBill.items?.map((item, itemIdx) => {
                                const payees = selectedBill.payees || [];
                                const rows = payees.length > 0 ? payees : [null];
                                const isLastItem = itemIdx === selectedBill.items.length - 1;

                                return rows.map((p, pIdx) => {
                                    const isLastRow = pIdx === rows.length - 1;
                                    return (
                                        <div
                                            key={`${itemIdx}-${pIdx}`}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.6fr 0.5fr",
                                                alignItems: "center",
                                                padding: "14px 20px",
                                                borderBottom: (!isLastItem || !isLastRow) ? `1px solid ${styles.border}` : "none",
                                                fontSize: 14,
                                                gap: 8,
                                            }}
                                        >
                                            {/* รายการ */}
                                            <span style={{ fontWeight: 700, color: pIdx === 0 ? styles.text : "transparent" }}>
                                                {item.name}
                                            </span>

                                            {/* ชื่อคน */}
                                            <span style={{ color: styles.subtext, fontSize: 13 }}>
                                                {p?.name || ""}
                                            </span>

                                            {/* ราคา */}
                                            <span style={{
                                                textAlign: "right",
                                                color: pIdx === 0 ? styles.text : "transparent",
                                                fontWeight: 600,
                                            }}>
                                                {pIdx === 0 ? `฿${item.price?.toLocaleString()}` : ""}
                                            </span>

                                            {/* ต่อคน */}
                                            <span style={{ textAlign: "right", fontWeight: 700, color: styles.primary }}>
                                                {p ? `฿${p.amount}` : ""}
                                            </span>

                                            {/* สถานะ */}
                                            <span style={{ textAlign: "center" }}>
                                                {p && (
                                                    <span style={{
                                                        display: "inline-block",
                                                        fontSize: 11,
                                                        padding: "5px 12px",
                                                        borderRadius: 8,
                                                        backgroundColor: p.status === "จ่ายแล้ว" ? styles.greenBg : styles.primaryBg,
                                                        color: p.status === "จ่ายแล้ว" ? styles.green : styles.primary,
                                                        fontWeight: 700,
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                        {p.status}
                                                    </span>
                                                )}
                                            </span>

                                            {/* Action */}
                                            <span style={{ textAlign: "center" }}>
                                                {p && (
                                                    <button
                                                        onClick={() => setEditingPayee(p)}
                                                        style={{
                                                            border: "none", background: "none",
                                                            cursor: "pointer", fontSize: 16,
                                                            opacity: 0.7,
                                                            padding: 4,
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Edit status modal ── */}
            {editingPayee && (
                <div style={{
                    position: "fixed", inset: 0,
                    backgroundColor: "rgba(0,0,0,.45)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1100,
                    backdropFilter: "blur(4px)",
                }}>
                    <div style={{
                        backgroundColor: styles.white,
                        padding: "32px 28px",
                        borderRadius: 24,
                        width: 320,
                        textAlign: "center",
                        boxShadow: "0 24px 60px rgba(0,0,0,.15)",
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>✏️</div>
                        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800 }}>
                            แก้ไขสถานะ
                        </h3>
                        <p style={{ margin: "0 0 24px", color: styles.subtext, fontSize: 14 }}>
                            {editingPayee.name}
                        </p>

                        <button
                            onClick={() => handleUpdateStatus(editingPayee.name, "จ่ายแล้ว")}
                            style={{
                                width: "100%", padding: "13px",
                                marginBottom: 10,
                                backgroundColor: styles.greenBg,
                                color: styles.green,
                                border: "none", borderRadius: 14,
                                fontWeight: 700, fontSize: 15,
                                cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            จ่ายแล้ว
                        </button>

                        <button
                            onClick={() => handleUpdateStatus(editingPayee.name, "ยังไม่ได้จ่าย")}
                            style={{
                                width: "100%", padding: "13px",
                                backgroundColor: styles.primaryBg,
                                color: styles.primary,
                                border: "none", borderRadius: 14,
                                fontWeight: 700, fontSize: 15,
                                cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            ยังไม่ได้จ่าย
                        </button>

                        <button
                            onClick={() => setEditingPayee(null)}
                            style={{
                                marginTop: 16,
                                background: "none", border: "none",
                                color: styles.subtext,
                                cursor: "pointer",
                                fontSize: 14, fontFamily: "inherit",
                            }}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}