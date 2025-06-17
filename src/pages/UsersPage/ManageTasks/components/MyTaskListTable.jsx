import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
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
import { React, useEffect, useRef, useState } from "react";
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

const { Option } = Select; // Add this line to import Option from Select

const MyTaskListTable = ({ projectId, filters, project }) => {
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
    setEditingTask(task); // task là record của dòng đó
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
      message.error("Error fetching data");
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
  };

  const handleReset = (clearFilters) => {
    clearFilters();
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
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchTitleInput}
          placeholder={`Search ${dataIndex}`}
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
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
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
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchTitleInput.current?.select(), 100);
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
        message: "Success",
        description: "Task status updated successfully",
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update task status",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "Task Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
    },
    {
      title: "Priority",
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
            color = "Gray";
        }
        return <Tag color={color}>{priority || "N/A"}</Tag>;
      },
    },
    {
      title: "Status",
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
              root: { minWidth: 120 }, // Replace deprecated dropdownStyle
            },
          }}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          disabled={status === "Completed"}
        >
          {["To Do", "In Progress", "Completed"].map((option) => (
            <Select.Option key={option} value={option}>
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
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
    },
    {
      title: "Due Date",
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
      title: "Action",
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
                ? "Cannot edit completed task"
                : "Edit"
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
      tip="Loading..."
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
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
        )}
        <div
          className="flex justify-end"
          onClick={() => navigate(`${PROJECT_LIST}`)}
        >
          <Button>Back</Button>
        </div>
      </div>

      <Modal
        width={750}
        open={isEditTaskModalOpen}
        onCancel={handleEditTaskModalCancel}
        footer={null} // ❗️Ẩn toàn bộ footer để dùng footer trong EditMyTaskForm
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
              // paddingBottom: "10px",
              borderBottom: "3px solid #1890ff",
              fontWeight: "bold",
            }}
          >
            View Task Detail
          </div>
        }
        width={750}
        open={isTaskDetailModalOpen}
        onCancel={handleTaskDetailCancel}
        footer={[
          <Button key={"close"} onClick={handleTaskDetailCancel}>
            Close
          </Button>,
        ]}
        style={{
          maxHeight: "100%", // Chiều cao tối đa của nội dung modal (70% chiều cao viewport)
          overflowY: "auto", // Bật cuộn dọc
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
