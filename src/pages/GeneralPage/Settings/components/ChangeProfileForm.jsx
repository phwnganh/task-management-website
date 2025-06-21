import {
  Button,
  Image,
  message,
  Upload,
  Form,
  Input,
  DatePicker,
  Modal,
  Spin,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  apiChangeAvatar,
  apiGetUserProfile,
  updateUserProfile,
} from "../../../../services/GeneralService/GeneralSerice";
import { useAuth } from "../../../../context/useAuth";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const phoneValidator = (_, value) => {
  if (!value) return Promise.resolve();
  const phoneRegex = /^0\d{9}$/;
  if (phoneRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error("Phone number must start with 0 and be 10 digits")
  );
};

const ChangeProfileForm = () => {
  const { t } = useTranslation("userinfor");
  const [fileList, setFileList] = useState([]);
  const [avatarBase64, setAvatarBase64] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUserProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await apiGetUserProfile(user.id);
      if (res?.avatar_url) {
        setAvatarBase64(res.avatar_url);
        setFileList([
          {
            uid: uuidv4(),
            name: "avatar.jpg",
            status: "done",
            url: res.avatar_url,
          },
        ]);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to get user profile",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    if (user.id) {
      getUserProfile();
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        dob: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        phoneNumber: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user, form]);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadProps = {
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        notification.error({
          message: "Error",
          description: t("uploadImageError"),
          placement: "bottomRight",
        });
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        notification.error({
          message: "Error",
          description: t("uploadSizeError"),
          placement: "bottomRight",
        });
        return false;
      }
      const base64 = await getBase64(file);
      setAvatarBase64(base64);
      return false;
    },
    fileList,
    listType: "picture-circle",
    maxCount: 1,
    accept: "image/*",
    onPreview: async (file) => {
      let src = file.url;
      if (!src) {
        src = await getBase64(file.originFileObj);
      }
      setPreviewImage(src);
      setPreviewVisible(true);
    },
  };

  const handleUpload = async () => {
    try {
      const file = fileList[0]?.originFileObj;
      if (!file) {
        notification.error({
          message: "Error",
          description: t("uploadSelectError"),
          placement: "bottomRight",
        });
        return;
      }
      const base64Image = await getBase64(file);
      const response = await apiChangeAvatar(user.id, base64Image);
      if (response?.avatar_url) {
        setAvatarBase64(response.avatar_url);
        setFileList([
          {
            uid: uuidv4(),
            name: "avatar.jpg",
            status: "done",
            url: response.avatar_url,
          },
        ]);
        notification.success({
          message: "Success",
          description: t("uploadSuccess"),
          placement: "bottomRight",
        });
      } else {
        throw new Error("No avatar_url in response");
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: t("uploadFail"),
        placement: "bottomRight",
      });
    }
  };

  const onCancel = () => {
    form.setFieldsValue({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      dob: user.date_of_birth ? dayjs(user.date_of_birth) : null,
      phoneNumber: user.phone_number || "",
      address: user.address || "",
    });
  };

  const handleSaveClick = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setIsModalVisible(true);
    } catch (error) {
      notification.error({
        message: "Error",
        description: t("formValidationError"),
        placement: "bottomRight",
      });
    }
  };

  const handleConfirm = async () => {
    if (!formValues) return;
    try {
      const dataToUpdate = {
        id: user.id,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        date_of_birth: formValues.dob
          ? formValues.dob.format("YYYY-MM-DD")
          : null,
        phone_number: formValues.phoneNumber || null,
        address: formValues.address || null,
        avatar_url: avatarBase64,
        email: user.email,
        role: user.role,
        status: user.status,
        password: user.password,
      };
      const updatedUser = await updateUserProfile(user.id, dataToUpdate);
      notification.success({
        message: "Success",
        description: t("updateSuccess"),
        placement: "bottomRight",
      });
      updateUser(updatedUser);

      setIsModalVisible(false);
      setFormValues(null);
    } catch (error) {
      notification.error({
        message: "Error",
        description: t("updateFail"),
        placement: "bottomRight",
      });
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="flex flex-col p-4 sm:p-6 max-w-4xl w-full rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-start">
          {t("changeProfileTitle")}
        </h3>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <ImgCrop rotationSlider>
            <Upload {...uploadProps} className="w-24 sm:w-32">
              {fileList.length < 1 && (
                <div className="flex flex-col items-center">
                  <UploadOutlined className="text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm mt-2">Choose File</span>
                </div>
              )}
            </Upload>
          </ImgCrop>
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
          {/* <Button
            onClick={handleUpload}
            type="primary"
            className="mt-4 w-32 sm:w-40 h-10 rounded-md"
          >
            Upload Avatar
          </Button> */}
        </div>
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-6"
          onFinish={() => {}}
        >
          <Form.Item
            label={t("firstNameLabel")}
            name="firstName"
            rules={[{ required: true, message: t("firstNameRequired") }]}
            className="flex flex-col"
          >
            <Input
              placeholder={t("firstNameLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label={t("lastNameLabel")}
            name="lastName"
            rules={[{ required: true, message: t("lastNameRequired") }]}
            className="flex flex-col"
          >
            <Input
              placeholder={t("lastNameLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label={t("emailLabel")}
            name="email"
            className="flex flex-col"
          >
            <Input
              placeholder={t("emailLabel")}
              disabled
              className="rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed px-3 py-2"
            />
          </Form.Item>

          <Form.Item
            label={t("dobLabel")}
            name="dob"
            rules={[{ required: true, message: t("dobRequired") }]}
            className="flex flex-col"
          >
            <DatePicker
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              classNames={{ popup: { root: "rounded-md" } }}
            />
          </Form.Item>

          <Form.Item
            label={t("phoneNumberLabel")}
            name="phoneNumber"
            rules={[{ validator: phoneValidator }]}
            className="flex flex-col"
          >
            <Input
              placeholder={t("phoneNumberLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label={t("addressLabel")}
            name="address"
            className="flex flex-col"
          >
            <Input
              placeholder={t("addressLabel")}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item className="col-span-1 sm:col-span-2 flex justify-end mb-0">
            <Button
              onClick={onCancel}
              className="px-4 sm:px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition mr-2 sm:mr-4 h-10 w-24 sm:w-28"
            >
              {t("cancelButton")}
            </Button>
            <Button
              type="primary"
              onClick={handleSaveClick}
              className="px-4 sm:px-6 py-2 rounded-md h-10 w-24 sm:w-28"
            >
              {t("saveButton")}
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title={t("confirmModalTitle")}
          open={isModalVisible}
          onOk={handleConfirm}
          onCancel={handleCancelModal}
          okText={t("yesButton")}
          cancelText={t("noButton")}
          className="max-w-[90vw] sm:max-w-md"
          okButtonProps={{ className: "h-10 w-20 sm:w-24" }}
          cancelButtonProps={{ className: "h-10 w-20 sm:w-24" }}
        >
          <p>{t("confirmModalMessage")}</p>
        </Modal>
      </div>
    </Spin>
  );
};

export default ChangeProfileForm;
