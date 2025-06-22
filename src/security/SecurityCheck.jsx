import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
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
      <h2>🔐 Verifying you are human...</h2>
      {loading ? (
        <Spin size="large" tip="Please wait a moment..." indicator={<LoadingOutlined spin />}></Spin>
      ) : (
        <Button
          style={{
            marginTop: "1rem",
            fontSize: "16px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
          onClick={handleVerify}
        >
          I am not a robot
        </Button>
      )}
    </div>
  );
}
