import { useEffect, useRef, useState } from "react";
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
  Form,
  notification,
  Menu,
  Dropdown,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { TbEye, TbPencil } from "react-icons/tb";
import dayjs from "dayjs";
import EditTaskModalDialog from "../EditTask/EditTaskModalDialog";
import ViewTaskDetailModalDialog from "../ViewTaskDetail/ViewTaskDetailModalDialog";
import { apiGetTasksWithAssigneesByProject } from "../../../../services/UserService/ManageMembersInsideProjectService";
import { apiGetPublicLabelList } from "../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../services/UserService/ManageMembersInsideProjectService";
import { apiUpdateTaskByOwner } from "../../../../services/UserService/ManageTasksService";
import { useAuth } from "../../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { PROJECT_LIST } from "../../../../constants/routes.constants";

const TasksListTable = ({ projectId, filters }) => {
  const [taskListByProject, setTaskListByProject] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleAssignees, setVisibleAssignees] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const searchTitleInput = useRef(null);
  const [editingTask, setEditingTask] = useState(null);
  const [labels, setLabels] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const { user } = useAuth(); // user sẽ có user.id hoặc user._id
  const showTaskDetailModal = (record) => {
    setSelectedTask(record);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskDetailCancel = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  // const showEditTaskModal = () => {
  //   setIsEditTaskModalOpen(true);
  // };

  const showEditTaskModal = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleEditTaskModalCancel = () => {
    setIsEditTaskModalOpen(false);
  };

  const renderTasksByProject = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const tasks = await apiGetTasksWithAssigneesByProject(projectId);
      setTaskListByProject(tasks);
      setFilteredTasks(tasks);
      const initialVisible = tasks.reduce((acc, task) => {
        acc[task.id] = task.assignees.slice(0, 3);
        return acc;
      }, {});
      setVisibleAssignees(initialVisible);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error fetching data",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...taskListByProject];
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
  }, [filters, taskListByProject]);

  useEffect(() => {
    // Thay ownerId bằng userId thực tế của bạn (ai là người tạo label)
    const ownerId = user?.id;
    const fetchLabelsAndMembers = async () => {
      try {
        const fetchedLabels = await apiGetPublicLabelList(ownerId);
        setLabels(fetchedLabels);

        const fetchedMembers = await apiGetProjectMembers(projectId);
        // Convert về array {id, first_name, last_name, avatar_url}
        const memberList = fetchedMembers.map((m) => ({
          id: m.user_details.id,
          first_name: m.user_details.first_name,
          last_name: m.user_details.last_name,
          avatar_url: m.user_details.avatar_url,
        }));
        setProjectMembers(memberList);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Error fetching members or labels",
          placement: "bottomRight",
        });
      }
    };
    if (projectId) fetchLabelsAndMembers();
  }, [projectId]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const navigate = useNavigate();

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

  const showAllAssignees = (taskId) => {
    const task = taskListByProject.find((t) => t.id === taskId);
    if (task) {
      setVisibleAssignees((prev) => ({
        ...prev,
        [taskId]: task.assignees,
      }));
    }
  };

  const columns = [
    {
      title: "Task Title",
      dataIndex: "title", // Adjust according to your task object structure
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
    },
    {
      title: "Priority",
      dataIndex: "priority", // Adjust according to your task object structure
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
      dataIndex: "status", // Adjust according to your task object structure
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
      title: "Start Date",
      dataIndex: "start_date", // Adjust according to your task object structure
      key: "start_date",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
    },
    {
      title: "Due Date",
      dataIndex: "due_date", // Adjust according to your task object structure
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
      title: "Assignees",
      dataIndex: "assignees", // Adjust according to your task object structure
      key: "assignees",
      render: (assignees, record) => {
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
                    />
                    <span>
                      {assignee.id === user.id
                        ? "Me"
                        : `${assignee.first_name} ${assignee.last_name}`}
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
                title={
                  assignee.id === user.id
                    ? "Me"
                    : `${assignee.first_name} ${assignee.last_name}`
                }
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

  useEffect(() => {
    renderTasksByProject(projectId);
  }, [projectId]);
  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip="Loading..."
    >
      <div className="mt-5">
        {taskListByProject.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            pagination={{
              pageSize: 10,
            }}
          />
        ) : (
          <>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
          </>
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
        footer={[null]}
      >
        <EditTaskModalDialog
          task={editingTask}
          members={projectMembers}
          labels={labels}
          onUpdateSuccess={() => {
            renderTasksByProject(projectId);
            handleEditTaskModalCancel();
          }}
          onCancel={handleEditTaskModalCancel}
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
        <ViewTaskDetailModalDialog
          projectId={projectId}
          task={selectedTask}
          currentUser={user}
        />
      </Modal>
    </Spin>
  );
};

export default TasksListTable;
