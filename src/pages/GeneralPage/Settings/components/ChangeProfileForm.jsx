import { Button, Image, message, Upload } from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiChangeAvatar, apiGetUserProfile } from "../../../../services/GeneralService/GeneralSerice";
import { useAuth } from "../../../../context/useAuth";
import { UploadOutlined } from "@ant-design/icons";
import ImgCrop from 'antd-img-crop';

const ChangeProfileForm = () => {
  const [fileList, setFileList] = useState([]);
  const [avatarBase64, setAvatarBase64] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { user } = useAuth();

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
      message.error("Failed to get user profile");
    }
  };

  useEffect(() => {
    if (user.id) {
      getUserProfile();
    }
  }, [user.id]);

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
        message.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
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
        message.error("Please select an image to upload");
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
        message.success("Avatar updated successfully");
      } else {
        throw new Error("No avatar_url in response");
      }
    } catch (error) {
      message.error("Failed to change avatar");
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-md rounded-lg">
      <h3 className="text-3xl font-bold mb-6">Change Profile</h3>
      <div className="flex flex-row justify-start">
      <ImgCrop rotationSlider>
        <Upload {...uploadProps}>
          {fileList.length < 1 && '+ Choose File'}
        </Upload>
      </ImgCrop>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        className="mt-8 ml-7"
        size="large"
      >
        Upload
      </Button>
      </div>

{/* change profile information section */}
    </div>
  );
};

export default ChangeProfileForm;