import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu } from "antd";
import { GlobalOutlined } from "@ant-design/icons";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const menu = (
    <Menu>
      <Menu.Item key="vi" onClick={() => changeLanguage("vi")}>
        Tiếng Việt
      </Menu.Item>
      <Menu.Item key="en" onClick={() => changeLanguage("en")}>
        English
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="h-8 w-8 flex items-center justify-center"
        style={{ fontWeight: 600 }}
      >
        {i18n.language === "vi" ? "Tiếng Việt" : "English"}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
