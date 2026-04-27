"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPermission, setShowPermission] = useState(false);

  const styles = {
    primary:      "#FFB7B2",
    primaryLight: "#FFD1DC",
    primaryBg:    "#FFF5F7",
    primaryText:  "#A0616A",
    text:         "#3D3D3D",
    subtext:      "#ADADAD",
    border:       "#F1F1F1",
    white:        "#FFFFFF",
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowMenu(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePhotoLibraryClick = () => {
    setShowMenu(false);
    setShowPermission(true);
  };

  const handleAllowPermission = () => {
    setShowPermission(false);
    setTimeout(() => fileInputRef.current.click(), 300);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      alert(`เลือกรูปภาพ ${file.name} สำเร็จ! กำลังไปที่หน้าสรุปรายการ...`);
      router.push(`/dashboard?image=${encodeURIComponent(imageUrl)}`);
    }
  };

  return (
    <div style={{
      backgroundColor: "#0A0A0A",
      height: "100vh", width: "100%",
      position: "relative", overflow: "hidden",
      fontFamily: "'Sarabun', -apple-system, sans-serif",
    }}>
      <input
        type="file" ref={fileInputRef}
        onChange={handleFileChange} accept="image/*"
        style={{ display: "none" }}
      />

      {/* ── Camera viewfinder ── */}
      <div style={{
        height: "70%", width: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        position: "relative",
      }}>
        {/* Corner guides */}
        {[
          { top: "20%", left: "10%", borderTop: `3px solid ${styles.primary}`, borderLeft: `3px solid ${styles.primary}`, borderRadius: "4px 0 0 0" },
          { top: "20%", right: "10%", borderTop: `3px solid ${styles.primary}`, borderRight: `3px solid ${styles.primary}`, borderRadius: "0 4px 0 0" },
          { bottom: "15%", left: "10%", borderBottom: `3px solid ${styles.primary}`, borderLeft: `3px solid ${styles.primary}`, borderRadius: "0 0 0 4px" },
          { bottom: "15%", right: "10%", borderBottom: `3px solid ${styles.primary}`, borderRight: `3px solid ${styles.primary}`, borderRadius: "0 0 4px 0" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
        ))}

        <p style={{ color: styles.primary, fontSize: 13, opacity: 0.7, letterSpacing: 1 }}>
          กำลังเปิดกล้อง...
        </p>
      </div>

      {/* ── Controls bar ── */}
      <div style={{
        height: "30%",
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 48,
        borderTop: "1px solid #1A1A1A",
      }}>
        {/* Placeholder icon */}
        <div style={{
          width: 44, height: 44,
          backgroundColor: "#1C1C1C",
          borderRadius: "50%",
        }} />

        {/* Shutter */}
        <button style={{
          width: 72, height: 72,
          borderRadius: "50%",
          border: `4px solid ${styles.primary}`,
          backgroundColor: "transparent",
          cursor: "pointer",
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            backgroundColor: styles.primaryBg,
            opacity: 0.15,
          }} />
        </button>

        {/* Cancel */}
        <button
          onClick={() => router.back()}
          style={{
            color: styles.primary,
            background: "none", border: "none",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ยกเลิก
        </button>
      </div>

      {/* ── Upload method bottom sheet ── */}
      {showMenu && (
        <div style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,.5)",
          zIndex: 2000,
          display: "flex", alignItems: "flex-end",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: "100%",
            backgroundColor: styles.white,
            borderRadius: "28px 28px 0 0",
            padding: "28px 20px 36px",
            animation: "slideUp .35s cubic-bezier(.25,.8,.25,1)",
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
              }
            `}</style>

            {/* Handle bar */}
            <div style={{
              width: 40, height: 4,
              backgroundColor: styles.border,
              borderRadius: 999,
              margin: "0 auto 24px",
            }} />

            <h3 style={{
              textAlign: "center",
              color: styles.subtext,
              fontSize: 12, fontWeight: 700,
              marginBottom: 20,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              เลือกวิธีอัปโหลดใบเสร็จ
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handlePhotoLibraryClick}
                style={{
                  width: "100%", padding: "17px",
                  borderRadius: 18,
                  border: `1.5px solid ${styles.border}`,
                  backgroundColor: styles.white,
                  color: styles.text,
                  fontSize: 16, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Photo Library
              </button>

              <button
                onClick={() => alert("ฟังก์ชันถ่ายภาพกำลังพัฒนา")}
                style={{
                  width: "100%", padding: "17px",
                  borderRadius: 18,
                  border: `1.5px solid ${styles.border}`,
                  backgroundColor: styles.white,
                  color: styles.text,
                  fontSize: 16, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Take Photo
              </button>

              <button
                onClick={() => router.back()}
                style={{
                  width: "100%", padding: "16px",
                  borderRadius: 18, border: "none",
                  backgroundColor: styles.primaryBg,
                  color: styles.primary,
                  fontSize: 15, fontWeight: 700,
                  marginTop: 4,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permission dialog ── */}
      {showPermission && (
        <div style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,.55)",
          zIndex: 3000,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: 20,
          backdropFilter: "blur(6px)",
        }}>
          <div style={{
            backgroundColor: styles.white,
            width: "100%", maxWidth: 300,
            borderRadius: 24,
            overflow: "hidden",
            textAlign: "center",
            animation: "popIn .25s cubic-bezier(.25,.8,.25,1)",
          }}>
            <style>{`
              @keyframes popIn {
                from { opacity: 0; transform: scale(.9); }
                to   { opacity: 1; transform: scale(1);  }
              }
            `}</style>

            <div style={{ padding: "30px 24px 24px" }}>
              <div style={{
                fontSize: 40, marginBottom: 16,
                width: 72, height: 72,
                backgroundColor: styles.primaryBg,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>📁</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: styles.text }}>
                "FairShare" ต้องการเข้าถึงรูปภาพของคุณ
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: styles.subtext, lineHeight: 1.6 }}>
                เพื่อใช้สำหรับการสแกนและบันทึกรูปภาพใบเสร็จลงในรายการบิลของคุณ
              </p>
            </div>

            <div style={{ display: "flex", borderTop: `1px solid ${styles.border}` }}>
              <button
                onClick={() => setShowPermission(false)}
                style={{
                  flex: 1, padding: "16px",
                  border: "none", background: "none",
                  color: styles.subtext,
                  fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  borderRight: `1px solid ${styles.border}`,
                }}
              >
                ไม่อนุญาต
              </button>
              <button
                onClick={handleAllowPermission}
                style={{
                  flex: 1, padding: "16px",
                  border: "none", background: "none",
                  color: styles.primary,
                  fontSize: 15, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                อนุญาต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}