import { Avatar, Badge, Card, message } from "antd";
import { apiGetUserProfile } from "../../../../services/GeneralService/GeneralSerice";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/useAuth";

const MyProfile = () => {
  const { user } = useAuth();
  const getUserProfile = async () => {
    try {
      const res = await apiGetUserProfile(user.id);
      console.log("profile res: ", res);
    } catch (error) {
      message.error("Failed to get user profile");
    }
  };

  useEffect(() => {
    if (user.id) {
      getUserProfile();
    }
  }, [user.id]);
  return (
    <div className="flex justify-center p-4 sm:p-6 md:p-8 min-h-screen">
      <Card className="w-full max-w-2xl">
        <div className="flex flex-col items-center">
          <h3 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-6">
            My Personal Information
          </h3>
          <div className="w-full space-y-6">
            <div className="flex justify-center">
              <Avatar size={200} src={user.avatar_url} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 font-medium">Name</p>
                <p className="text-lg">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Date of Birth</p>
                <p className="text-lg">{user.date_of_birth}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Address</p>
                <p className="text-lg">{user.address}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Role</p>
                <p className="text-lg">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Status</p>
                <Badge
                  status={user.status === "Active" ? "success" : "error"}
                  text={user.status}
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyProfile;
