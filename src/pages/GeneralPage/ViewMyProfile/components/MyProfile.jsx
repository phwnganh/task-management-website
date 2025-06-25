import {
  Avatar,
  Badge,
  Button,
  Card,
  message,
  notification,
  Popconfirm,
  Spin,
  Modal,
  Input,
  Form,
} from "antd";
import { apiGetUserProfile } from "../../../../services/GeneralService/GeneralSerice";
import {
  apiGetUserDetail,
  apiTemporarilyDeletedAccount,
} from "../../../../services/AdminService/ManageUsersService";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const MyProfile = () => {
  const { t } = useTranslation("userinfor");
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [form] = Form.useForm();
  // Lấy thông tin người dùng
  const getUserProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await apiGetUserProfile(user.id);
      setUserDetail(res);
      console.log("profile res: ", res);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to get user profile",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      getUserProfile();
    }
  }, [user.id]);

  const handleTemporarilyDeleteAccount = async () => {
    try {
      // Kiểm tra mật khẩu
      if (password !== userDetail?.password) {
        notification.error({
          message: "Error",
          description: t("Invalid password"),
          placement: "bottomRight",
        });
        return;
      }

      // Gọi API xóa tài khoản
      await apiTemporarilyDeletedAccount(user.id, true);
      notification.success({
        message: t(
          "Your account has been marked for deletion. You can recover it within 30 days by logging back in."
        ),
        placement: "bottomRight",
      });
      logout();
      setIsModalOpen(false); // Close modal only on success
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to delete account",
        placement: "bottomRight",
      });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="flex justify-center p-4 sm:p-6 md:p-8 min-h-screen">
        <Card className="w-full max-w-xs sm:max-w-xl md:max-w-2xl">
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6">
              {t("myProfileTitle")}
            </h3>
            <div className="w-full space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <Avatar
                  size={120}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48"
                  src={user.avatar_url}
                  icon={!user.avatar_url && <UserOutlined />}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 font-medium">{t("nameLabel")}</p>
                  <p className="text-lg">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">{t("emailLabel")}</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">
                    {t("dateOfBirthLabel")}
                  </p>
                  <p className="text-lg">
                    {user.date_of_birth ? user.date_of_birth : t("none")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">
                    {t("addressLabel")}
                  </p>
                  <p className="text-lg">
                    {user.address ? user.address : t("none")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">{t("roleLabel")}</p>
                  <p className="text-lg">{user.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">
                    {t("statusLabel")}
                  </p>
                  <Badge
                    status={user.status === "Active" ? "success" : "error"}
                    text={user.status}
                    className="text-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end sm:justify-center mt-6">
                <Popconfirm
                  title={t("Delete Account")}
                  description={t("des")}
                  okText={t("Yes")}
                  cancelText={t("No")}
                  placement="top"
                  onConfirm={showModal}
                  overlayStyle={{ width: "300px" }}
                >
                  <Button type="default" danger>
                    {t("Delete Account")}
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title={
          <div className="text-xl font-semibold text-gray-800">
            {t("Confirm Account Deletion")}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg"
        styles={{
          body: {
            padding: "24px",
            backgroundColor: "#f9fafb",
          },
        }}
        centered
      >
        <div className="mb-4 text-gray-600">
          {t(
            "Please enter your password to confirm the deletion of your account."
          )}
        </div>
        <Form
          form={form}
          onFinish={handleTemporarilyDeleteAccount}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="password"
            label={
              <span className="font-medium text-gray-700">{t("Password")}</span>
            }
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              placeholder={t("Enter your password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
            />
          </Form.Item>
          <div className="flex justify-end space-x-3">
            <Button
              type="default"
              onClick={handleCancel}
              className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              {t("Cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-md bg-red-600 hover:bg-red-700 transition duration-200"
            >
              {t("Confirm Deletion")}
            </Button>
          </div>
        </Form>
      </Modal>
    </Spin>
  );
};

export default MyProfile;
