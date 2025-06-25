import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/useAuth";
import {
  apiRenderTaskAttachments,
  apiUploadAttachment,
  apiRemoveAttachmentFromTask,
  apiGetTaskDetail,
} from "../../../../../services/UserService/ManageTasksService";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  notification,
  Typography,
  Upload,
  Modal,
  Spin,
  Image,
} from "antd";
import {
  FileOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { apiCreateNotifications } from "../../../../../services/UserService/NotificationsService";
import {
  TASK_ATTACHMENT_REMOVE,
  TASK_ATTACHMENT_UPLOADED,
} from "../../../../../constants/notifications.constants";
import dayjs from "dayjs";
import { apiGetUserDetail } from "../../../../../services/AdminService/ManageUsersService";
import { useTranslation } from "react-i18next";

const TaskDetailAttachmentsSection = ({ projectData, taskId }) => {
  const { t } = useTranslation("cmtAtt");
  const { user } = useAuth();
  const isOwner = projectData && projectData.owner_id === user.id;
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [canUpload, setCanUpload] = useState(true);
  const [isAssignee, setIsAssignee] = useState(false); // Thêm state mới
  const [countdown, setCountdown] = useState({ expired: false, timeLeft: "" });

  const calculateCountdown = (completed_at) => {
    const completedDate = dayjs(completed_at);
    const currentDate = dayjs();
    const endDate = completedDate.add(7, "day");
    if (currentDate.isAfter(endDate)) {
      return { expired: true, timeLeft: "Expired" };
    }
    const diff = endDate.diff(currentDate);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return {
      expired: false,
      timeLeft: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
  };
  const getTaskDetail = async () => {
    try {
      const res = await apiGetTaskDetail(taskId);
      setTaskData(res);
      // Kiểm tra xem user.id có trong assignee_ids không
      if (res.assignee_ids && res.assignee_ids.includes(user.id)) {
        setIsAssignee(true);
      } else {
        setIsAssignee(false);
      }
      // Kiểm tra thời gian hoàn thành task
      if (res.status === "Completed" && res.completed_at) {
        const completedDate = dayjs(res.completed_at);
        const currentDate = dayjs();
        const daysDifference = currentDate.diff(completedDate, "day");
        if (daysDifference > 7) {
          setCanUpload(false);
          setCountdown({ expired: true, timeLeft: "Expired" });
        } else {
          setCanUpload(true);
          setCountdown(calculateCountdown(res.completed_at));
        }
      }
    } catch (error) {
      notification.error({
        message: error.message,
        placement: "bottomRight",
      });
    }
  };

  const getUserDetail = async (userId) => {
    try {
      const user = await apiGetUserDetail(userId);
      return {
        first_name: user?.first_name,
        last_name: user?.last_name,
      };
    } catch (error) {
      notification.error({
        message: error.message,
        placement: "bottomRight",
      });
    }
  };

  useEffect(() => {
    getTaskDetail();
  }, [taskId]);

  useEffect(() => {
    if (
      taskData?.status === "Completed" &&
      taskData?.completed_at &&
      canUpload
    ) {
      const interval = setInterval(() => {
        const result = calculateCountdown(taskData.completed_at);
        setCountdown(result);
        if (result.expired) {
          setCanUpload(false);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [taskData, canUpload]);

  const renderTaskAttachments = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await apiRenderTaskAttachments(taskId);
      if (Array.isArray(res)) {
        const attachmentsWithUser = await Promise.all(
          res.map(async (attachment) => {
            const created_by = await getUserDetail(attachment.user_id);
            return {
              uid: uuidv4(),
              name: attachment.file_url.split("/").pop(),
              status: "done",
              url: attachment.file_url,
              attachment_id: attachment.id,
              user_id: attachment.user_id,
              created_at: attachment.created_at,
              created_by,
            };
          })
        );
        setFileList(attachmentsWithUser);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch task attachments",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      renderTaskAttachments();
    }
  }, [taskId]);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!canUpload) {
      notification.error({
        message: "Error",
        description: "Uploading is disabled after 7 days from task completion.",
        placement: "bottomRight",
      });
      return;
    }
    const filesToUpload = fileList.filter((file) => file.status !== "done");
    if (filesToUpload.length === 0) {
      notification.error({
        message: "Error",
        description: "Please select at least one file to upload",
        placement: "bottomRight",
      });
      return;
    }
    setPendingFiles(filesToUpload);
    setIsModalVisible(true);
  };

  const handleConfirmUpload = async () => {
    if (!canUpload) {
      notification.error({
        message: "Error",
        description: "Uploading is disabled after 7 days from task completion.",
        placement: "bottomRight",
      });
      setIsModalVisible(false);
      return;
    }
    setIsLoading(true);
    try {
      const uploadPromises = pendingFiles.map(async (file) => {
        const base64 = await getBase64(file.originFileObj);
        const payload = {
          id: uuidv4(),
          task_id: taskId,
          user_id: user.id,
          file_url: base64,
          created_at: new Date().toISOString(),
        };
        const res = await apiUploadAttachment(file.originFileObj, payload);
        return {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: res.file_url,
          attachment_id: res.id,
          created_at: payload.created_at,
          created_by: {
            first_name: user.first_name,
            last_name: user.last_name,
          },
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      await apiCreateNotifications({
        id: uuidv4(),
        type: TASK_ATTACHMENT_UPLOADED,
        task_id: taskId,
        recipient_id: projectData?.owner_id,
        initiator_id: user.id,
        message: `${user.first_name} ${user.last_name} has uploaded attachment(s) to task '${taskData?.title}' in ${projectData?.title}`,
        status: "Unread",
        created_at: dayjs().toISOString(),
      });
      setFileList((prevList) => {
        const existingFiles = prevList.filter((file) => file.status === "done");
        return [...existingFiles, ...uploadedFiles].slice(0, 5);
      });
      notification.success({
        message: "Success",
        description: `Successfully uploaded ${uploadedFiles.length} attachment(s)`,
        placement: "bottomRight",
      });
      setIsModalVisible(false);
      setPendingFiles([]);
    } catch (error) {
      console.error("Error uploading attachments:", error);
      notification.error({
        message: "Error",
        description: "Failed to upload attachments",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setPendingFiles([]);
  };

  const handleRemove = (file) => {
    console.log("Attempting to remove file:", {
      uid: file.uid,
      name: file.name,
      status: file.status,
      attachment_id: file.attachment_id,
      user_id: file.user_id,
    });

    // Trường hợp 1: File chưa upload (before upload)
    if (file.status !== "done" || !file.attachment_id) {
      setFileList((prevList) => {
        console.log("Removing non-uploaded file from fileList:", file.name);
        return prevList.filter((item) => item.uid !== file.uid);
      });
      notification.success({
        message: "Success",
        description: `File "${file.name}" removed from the list`,
        placement: "bottomRight",
      });
      return true;
    }

    // Trường hợp 2: File đã upload (after upload)
    if (file.user_id !== user.id) {
      notification.error({
        message: "Error",
        description: "You are not authorized to delete this attachment",
        placement: "bottomRight",
      });
      return false;
    }

    // Hiển thị modal xác nhận xóa cho file đã upload
    setFileToDelete(file);
    setIsDeleteModalVisible(true);
    return false;
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete || !fileToDelete.attachment_id) {
      notification.error({
        message: "Error",
        description: "Invalid file selected for deletion",
        placement: "bottomRight",
      });
      setIsDeleteModalVisible(false);
      setFileToDelete(null);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Deleting attachment with ID:", fileToDelete.attachment_id);
      await apiRemoveAttachmentFromTask(fileToDelete.attachment_id, user.id);
      setFileList((prevList) => {
        console.log("Removing uploaded file from fileList:", fileToDelete.name);
        return prevList.filter((item) => item.uid !== fileToDelete.uid);
      });

      await apiCreateNotifications({
        id: uuidv4(),
        type: TASK_ATTACHMENT_REMOVE,
        task_id: taskId,
        recipient_id: projectData?.owner_id,
        initiator_id: user.id,
        message: `${user.first_name} ${user.last_name} has removed an attachment '${fileToDelete.name}' from task '${taskData?.title}' in ${projectData?.title}`,
        status: "Unread",
        created_at: dayjs().toISOString(),
      });
      notification.success({
        message: "Success",
        description: `Attachment "${fileToDelete.name}" deleted successfully`,
        placement: "bottomRight",
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      notification.error({
        message: "Error",
        description: `Failed to delete attachment "${fileToDelete.name}"`,
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteModalVisible(false);
      setFileToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log("Delete cancelled for file:", fileToDelete?.name);
    setIsDeleteModalVisible(false);
    setFileToDelete(null);
  };

  const customItemRender = (originNode, file, currentFileList, actions) => {
    return (
      <div>
        {originNode}
        {file.status === "done" && file.created_at && (
          <Typography.Text type="secondary" className="block mt-1">
            {t("Uploaded at")}{" "}
            {dayjs(file.created_at).format("YYYY-MM-DD HH:mm")}
          </Typography.Text>
        )}
        {file.status === "done" && file.created_by && (
          <Typography.Text type="secondary" className="block mt-1">
            {t("Uploaded by")} :{" "}
            {file.user_id === user.id
              ? "Me"
              : `${file.created_by.first_name} ${file.created_by.last_name}`}
          </Typography.Text>
        )}
      </div>
    );
  };

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(0, 5));
    },
    beforeUpload: (file) => {
      if (!canUpload) {
        notification.error({
          message: "Error",
          description:
            "Uploading is disabled after 7 days from task completion.",
          placement: "bottomRight",
        });
        return Upload.LIST_IGNORE;
      }
      const acceptedTypes = [".png", ".jpeg", ".jpg"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const isAccepted = acceptedTypes.includes(fileExtension);
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isAccepted) {
        notification.error({
          message: "Error",
          description: t("errorFileType"),
          placement: "bottomRight",
        });
        return Upload.LIST_IGNORE;
      }
      if (!isLt5M) {
        notification.error({
          message: "Error",
          description: "File must be smaller than 5MB!",
          placement: "bottomRight",
        });
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    accept: ".png,.jpeg,.jpg",
    onRemove: handleRemove,
    onPreview: async (file) => {
      let src = file.url;
      if (!src) {
        src = await getBase64(file.originFileObj);
      }
      setPreviewImage(src);
      setPreviewVisible(true);
    },
    listType: "picture",
    showUploadList: {
      showPreviewIcon: true,
      // Cho phép xóa nếu là assignee hoặc file chưa upload
      showRemoveIcon:
        isAssignee || fileList.some((file) => file.status !== "done"),
    },
    // Cho phép upload nếu là assignee và canUpload
    disabled: !isAssignee || !canUpload,
    itemRender: customItemRender,
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip="Loading..."
    >
      <div className="flex flex-col p-4 sm:p-6 max-w-4xl w-full rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-start">
          {t("taskAttachments")}
        </h3>
        <div className="flex flex-col mb-6 sm:mb-8">
          <Typography.Text type="secondary" className="mb-2">
            {isAssignee ? (
              taskData?.status === "Completed" ? (
                canUpload ? (
                  <>
                    {t("uploadTipCountdown", {
                      timeLeft: countdown.timeLeft,
                    })}
                  </>
                ) : (
                  t("uploadTipCompleted")
                )
              ) : (
                t("uploadTipDefault")
              )
            ) : fileList.length > 0 ? (
              t("viewAttachments")
            ) : (
              t("noAttachments")
            )}
          </Typography.Text>
          <Upload {...uploadProps}>
            <Button
              icon={isAssignee ? <UploadOutlined /> : <FileOutlined />}
              type={isAssignee ? "primary" : "default"}
              disabled={!isAssignee || !canUpload}
              className="h-10 w-40 rounded-md"
            >
              {isAssignee ? t("selectFiles") : "View Attachments"}
            </Button>
          </Upload>
          {isAssignee && (
            <Button
              type="primary"
              onClick={handleUpload}
              className="mt-4 w-40 h-10 rounded-md"
              disabled={
                fileList.filter((file) => file.status !== "done").length ===
                  0 || !canUpload
              }
            >
              {t("uploadAttachments")}
            </Button>
          )}
          {previewImage && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewVisible,
                onVisibleChange: (visible) => setPreviewVisible(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}
        </div>
        <Modal
          title="Confirm Upload"
          open={isModalVisible}
          onOk={handleConfirmUpload}
          onCancel={handleCancelModal}
          okText="Yes"
          cancelText="No"
          className="max-w-[90vw] sm:max-w-md"
          okButtonProps={{ className: "h-10 w-24" }}
          cancelButtonProps={{ className: "h-10 w-24" }}
        >
          <p>Are you sure you want to upload {pendingFiles.length} file(s)?</p>
        </Modal>
        <Modal
          title="Confirm Delete"
          open={isDeleteModalVisible}
          onOk={handleConfirmDelete}
          onCancel={handleCancelDelete}
          okText="Yes"
          cancelText="No"
          className="max-w-[90vw] sm:max-w-md"
          okButtonProps={{ className: "h-10 w-24" }}
          cancelButtonProps={{ className: "h-10 w-24" }}
        >
          <p>
            Are you sure you want to delete the file "{fileToDelete?.name}"?
          </p>
        </Modal>
      </div>
    </Spin>
  );
};

export default React.memo(TaskDetailAttachmentsSection);
