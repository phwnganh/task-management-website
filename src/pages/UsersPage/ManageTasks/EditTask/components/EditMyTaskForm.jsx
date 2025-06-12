import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { Descriptions, Form, Input, notification, Typography } from "antd";
import { apiGetRequestToEditTaskByMember } from "../../../../../services/UserService/ManageTasksService";
import dayjs from "dayjs";

const { Title } = Typography;

const EditMyTaskForm = forwardRef(({ initialValues, onChangeForm }, ref) => {
  const [form] = Form.useForm();
  const [requestedContent, setRequestedContent] = useState([]);

  // Để cha có thể lấy giá trị từ form khi submit
  useImperativeHandle(ref, () => ({
    getFormValues: () => form.getFieldsValue(),
  }));

  // Set lại giá trị mỗi khi initialValues thay đổi
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
      });
    }
  }, [initialValues, form]);

  // Theo dõi thay đổi để báo cho cha
  useEffect(() => {
    const unsubscribe = form.subscribe?.({
      values: () => {
        const values = form.getFieldsValue();
        const changed =
          values.title !== (initialValues?.title || "") ||
          values.description !== (initialValues?.description || "");
        onChangeForm && onChangeForm(changed);
      },
    });
    // Nếu AntD không hỗ trợ subscribe, thì dùng onValuesChange bên dưới là đủ
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [form, initialValues, onChangeForm]);

  useEffect(() => {
    const getMyContentRequested = async (taskId) => {
      try {
        const res = await apiGetRequestToEditTaskByMember(taskId);
        console.log("api request to edit task by member: ", res);

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

  return (
    <div className="p-8 rounded-2xl shadow min-w-[340px] bg-white">
      <Title level={3} className="!mb-6 !text-black">
        Edit My Task
      </Title>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          const values = form.getFieldsValue();
          const changed =
            values.title !== (initialValues?.title || "") ||
            values.description !== (initialValues?.description || "");
          onChangeForm && onChangeForm(changed);
        }}
      >
        <Form.Item
          label="Title:"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter title..." />
        </Form.Item>
        <Form.Item label="Description:" name="description">
          <Input.TextArea placeholder="Enter description..." rows={4} />
        </Form.Item>
      </Form>
      {requestedContent.length > 0 ? (
        requestedContent.map((item, index) => (
          <Descriptions
            key={index}
            title={`Proposed Changes (Request ${index + 1})`}
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
                    ? "#52c41a" // Xanh lá
                    : item.status === "Rejected"
                    ? "#ff4d4f" // Đỏ
                    : "#999999", // Màu mặc định
              }}
            >
              {item?.status}
            </Descriptions.Item>
          </Descriptions>
        ))
      ) : (
        <Typography.Text style={{ color: "#999999" }}>
          No proposed changes available.
        </Typography.Text>
      )}
    </div>
  );
});

export default EditMyTaskForm;
