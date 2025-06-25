import { Button, Modal } from "antd";
import { useState } from "react";
import ExportUserExcel from "./ExportUserExcel";
import { useTranslation } from "react-i18next";

const UserListActionTools = () => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
        {t("Manage Users")}
      </h1>
      <div className="mt-2 md:mt-0">
        <ExportUserExcel />
      </div>
    </div>
  );
};

export default UserListActionTools;
