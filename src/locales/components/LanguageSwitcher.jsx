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
  ];

  const currentLangLabel =
    {
      vi: "Tiếng Việt",
      en: "English",
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
