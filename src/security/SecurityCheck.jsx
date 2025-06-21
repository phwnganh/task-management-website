import { useEffect, useState } from "react";

export default function SecurityCheck({ onVerified }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleVerify = () => {
    localStorage.setItem("isVerified", "true");
    onVerified();
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "20%" }}>
      <h2>🔐 Đang xác minh bạn là người thật...</h2>
      {loading ? (
        <p>Vui lòng chờ trong giây lát...</p>
      ) : (
        <button
          style={{
            marginTop: "1rem",
            fontSize: "16px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
          onClick={handleVerify}
        >
          Tôi không phải robot
        </button>
      )}
    </div>
  );
}
