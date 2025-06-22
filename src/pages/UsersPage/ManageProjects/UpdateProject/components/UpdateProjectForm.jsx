import { useEffect, useState } from "react";
import { Form, Input, Button, Typography, notification, Spin } from "antd";
import {
  apiUpdateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";
import { LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

const UpdateProjectForm = ({ owner, project, onUpdate, onClose }) => {
  const { t } = useTranslation("taskowner");
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(true);

  notification.config({
    placement: "bottomRight",
    duration: 3,
  });

  useEffect(() => {
    if (project) {
      const safeDesc =
        typeof project.description === "string"
          ? project.description
          : typeof project.description === "number"
          ? project.description.toString()
          : "";

      form.setFieldsValue({
        title: project.title || "",
        description: safeDesc,
      });

      setLoading(false);
    }

    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        notification.error({
          message: t("error"),
          description: t("failedToFetchProjectList"),
        });
      }
    };

    fetchProjects();
  }, [project, form]);

  const handleFieldChange = (_, allValues) => {
    const currentTitle = allValues.title?.trim() || "";
    const currentDescription = allValues.description?.trim() || "";
    const originalTitle = project.title?.trim() || "";
    const originalDescription =
      typeof project.description === "string" ? project.description.trim() : "";

    const changed =
      currentTitle !== originalTitle ||
      currentDescription !== originalDescription;

    setIsModified(changed);
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      const title = values.title.trim();
      const description = values.description.trim();

      if (!description) {
        notification.error({
          message: t("descriptionCannotBeEmpty"),
        });
        return;
      }

      const duplicate = allProjects.some(
        (p) =>
          p.title.trim().toLowerCase() === title.toLowerCase() &&
          p.owner_id === owner.id &&
          p.id !== project.id
      );

      if (duplicate) {
        notification.error({
          message: t("error"),
          description: t("duplicateProjectTitle"),
        });
        return;
      }

      setSubmitting(true);
      try {
        await apiUpdateProject(project.id, {
          title,
          description,
          plain_description: description,
          owner_id: project.owner_id,
        });

        notification.success({
          message: t("success"),
          description: t("projectUpdatedSuccessfully"),
        });

        onUpdate?.();
        form.resetFields();
        onClose?.();
      } catch (err) {
        notification.error({
          message: t("error"),
          description: t("failedToUpdateProject"),
        });
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spin size="large" indicator={<LoadingOutlined spin/>}/>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <Title level={2}>{t("updateProject")}</Title>
      <Form form={form} layout="vertical" onValuesChange={handleFieldChange}>
        <Form.Item
          label={<span className="font-semibold">{t("title")}</span>}
          name="title"
          rules={[
            { required: true, message: t("pleaseEnterProjectTitle") },
            {
              validator: (_, value) => {
                const trimmed = value?.trim();
                if (!trimmed) {
                  return Promise.reject(t("titleCannotBeEmpty"));
                }
                if (/^[\d\s]+$/.test(trimmed)) {
                  return Promise.reject(t("titleOnlyNumbers"));
                }
                if (!/^[A-Za-z0-9\s\-_,\.;:()]+$/.test(trimmed)) {
                  return Promise.reject(t("titleInvalidCharacters"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder={t("title")} className="w-1/2" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold">{t("description")}</span>}
          name="description"
          rules={[
            { required: true, message: t("pleaseEnterProjectDescription") },
            {
              validator: (_, value) => {
                const trimmed = value?.trim();
                if (!trimmed) {
                  return Promise.reject(
                    t("descriptionCannotBeEmptyOrWhitespace")
                  );
                }
                if (/^[\d\s]+$/.test(trimmed)) {
                  return Promise.reject(t("descriptionOnlyNumbers"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea
            placeholder={t("description")}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>

        <div className="flex justify-end space-x-4 pt-4">
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            disabled={!isModified}
          >
            {t("update")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateProjectForm;
