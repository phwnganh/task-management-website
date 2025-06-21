import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu } from "antd";
import { GlobalOutlined } from "@ant-design/icons";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const menuItems = [
    {
      key: "vi",
      label: "Tiếng Việt",
      onClick: () => changeLanguage("vi"),
    },
    {
      key: "en",
      label: "English",
      onClick: () => changeLanguage("en"),
    },
    {
      key: "ja",
      label: "日本語",
      onClick: () => changeLanguage("ja"),
    },
    {
      key: "zh",
      label: "简体中文", // Tiếng Trung giản thể
      onClick: () => changeLanguage("zh"),
    },
    {
      key: "ko",
      label: "한국어", // Tiếng Hàn
      onClick: () => changeLanguage("ko"),
    },
  ];

  const currentLangLabel =
    {
      vi: "Tiếng Việt",
      en: "English",
      ja: "日本語",
      zh: "简体中文",
      ko: "한국어",
    }[i18n.language] || "English"; // fallback nếu có lỗi

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="h-8 w-8 flex items-center justify-center"
        style={{ fontWeight: 600 }}
      >
        {currentLangLabel}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
