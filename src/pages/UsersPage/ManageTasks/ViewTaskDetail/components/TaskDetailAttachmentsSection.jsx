// import React, { useEffect, useState } from "react";
// import { useAuth } from "../../../../../context/useAuth";
// import {
//   apiRenderTaskAttachments,
//   apiUploadAttachment,
// } from "../../../../../services/UserService/ManageTasksService";
// import { v4 as uuidv4 } from "uuid";
// import { Button, notification, Typography, Upload } from "antd";
// import { FileOutlined, UploadOutlined } from "@ant-design/icons";

// const TaskDetailAttachmentsSection = ({ projectData, taskId }) => {
//   const { user } = useAuth();
//   const isOwner = projectData && projectData.owner_id === user.id;
//   const [fileList, setFileList] = useState([]);
//   const [attachmentBase64, setAttachmentBase64] = useState("");
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewImage, setPreviewImage] = useState("");
//   const [previewTitle, setPreviewTitle] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const renderTaskAttachments = async () => {
//     setIsLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       const res = await apiRenderTaskAttachments(taskId);
//       if (res?.file_url) {
//         setFileList([
//           {
//             uid: uuidv4(),
//             name: res.file_url.split("/").pop(),
//             status: "done",
//             url: res.file_url,
//           },
//         ]);
//       }
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: "Failed to get task attachments",
//         placement: "bottomRight",
//       });
//     } finally {
//       setIsLoading(false); // Kết thúc loading
//     }
//   };

//   useEffect(() => {
//     if (taskId) {
//       renderTaskAttachments();
//     }
//   }, [taskId]);

//   const getBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handlePreview = async (file) => {
//     if (!file.url && !file.preview) {
//       file.preview = await getBase64(file.originFileObj);
//     }
//     setPreviewImage(file.url || file.preview);
//     setPreviewTitle(file.name || file.url.split("/").pop());
//     setPreviewVisible(true);
//   };

//   const handleUpload = async (options) => {
//     const { file, onSuccess, onError } = options;
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("task_id", taskId);
//       formData.append("user_id", user.id);
//       const res = await apiUploadAttachment(formData);
//       setFileList((prevList) => {
//         const newFile = {
//           uid: uuidv4(),
//           name: file.name,
//           status: "done",
//           url: res.file_url,
//         };
//         return [...prevList, newFile].slice(0, 5);
//       });
//       notification.success({
//         message: "Success",
//         description: "Attachment uploaded successfully",
//         placement: "bottomRight",
//       });
//       onSuccess("ok");
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: "Failed to upload attachment",
//         placement: "bottomRight",
//       });
//       onError(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const uploadProps = {
//     name: "file",
//     multiple: true,
//     fileList,
//     onChange: ({ fileList: newFileList }) => {
//       setFileList(newFileList.slice(0, 5));
//     },
//     onPreview: handlePreview,
//     beforeUpload: (file) => {
//       const acceptedTypes = [".png", ".jpeg", ".jpg", ".mp3", ".mp4", ".pdf"];
//       const fileExtension = "." + file.name.split(".").pop().toLowerCase();
//       const isAccepted = acceptedTypes.includes(fileExtension);
//       const isLt5M = file.size / 1024 / 1024 < 5;
//       if (!isAccepted) {
//         notification.error({
//           message: "Error",
//           description:
//             "Only .png, .jpeg, .jpg, .mp3, .mp4, .pdf files are allowed!",
//           placement: "bottomRight",
//         });
//         return Upload.LIST_IGNORE;
//       }
//       if (!isLt5M) {
//         notification.error({
//           message: "Error",
//           description: "File must be smaller than 5MB!",
//           placement: "bottomRight",
//         });
//         return Upload.LIST_IGNORE;
//       }
//       return false;
//     },
//     maxCount: 5,
//     accept: ".png,.jpeg,.jpg,.mp3,.mp4,.pdf",
//     onRemove: (file) => {
//       setFileList((prevList) =>
//         prevList.filter((item) => item.uid !== file.uid)
//       );
//     },
//     customRequest: handleUpload,
//     listType: "picture-card",
//     showUploadList: {
//       showPreviewIcon: true,
//       showRemoveIcon: true,
//     },
//   };
//   return (
//     <div>
//       {isOwner ? (
//         <div>
//           <Typography.Text type="secondary">
//             {fileList.length > 0
//               ? "View the attachments for this task below."
//               : "No attachments available for this task."}
//           </Typography.Text>
//           <Upload
//             {...uploadProps}
//             disabled={true}
//             listType="picture"
//             style={{ marginTop: 16 }}
//           >
//             <Button icon={<FileOutlined />} disabled>
//               View Attachments
//             </Button>
//           </Upload>
//         </div>
//       ) : (
//         <div>
//           <Typography.Text type="secondary">
//             Upload up to 5 files (PNG, JPEG, MP3, MP4, PDF, max 5MB each).
//           </Typography.Text>
//           <Upload {...uploadProps} style={{ marginTop: 16 }}>
//             <Button
//               icon={<UploadOutlined />}
//               type="primary"
//               loading={isLoading}
//             >
//               Upload Attachment
//             </Button>
//           </Upload>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskDetailAttachmentsSection;

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/useAuth";
import {
  apiRenderTaskAttachments,
  apiUploadAttachment,
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
import { FileOutlined, UploadOutlined, LoadingOutlined } from "@ant-design/icons";

const TaskDetailAttachmentsSection = ({ projectData, taskId }) => {
  const { user } = useAuth();
  const isOwner = projectData && projectData.owner_id === user.id;
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

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
          }))
        );
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to get task attachments",
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

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(0, 5));
    },
    beforeUpload: (file) => {
      const acceptedTypes = [".png", ".jpeg", ".jpg", ".mp3", ".mp4", ".pdf"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const isAccepted = acceptedTypes.includes(fileExtension);
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isAccepted) {
        notification.error({
          message: "Error",
          description: "Only .png, .jpeg, .jpg, .mp3, .mp4, .pdf files are allowed!",
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
    onRemove: (file) => {
      setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
    },
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
      showRemoveIcon: !isOwner,
    },
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
              : "Upload up to 5 files (PNG, JPEG, MP3, MP4, PDF, max 5MB each)."}
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
              disabled={fileList.filter((file) => file.status !== "done").length === 0}
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
      </div>
    </Spin>
  );
};

export default TaskDetailAttachmentsSection;