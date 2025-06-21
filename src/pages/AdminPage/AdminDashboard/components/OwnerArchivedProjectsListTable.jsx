import React from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Table, message } from "antd";
import { useNavigate } from "react-router-dom";
import { ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN } from "../../../../constants/routes.constants";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API } from "../../../../constants/api.constants";
import { getArchivedProjectsWithUserDetails } from "../../../../services/AdminService/DashboardService";

const OwnerArchivedProjectsListTable = () => {
  const handleExportExcel = async () => {
    try {
      // Gọi service lấy danh sách project đã archive kèm user
      const projects = await getArchivedProjectsWithUserDetails();

      // Tạo workbook exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Archived Projects");

      // Thêm header
      worksheet.columns = [
        { header: "Project Name", key: "project_name", width: 30 },
        { header: "Owner Name", key: "owner_name", width: 28 },
        { header: "Archived Date", key: "archived_date", width: 16 },
        { header: "Time Archived", key: "time_archived", width: 18 },
      ];

      // Helper tính "n days ago"
      const getDaysAgo = (archivedDateStr) => {
        const archivedDate = new Date(archivedDateStr);
        const now = new Date();
        const diff = Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "Today";
        if (diff === 1) return "1 day ago";
        return `${diff} days ago`;
      };

      // Thêm dữ liệu từng dòng
      projects.forEach((p) => {
        worksheet.addRow({
          project_name: p.title || "",
          owner_name: p.user
            ? `${p.user.first_name ?? ""} ${p.user.last_name ?? ""}`.trim()
            : "",
          archived_date: p.archived_at
            ? new Date(p.archived_at).toISOString().slice(0, 10)
            : "",
          time_archived: p.archived_at ? getDaysAgo(p.archived_at) : "",
        });
      });

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Archived_Projects.xlsx");
      message.success("Exported Excel successfully!");
    } catch (err) {
      message.error("Export failed!");
    }
  };

  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
              View Archived Projects
            </h1>
            <div className="mt-2 md:mt-0">
              <Button type="primary" size="large" onClick={handleExportExcel}>
                Export Data
              </Button>
            </div>
          </div>
          <Table scroll={{ x: "max-content" }} />
          <Button
            onClick={() => navigate(ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN)}
          >
            Back
          </Button>
        </div>
      </PostLoginLayout>
    </>
  );
};

export default OwnerArchivedProjectsListTable;
