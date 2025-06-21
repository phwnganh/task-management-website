import { Form, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const ProjectFilterAction = ({ onChange, onFormInstance }) => {
  const { t } = useTranslation("mp");
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstance(form);
  }, [form, onFormInstance]);

  const roleSelectionDefault = [
    {
      value: "owner",
      label: t("owner"),
    },
    {
      value: "member",
      label: t("member"),
    },
  ];

  const projectStatusSelectionDefault = [
    {
      value: "in-progress",
      label: t("inProgress"),
    },
    {
      value: "completed",
      label: t("completed"),
    },
  ];

  const handleValuesChange = (_, allValues) => {
    onChange(allValues);
  };

  return (
    <>
      <Form
        {...layout}
        form={form}
        className="space-y-6"
        layout="vertical"
        initialValues={{ role: null, projectStatus: null }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="role"
          label={<span className="text-gray-700 font-medium">{t("role")}</span>}
        >
          <Select
            placeholder={t("selectRole")}
            options={roleSelectionDefault}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="projectStatus"
          label={
            <span className="text-gray-700 font-medium">
              {t("projectStatus")}
            </span>
          }
        >
          <Select
            placeholder={t("selectProjectStatus")}
            options={projectStatusSelectionDefault}
            allowClear
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default ProjectFilterAction;
