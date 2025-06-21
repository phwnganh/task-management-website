import React from "react";
import { Button, message } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { apiGetUserList } from "../../../../services/AdminService/ManageUsersService";
const ExportUserExcel = () => {
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

      message.success("Export thành công!");
    } catch (error) {
      console.error(error);
      message.error("Export thất bại!");
    }
  };

  return (
    <Button type="primary" onClick={handleExport} className="bg-blue-500">
      Export Data
    </Button>
  );
};

export default ExportUserExcel;
