import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import sidebarEN from "./locales/en/SideBar.json";
import sidebarVI from "./locales/vi/SideBar.json";
import sidebarJP from "./locales/jp/SideBar.json";
import sidebarTH from "./locales/th/SideBar.json";
import userdashboardEN from "./locales/en/UserDashboard.json";
import userdashboardVI from "./locales/vi/UserDashboard.json";
import userdashboardJP from "./locales/jp/UserDashboard.json";
import userdashboardTH from "./locales/th/UserDashboard.json";
import headerEN from "./locales/en/Header.json";
import headerVI from "./locales/vi/Header.json";
import headerJP from "./locales/jp/Header.json";
import headerTH from "./locales/th/Header.json";
import labelEN from "./locales/en/Label.json";
import labelVI from "./locales/vi/Label.json";
import labelJP from "./locales/jp/Label.json";
import labelTH from "./locales/th/Label.json";
import taskownerEN from "./locales/en/TaskOwner.json";
import taskownerVI from "./locales/vi/TaskOwner.json";
import taskownerJP from "./locales/jp/TaskOwner.json";
import taskownerTH from "./locales/th/TaskOwner.json";
import taskmemberEN from "./locales/en/TaskMember.json";
import taskmemberVI from "./locales/vi/TaskMember.json";
import taskmemberJP from "./locales/jp/TaskMember.json";
import taskmemberTH from "./locales/th/TaskMember.json";
import dashboardEN from "./locales/en/Dashboard.json";
import dashboardVI from "./locales/vi/Dashboard.json";
import dashboardJP from "./locales/jp/Dashboard.json";
import dashboardTH from "./locales/th/Dashboard.json";
import userinforEN from "./locales/en/UserInfor.json";
import userinforVI from "./locales/vi/UserInfor.json";
import userinforJP from "./locales/jp/UserInfor.json";
import userinforTH from "./locales/th/UserInfor.json";
import changepwEN from "./locales/en/ChangePW.json";
import changepwVI from "./locales/vi/ChangePW.json";
import changepwJP from "./locales/jp/ChangePW.json";
import changepwTH from "./locales/th/ChangePW.json";
import taskcalendarEN from "./locales/en/TaskCalendar.json";
import taskcalendarVI from "./locales/vi/TaskCalendar.json";
import taskcalendarJP from "./locales/jp/TaskCalendar.json";
import taskcalendarTH from "./locales/th/TaskCalendar.json";
import managerprojectEN from "./locales/en/ManagerProject.json";
import managerprojectVI from "./locales/vi/ManagerProject.json";
import managerprojectJP from "./locales/jp/ManagerProject.json";
import managerprojectTH from "./locales/th/ManagerProject.json";

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
        taskcalendar: taskcalendarEN,
        mp: managerprojectEN,
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
        taskcalendar: taskcalendarVI,
        mp: managerprojectVI,
      },
      ja: {
        sidebar: sidebarJP,
        userdashboard: userdashboardJP,
        header: headerJP,
        labellist: labelJP,
        taskowner: taskownerJP,
        taskmember: taskmemberJP,
        dashboard: dashboardJP,
        userinfor: userinforJP,
        changepwuser: changepwJP,
        taskcalendar: taskcalendarJP,
        mp: managerprojectJP,
      },
      th: {
        sidebar: sidebarTH,
        userdashboard: userdashboardTH,
        header: headerTH,
        labellist: labelTH,
        taskowner: taskownerTH,
        taskmember: taskmemberTH,
        dashboard: dashboardTH,
        userinfor: userinforTH,
        changepwuser: changepwTH,
        taskcalendar: taskcalendarTH,
        mp: managerprojectTH,
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
      "taskcalendar",
      "mp",
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
