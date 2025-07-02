import {
  Avatar,
  Badge,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  notification,
  Row,
  Select,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGetPublicLabelList } from "../../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import { apiCreateTask } from "../../../../../services/UserService/ManageTasksService";
import { getAITaskSuggestions } from "../../../../../services/UserService/AIService";
import { Editor } from "@tinymce/tinymce-react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import {
  UserAddOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { apiCreateNotifications } from "../../../../../services/UserService/NotificationsService";
import { CREATE_TASK } from "../../../../../constants/notifications.constants";
import { apiGetProjectDetail } from "../../../../../services/UserService/ManageProjectsService";

const AddTaskForm = ({ projectId, userId }) => {
  const { t } = useTranslation("taskcalendar");
  const [form] = Form.useForm();
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const prioritySelectionDefault = [
    {
      value: "Low",
      label: t("Low"), // Dịch "Low"
      color: "#52c41a",
    },
    {
      value: "Medium",
      label: t("Medium"), // Dịch "Medium"
      color: "#fa8c16",
    },
    {
      value: "High",
      label: t("High"), // Dịch "High"
      color: "#f5222d",
    },
  ];

  const validateTextAndNumber = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error(t("fieldCannotContainOnlyWhitespace")));
    }
    if (/^\d+$/.test(value)) {
      return Promise.reject(new Error(t("fieldCannotContainOnlyNumbers")));
    }
    if (/^\s+[\w\d]+/.test(value)) {
      return Promise.reject(new Error(t("fieldCannotStartWithWhitespace")));
    }
    if (/\d+\s+\d+/.test(value)) {
      return Promise.reject(
        new Error(t("fieldCannotContainWhitespaceBetweenNumbers"))
      );
    }
    return Promise.resolve();
  };

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const res = await apiGetProjectDetail(projectId);
        setProjectData(res);
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchProjectDetail();
  }, [projectId]);

  const createTask = async (values) => {
    try {
      const taskData = {
        id: uuidv4(),
        project_id: projectId,
        title: values.title,
        priority: values.priority,
        status: "To Do",
        label_ids: values.labels || [],
        start_date: values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
        assignee_ids: values.assignee || [],
        description: values.description || "",
        is_deleted: false,
      };
      const res = await apiCreateTask(taskData);

      if (res.assignee_ids && res.assignee_ids.length > 0) {
        await Promise.all(
          res.assignee_ids.map(async (assigneeId) => {
            await apiCreateNotifications({
              id: uuidv4(),
              type: CREATE_TASK,
              task_id: res.id,
              recipient_id: assigneeId, // Use assigneeId as recipient_id
              initiator_id: userId,
              message: `You have been assigned to do the task "${res.title}" in ${projectData?.title}`,
              status: "Unread",
              created_at: dayjs().toISOString(),
            });
          })
        );
      }
      notification.success({
        message: t("success"),
        description: t("taskCreatedSuccessfully"),
        placement: "bottomRight",
      });
      form.resetFields();
      return res;
    } catch (error) {
      console.error("Error creating task:", error);
      notification.error({
        message: t("error"),
        description: t("failedToCreateTask"),
        placement: "bottomRight",
      });
    } finally {
      window.location.reload();
    }
  };

  const assigneeSelectionDefault = async (projectId) => {
    try {
      const res = await apiGetProjectMembers(projectId);
      console.log("get project members in filter action: ", res);
      const assigneeOptions = res.map((member) => ({
        value: member.user_details.id,
        label:
          member.user_details.id === userId
            ? t("Me")
            : `${member.user_details.first_name} ${member.user_details.last_name}`,
        avatar_url: member.user_details.avatar_url,
      }));
      setAssignees(assigneeOptions);
    } catch (error) {
      console.error("Error fetching project members:", error);
      notification.error({
        message: t("error"),
        description: error.message,
        placement: "bottomRight",
      });
    }
  };

  const labelsSelectionDefault = async (owner_id) => {
    try {
      const res = await apiGetPublicLabelList(owner_id);
      const labelOptions = res.map((label) => ({
        value: label.id,
        label: label.title,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      }));
      setLabels(labelOptions);
    } catch (error) {
      console.error("Error fetching labels:", error);
      notification.error({
        message: t("error"),
        description: error.message,
        placement: "bottomRight",
      });
    }
  };

  useEffect(() => {
    assigneeSelectionDefault(projectId);
  }, [projectId]);
  useEffect(() => {
    labelsSelectionDefault(userId);
  }, [userId]);

  const handleReset = () => {
    form.resetFields();
  };

  const validateStartDate = (_, value) => {
    const dueDate = form.getFieldValue("due_date");
    if (
      value &&
      dueDate &&
      dayjs(value).isAfter(dayjs(dueDate).format("YYYY-MM-DD"))
    ) {
      return Promise.reject(new Error(t("startDateBeforeDueDate")));
    }
    return Promise.resolve();
  };

  const validateDueDate = (_, value) => {
    const startDate = form.getFieldValue("start_date");
    const currentDate = dayjs();

    if (value && dayjs(value).isBefore(currentDate, "day")) {
      return Promise.reject(new Error(t("dueDateAfterToday")));
    } else if (
      value &&
      startDate &&
      dayjs(value).isBefore(dayjs(startDate).format("YYYY-MM-DD"))
    ) {
      return Promise.reject(new Error(t("dueDateAfterStartDate")));
    }
    return Promise.resolve();
  };

  const colorPalette = [
    "#f5222d",
    "#fa8c16",
    "#fadb14",
    "#52c41a",
    "#1890ff",
    "#722ed1",
    "#eb2f96",
    "#13c2c2",
  ];

  const suggestPriorityAndLabels = async () => {
    const title = form.getFieldValue("title");
    const description = form.getFieldValue("description");
    if (!title || !description) return;
    const suggestions = await getAITaskSuggestions(
      title,
      description,
      undefined
    );
    setAiSuggestions((prev) => ({ ...prev, ...suggestions }));
    // Gợi ý priority
    if (suggestions.priority) {
      form.setFieldsValue({ priority: suggestions.priority });
    }
    // Gợi ý labels
    if (suggestions.labels && suggestions.labels.length > 0) {
      const matchingLabels = suggestions.labels
        .map((suggestedLabel) => {
          const foundLabel = labels.find(
            (label) =>
              label.label
                .toLowerCase()
                .includes(suggestedLabel.toLowerCase()) ||
              suggestedLabel.toLowerCase().includes(label.label.toLowerCase())
          );
          return foundLabel ? foundLabel.value : null;
        })
        .filter(Boolean);
      if (matchingLabels.length > 0) {
        form.setFieldsValue({ labels: matchingLabels });
      }
    }
  };

  const suggestDueDate = async () => {
    const titleVal = form.getFieldValue("title") || "";
    const descriptionVal = form.getFieldValue("description") || "";
    const startDateVal = form.getFieldValue("start_date");
    if (!startDateVal) return;
    const suggestions = await getAITaskSuggestions(
      titleVal,
      descriptionVal,
      startDateVal.format("YYYY-MM-DD")
    );
    setAiSuggestions((prev) => ({ ...prev, ...suggestions }));
    if (suggestions.dueDate) {
      form.setFieldsValue({ due_date: dayjs(suggestions.dueDate) });
    }
  };

  const title = Form.useWatch("title", form);
  const description = Form.useWatch("description", form);
  const startDate = Form.useWatch("start_date", form);

  // Gợi ý priority và labels khi title hoặc description thay đổi
  useEffect(() => {
    if (title && description) {
      const timeout = setTimeout(() => {
        suggestPriorityAndLabels();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [title, description]);

  // Gợi ý duedate khi startdate thay đổi
  useEffect(() => {
    if (startDate) {
      const timeout = setTimeout(() => {
        suggestDueDate();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [startDate]);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "3px",
          background: "#1890ff",
          marginBottom: 24,
        }}
      />
      <Form
        form={form}
        layout="vertical"
        className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto"
        initialValues={{
          title: "",
          assignee: null,
          priority: null,
          status: "To Do",
          label: null,
          start_date: null,
          due_date: null,
          description: "",
        }}
        onFinish={createTask}
      >
        <Form.Item
          name="title"
          label={
            <span className="text-gray-700 font-medium text-sm sm:text-base font-bold">
              {t("taskTitle")}
            </span>
          }
          rules={[
            { required: true, message: t("pleaseEnterTaskTitle") },
            { validator: validateTextAndNumber },
          ]}
        >
          <Input placeholder={t("taskTitle")} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="font-semibold">{t("description")}</span>}
          rules={[
            { validator: validateTextAndNumber },
            { required: true, message: t("pleaseEnterTaskDescription") },
          ]}
        >
          <Input.TextArea placeholder={t("description")} rows={4} />
        </Form.Item>

        <Form.Item
          name="assignee"
          label={
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              {t("assignees")}
            </span>
          }
          rules={[{ required: true, message: t("pleaseSelectAssignees") }]}
        >
          <Select
            placeholder={t("assignees")}
            options={assignees}
            mode="multiple"
            allowClear
            className="w-full"
            optionRender={(option) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={option.data.avatar_url}
                  icon={!option.data.avatar_url && <UserOutlined />}
                />
                <span className="ml-2">{option.data.label}</span>
              </div>
            )}
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="priority"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {t("priority")}
                </span>
              }
              rules={[
                { required: true, message: t("pleaseSelectTaskPriority") },
              ]}
            >
              <Select
                placeholder={t("priority")}
                options={prioritySelectionDefault}
                allowClear
                className="w-full"
                optionRender={(option) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge color={option.data.color} text={option.data.label} />
                  </div>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="labels"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {t("labels")}
                </span>
              }
              rules={[{ required: true, message: t("pleaseSelectTaskLabels") }]}
            >
              <Select
                placeholder={t("labels")}
                options={labels}
                mode="multiple"
                allowClear
                className="w-full"
                optionRender={(option) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Badge color={option.data.color} text={option.data.label} />
                  </div>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="start_date"
              label={
                <span className="text-gray-700 font-semibold text-base">
                  {t("startDate")}
                </span>
              }
              rules={[
                { required: true, message: t("pleaseSelectStartDate") },
                { validator: validateStartDate },
              ]}
              dependencies={["due_date"]}
              className="mb-0"
            >
              <DatePicker
                size="large"
                allowClear
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:shadow"
                style={{ height: 44 }}
                placeholder={t("startDate") || "startDate"}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="due_date"
              label={
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {t("dueDate")}
                </span>
              }
              rules={[
                { required: true, message: t("dueDate") },
                { validator: validateDueDate },
              ]}
              dependencies={["start_date"]}
            >
              <DatePicker
                size="middle"
                allowClear
                className="w-full h-10 rounded-md"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                placeholder={t("dueDate") || "dueDate"}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex flex-col md:flex-row justify-end items-end gap-2">
          <Button onClick={handleReset} className="w-full md:w-auto">
            {t("reset")}
          </Button>
          <Button type="primary" htmlType="submit" className="w-full md:w-auto">
            {t("create")}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default AddTaskForm;
