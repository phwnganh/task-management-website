import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import {
  Descriptions,
  Form,
  Input,
  notification,
  Typography,
  Pagination,
  Button,
} from "antd";
import { apiGetRequestToEditTaskByMember } from "../../../../../services/UserService/ManageTasksService";
import { apiRequestToUpdateTaskByMember } from "../../../../../services/UserService/ManageTasksService";
import { apiCreateNotifications } from "../../../../../services/UserService/NotificationsService";
import { TASK_EDIT_REQUEST } from "../../../../../constants/notifications.constants";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(
  (
    { initialValues, onChangeForm, user, project, editingTask, onClose },
    ref
  ) => {
    const [form] = Form.useForm();
    const [requestedContent, setRequestedContent] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 2;

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title || "",
          description: initialValues.description || "",
        });
      }
    }, [initialValues, form]);

    useImperativeHandle(ref, () => ({
      getFormValues: () => form.getFieldsValue(),
    }));

    const hasValidChanges = () => {
      const values = form.getFieldsValue();
      const titleChanged = values.title !== (initialValues?.title || "");
      const descriptionChanged =
        values.description !== (initialValues?.description || "");
      return titleChanged || descriptionChanged;
    };

    useEffect(() => {
      const unsubscribe = form.subscribe?.({
        values: () => {
          const changed = hasValidChanges();
          onChangeForm && onChangeForm(changed);
        },
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [form, initialValues, onChangeForm]);

    const validateTitle = (_, value) => {
      if (!value || value.trim() === "") {
        return Promise.reject(
          new Error("Title is required and cannot be empty or whitespace only")
        );
      }
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) {
        return Promise.reject(new Error("Title cannot be only numbers"));
      }
      return Promise.resolve();
    };

    const validateDescription = (_, value) => {
      if (!value || value.trim() === "") {
        return Promise.reject(
          new Error(
            "Description is required and cannot be empty or whitespace only"
          )
        );
      }
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) {
        return Promise.reject(new Error("Description cannot be only numbers"));
      }
      return Promise.resolve();
    };

    const getRequestedChanges = async (taskId) => {
      try {
        const res = await apiGetRequestToEditTaskByMember(taskId);
        setRequestedContent(res);
      } catch (error) {
        notification.error({
          description: error,
          placement: "bottomRight",
        });
      }
    };

    useEffect(() => {
      if (initialValues?.id) {
        getRequestedChanges(initialValues.id);
      }
    }, [initialValues?.id]);

    const handleSubmit = async () => {
      try {
        const formValues = await form.validateFields();
        const task_id = editingTask?.id;

        const response = await apiRequestToUpdateTaskByMember({
          task_id,
          requester_id: user.id,
          proposed_changes: {
            title: formValues.title,
            description: formValues.description,
          },
        });

        const request_id = response.request_id;

        await apiCreateNotifications({
          id: uuidv4(),
          type: TASK_EDIT_REQUEST,
          task_id: task_id,
          requestContent_id: request_id,
          recipient_id: project?.owner_id,
          initiator_id: user.id,
          message: `${user.first_name} ${user.last_name} requested to edit the task '${editingTask?.title}' in ${project?.title}`,
          status: "Unread",
          created_at: new Date().toISOString(),
        });

        notification.success({
          message: "Success",
          description: "Request to change sent! Please wait for approval",
          placement: "bottomRight",
        });

        onClose?.();
      } catch (err) {
        console.error("Lỗi khi gửi yêu cầu:", err);
        notification.error({
          message: "Error",
          description: err.message,
          placement: "bottomRight",
        });
      }
    };

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedRequestedContent = requestedContent.slice(
      startIndex,
      startIndex + pageSize
    );

    return (
      <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
        <Title level={3} className="!mb-6 !text-black">
          Edit My Task
        </Title>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            const changed = hasValidChanges();
            onChangeForm && onChangeForm(changed);
          }}
        >
          <Form.Item
            label="Title:"
            name="title"
            rules={[{ required: true }, { validator: validateTitle }]}
          >
            <Input
              placeholder="Enter title..."
              onBlur={(e) => {
                const trimmed = e.target.value.trimStart();
                if (trimmed !== e.target.value) {
                  form.setFieldValue("title", trimmed);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Description:"
            name="description"
            rules={[{ required: true }, { validator: validateDescription }]}
          >
            <Input.TextArea
              placeholder="Enter description..."
              rows={4}
              onBlur={(e) => {
                const trimmed = e.target.value.trimStart();
                if (trimmed !== e.target.value) {
                  form.setFieldValue("description", trimmed);
                }
              }}
            />
          </Form.Item>

          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              Request To Change
            </Button>
          </div>
        </Form>

        {requestedContent.length > 0 ? (
          <div>
            {paginatedRequestedContent.map((item, index) => (
              <Descriptions
                key={index}
                title={`Proposed Changes (Request ${startIndex + index + 1})`}
                bordered
                column={1}
                className="mt-6"
              >
                <Descriptions.Item label="Proposed Title">
                  {item.proposed_changes?.title}
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Description">
                  {item.proposed_changes?.description}
                </Descriptions.Item>
                <Descriptions.Item label="Requested Time">
                  {dayjs(item?.created_at).format("YYYY-MM-DD hh:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Status"
                  style={{
                    color:
                      item.status === "Accepted"
                        ? "#52c41a"
                        : item.status === "Rejected"
                        ? "#ff4d4f"
                        : "#999999",
                  }}
                >
                  {item?.status}
                </Descriptions.Item>
              </Descriptions>
            ))}

            {requestedContent.length > pageSize && (
              <div className="flex justify-center mt-4">
                <Pagination
                  current={currentPage}
                  total={requestedContent.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </div>
        ) : (
          <Typography.Text style={{ color: "#999999" }}>
            No proposed changes available.
          </Typography.Text>
        )}
      </div>
    );
  }
);

export default EditMyTaskForm;
