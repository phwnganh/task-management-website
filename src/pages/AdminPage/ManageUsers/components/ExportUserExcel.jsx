import React from "react";
import { Button, message, notification } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { apiGetUserList } from "../../../../services/AdminService/ManageUsersService";
import { useTranslation } from "react-i18next";
const ExportUserExcel = () => {
  const { t } = useTranslation("dashboard");
  const handleExport = async () => {
    try {
      const users = await apiGetUserList();

      const exportUsers = users.filter((u) => u.role === "User");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Users");

      worksheet.addRow([
        "First Name",
        "Last Name",
        "Email",
        "Date Of Birth",
        "Phone Number",
        "Address",
        "Status",
      ]);

      exportUsers.forEach((user) => {
        worksheet.addRow([
          user.first_name,
          user.last_name,
          user.email,
          user.date_of_birth,
          user.phone_number,
          user.address,
          user.status,
        ]);
      });

      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      const buf = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), "UserList.xlsx");

      notification.success({
        message: t("Export thành công!"),
        placement: "bottomRight"
      })
    } catch (error) {
      console.error(error);
      notification.error({
        message: t("Export thất bại!"),
        placement: "bottomRight"
      })
    }
  };

  return (
    <Button type="primary" onClick={handleExport} className="bg-blue-500">
      {t("Export Data")}
    </Button>
  );
};

export default ExportUserExcel;
