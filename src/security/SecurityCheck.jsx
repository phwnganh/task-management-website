import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function SecurityCheck({ onVerified }) {
  const { t } = useTranslation("login");
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
      <h2>🔐 {t("Verifying you are human...")}</h2>
      {loading ? (
        <Spin
          size="large"
          tip="Please wait a moment..."
          indicator={<LoadingOutlined spin />} //LoadingOutlined: biểu tượng loading dạng xoay (icon từ Ant Design), Spin: component hiển thị hiệu ứng loading.
        ></Spin>
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
          {t("I am not a robot")}
        </Button>
      )}
    </div>
  );
}
