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
      key: "th",
      label: "ภาษาไทย",
      onClick: () => changeLanguage("th"),
    },
    {
      key: "zh",
      label: "简体中文", // Tiếng Trung giản thể
      onClick: () => changeLanguage("zh"),
    },
  ];

  const currentLangLabel =
    {
      vi: "Tiếng Việt",
      en: "English",
      ja: "日本語",
      th: "ภาษาไทย",
      zh: "简体中文",
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
