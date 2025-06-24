import {
  LoadingOutlined,
  SearchOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import {
  Button,
  Empty,
  Input,
  message,
  Modal,
  notification,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import dayjs from "dayjs";
import { TbEye, TbPencil } from "react-icons/tb";
import EditMyTaskModalDialog from "../EditTask/EditMyTaskModalDialog";
import ViewTaskDetailModalDialog from "../ViewTaskDetail/ViewTaskDetailModalDialog";
import {
  apiGetTaskListByAssignee,
  apiUpdateTaskStatus,
} from "../../../../services/UserService/ManageTasksService";
import { apiRequestToUpdateTaskByMember } from "../../../../services/UserService/ManageTasksService";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { useNavigate } from "react-router-dom";
import { apiCreateNotifications } from "../../../../services/UserService/NotificationsService";
import { v4 as uuidv4 } from "uuid";
import { TASK_EDIT_REQUEST } from "../../../../constants/notifications.constants";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const { Option } = Select;

const MyTaskListTable = ({ projectId, filters, project }) => {
  const [recognizing, setRecognizing] = useState(false);
  const { t } = useTranslation("taskcalendar");
  const [myTaskList, setMyTaskList] = useState([]);
  const [myFilterTasks, setMyFilterTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchTitleInput = useRef(null);
  const [editingTask, setEditingTask] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);

  const formRef = useRef();

  const showTaskDetailModal = (record) => {
    setSelectedTask(record);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskDetailCancel = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const showEditTaskModal = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleEditTaskModalCancel = () => {
    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  const renderMyTask = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const myTasks = await apiGetTaskListByAssignee(user.id, projectId);
      setMyTaskList(myTasks);
      setMyFilterTasks(myTasks);
    } catch (error) {
      message.error(t("errorFetchingTasks"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...myTaskList];
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
      setMyFilterTasks(filtered);
    };
    applyFilters();
  }, [filters, myTaskList]);

  useEffect(() => {
    renderMyTask(projectId);
  }, [user.id, projectId]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setMyFilterTasks(
      myTaskList.filter((record) =>
        record[dataIndex]
          ?.toString()
          .toLowerCase()
          .includes(selectedKeys[0]?.toLowerCase() || "")
      )
    );
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setMyFilterTasks(myTaskList);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "blue";
      case "In Progress":
        return "cyan";
      case "Completed":
        return "green";
      default:
        return "gray";
    }
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

        // Kiểm tra trạng thái quyền microphone
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
        recognition.lang = mapI18nToSpeechLang(i18n.language);
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
          notification.destroy(); // huỷ các notification đang hiện
          notification.info({
            message: "🎤 Đang nghe...",
            description: "Hãy nói từ khóa tìm kiếm",
            duration: 2,
          });
        };

        recognition.onend = () => {
          setRecognizing(false);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim();
          setSelectedKeys([transcript]);
          handleSearch([transcript], confirm, dataIndex);
          close();

          // Xóa toàn bộ notification cũ trước khi hiện cái mới
          notification.destroy();
          notification.success({
            message: "✅ Đã nhận dạng",
            description: `"${transcript}"`,
            duration: 3,
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
      record[dataIndex]
        ? record[dataIndex].toLowerCase().includes(value.toLowerCase())
        : "",
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setIsLoading(true);
      await apiUpdateTaskStatus(taskId, newStatus);
      const updatedTaskList = myTaskList.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setMyTaskList(updatedTaskList);
      setMyFilterTasks(updatedTaskList);
      notification.success({
        message: t("success"),
        description: t("taskStatusUpdated"),
        placement: "bottomRight",
      });

      const notificationData = {
        id: uuidv4(),
        sender_id: user.id,
        receiver_id: project.is_owner,
        type: TASK_EDIT_REQUEST,
        content: `${user.first_name} ${user.last_name} updated task status to ${newStatus} (Task ID: ${taskId})`,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      await apiCreateNotifications(notificationData);
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("failedUpdateTaskStatus"),
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
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
      render: (status, record) => (
        <Select
          value={status}
          style={{
            width: 120,
            borderRadius: 10,
            fontWeight: 500,
            textAlign: "center",
            backgroundColor: `${getStatusColor(status)}20`,
            color: getStatusColor(status),
          }}
          styles={{
            popup: {
              root: { minWidth: 120 },
            },
          }}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          disabled={status === "Completed"}
        >
          {["To Do", "In Progress", "Completed"].map((option) => (
            <Option key={option} value={option}>
              <Tag
                color={getStatusColor(option)}
                style={{
                  margin: 0,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {option}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: t("startDate"),
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
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
      sorter: (a, b) => a.due_date.localeCompare(b.due_date),
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
          <Tooltip
            title={
              record.status === "Completed"
                ? t("cannotEditCompletedTask")
                : t("edit")
            }
          >
            <Button
              onClick={() => showEditTaskModal(record)}
              style={{ marginLeft: 16 }}
              icon={<TbPencil />}
              disabled={record.status === "Completed"}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="mt-5">
        {myTaskList.length > 0 ? (
          <Table
            columns={columns}
            dataSource={myFilterTasks}
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
          onClick={() => navigate(`${PROJECT_LIST}`)}
        >
          <Button>{t("back")}</Button>
        </div>
      </div>

      <Modal
        width={750}
        open={isEditTaskModalOpen}
        onCancel={handleEditTaskModalCancel}
        footer={null}
      >
        <EditMyTaskModalDialog
          ref={formRef}
          task={editingTask}
          editingTask={editingTask}
          user={user}
          project={project}
          onChangeForm={setHasChanged}
          onClose={handleEditTaskModalCancel}
        />
      </Modal>

      <Modal
        title={
          <div
            style={{
              borderBottom: "3px solid #1890ff",
              fontWeight: "bold",
            }}
          >
            {t("viewtaskdetail")}
          </div>
        }
        width={750}
        open={isTaskDetailModalOpen}
        onCancel={handleTaskDetailCancel}
        footer={[
          <Button key="close" onClick={handleTaskDetailCancel}>
            {t("close")}
          </Button>,
        ]}
        style={{
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        {selectedTask && (
          <ViewTaskDetailModalDialog task={selectedTask} currentUser={user} />
        )}
      </Modal>
    </Spin>
  );
};

export default MyTaskListTable;
