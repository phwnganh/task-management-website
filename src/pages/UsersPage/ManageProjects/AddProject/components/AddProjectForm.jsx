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
    <div className="p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto">
      <Title level={2} className="text-lg sm:text-xl md:text-2xl">{t("createNewProject")}</Title>
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
                // if (!/^[A-Za-z0-9\s\-_,\.;:()]+$/.test(trimmed)) {
                //   return Promise.reject(t("titleInvalidCharacters"));
                // }
                // const validCharactersRegex =
                //   /^[\p{L}\p{N}\s\-_,\.;:()\uff08\uff09\u300a\u300b\u3010\u3011\u3002\uff0c\u3001\uff01\uff1f\u2018\u2019\u201c\u201d\u00b7\u3005\u30fc\u30fb]+$/u;
                const validCharactersRegex =  /^[\p{L}\p{N}\s\-_,\.;:()（）《》【】。，、！？‘’“”'"’”‘“·々ー・]+$/u;
                if (!validCharactersRegex.test(trimmed)) {
                  return Promise.reject(t("titleInvalidCharacters"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder={t("title")}
            className="w-full sm:w-1/2 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base" />
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
                // const validCharactersRegex =
                //   /^[\p{L}\p{N}\s\-_,\.;:()\uff08\uff09\u300a\u300b\u3010\u3011\u3002\uff0c\u3001\uff01\uff1f\u2018\u2019\u201c\u201d\u00b7\u3005\u30fc\u30fb]+$/u;
                const validCharactersRegex =  /^[\p{L}\p{N}\s\-_,\.;:()（）《》【】。，、！？‘’“”'"’”‘“·々ー・]+$/u;
                if (!validCharactersRegex.test(trimmed)) {
                  return Promise.reject(t("descriptionInvalidCharacters"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea
            placeholder={t("description")}
            autoSize={{ minRows: 4, maxRows: 8 }}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base"
          />
        </Form.Item>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <Button
            onClick={() => {
              form.resetFields();
            }}
            className="w-full sm:w-auto"
          >
            {t("reset")}
          </Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit} className="w-full sm:w-auto">
            {t("create")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddProjectForm;
