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
  Switch,
  Alert,
  Checkbox,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  AudioOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { TbEye, TbPencil, TbTrash } from "react-icons/tb";
import dayjs from "dayjs";
import EditTaskModalDialog from "../EditTask/EditTaskModalDialog";
import ViewTaskDetailModalDialog from "../ViewTaskDetail/ViewTaskDetailModalDialog";
import {
  apiGetTasksWithAssigneesByProject,
  apiRemoveTask,
} from "../../../../services/UserService/ManageMembersInsideProjectService";
import { apiGetPublicLabelList } from "../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../services/UserService/ManageMembersInsideProjectService";
import {
  apiArchieveTask,
  apiUpdateTaskByOwner,
} from "../../../../services/UserService/ManageTasksService";
import { useAuth } from "../../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { useTranslation } from "react-i18next";

const TasksListTable = ({ projectId, filters }) => {
  const { t, i18n } = useTranslation("taskcalendar");
  const [taskListByProject, setTaskListByProject] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isRemoveTaskModalVisible, setIsRemoveTaskModalVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleAssignees, setVisibleAssignees] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const searchTitleInput = useRef(null);
  const [editingTask, setEditingTask] = useState(null);
  const [labels, setLabels] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra hỗ trợ Speech Recognition khi component mount
  useEffect(() => {
    const hasSupport =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log("Speech Recognition Support:", !!hasSupport);
    console.log("Current browser:", navigator.userAgent);
  }, []);

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
  };

  const showRemoveTaskModal = (task) => {
    setSelectedTask(task);
    setIsRemoveTaskModalVisible(true);
  };

  const handleRemoveTaskModalCancel = () => {
    setIsRemoveTaskModalVisible(false);
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
        description: t("errorFetchingTasks"),
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTaskPermanently = async () => {
    try {
      await apiRemoveTask(selectedTask);
      notification.success({
        message: "Remove Task Successfully!",
        placement: "bottomRight",
      });
      await renderTasksByProject();
    } catch (error) {
      notification.error({
        message: error.message,
        placement: "bottomRight",
      });
    } finally {
      setIsRemoveTaskModalVisible(false);
      setSelectedTask(null);
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
      if(filters.is_deleted && filters.is_deleted.length > 0){
        filtered = filtered.filter(task => filtered.is_deleted.includes(task.is_deleted.toString()))
      }
      setFilteredTasks(filtered);
    };
    applyFilters();
  }, [filters, taskListByProject]);

  useEffect(() => {
    const ownerId = user?.id;
    const fetchLabelsAndMembers = async () => {
      try {
        const fetchedLabels = await apiGetPublicLabelList(ownerId);
        setLabels(fetchedLabels);

        const fetchedMembers = await apiGetProjectMembers(projectId);
        const memberList = fetchedMembers.map((m) => ({
          id: m.user_details.id,
          first_name: m.user_details.first_name,
          last_name: m.user_details.last_name,
          avatar_url: m.user_details.avatar_url,
          status: m.user_details.status,
        }));
        setProjectMembers(memberList);
      } catch (error) {
        notification.error({
          message: "Error",
          description: t("errorFetchingTasks"),
          placement: "bottomRight",
        });
      }
    };
    if (projectId) fetchLabelsAndMembers();
  }, [projectId, user?.id, t]);

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
    }) => {
      const [recognizing, setRecognizing] = useState(false);

      const mapI18nToSpeechLang = (lang) => {
        switch (lang) {
          case "vi":
            return "vi-VN";
          case "en":
            return "en-US";
          default:
            return "en-US";
        }
      };

      const handleVoiceSearch = () => {
        console.log("Voice search initiated");
        console.log("i18n object:", i18n);
        console.log("Current language:", i18n?.language);

        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
          notification.error({
            message: "Trình duyệt không hỗ trợ nhận diện giọng nói",
            description: "Vui lòng sử dụng Chrome, Edge hoặc Safari",
            duration: 4,
            placement: "bottomRight",
          });
          return;
        }

        // Kiểm tra quyền microphone
        navigator.mediaDevices
          ?.getUserMedia({ audio: true })
          .then(() => {
            console.log("Microphone permission granted");
            startRecognition();
          })
          .catch((error) => {
            console.error("Microphone permission denied:", error);
            notification.error({
              message: t("Không có quyền truy cập microphone"),
              description: t(
                "Vui lòng cho phép truy cập microphone trong trình duyệt"
              ),
              duration: 4,
              placement: "bottomRight",
            });
          });

        const startRecognition = () => {
          const currentLang = i18n?.language || "vi";
          const speechLang = mapI18nToSpeechLang(currentLang);

          console.log("Starting recognition with language:", speechLang);

          const recognition = new SpeechRecognition();
          recognition.lang = speechLang;
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          recognition.continuous = false;

          recognition.onstart = () => {
            console.log("Speech recognition started");
            setRecognizing(true);
            notification.info({
              message: t("🎤 Đang nghe..."),
              description: t("Hãy nói từ khóa tìm kiếm"),
              duration: 2,
              placement: "bottomRight",
            });
          };

          recognition.onend = () => {
            console.log("Speech recognition ended");
            setRecognizing(false);
          };

          recognition.onresult = (event) => {
            console.log("Speech results:", event.results);

            if (event.results && event.results.length > 0) {
              let transcript = event.results[0][0].transcript;
              transcript = transcript.trim().replace(/[\p{P}\p{S}]+$/gu, "");

              console.log("Final transcript:", transcript);

              // Cập nhật input và thực hiện tìm kiếm
              setSelectedKeys([transcript]);
              handleSearch(selectedKeys, confirm, dataIndex);

              notification.success({
                message: t("🎤 Nhận diện thành công"),
                description: `"${transcript}"`,
                duration: 3,
                placement: "bottomRight",
              });
            } else {
              notification.warning({
                message: t("Không nhận diện được giọng nói"),
                description: t("Vui lòng thử lại"),
                duration: 3,
                placement: "bottomRight",
              });
            }
          };

          recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setRecognizing(false);

            let message = t("Lỗi nhận diện giọng nói");
            let description = "";

            switch (event.error) {
              case "not-allowed":
                message = t("Không có quyền truy cập microphone");
                description = t(
                  "Vui lòng cho phép truy cập microphone và thử lại"
                );
                break;
              case "no-speech":
                message = t("Không nghe thấy giọng nói");
                description = t("Thử nói to hơn và rõ ràng hơn");
                break;
              case "audio-capture":
                message = t("Lỗi microphone");
                description = t("Kiểm tra kết nối microphone");
                break;
              case "network":
                message = t("Lỗi mạng");
                description = t("Kiểm tra kết nối internet");
                break;
              case "aborted":
                message = t("Đã hủy nhận diện");
                description = t("Thử lại");
                break;
              default:
                description = `${t("Lỗi")}: ${event.error}`;
            }

            notification.error({
              message,
              description,
              duration: 4,
              placement: "bottomRight",
            });
          };

          // Bắt đầu nhận diện
          try {
            recognition.start();
          } catch (error) {
            console.error("Start recognition error:", error);
            setRecognizing(false);
            notification.error({
              message: t("Không thể khởi động nhận diện giọng nói"),
              description: t("Thử lại sau vài giây"),
              duration: 4,
              placement: "bottomRight",
            });
          }
        };
      };

      return (
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
            allowClear
            suffix={
              <Tooltip
                title={
                  recognizing ? t("Đang nghe...") : t("Tìm kiếm bằng giọng nói")
                }
              >
                <Button
                  icon={<AudioOutlined />}
                  type={recognizing ? "primary" : "default"}
                  onClick={handleVoiceSearch}
                  loading={recognizing}
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

  const handleToggleArchieveTask = async (record, checked) => {
    Modal.confirm({
      title: checked ? t("archiveTitle") : t("restoreTitle"),
      content: checked ? t("archiveConfirm") : t("restoreConfirm"),
      okText: t("yes"),
      cancelText: t("no"),
      onOk: async () => {
        try {
          await apiArchieveTask(record.id, { is_deleted: checked });
          setTaskListByProject((prev) =>
            prev.map((task) =>
              task.id === record.id ? { ...task, is_deleted: checked } : task
            )
          );
          setFilteredTasks((prev) =>
            prev.map((task) =>
              task.id === record.id ? { ...task, is_deleted: checked } : task
            )
          );

          notification.success({
            message: t("success"),
            description: checked ? t("archiveSuccess") : t("restoreSuccess"),
            placement: "bottomRight",
          });
        } catch (error) {
          notification.error({
            message: error.message,
            placement: "bottomRight",
          });
        }
      },
    });
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
            color = "Gray";
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
      sorter: (a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return a.start_date.localeCompare(b.start_date);
      },
    },
    {
      title: t("dueDate"),
      dataIndex: "due_date",
      key: "due_date",
      render: (date, record) => {
        if (!date) return "N/A";
        const dueDate = dayjs(date);
        const currentDate = dayjs();
        if (record.status !== "Completed") {
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
        }
        return <span>{dueDate.format("YYYY-MM-DD")}</span>;
      },
      sorter: (a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      },
    },
    {
      title: t("assignees"),
      dataIndex: "assignees",
      key: "assignees",
      render: (assignees, record) => {
        if (!assignees || assignees.length === 0) {
          return <span style={{ color: "#999" }}>{t("No assignees")}</span>;
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
                      src={assignee.avatar_url || null}
                      alt={`${assignee.first_name} ${assignee.last_name}`}
                      size={24}
                      icon={!assignee.avatar_url && <UserOutlined />}
                    />
                    <span>
                      {assignee.id === user.id
                        ? t("Me")
                        : `${assignee.first_name} ${assignee.last_name}`}
                    </span>
                  </div>
                ),
              }))
            : [
                {
                  key: "no-assignees",
                  label: t("No additional assignees"),
                  disabled: true,
                },
              ];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {visible.map((assignee, index) => (
              <Tooltip
                key={index}
                title={
                  <>
                    <div>
                      {assignee.id === user.id
                        ? t("Me")
                        : `${assignee.first_name} ${assignee.last_name}`}
                    </div>
                    {assignee.status === "Inactive" && (
                      <div className="text-red-500">Inactive</div>
                    )}
                  </>
                }
              >
                <Avatar
                  src={assignee?.avatar_url || null}
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
    // {
    //   title: t("action"),
    //   key: "action",
    //   render: (_, record) => (
    //     <div className="flex flex-row items-center gap-4">
    //       <Tooltip title={t("view")}>
    //         <Button
    //           onClick={() => showTaskDetailModal(record)}
    //           icon={<TbEye />}
    //         />
    //       </Tooltip>
    //       <Tooltip
    //         title={
    //           record.status === "Completed"
    //             ? t("cannotEditCompletedTask")
    //             : t("edit")
    //         }
    //       >
    //         <Button
    //           onClick={() => showEditTaskModal(record)}
    //           style={{ marginLeft: 16 }}
    //           icon={<TbPencil />}
    //           disabled={record.status === "Completed"}
    //         />
    //       </Tooltip>
    //       <div className="text-center">
    //         <Tooltip
    //           title={record.is_deleted ? t("Restore Task") : t("Archive Task")}
    //         >
    //           <Switch
    //             checked={record.is_deleted}
    //             style={{ marginLeft: 16 }}
    //             onChange={(checked) =>
    //               handleToggleArchieveTask(record, checked)
    //             }
    //           />
    //           <p className="text-center text-gray-400">
    //             {record.is_deleted === true &&
    //               dayjs(record.deleted_at).format("YYYY-MM-DD HH:mm:ss")}
    //           </p>
    //         </Tooltip>
    //       </div>

    //       <Tooltip title={t("Remove")}>
    //         <Button
    //           style={{ marginLeft: 16 }}
    //           icon={<TbTrash />}
    //           onClick={() => showRemoveTaskModal(record.id)}
    //         ></Button>
    //       </Tooltip>
    //     </div>
    //   ),
    // },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-row items-center gap-4">
            <Tooltip title={t("view")}>
              <Button
                onClick={() => showTaskDetailModal(record)}
                icon={<TbEye />}
              />
            </Tooltip>
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
            <Tooltip
              title={record.is_deleted ? t("Restore Task") : t("Archive Task")}
            >
              <Switch
                checked={record.is_deleted}
                style={{ marginLeft: 16 }}
                onChange={(checked) =>
                  handleToggleArchieveTask(record, checked)
                }
              />
            </Tooltip>
            <Tooltip title={t("Remove")}>
              <Button
                style={{ marginLeft: 16 }}
                icon={<TbTrash />}
                onClick={() => showRemoveTaskModal(record.id)}
              />
            </Tooltip>
          </div>
          {record.is_deleted && (
            <span className="text-gray-400 text-xs ml-16">
              {dayjs(record.deleted_at).format("YYYY-MM-DD HH:mm:ss")}
            </span>
          )}
        </div>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            style={{ marginBottom: 8, display: "block" }}
            value={selectedKeys}
            onChange={(values) => setSelectedKeys(values)}
            options={[
              { label: t("Active Tasks"), value: "false" },
              { label: t("Archived Tasks"), value: "true" },
            ]}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={() => {
                confirm();
              }}
              icon={<SearchOutlined />}
              size="small"
            >
              {t("search")}
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
            >
              {t("reset")}
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        // Convert string value ("true"/"false") to boolean for comparison
        return record.is_deleted.toString() === value;
      },
      filterMultiple: true,
    },
  ];

  useEffect(() => {
    if (projectId) {
      renderTasksByProject();
    }
  }, [projectId]);

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="mt-5">
        <Alert
          message={t("tn")}
          description={t("tthv")}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
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
        <EditTaskModalDialog
          task={editingTask}
          members={projectMembers}
          labels={labels}
          onUpdateSuccess={() => {
            renderTasksByProject();
            handleEditTaskModalCancel();
          }}
          onCancel={handleEditTaskModalCancel}
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
          <Button
            key="close"
            onClick={handleTaskDetailCancel}
            className="w-full md:w-auto mx-auto block"
          >
            {t("close")}
          </Button>,
        ]}
        style={{
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <ViewTaskDetailModalDialog
          projectId={projectId}
          task={selectedTask}
          currentUser={user}
        />
      </Modal>
      <Modal
        title={t("Confirm Remove")}
        open={isRemoveTaskModalVisible}
        onOk={handleRemoveTaskPermanently}
        onCancel={handleRemoveTaskModalCancel}
        okText={t("Remove")}
        cancelText={t("cancel")}
        className="max-w-xs sm:max-w-md md:max-w-lg"
      >
        <p>{t("Are you sure to remove this task?")}</p>
      </Modal>
    </Spin>
  );
};

export default TasksListTable;
