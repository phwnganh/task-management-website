import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Empty,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
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

const { Option } = Select; // Add this line to import Option from Select

const MyTaskListTable = ({ projectId, filters }) => {
  const [myTaskList, setMyTaskList] = useState([]);
  const [myFilterTasks, setMyFilterTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // lấy user từ context
  const searchTitleInput = useRef(null);
  const [editingTask, setEditingTask] = useState(null);

  const formRef = useRef();

  const showTaskDetailModal = () => {
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskDetailCancel = () => {
    setIsTaskDetailModalOpen(false);
  };

  // const showEditTaskModal = () => {
  //   setIsEditTaskModalOpen(true);
  // };

  const showEditTaskModal = (task) => {
    setEditingTask(task); // task là record của dòng đó
    setIsEditTaskModalOpen(true);
  };

  // const handleEditTaskModalOk = () => {
  //   setIsEditTaskModalOpen(false);
  // };

  const handleEditTaskModalOk = async () => {
    console.log("ĐÃ NHẤN OK");
    try {
      // Lấy data từ form
      const formValues = formRef.current.getFormValues();
      // Lấy task_id từ initialValues (hoặc editingTask)
      const task_id = editingTask?.id;
      // Gọi API
      await apiRequestToUpdateTaskByMember({
        task_id,
        requester_id: user.id,
        proposed_changes: {
          title: formValues.title,
          description: formValues.description,
        },
      });
      message.success("Request to change sent!");
      setIsEditTaskModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu:", err);
      message.error(err.message || "Request failed!");
    }
  };

  // const handleEditTaskModalCancel = () => {
  //   setIsEditTaskModalOpen(false);
  // };

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
      message.success("Task status updated successfully");
    } catch (error) {
      message.error("Failed to update task status");
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
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
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
      </div>

      <Modal
        width={750}
        open={isEditTaskModalOpen}
        onOk={handleEditTaskModalOk}
        onCancel={handleEditTaskModalCancel}
        footer={[
          <Button key="cancel" onClick={handleEditTaskModalCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleEditTaskModalOk}>
            Request To Change
          </Button>,
        ]}
      >
        {/* Gắn ref để lấy form data */}
        <EditMyTaskModalDialog ref={formRef} task={editingTask} />
      </Modal>

      <Modal
        title="View My Task Detail"
        width={750}
        open={isTaskDetailModalOpen}
        onCancel={handleTaskDetailCancel}
        footer={[
          <Button key={"close"} onClick={handleTaskDetailCancel}>
            Close
          </Button>,
        ]}
      >
        <ViewTaskDetailModalDialog />
      </Modal>
    </Spin>
  );
};

export default MyTaskListTable;
