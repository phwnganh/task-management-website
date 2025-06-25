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
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../context/useAuth";
import { apiGetUserDetail } from "../../../../../services/AdminService/ManageUsersService";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(
  (
    { initialValues, onChangeForm, user, project, editingTask, onClose },
    ref
  ) => {
    const { t } = useTranslation("taskmember");
    const [form] = Form.useForm();
    const [requestedContent, setRequestedContent] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasChanges, setHasChanges] = useState(false);
    const pageSize = 2;
    const [requesterData, setRequesterData] = useState({});
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
          setHasChanges(changed);
          onChangeForm && onChangeForm(changed);
        },
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [form, initialValues, onChangeForm]);

    const validateTitle = (_, value) => {
      if (!value || value.trim() === "") {
        return Promise.reject(new Error(t("titleRequired")));
      }
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) {
        return Promise.reject(new Error(t("titleValidation")));
      }
      if (
        /^\d[\d\s]*\d$/.test(trimmed) &&
        /^\d+$/.test(trimmed.replace(/\s/g, ""))
      ) {
        return Promise.reject(new Error(t("titleValidation")));
      }
      return Promise.resolve();
    };

    const validateDescription = (_, value) => {
      if (!value || value.trim() === "") {
        return Promise.reject(new Error(t("descriptionRequired")));
      }
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) {
        return Promise.reject(new Error(t("descriptionValidation")));
      }
      if (
        /^\d[\d\s]*\d$/.test(trimmed) &&
        /^\d+$/.test(trimmed.replace(/\s/g, ""))
      ) {
        return Promise.reject(new Error(t("descriptionValidation")));
      }
      return Promise.resolve();
    };

    const getRequestedChanges = async (taskId) => {
      try {
        const res = await apiGetRequestToEditTaskByMember(taskId);
        setRequestedContent(res);

        const requesterPromises = res.map((item) =>
          apiGetUserDetail(item.requester_id).catch((err) => {
            console.error(err.message);
            return null;
          })
        );
        const requesters = await Promise.all(requesterPromises);
        const requestersMap = {};
        res.forEach((item, index) => {
          if (requesters[index]) {
            requestersMap[item.requester_id] = requesters[index];
          }
        });
        setRequesterData(requestersMap);
      } catch (error) {
        notification.error({
          description: error.message || t("errorDescription", { error: error }),
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
          message: t("successMessage"),
          description: t("successDescription"),
          placement: "bottomRight",
        });

        onClose?.();
        // window.location.reload(); // Loại bỏ reload, sử dụng callback thay thế
      } catch (err) {
        console.error("Lỗi khi gửi yêu cầu:", err);
        notification.error({
          message: t("errorMessage"),
          description: t("errorDescription", { error: err.message }),
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
          {t("editMyTask")}
        </Title>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            const changed = hasValidChanges();
            setHasChanges(changed);
            onChangeForm && onChangeForm(changed);
          }}
        >
          <Form.Item
            label={t("title")}
            name="title"
            rules={[{ required: true }, { validator: validateTitle }]}
          >
            <Input
              placeholder={t("title")}
              onBlur={(e) => {
                const trimmed = e.target.value.trimStart();
                if (trimmed !== e.target.value) {
                  form.setFieldValue("title", trimmed);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label={t("description")}
            name="description"
            rules={[{ required: true }, { validator: validateDescription }]}
          >
            <Input.TextArea
              placeholder={t("description")}
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
            <Button onClick={onClose}>{t("cancel")}</Button>
            {hasChanges && (
              <Button type="primary" onClick={handleSubmit}>
                {t("requestToChange")}
              </Button>
            )}
          </div>
        </Form>

        {requestedContent.length > 0 ? (
          <div>
            {paginatedRequestedContent.map((item, index) => (
              <Descriptions
                key={index}
                title={t("proposedChanges", { index: startIndex + index + 1 })}
                bordered
                column={1}
                className="mt-6"
              >
                <Descriptions.Item label={t("proposedTitle")}>
                  {item.proposed_changes?.title}
                </Descriptions.Item>
                <Descriptions.Item label={t("proposedDescription")}>
                  {item.proposed_changes?.description}
                </Descriptions.Item>
                <Descriptions.Item label="Requester Name">
                  {item.requester_id === user.id
                    ? "Me"
                    : requesterData[item.requester_id] &&
                      `${requesterData[item.requester_id].first_name} ${
                        requesterData[item.requester_id].last_name
                      }`}
                </Descriptions.Item>
                <Descriptions.Item label={t("requestedTime")}>
                  {dayjs(item?.created_at).format("YYYY-MM-DD hh:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("status")}
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
            {t("noProposedChanges")}
          </Typography.Text>
        )}
      </div>
    );
  }
);

export default EditMyTaskForm;
