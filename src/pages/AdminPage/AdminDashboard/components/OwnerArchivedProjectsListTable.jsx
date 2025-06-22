import React, { useState, useEffect, useRef } from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Table, message, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN } from "../../../../constants/routes.constants";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getArchivedProjectsWithUserDetails } from "../../../../services/AdminService/DashboardService";

const { Search } = Input;

const OwnerArchivedProjectsListTable = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await getArchivedProjectsWithUserDetails();
        setProjects(data);
      } catch (error) {
        message.error("Failed to load archived projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getDaysAgo = (archivedDateStr) => {
    if (!archivedDateStr) return "";
    const archivedDate = new Date(archivedDateStr);
    const now = new Date();
    const diff = Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Archived Projects");

      worksheet.columns = [
        { header: "Project Name", key: "project_name", width: 30 },
        { header: "Owner Name", key: "owner_name", width: 28 },
        { header: "Archived Date", key: "archived_date", width: 16 },
        { header: "Time Archived", key: "time_archived", width: 18 },
      ];

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

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Archived_Projects.xlsx");
      message.success("Exported Excel successfully!");
    } catch (err) {
      message.error("Export failed!");
    }
  };

  const handleSendReminder = (name) => {
    message.info(`Reminder sent for project name: ${name}`);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <span style={{ color: filtered ? "#1890ff" : undefined }}>🔍</span>
    ),
    onFilter: (value, record) => {
      if (dataIndex === "title") {
        return (record.title || "")
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      }
      if (dataIndex === "owner_name") {
        const ownerName = record.user
          ? `${record.user.first_name || ""} ${record.user.last_name || ""}`.trim()
          : "";
        return ownerName.toLowerCase().includes(value.toLowerCase());
      }
      return false;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.focus(), 100);
      }
    },
  });

  const columns = [
    {
      title: "Project Name",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      ...getColumnSearchProps("title", "Search by Project Name"),
    },
    {
      title: "Owner Name",
      key: "owner_name",
      render: (_, record) =>
        record.user
          ? `${record.user.first_name || ""} ${record.user.last_name || ""}`.trim()
          : "",
      sorter: (a, b) => {
        const nameA = a.user
          ? `${a.user.first_name || ""} ${a.user.last_name || ""}`.trim()
          : "";
        const nameB = b.user
          ? `${b.user.first_name || ""} ${b.user.last_name || ""}`.trim()
          : "";
        return nameA.localeCompare(nameB);
      },
      ...getColumnSearchProps("owner_name", "Search by Owner Name"),
    },
    {
      title: "Archived Date",
      key: "archived_at",
      render: (_, record) =>
        record.archived_at
          ? new Date(record.archived_at).toISOString().slice(0, 10)
          : "",
      sorter: (a, b) => {
        const dateA = a.archived_at ? new Date(a.archived_at).getTime() : 0;
        const dateB = b.archived_at ? new Date(b.archived_at).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: "Time Archived",
      key: "time_archived",
      render: (_, record) => getDaysAgo(record.archived_at),
      sorter: (a, b) => {
        const dateA = a.archived_at ? new Date(a.archived_at).getTime() : 0;
        const dateB = b.archived_at ? new Date(b.archived_at).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="large"
          onClick={() => handleSendReminder(record.title)}
        >
          Send Reminder
        </Button>
      ),
    },
  ];

  return (
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
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Button
          className="mt-4"
          onClick={() => navigate(ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN)}
        >
          Back
        </Button>
      </div>
    </PostLoginLayout>
  );
};

export default OwnerArchivedProjectsListTable;