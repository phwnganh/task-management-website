import {
  Avatar,
  Badge,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  notification,
  Row,
  Select,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGetPublicLabelList } from "../../../../../services/UserService/ManageLabelsService";
import { apiGetProjectMembers } from "../../../../../services/UserService/ManageMembersInsideProjectService";
import { apiCreateTask } from "../../../../../services/UserService/ManageTasksService";
import { Editor } from "@tinymce/tinymce-react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const AddTaskForm = ({ projectId, userId }) => {
  const { t } = useTranslation("taskcalendar");
  const [form] = Form.useForm();
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState([]);
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
      };
      const res = await apiCreateTask(taskData);
      notification.success({
        message: t("success"),
        description: t("taskCreatedSuccessfully"),
        placement: "bottomRight",
      });
      form.resetFields();
      return res;
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("failedToCreateTask"),
        placement: "bottomRight",
      });
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
            ? t("Me") // Thêm key "Me" nếu cần
            : `${member.user_details.first_name} ${member.user_details.last_name}`,
        avatar_url: member.user_details.avatar_url,
      }));
      setAssignees(assigneeOptions);
    } catch (error) {
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
  return (
    <>
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
            <span className="text-gray-700 font-medium text-sm sm:text-base">
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
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {t("startDate")}
                </span>
              }
              rules={[
                { required: true, message: t("pleaseSelectStartDate") },
                { validator: validateStartDate },
              ]}
              dependencies={["due_date"]}
            >
              <DatePicker
                size="middle"
                allowClear
                className="w-full h-10 rounded-md"
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
                { required: true, message: t("pleaseSelectDueDate") },
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
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={<span className="font-semibold">{t("description")}</span>}
          name="description"
          rules={[
            { validator: validateTextAndNumber },
            { required: true, message: t("pleaseEnterTaskDescription") },
          ]}
        >
          <Input.TextArea placeholder={t("description")} rows={4} />
        </Form.Item>
        <div className="flex flex-row justify-end">
          <Button className="mr-4" onClick={handleReset}>
            {t("reset")}
          </Button>
          <Button type="primary" htmlType="submit">
            {t("create")}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default AddTaskForm;
