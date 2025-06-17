import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/useAuth";
import {
  apiRenderTaskAttachments,
  apiUploadAttachment,
  apiRemoveAttachmentFromTask,
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

const TaskDetailAttachmentsSection = ({ projectData, taskId }) => {
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

  const renderTaskAttachments = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await apiRenderTaskAttachments(taskId);
      if (Array.isArray(res)) {
        setFileList(
          res.map((attachment) => ({
            uid: uuidv4(),
            name: attachment.file_url.split("/").pop(),
            status: "done",
            url: attachment.file_url,
            attachment_id: attachment.id,
            user_id: attachment.user_id,
          }))
        );
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
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
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
    if (file.user_id !== user.id) {
      notification.error({
        message: "Error",
        description: "You are not authorized to delete this attachment",
        placement: "bottomRight",
      });
      return false;
    }
    if (file.status === "done" && file.attachment_id) {
      // File đã upload, hiển thị modal xác nhận
      setFileToDelete(file);
      setIsDeleteModalVisible(true);
      return false;
    } else {
      // File chưa upload, xóa trực tiếp khỏi fileList
      setFileList((prevList) => {
        console.log("Removing non-uploaded file from fileList:", file.name);
        return prevList.filter((item) => item.uid !== file.uid);
      });
      return true;
    }
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

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(0, 5));
    },
    beforeUpload: (file) => {
      const acceptedTypes = [".png", ".jpeg", ".jpg"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const isAccepted = acceptedTypes.includes(fileExtension);
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isAccepted) {
        notification.error({
          message: "Error",
          description: "Only .png, .jpeg, .jpg files are allowed!",
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
      showRemoveIcon: !isOwner && fileList.some(file => file.user_id === user.id),
    },
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip="Loading..."
    >
      <div className="flex flex-col p-4 sm:p-6 max-w-4xl w-full rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-start">
          Task Attachments
        </h3>
        <div className="flex flex-col mb-6 sm:mb-8">
          <Typography.Text type="secondary" className="mb-2">
            {isOwner
              ? fileList.length > 0
                ? "View the attachments for this task below."
                : "No attachments available for this task."
              : "Upload up to 5 files (PNG, JPEG, JPG max 5MB each)."}
          </Typography.Text>
          <Upload {...uploadProps} disabled={isOwner}>
            <Button
              icon={isOwner ? <FileOutlined /> : <UploadOutlined />}
              type={isOwner ? "default" : "primary"}
              disabled={isOwner}
              className="h-10 w-40 rounded-md"
            >
              {isOwner ? "View Attachments" : "Select Files"}
            </Button>
          </Upload>
          {!isOwner && (
            <Button
              type="primary"
              onClick={handleUpload}
              className="mt-4 w-40 h-10 rounded-md"
              disabled={
                fileList.filter((file) => file.status !== "done").length === 0
              }
            >
              Upload Attachments
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

export default TaskDetailAttachmentsSection;
