import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import sidebarEN from "./locales/en/SideBar.json";
import sidebarVI from "./locales/vi/SideBar.json";
import userdashboardEN from "./locales/en/UserDashboard.json";
import userdashboardVI from "./locales/vi/UserDashboard.json";
import headerEN from "./locales/en/Header.json";
import headerVI from "./locales/vi/Header.json";
import labelEN from "./locales/en/Label.json";
import labelVI from "./locales/vi/Label.json";
import taskownerEN from "./locales/en/TaskOwner.json";
import taskownerVI from "./locales/vi/TaskOwner.json";
import taskmemberEN from "./locales/en/TaskMember.json";
import taskmemberVI from "./locales/vi/TaskMember.json";
import dashboardEN from "./locales/en/Dashboard.json";
import dashboardVI from "./locales/vi/Dashboard.json";
import userinforEN from "./locales/en/UserInfor.json";
import userinforVI from "./locales/vi/UserInfor.json";
import changepwEN from "./locales/en/ChangePW.json";
import changepwVI from "./locales/vi/ChangePW.json";

// Lấy ngôn ngữ đã lưu từ localStorage hoặc dùng mặc định là 'en'
const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        sidebar: sidebarEN,
        userdashboard: userdashboardEN,
        header: headerEN,
        labellist: labelEN,
        taskowner: taskownerEN,
        taskmember: taskmemberEN,
        dashboard: dashboardEN,
        userinfor: userinforEN,
        changepwuser: changepwEN,
      },
      vi: {
        sidebar: sidebarVI,
        userdashboard: userdashboardVI,
        header: headerVI,
        labellist: labelVI,
        taskowner: taskownerVI,
        taskmember: taskmemberVI,
        dashboard: dashboardVI,
        userinfor: userinforVI,
        changepwuser: changepwVI,
      },
    },
    lng: savedLanguage, // Sử dụng ngôn ngữ từ localStorage làm mặc định
    fallbackLng: "en", // Ngôn ngữ dự phòng nếu không tìm thấy
    ns: [
      "sidebar",
      "userdashboard",
      "header",
      "labellist",
      "taskowner",
      "taskmember",
      "dashboard",
      "userinfor",
      "changepwuser",
    ], // Đăng ký các namespace sử dụng
    defaultNS: "userdashboard", // Namespace mặc định
    interpolation: {
      escapeValue: false,
    },
    // Cấu hình LanguageDetector để ưu tiên ngôn ngữ đã lưu trong localStorage
    detection: {
      order: ["localStorage", "navigator"], // Ưu tiên localStorage trước, sau đó là ngôn ngữ trình duyệt
      lookupLocalStorage: "i18nextLng", // Key lưu trong localStorage
      caches: ["localStorage"], // Lưu ngôn ngữ vào localStorage
    },
  });

// Lắng nghe sự kiện thay đổi ngôn ngữ và lưu vào localStorage
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});

export default i18n;
