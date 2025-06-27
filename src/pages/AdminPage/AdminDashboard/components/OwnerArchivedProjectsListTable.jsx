import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Table, message, Input, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN } from "../../../../constants/routes.constants";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getArchivedProjectsWithUserDetails } from "../../../../services/AdminService/DashboardService";
import { v4 as uuidv4 } from "uuid";
import {
  apiDeleteProjects,
  apiGetProjectDetail,
} from "../../../../services/UserService/ManageProjectsService";
import {
  REMINDER_DELETED_PROJECTS,
  REMINDER_RESTORED_PROJECTS,
} from "../../../../constants/notifications.constants";
import dayjs from "dayjs";
import { apiCreateNotifications } from "../../../../services/UserService/NotificationsService";

const { Search } = Input;

const OwnerArchivedProjectsListTable = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getArchivedProjectsWithUserDetails();
      setProjects(data);
    } catch (error) {
      message.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const checkAndHandleExpiredProjects = async () => {
    if (projects.length === 0) return;

    const now = new Date();
    for (const project of projects) {
      const archivedDate = project.archived_at
        ? new Date(project.archived_at)
        : null;
      if (!archivedDate) continue;

      const diffDays = Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 30) {
        const notificationData = {
          id: uuidv4(),
          type: REMINDER_DELETED_PROJECTS,
          project_id: project.id,
          recipient_id: project.user?.id,
          initiator_id: "system",
          message: t("autoDeleteNotification", {
            project: { title: project.title },
          }),
          status: "Unread",
          created_at: dayjs().toISOString(),
        };

        try {
          await apiCreateNotifications(notificationData);
          await apiDeleteProjects(project.id);

          notification.success({
            message: t("deleteSuccess", { project: { title: project.title } }),
            placement: "bottomRight",
          });
        } catch (error) {
          notification.error({
            message: t("deleteFailed", {
              project: { title: project.title },
              error: { message: error.message },
            }),
            placement: "bottomRight",
          });
        }
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    checkAndHandleExpiredProjects();
  }, [projects]);

  const getDaysAgo = (archivedDateStr) => {
    if (!archivedDateStr) return "";
    const archivedDate = new Date(archivedDateStr);
    const now = new Date();
    const diff = Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t("Today");
    if (diff >= 30) return t("expired");
    const daysRemaining = 30 - diff;
    // return `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`;
    return t("daysRemaining", { count: daysRemaining });
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Archived Projects");

      worksheet.columns = [
        { header: t("columnProjectName"), key: "project_name", width: 30 },
        { header: t("columnOwnerName"), key: "owner_name", width: 28 },
        { header: t("columnArchivedDate"), key: "archived_date", width: 16 },
        { header: t("columnTimeArchived"), key: "time_archived", width: 18 },
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
      message.success(t("exportSuccess"));
    } catch (err) {
      message.error(t("exportFailed"));
    }
  };

  const handleSendReminder = async (
    archived_at,
    projectTitle,
    userId,
    projectId
  ) => {
    const archivedDate = new Date(archived_at);
    const now = new Date();
    const diffDays = Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) {
      notification.error({
        message: t("alreadyDeletedNotification", {
          project: { title: projectTitle },
        }),
        placement: "bottomRight",
      });
      return;
    }
    const daysRemaining = 30 - diffDays;
    if (daysRemaining <= 0) {
      notification.error({
        message: t("cannotRestoreNotification", {
          project: { title: projectTitle },
        }),
        placement: "bottomRight",
      });
      return;
    }
    const notificationData = {
      id: uuidv4(),
      type: REMINDER_RESTORED_PROJECTS,
      project_id: projectId,
      recipient_id: userId,
      initiator_id: "system",
      message: t("reminderMessage", { daysRemaining, projectTitle }),
      status: "Unread",
      created_at: dayjs().toISOString(),
    };
    try {
      await apiCreateNotifications(notificationData);
      notification.success({
        message: t("reminderSuccess"),
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: error.message,
        placement: "bottomRight",
      });
    }
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
          placeholder={t(placeholder)}
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
            {t("searchButton")}
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            {t("resetButton")}
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
          ? `${record.user.first_name || ""} ${
              record.user.last_name || ""
            }`.trim()
          : "";
        return ownerName.toLowerCase().includes(value.toLowerCase());
      }
      return false;
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.focus(), 100);
        }
      },
    },
  });

  const columns = [
    {
      title: t("columnProjectName"),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      ...getColumnSearchProps("title", "searchProjectNamePlaceholder"),
    },
    {
      title: t("columnOwnerName"),
      key: "owner_name",
      render: (_, record) =>
        record.user
          ? `${record.user.first_name || ""} ${
              record.user.last_name || ""
            }`.trim()
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
      ...getColumnSearchProps("owner_name", "searchOwnerNamePlaceholder"),
    },
    {
      title: t("columnArchivedDate"),
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
      title: t("columnTimeArchived"),
      key: "time_archived",
      render: (_, record) => {
        const daysText = getDaysAgo(record.archived_at);
        let textColor = "";
        const match = daysText.match(/^(\d+)\s+day(s)?\s+remaining$/); //xxxxxxxxxx
        if (match) {
          const days = parseInt(match[1], 10);
          if (days === 1) {
            textColor = "text-red-500";
          } else if (days >= 2 && days <= 23) {
            textColor = "text-yellow-500";
          }
        }

        return <span className={textColor}>{daysText}</span>;
      },
      sorter: (a, b) => {
        const dateA = a.archived_at ? new Date(a.archived_at).getTime() : 0;
        const dateB = b.archived_at ? new Date(b.archived_at).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: t("columnAction"),
      key: "action",
      render: (_, record) => {
        const archivedDate = record.archived_at
          ? new Date(record.archived_at)
          : null;
        const now = new Date();
        const diffDays = archivedDate
          ? Math.floor((now - archivedDate) / (1000 * 60 * 60 * 24))
          : 0;
        const isDisabled = diffDays < 7 || diffDays >= 30;
        return (
          <Button
            type="primary"
            size="large"
            onClick={() =>
              handleSendReminder(
                record.archived_at,
                record.title,
                record.user?.id,
                record.id
              )
            }
            disabled={isDisabled}
          >
            {t("sendReminderButton")}
          </Button>
        );
      },
    },
  ];

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
            {t("viewArchivedProjectsTitle")}
          </h1>
          <div className="mt-2 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2 md:gap-3">
            <Button
              type="primary"
              size="large"
              className="w-full md:w-auto"
              onClick={handleExportExcel}
            >
              {t("Export Data")}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="min-w-[600px]"
          />
        </div>
        <div className="flex flex-row justify-end">
          <Button
            className="mt-4 w-full md:w-auto"
            onClick={() => navigate(ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN)}
          >
            {t("Back")}
          </Button>
        </div>
      </div>
    </PostLoginLayout>
  );
};

export default OwnerArchivedProjectsListTable;
