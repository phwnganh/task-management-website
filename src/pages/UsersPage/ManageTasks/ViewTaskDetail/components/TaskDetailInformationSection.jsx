import React, { useState, useEffect } from "react";
import { apiGetUserDetail } from "../../../../../services/AdminService/ManageUsersService";
import { apiGetProjectDetail } from "../../../../../services/UserService/ManageProjectsService";
import { apiGetLabelsDetail } from "../../../../../services/UserService/ManageLabelsService";
import { Badge, Avatar, Tooltip, Input, Button, Dropdown, Tag, Spin } from "antd";
const { TextArea } = Input;
import { useTranslation } from "react-i18next";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const TaskDetailInformationSection = ({ task, currentUser }) => {
  const { t } = useTranslation("taskcalendar");
  const [assigneeData, setAssigneeData] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(true);
  const [project, setProject] = useState(null);
  const [labelData, setLabelData] = useState([]);
  const [loadingLabel, setLoadingLabel] = useState(true);

  useEffect(() => {
    const fetchAssigneesAndProject = async () => {
      if (
        !task ||
        !currentUser ||
        !task.assignee_ids ||
        task.assignee_ids.length === 0
      ) {
        setLoadingAssignees(false);
        return;
      }

      setLoadingAssignees(true);
      const fetchedAssigneeDetails = [];

      try {
        const fetchedProject = await apiGetProjectDetail(task.project_id);
        setProject(fetchedProject);

        for (const id of task.assignee_ids) {
          const userDetail = await apiGetUserDetail(id);
          if (userDetail) {
            if (
              id === currentUser.id &&
              fetchedProject.is_owner !== currentUser.id
            ) {
              fetchedAssigneeDetails.push({ ...userDetail, isMe: true });
            } else {
              fetchedAssigneeDetails.push(userDetail);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching assignees or project detail:", error);
      } finally {
        setAssigneeData(fetchedAssigneeDetails);
        setLoadingAssignees(false);
      }
    };

    const fetchLabels = async () => {
      if (!task || !task.label_ids || task.label_ids.length === 0) {
        setLoadingLabel(false);
        return;
      }

      setLoadingLabel(true);
      try {
        const fetchedLabels = [];
        for (const labelId of task.label_ids) {
          const label = await apiGetLabelsDetail(labelId);
          if (label) {
            fetchedLabels.push(label);
          }
        }
        setLabelData(fetchedLabels);
      } catch (error) {
        console.error("Error fetching label details:", error);
      } finally {
        setLoadingLabel(false);
      }
    };

    fetchAssigneesAndProject();
    fetchLabels();
  }, [task, currentUser]);

  const isOwner = project && currentUser && project.is_owner === currentUser.id;

  if (!task) {
    return <div>{t("noTaskData")}</div>;
  }

  return (
    <Spin spinning={loadingAssignees} indicator={<LoadingOutlined spin/>} tip={t("loadingAssignees")}>
        <div className="p-4">
      <div className="space-y-6">
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="title"
          >
            {t("title")}:
          </label>
          <div className="w-3/4 pl-3">
            <Input id="title" value={task.title} readOnly className="w-full" />
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="assignedTo"
          >
            {t("assignedTo")}:
          </label>
          <div className="w-3/4">
            <div className="pl-3">
              {loadingAssignees ? (
                <span>{t("loadingAssignees")}</span>
              ) : (
                <div className="flex items-center space-x-2">
                  {assigneeData.slice(0, 3).map((assignee) => (
                    <Tooltip
                      title={
                        assignee.isMe
                          ? "Me"
                          : `${assignee.first_name} ${assignee.last_name}`
                      }
                      key={assignee.id}
                    >
                      <Avatar src={assignee.avatar_url} icon={!assignee.avatar_url && <UserOutlined/>}/>
                    </Tooltip>
                  ))}
                  {assigneeData.length > 3 && (
                    <Dropdown
                      menu={{
                        items: assigneeData.slice(3).map((assignee) => ({
                          key: assignee.id,
                          label: (
                            <div className="flex items-center">
                              <Avatar
                                src={assignee.avatar_url}
                                className="mr-2"
                              />
                              <span>
                                {assignee.isMe
                                  ? "Me"
                                  : `${assignee.first_name} ${assignee.last_name}`}
                              </span>
                            </div>
                          ),
                        })),
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        shape="circle"
                        className="flex items-center justify-center"
                      >
                        +{assigneeData.length - 3}
                      </Button>
                    </Dropdown>
                  )}
                  {isOwner && (
                    <Tooltip title={t("addAssignee")}>
                      <Avatar className="bg-gray-300 cursor-pointer">+</Avatar>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="priority"
          >
            {t("priority")}:
          </label>
          <div className="w-3/4">
            <div className="pl-3">
              <Badge
                status={
                  task.priority === "Low"
                    ? "success"
                    : task.priority === "Medium"
                    ? "warning"
                    : task.priority === "High"
                    ? "error"
                    : "default"
                }
                text={task.priority || "N/A"}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="label"
          >
            {t("labels")}:
          </label>
          <div className="w-3/4">
            <div className="pl-3">
              {loadingLabel ? (
                <span>{t("loadingLabels")}</span>
              ) : labelData.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {labelData.map((label) => (
                    <Tag key={label.id} color={label.color}>
                      {label.title}
                    </Tag>
                  ))}
                </div>
              ) : (
                <span>{t("noLabels")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="status"
          >
            {t("status")}:
          </label>
          <div className="w-3/4">
            <div className="pl-3">
              <Badge
                color={
                  task.status === "Completed"
                    ? "lime"
                    : task.status === "In Progress"
                    ? "cyan"
                    : task.status === "To Do"
                    ? "blue"
                    : "default"
                }
                text={task.status || "N/A"}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="startDate"
          >
            {t("startDate")}:
          </label>
          <div className="w-3/4 pl-3">
            <Input
              id="startDate"
              value={task.start_date ? dayjs(task.start_date).format("YYYY-MM-DD") : "N/A"}
              readOnly
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold"
            htmlFor="dueDate"
          >
            {t("dueDate")}:
          </label>
          <div className="w-3/4 pl-3">
            <Input
              id="dueDate"
              value={task.due_date ? dayjs(task.due_date).format("YYYY-MM-DD") : "N/A"}
              readOnly
              className="w-full"
            />
          </div>
        </div>
        <div className="flex mb-2">
          <label
            className="w-1/4 text-gray-700 text-sm font-bold mt-2"
            htmlFor="description"
          >
            {t("description")}:
          </label>
          <div className="w-3/4 pl-3">
            <TextArea
              id="description"
              value={task.description}
              readOnly
              className="w-full"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </div>
        </div>
      </div>
    </div></Spin>

  );
};

export default TaskDetailInformationSection;
