import React from "react";
import { Form, Input, Button, ColorPicker, notification } from "antd";
import { apiCreateLabel } from "../../../../../services/UserService/ManageLabelsService";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useAuth } from "../../../../../context/useAuth";
import { useTranslation } from "react-i18next";

const CreateLabelForm = ({ onSubmit, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { t } = useTranslation("labellist");

  React.useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      color: initialValues?.color || undefined,
    });
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    try {
      const newLabel = {
        id: uuidv4(),
        title: values.title,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color?.toHexString?.() || "#1677ff",
        created_by: user?.id || "unknown",
        created_at: dayjs().toISOString(),
        is_public: false,
      };
      const res = await apiCreateLabel(newLabel);
      notification.success({
        message: t("success") || "Success",
        description: t("label_created") || "Label created successfully!",
        placement: "bottomRight",
      });
      form.resetFields();
      if (onSubmit) onSubmit(res);
      if (onCancel) onCancel();
    } catch (error) {
      notification.error({
        message: t("error") || "Error",
        description: t("create_label_failed") || "Create label failed!",
        placement: "bottomRight",
      });
    }
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ flex: "90px" }}
      wrapperCol={{ flex: "auto" }}
      colon={false}
      className="pt-2 pb-0 px-2 w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto"
      onFinish={handleFinish}
      initialValues={{
        title: "",
        color: undefined,
      }}
    >
      <br />
      <Form.Item
        label={<span className="font-semibold text-base">{t("title")}:</span>}
        name="title"
        rules={[
          { required: true, message: t("please_enter_label_name") },
          {
            validator: (_, value) => {
              if (!value || value.length === 0) return Promise.resolve();
              if (/^[a-zA-Z]/.test(value)) return Promise.resolve();
              return Promise.reject(t("first_letter_letter"));
            },
          },
        ]}
      >
        <Input
          placeholder={t("title")}
          autoFocus
          maxLength={32}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-base w-full"
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-semibold text-base">{t("color")}:</span>}
        name="color"
        rules={[{ required: true, message: t("please_select_color") }]}
        valuePropName="value"
      >
        <ColorPicker
          showText={false}
          allowClear
          size="large"
          className="rounded-full"
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item className="mt-8 px-2">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            onClick={() => {
              form.resetFields();
              if (onCancel) onCancel();
            }}
            className="border border-gray-300 px-7 py-2 rounded-lg text-base font-medium hover:bg-gray-100 w-full sm:w-auto"
          >
            {t("reset")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-[#1677ff] px-7 py-2 rounded-lg text-base font-medium w-full sm:w-auto"
          >
            {t("create")}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CreateLabelForm;
