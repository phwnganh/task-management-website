import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../../context/useAuth";
import { apiGetTasksExcludingCurrentUser } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import {
  Avatar,
  Button,
  Empty,
  Input,
  message,
  Modal,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { TbEye } from "react-icons/tb";
import { PROJECT_LIST } from "../../../../../constants/routes.constants";
import ViewTaskDetailModalDialog from "../../ViewTaskDetail/ViewTaskDetailModalDialog";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const OtherTaskListTable = ({ projectId, filters }) => {
  const { t } = useTranslation("taskcalendar");
  const [otherMemberTaskList, setOtherMemberTaskList] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleAssignees, setVisibleAssignees] = useState({});
  const searchTitleInput = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const otherTasks = await apiGetTasksExcludingCurrentUser(
        projectId,
        user.id
      );
      setOtherMemberTaskList(otherTasks);
      setFilteredTasks(otherTasks);
      const initialVisible = otherTasks.reduce((acc, task) => {
        acc[task.id] = task.assignees?.slice(0, 3) || [];
        return acc;
      }, {});
      setVisibleAssignees(initialVisible);
    } catch (error) {
      message.error(t("errorFetchingTasks"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && user?.id) {
      fetchTasks();
    }
  }, [projectId, user?.id]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...otherMemberTaskList];
      if (filters.priority) {
        filtered = filtered.filter(
          (task) => task.priority === filters.priority
        );
      }
      if (filters.status) {
        filtered = filtered.filter((task) => task.status === filters.status);
      }
      if (filters.start_date) {
        const filterStartDate = dayjs(filters.start_date);
        filtered = filtered.filter(
          (task) =>
            task.start_date &&
            dayjs(task.start_date).isSame(filterStartDate, "day")
        );
      }
      if (filters.due_date) {
        const filterDueDate = dayjs(filters.due_date);
        filtered = filtered.filter(
          (task) =>
            task.due_date && dayjs(task.due_date).isSame(filterDueDate, "day")
        );
      }
      if (filters.assignee && filters.assignee.length > 0) {
        filtered = filtered.filter((task) =>
          task.assignee_ids.some((id) => filters.assignee.includes(id))
        );
      }
      setFilteredTasks(filtered);
    };
    applyFilters();
  }, [filters, otherMemberTaskList]);

  const showTaskDetailModal = (task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskDetailCancel = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchTitleInput}
          placeholder={`${t("search")} ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {t("search")}
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          {t("reset")}
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchTitleInput.current?.select(), 100);
      }
    },
  });

  const showAllAssignees = (taskId) => {
    const task = otherMemberTaskList.find((t) => t.id === taskId);
    if (task) {
      setVisibleAssignees((prev) => ({
        ...prev,
        [taskId]: task.assignees || [],
      }));
    }
  };

  const columns = [
    {
      title: t("taskTitle"),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
    },
    {
      title: t("priority"),
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color;
        switch (priority) {
          case "High":
            color = "red";
            break;
          case "Medium":
            color = "orange";
            break;
          case "Low":
            color = "green";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{priority || "N/A"}</Tag>;
      },
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        switch (status) {
          case "To Do":
            color = "blue";
            break;
          case "In Progress":
            color = "cyan";
            break;
          case "Completed":
            color = "green";
            break;
          default:
            color = "gray";
        }
        return (
          <Tag color={color}>
            {status
              ?.toLowerCase()
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase()) || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: t("startDate"),
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => a.start_date?.localeCompare(b.start_date || ""),
    },
    {
      title: t("dueDate"),
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => {
        if (!date) return "N/A";
        const dueDate = dayjs(date);
        const currentDate = dayjs();
        const isOverdue = dueDate.isBefore(currentDate, "day");
        const isDueSoon =
          dueDate.isSame(currentDate, "day") ||
          dueDate.isSame(currentDate.add(1, "day"), "day");
        return (
          <span
            style={{
              color: isOverdue ? "red" : isDueSoon ? "orange" : "inherit",
              fontWeight: isOverdue ? "bold" : "normal",
            }}
          >
            {dueDate.format("YYYY-MM-DD")}
          </span>
        );
      },
      sorter: (a, b) => a.due_date?.localeCompare(b.due_date || ""),
    },
    {
      title: t("assignees"),
      dataIndex: "assignees",
      key: "assignees",
      render: (assignees = [], record) => {
        const visible = visibleAssignees[record.id] || assignees.slice(0, 3);
        const remainingCount = assignees.length - 3;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {visible.map((assignee, index) => (
              <Tooltip
                key={index}
                title={`${assignee.first_name} ${assignee.last_name}`}
              >
                <Avatar
                  src={assignee?.avatar_url}
                  alt={`${assignee.first_name} ${assignee.last_name}`}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              </Tooltip>
            ))}
            {remainingCount > 0 && (
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => showAllAssignees(record.id)}
                style={{ padding: 0, height: "auto" }}
              >
                +{remainingCount}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <div className="flex flex-row">
          <Button
            onClick={() => showTaskDetailModal(record)}
            icon={<TbEye />}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Spin
        spinning={isLoading}
        indicator={<LoadingOutlined spin />}
        tip={t("loading")}
      >
        <div className="mt-5">
          {otherMemberTaskList.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredTasks}
              rowKey="id"
              pagination={{
                pageSize: 10,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("noTasks")}
            />
          )}
          <div
            className="flex justify-end"
            onClick={() => navigate(PROJECT_LIST)}
          >
            <Button>{t("back")}</Button>
          </div>
        </div>

        <Modal
          title={t("viewtaskdetail")}
          width={750}
          open={isTaskDetailModalOpen}
          onCancel={handleTaskDetailCancel}
          footer={[
            <Button key="close" onClick={handleTaskDetailCancel}>
              {t("close")}
            </Button>,
          ]}
        >
          <ViewTaskDetailModalDialog
            projectId={projectId}
            task={selectedTask}
          />
        </Modal>
      </Spin>
    </div>
  );
};

export default OtherTaskListTable;
