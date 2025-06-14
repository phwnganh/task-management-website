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
} from "antd";
import { apiGetRequestToEditTaskByMember } from "../../../../../services/UserService/ManageTasksService";
import dayjs from "dayjs";

const { Title } = Typography;

const validateTextAndNumber = (_, value) => {
  if (!value || value.trim() === "") {
    return Promise.reject(
      new Error("Field cannot be empty or only whitespace")
    );
  }

  const trimmed = value.trim();
  const hasLetter = /[a-zA-Z]/.test(trimmed);
  const hasOnlyNumbers = /^\d+$/.test(trimmed);

  if (!hasLetter) {
    return Promise.reject(new Error("Field must contain at least one letter"));
  }

  if (hasOnlyNumbers) {
    return Promise.reject(new Error("Field cannot be only numbers"));
  }

  return Promise.resolve();
};

const EditMyTaskForm = forwardRef(({ initialValues, onChangeForm }, ref) => {
  const [form] = Form.useForm();
  const [requestedContent, setRequestedContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  const isValidTitle = (title) => {
    return title && title.trim().length > 0;
  };

  const hasValidChanges = () => {
    const values = form.getFieldsValue();
    const titleChanged = values.title !== (initialValues?.title || "");
    const descriptionChanged =
      values.description !== (initialValues?.description || "");
    const validTitle = isValidTitle(values.title);
    return (titleChanged || descriptionChanged) && validTitle;
  };

  useImperativeHandle(ref, () => ({
    getFormValues: () => form.getFieldsValue(),
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
      });
    }
  }, [initialValues, form]);

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

  useEffect(() => {
    const getMyContentRequested = async (taskId) => {
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
    if (initialValues?.id) {
      getMyContentRequested(initialValues.id);
    }
  }, [initialValues?.id]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequestedContent = requestedContent.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
          rules={[
            { required: true, message: "Title is required" },
            { validator: validateTextAndNumber },
          ]}
        >
          <Input
            placeholder="Enter title..."
            onBlur={(e) => {
              const trimmedValue = e.target.value.trimStart();
              if (trimmedValue !== e.target.value) {
                form.setFieldValue("title", trimmedValue);
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Description:"
          name="description"
          rules={[
            { required: true, message: "Description is required" },
            { validator: validateTextAndNumber },
          ]}
        >
          <Input.TextArea
            placeholder="Enter description..."
            rows={4}
            onBlur={(e) => {
              const trimmedValue = e.target.value.trimStart();
              if (trimmedValue !== e.target.value) {
                form.setFieldValue("description", trimmedValue);
              }
            }}
          />
        </Form.Item>
      </Form>

      {requestedContent.length > 0 ? (
        <div>
          {paginatedRequestedContent.map((item, index) => (
            <Descriptions
              key={startIndex + index}
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
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} requests`
                }
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
});

export default EditMyTaskForm;
