import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import sidebarEN from "./locales/en/SideBar.json";
import sidebarVI from "./locales/vi/SideBar.json";
import sidebarJP from "./locales/jP/SideBar.json";
import sidebarZH from "./locales/zh/SideBar.json";
import sidebarKO from "./locales/ko/SideBar.json";
import userdashboardEN from "./locales/en/UserDashboard.json";
import userdashboardVI from "./locales/vi/UserDashboard.json";
import userdashboardJP from "./locales/jP/UserDashboard.json";
import userdashboardZH from "./locales/zh/UserDashboard.json";
import userdashboardKO from "./locales/ko/UserDashboard.json";
import headerEN from "./locales/en/Header.json";
import headerVI from "./locales/vi/Header.json";
import headerJP from "./locales/jP/Header.json";
import headerZH from "./locales/zh/Header.json";
import headerKO from "./locales/ko/Header.json";
import labelEN from "./locales/en/Label.json";
import labelVI from "./locales/vi/Label.json";
import labelJP from "./locales/jP/Label.json";
import labelZH from "./locales/zh/Label.json";
import labelKO from "./locales/ko/Label.json";
import taskownerEN from "./locales/en/TaskOwner.json";
import taskownerVI from "./locales/vi/TaskOwner.json";
import taskownerJP from "./locales/jP/TaskOwner.json";
import taskownerZH from "./locales/zh/TaskOwner.json";
import taskownerKO from "./locales/ko/TaskOwner.json";
import taskmemberEN from "./locales/en/TaskMember.json";
import taskmemberVI from "./locales/vi/TaskMember.json";
import taskmemberJP from "./locales/jP/TaskMember.json";
import taskmemberZH from "./locales/zh/TaskMember.json";
import taskmemberKO from "./locales/ko/TaskMember.json";
import dashboardEN from "./locales/en/Dashboard.json";
import dashboardVI from "./locales/vi/Dashboard.json";
import dashboardJP from "./locales/jP/Dashboard.json";
import dashboardZH from "./locales/zh/Dashboard.json";
import dashboardKO from "./locales/ko/Dashboard.json";
import userinforEN from "./locales/en/UserInfor.json";
import userinforVI from "./locales/vi/UserInfor.json";
import userinforJP from "./locales/jP/UserInfor.json";
import userinforZH from "./locales/zh/UserInfor.json";
import userinforKO from "./locales/ko/UserInfor.json";
import changepwEN from "./locales/en/ChangePW.json";
import changepwVI from "./locales/vi/ChangePW.json";
import changepwJP from "./locales/jP/ChangePW.json";
import changepwZH from "./locales/zh/ChangePW.json";
import changepwKO from "./locales/ko/ChangePW.json";
import taskcalendarEN from "./locales/en/TaskCalendar.json";
import taskcalendarVI from "./locales/vi/TaskCalendar.json";
import taskcalendarJP from "./locales/jP/TaskCalendar.json";
import taskcalendarZH from "./locales/zh/TaskCalendar.json";
import taskcalendarKO from "./locales/ko/TaskCalendar.json";
import managerprojectEN from "./locales/en/ManagerProject.json";
import managerprojectVI from "./locales/vi/ManagerProject.json";
import managerprojectJP from "./locales/jP/ManagerProject.json";
import managerprojectZH from "./locales/zh/ManagerProject.json";
import managerprojectKO from "./locales/ko/ManagerProject.json";

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
      zh: {
        sidebar: sidebarZH,
        userdashboard: userdashboardZH,
        header: headerZH,
        labellist: labelZH,
        taskowner: taskownerZH,
        taskmember: taskmemberZH,
        dashboard: dashboardZH,
        userinfor: userinforZH,
        changepwuser: changepwZH,
        taskcalendar: taskcalendarZH,
        mp: managerprojectZH,
      },
      ko: {
        sidebar: sidebarKO,
        userdashboard: userdashboardKO,
        header: headerKO,
        labellist: labelKO,
        taskowner: taskownerKO,
        taskmember: taskmemberKO,
        dashboard: dashboardKO,
        userinfor: userinforKO,
        changepwuser: changepwKO,
        taskcalendar: taskcalendarKO,
        mp: managerprojectKO,
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
