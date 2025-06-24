// import {
//   Avatar,
//   Badge,
//   Button,
//   Card,
//   message,
//   notification,
//   Popconfirm,
//   Spin,
// } from "antd";
// import { apiGetUserProfile } from "../../../../services/GeneralService/GeneralSerice";
// import { useEffect, useState } from "react";
// import { useAuth } from "../../../../context/useAuth";
// import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
// import { useTranslation } from "react-i18next";
// import { apiTemporarilyDeletedAccount } from "../../../../services/AdminService/ManageUsersService";

// const MyProfile = () => {
//   const { t } = useTranslation("userinfor");
//   const { user, logout } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);

//   const getUserProfile = async () => {
//     setIsLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       const res = await apiGetUserProfile(user.id);
//       console.log("profile res: ", res);
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: "Failed to get user profile",
//         placement: "bottomRight",
//       });
//     } finally {
//       setIsLoading(false); // Kết thúc loading
//     }
//   };

//   useEffect(() => {
//     if (user.id) {
//       getUserProfile();
//     }
//   }, [user.id]);

//   const handleTemporarilyDeleteAccount = async () => {
//     try {
//       await apiTemporarilyDeletedAccount(user.id, true)
//       notification.success({
//         message: "Delete My Account Successfully!",
//         placement: "bottomRight"
//       })
//     } catch (error) {
//       notification.error({
//         message: error.message,
//         placement: "bottomRight"
//       })
//     }finally{
//       logout()
//     }
//   }
//   return (
//     <Spin
//       spinning={isLoading}
//       indicator={<LoadingOutlined spin />}
//       tip={t("loading")}
//     >
//       <div className="flex justify-center p-4 sm:p-6 md:p-8 min-h-screen">
//         <Card className="w-full max-w-xs sm:max-w-xl md:max-w-2xl">
//           <div className="flex flex-col items-center">
//             <h3 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6">
//               {t("myProfileTitle")}
//             </h3>
//             <div className="w-full space-y-4 sm:space-y-6">
//               <div className="flex justify-center">
//                 <Avatar
//                   size={120}
//                   className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48"
//                   src={user.avatar_url}
//                   icon={!user.avatar_url && <UserOutlined />}
//                 />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-gray-500 font-medium">{t("nameLabel")}</p>
//                   <p className="text-lg">
//                     {user.first_name} {user.last_name}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium">{t("emailLabel")}</p>
//                   <p className="text-lg">{user.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium">
//                     {t("dateOfBirthLabel")}
//                   </p>
//                   <p className="text-lg">
//                     {user.date_of_birth ? user.date_of_birth : t("none")}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium">
//                     {t("addressLabel")}
//                   </p>
//                   <p className="text-lg">
//                     {user.address ? user.address : t("none")}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium">{t("roleLabel")}</p>
//                   <p className="text-lg">{user.role}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium">
//                     {t("statusLabel")}
//                   </p>
//                   <Badge
//                     status={user.status === "Active" ? "success" : "error"}
//                     text={user.status}
//                     className="text-lg"
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <Popconfirm
//                   title="Delete Account"
//                   description="Are you sure you want to delete your account? This action will mark your account for permanent deletion after 30 days. During this period, you can still recover your account by logging back in. After 30 days, all your data will be permanently removed and cannot be restored."
//                   okText="Yes"
//                   cancelText="No"
//                   placement="top"
//                   onConfirm={handleTemporarilyDeleteAccount}
//                   overlayStyle={{width: '300px'}}
//                 >
//                   <Button type="default" danger>
//                     Delete Account
//                   </Button>
//                 </Popconfirm>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </Spin>
//   );
// };

// export default MyProfile;

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
import { apiGetUserDetail, apiTemporarilyDeletedAccount } from "../../../../services/AdminService/ManageUsersService";
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

  // Lấy thông tin người dùng
  const getUserProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await apiGetUserProfile(user.id);
      const detail = await apiGetUserDetail(user.id); // Lấy chi tiết người dùng
      setUserDetail(detail);
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
    if (!password) {
      notification.error({
        message: "Error",
        description: "Please enter your password",
        placement: "bottomRight",
      });
      return;
    }

    try {
      // Kiểm tra mật khẩu
      if (password !== userDetail?.password) {
        throw new Error("Invalid password");
      }

      // Gọi API xóa tài khoản
      await apiTemporarilyDeletedAccount(user.id, true);
      notification.success({
        message: "Delete My Account Successfully!",
        placement: "bottomRight",
      });
      logout();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to delete account",
        placement: "bottomRight",
      });
    } finally {
      setIsModalOpen(false);
      setPassword("");
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPassword("");
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
              <div className="flex justify-end mt-6">
                <Popconfirm
                  title="Delete Account"
                  description="Are you sure you want to delete your account? This action will mark your account for permanent deletion after 30 days. During this period, you can still recover your account by logging back in. After 30 days, all your data will be permanently removed and cannot be restored."
                  okText="Yes"
                  cancelText="No"
                  placement="top"
                  onConfirm={showModal}
                  overlayStyle={{ width: "300px" }}
                >
                  <Button type="default" danger>
                    Delete Account
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title="Please enter your password to confirm account deletion"
        open={isModalOpen}
        onOk={handleTemporarilyDeleteAccount}
        onCancel={handleCancel}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </Modal>
    </Spin>
  );
};

export default MyProfile;