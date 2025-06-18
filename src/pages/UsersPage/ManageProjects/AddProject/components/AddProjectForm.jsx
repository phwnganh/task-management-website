import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, notification } from "antd";
import {
  apiCreateProject,
  apiGetProjectList,
} from "../../../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const { TextArea } = Input;

const AddProjectForm = ({ owner, onCreate, onClose }) => {
  const { t } = useTranslation("mp");
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  notification.config({
    placement: "bottomRight",
    duration: 3,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await apiGetProjectList();
        setAllProjects(projects);
      } catch (error) {
        notification.error({
          message: t("error"),
          description: t("failedToFetchProjects"),
        });
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const title = values.title.trim();
        const description = values.description.trim();

        if (!description) {
          notification.error({
            message: t("descriptionCannotBeEmpty"),
          });
          return;
        }

        const duplicate = allProjects.some(
          (project) =>
            project.title.trim().toLowerCase() === title.toLowerCase() &&
            project.owner_id === owner.id
        );

        if (duplicate) {
          notification.error({
            message: t("error"),
            description: t("projectTitleExists"),
          });
          return;
        }

        setSubmitting(true);
        try {
          const payload = {
            title,
            description,
            owner_id: owner.id,
          };

          await apiCreateProject(payload);
          notification.success({
            message: t("success"),
            description: t("projectCreatedSuccessfully"),
          });
          onCreate(payload);
          form.resetFields();
          onClose();
        } catch (error) {
          notification.error({
            message: t("error"),
            description: t("failedToCreateProject"),
          });
        } finally {
          setSubmitting(false);
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <Title level={2}>{t("createNewProject")}</Title>
      <Form form={form} layout="vertical">
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
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            {t("reset")}
          </Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {t("create")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddProjectForm;
