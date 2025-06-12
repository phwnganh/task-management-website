import { useEffect, useRef, useState } from "react";
import {
  apiGetTaskListByProject,
  apiGetTasksWithAssigneesByProject,
} from "../../../../services/UserService/UserService";
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
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { TbEye, TbPencil } from "react-icons/tb";
import dayjs from "dayjs";
import EditTaskModalDialog from "../EditTask/EditTaskModalDialog";
import ViewTaskDetailModalDialog from "../ViewTaskDetail/ViewTaskDetailModalDialog";
import { useAuth } from "../../../../context/useAuth";

const TasksListTable = ({ projectId, filters }) => {
  const [taskListByProject, setTaskListByProject] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleAssignees, setVisibleAssignees] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const searchTitleInput = useRef(null);
  const { user } = useAuth();

  const showTaskDetailModal = (record) => {
    setSelectedTask(record);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskDetailCancel = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const showEditTaskModal = () => {
    setIsEditTaskModalOpen(true);
  };

  const handleEditTaskModalOk = () => {
    setIsEditTaskModalOpen(false);
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
      message.error("Error fetching data");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    renderTasksByProject(projectId);
  }, [projectId]);

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
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) => a.due_date.localeCompare(b.due_date),
    },
    {
      title: "Assignees",
      key: "assignees",
      render: (text, record) => (
        <Avatar.Group
          maxCount={3}
          maxStyle={{
            color: "#f56a00",
            backgroundColor: "#fde3cf",
          }}
        >
          {visibleAssignees[record.id]?.map((assignee) => (
            <Tooltip
              title={`${assignee.first_name} ${assignee.last_name}`}
              placement="top"
              key={assignee.id}
            >
              <Avatar src={assignee.avatar_url} />
            </Tooltip>
          ))}
          {record.assignees.length > 3 && (
            <Button type="link" onClick={() => showAllAssignees(record.id)}>
              +{record.assignees.length - 3} More
            </Button>
          )}
        </Avatar.Group>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex flex-row">
          <Button
            onClick={() => showTaskDetailModal(record)}
            icon={<TbEye />}
          ></Button>
          <Button
            onClick={() => showEditTaskModal(record)}
            style={{ marginLeft: 16 }}
            icon={<TbPencil />}
          ></Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    renderTasksByProject();
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
      </div>
      <Modal
        title="Edit Task"
        width={750}
        open={isEditTaskModalOpen}
        onOk={handleEditTaskModalOk}
        onCancel={handleEditTaskModalCancel}
        footer={[
          <Button key={"cancel"} onClick={handleEditTaskModalCancel}>
            Cancel
          </Button>,
          <Button
            key={"save"}
            type="primary"
            onClick={handleEditTaskModalCancel}
          >
            Save
          </Button>,
        ]}
      >
        <EditTaskModalDialog />
      </Modal>
      <Modal
        title="View Task Detail"
        width={750}
        open={isTaskDetailModalOpen}
        onCancel={handleTaskDetailCancel}
        footer={[
          <Button key={"close"} onClick={handleTaskDetailCancel}>
            Close
          </Button>,
        ]}
      >
        <ViewTaskDetailModalDialog task={selectedTask} currentUser={user} />
      </Modal>
    </Spin>
  );
};

export default TasksListTable;
