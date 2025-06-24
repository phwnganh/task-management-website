import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../../context/useAuth";
import { apiGetTasksExcludingCurrentUser } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import {
  Avatar,
  Button,
  Dropdown,
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
  UserOutlined,
  AudioOutlined,
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
  const [recognizing, setRecognizing] = useState(false);

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
    setFilteredTasks(
      otherMemberTaskList.filter((record) =>
        record[dataIndex]
          ?.toString()
          .toLowerCase()
          .includes(selectedKeys[0]?.toLowerCase() || "")
      )
    );
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setFilteredTasks(otherMemberTaskList);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => {
      const searchInput = useRef(null);

      const mapI18nToSpeechLang = (lang) => {
        switch (lang) {
          case "vi":
            return "vi-VN";
          case "en":
            return "en-US";
          case "ja":
            return "ja-JP";
          case "zh":
            return "zh-CN";
          case "ko":
            return "ko-KR";
          default:
            return "en-US";
        }
      };

      const handleVoiceSearch = async () => {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
          notification.error({
            message: "Trình duyệt không hỗ trợ nhận diện giọng nói",
            description: "Vui lòng dùng Chrome hoặc Edge",
          });
          return;
        }

        // Kiểm tra quyền microphone
        const permissionStatus = await navigator.permissions
          .query({ name: "microphone" })
          .then((status) => status.state);

        if (permissionStatus === "denied") {
          notification.error({
            message: "Không có quyền truy cập microphone",
            description: (
              <span>
                Vui lòng cấp quyền microphone trong cài đặt trình duyệt.{" "}
                <a
                  href="https://support.google.com/chrome/answer/2693767"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hướng dẫn
                </a>
              </span>
            ),
          });
          return;
        }

        setRecognizing(true);
        const recognition = new SpeechRecognition();
        recognition.lang = mapI18nToSpeechLang(
          t("language")?.split("-")[0] || "vi"
        );
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () =>
          notification.info({
            message: "🎤 Đang nghe...",
            description: "Hãy nói từ khóa tìm kiếm",
            duration: 2,
          });

        recognition.onend = () => {
          setRecognizing(false);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim();
          setSelectedKeys([transcript]);
          handleSearch(selectedKeys, confirm, dataIndex);
          close();
          notification.success({
            message: "✅ Đã nhận",
            description: `"${transcript}"`,
          });
        };

        recognition.onerror = (event) => {
          setRecognizing(false);
          notification.error({
            message: "❌ Lỗi nhận diện",
            description: `Chi tiết: ${event.error}`,
          });
        };

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          recognition.start();
        } catch (err) {
          setRecognizing(false);
          notification.error({
            message: "Không có quyền micro",
            description: "Hãy cấp quyền truy cập micro trong trình duyệt.",
          });
        }
      };

      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`${t("search")} ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: "block" }}
            allowClear
            suffix={
              <Tooltip
                title={recognizing ? "Đang nghe..." : "Tìm bằng giọng nói"}
              >
                <Button
                  icon={<AudioOutlined />}
                  onClick={handleVoiceSearch}
                  loading={recognizing}
                  type={recognizing ? "primary" : "default"}
                  style={{
                    border: "none",
                    boxShadow: "none",
                    paddingInline: 8,
                    marginRight: -8,
                  }}
                />
              </Tooltip>
            }
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
            >
              {t("search")}
            </Button>
            <Button onClick={() => handleReset(clearFilters)} size="small">
              {t("reset")}
            </Button>
          </div>
        </div>
      );
    },
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
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
      render: (assignees, record) => {
        if (!assignees || assignees.length === 0) {
          return <span style={{ color: "#999" }}>No assignees</span>;
        }

        const visible = visibleAssignees[record.id] || assignees.slice(0, 3);
        const remainingCount = assignees.length - visible.length;
        const remainingAssignees = assignees.slice(3);

        const menuItems =
          remainingAssignees.length > 0
            ? remainingAssignees.map((assignee, index) => ({
                key: index,
                label: (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Avatar
                      src={assignee.avatar_url}
                      alt={`${assignee.first_name} ${assignee.last_name}`}
                      size={24}
                      icon={!assignee.avatar_url && <UserOutlined />}
                    />
                    <span>
                      {`${assignee.first_name} ${assignee.last_name}`}
                    </span>
                  </div>
                ),
              }))
            : [
                {
                  key: "no-assignees",
                  label: "No additional assignees",
                  disabled: true,
                },
              ];
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
                  icon={!assignee?.avatar_url && <UserOutlined />}
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
              <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                <Button type="default" style={{ padding: 6, height: "auto" }}>
                  +{remainingCount}
                </Button>
              </Dropdown>
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
            currentUser={user}
          />
        </Modal>
      </Spin>
    </div>
  );
};

export default OtherTaskListTable;
