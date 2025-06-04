import {
  Button,
  Image,
  message,
  Upload,
  Form,
  Input,
  DatePicker,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  apiChangeAvatar,
  apiGetUserProfile,
  updateUserProfile,
} from "../../../../services/GeneralService/GeneralSerice";
import { useAuth } from "../../../../context/useAuth";
import { UploadOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import dayjs from "dayjs";

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
  const [fileList, setFileList] = useState([]);
  const [avatarBase64, setAvatarBase64] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [messageApi, contextHolder] = message.useMessage(); // Initialize message API

  const getUserProfile = async () => {
    try {
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
      messageApi.error("Failed to get user profile");
    }
  };

  useEffect(() => {
    if (user.id) {
      getUserProfile();
    }
  }, [user.id, messageApi]);

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
        messageApi.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        messageApi.error("Image must be smaller than 5MB!");
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
        messageApi.error("Please select an image to upload");
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
        messageApi.success("Avatar updated successfully");
      } else {
        throw new Error("No avatar_url in response");
      }
    } catch (error) {
      messageApi.error("Failed to change avatar");
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
      messageApi.error("Form validation failed.");
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
      messageApi.success({
        content: "Profile updated successfully!",
        duration: 5,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
        },
      });
      updateUser(updatedUser);

      setIsModalVisible(false);

      setFormValues(null);
    } catch (error) {
      messageApi.error("Failed to update profile.");
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <div className="flex flex-col p-6 max-w-3xl rounded-lg">
        {contextHolder} {/* Add contextHolder to enable message API */}
        <h3 className="text-3xl font-bold mb-6 text-start">Change Profile</h3>
        <div className="flex flex-row items-center mb-8">
          <ImgCrop rotationSlider>
            <Upload {...uploadProps}>
              {fileList.length < 1 && "+ Choose File"}
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
        </div>
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-2 gap-x-8 gap-y-6"
          onFinish={() => {}}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter first name" }]}
            className="flex flex-col"
          >
            <Input
              placeholder="First name"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter last name" }]}
            className="flex flex-col"
          >
            <Input
              placeholder="Last name"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item label="Email" name="email" className="flex flex-col">
            <Input
              placeholder="Email"
              disabled
              className="rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed px-3 py-2"
            />
          </Form.Item>

          <Form.Item
            label="Date Of Birth"
            name="dob"
            rules={[{ required: true, message: "Please select date of birth" }]}
            className="flex flex-col"
          >
            <DatePicker
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              classNames={{ popup: { root: "rounded-md" } }}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ validator: phoneValidator }]}
            className="flex flex-col"
          >
            <Input
              placeholder="Phone number (starts with 0, 10 digits)"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item label="Address" name="address" className="flex flex-col">
            <Input
              placeholder="Address"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </Form.Item>

          <Form.Item className="col-span-2 flex justify-end mb-0">
            <Button
              onClick={onCancel}
              className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition mr-4 min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveClick}
              className="px-6 py-2 rounded-md min-w-[100px]"
            >
              Save
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title="Confirm Change"
          open={isModalVisible}
          onOk={handleConfirm}
          onCancel={handleCancelModal}
          okText="Yes"
          cancelText="No"
        >
          <p>Are you sure you want to change your profile?</p>
        </Modal>
      </div>
    </>
  );
};

export default ChangeProfileForm;
