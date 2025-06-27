import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  Input,
  Button,
  Switch,
  Modal,
  Space,
  Checkbox,
  notification,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { TbEye } from "react-icons/tb";
import moment from "moment";
import {
  apiGetAllUserWithoutAdminList,
  apiUpdateUserStatus,
} from "../../../../services/AdminService/ManageUsersService";
import ViewUserDetailModalDialog from "../UserDetail/ViewUserDetailModalDialog";
import { apiGetUserDetail } from "../../../../services/AdminService/ManageUsersService";
import { DASHBOARD } from "../../../../constants/routes.constants";
import { useNavigate } from "react-router-dom";

const UserListTable = () => {
  const { t } = useTranslation("dashboard");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [statusFilters, setStatusFilters] = useState({
    Active: false,
    Inactive: false,
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const navigate = useNavigate();

  const handleViewUser = async (userId) => {
    setLoadingUserDetail(true);
    try {
      const userDetail = await apiGetUserDetail(userId);
      const translatedUser = {
        ...userDetail,
        translatedStatus:
          userDetail.status === "Active"
            ? t("statusActive")
            : t("statusInactive"),
      };
      setSelectedUser(translatedUser);
      setShowUserModal(true);
    } catch (error) {
      Modal.error({
        title: t("modalErrorTitle"),
        content: t("fetchUserDetailError"),
      });
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const [sorter, setSorter] = useState({ field: null, order: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await apiGetAllUserWithoutAdminList();
      const transformedUsers = users.map((user) => ({
        ...user,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        status: user.status,
      }));
      setData(transformedUsers);
      setFilteredData(transformedUsers);
      setPagination((prev) => ({ ...prev, total: transformedUsers.length }));
    } catch (error) {
      Modal.error({
        title: t("modalErrorTitle"),
        content: t("fetchUserListError"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (field, value) => {
    setSearchText((prev) => ({ ...prev, [field]: value }));
    filterData({ ...searchText, [field]: value }, statusFilters, sorter);
  };

  const handleStatusFilterChange = (checkedValues) => {
    const newFilters = {
      Active: checkedValues.includes("Active"),
      Inactive: checkedValues.includes("Inactive"),
    };
    setStatusFilters(newFilters);
    filterData(searchText, newFilters, sorter);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSorter({ field: sorter.field, order: sorter.order });
    setPagination(pagination);
    filterData(searchText, statusFilters, {
      field: sorter.field,
      order: sorter.order,
    });
  };

  const filterData = (search, statusFilters, sort) => {
    let result = [...data];

    if (search.name) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.name.toLowerCase())
      );
    }
    if (search.email) {
      result = result.filter((item) =>
        item.email.toLowerCase().includes(search.email.toLowerCase())
      );
    }
    if (search.address) {
      result = result.filter(
        (item) =>
          item.address &&
          item.address.toLowerCase().includes(search.address.toLowerCase())
      );
    }

    if (statusFilters.Active || statusFilters.Inactive) {
      result = result.filter((item) => {
        const status = item.status || "";
        return (
          (statusFilters.Active && status === "Active") ||
          (statusFilters.Inactive && status === "Inactive")
        );
      });
    }

    if (sort.field && sort.order) {
      result.sort((a, b) => {
        let fieldA = a[sort.field] || "";
        let fieldB = b[sort.field] || "";
        if (sort.field === "date_of_birth") {
          fieldA = moment(fieldA).unix();
          fieldB = moment(fieldB).unix();
          return sort.order === "ascend" ? fieldA - fieldB : fieldB - fieldA;
        }
        return sort.order === "ascend"
          ? fieldA.toString().localeCompare(fieldB.toString())
          : fieldB.toString().localeCompare(fieldA.toString());
      });
    }

    setFilteredData(result);
    setPagination((prev) => ({ ...prev, total: result.length }));
  };

  const handleStatusChange = (userId, checked) => {
    Modal.confirm({
      title: t("confirmStatusChange", {
        activate: checked ? t("statusActive").toLowerCase() : "",
        deactivate: !checked ? t("statusInactive").toLowerCase() : "",
      }),
      icon: <ExclamationCircleOutlined />,
      okText: t("confirmButton"),
      cancelText: t("cancelButton"),
      okType: "primary",
      onOk: async () => {
        try {
          const newStatus = checked ? "Active" : "Inactive";
          await apiUpdateUserStatus(userId, { status: newStatus });
          setData((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: newStatus } : user
            )
          );
          filterData(searchText, statusFilters, sorter);
          await fetchUsers()
          notification.success({
            message: t("updateSuccess"),
            placement: "bottomRight",
          });
        } catch (error) {
          notification.error({
            message: t("updateFailed"),
            placement: "bottomRight",
          });
        }
      },
    });
  };

  const columns = [
    {
      title: t("columnName"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={t("searchNamePlaceholder")}
            value={searchText.name}
            onChange={(e) => handleSearch("name", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: t("columnEmail"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={t("searchEmailPlaceholder")}
            value={searchText.email}
            onChange={(e) => handleSearch("email", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: t("columnDateOfBirth"),
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      sorter: true,
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },
    {
      title: t("columnAddress"),
      dataIndex: "address",
      key: "address",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={t("searchAddressPlaceholder")}
            value={searchText.address}
            onChange={(e) => handleSearch("address", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: t("columnStatus"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            value={Object.keys(statusFilters).filter(
              (key) => statusFilters[key]
            )}
            onChange={handleStatusFilterChange}
            style={{ display: "block", marginBottom: 8 }}
          >
            <Checkbox value="Active">{t("statusActive")}</Checkbox>
            <Checkbox value="Inactive">{t("statusInactive")}</Checkbox>
          </Checkbox.Group>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setStatusFilters({ Active: false, Inactive: false });
                handleStatusFilterChange([]);
              }}
              style={{ marginRight: 8 }}
            >
              {t("filterReset")}
            </Button>
            <Button type="primary">{t("filterOK")}</Button>
          </div>
        </div>
      ),
      filterIcon: <SearchOutlined />,
      render: (status) => (
        <span style={{ color: status === "Active" ? "green" : "red" }}>
          {status === "Active" ? t("statusActive") : t("statusInactive")}
        </span>
      ),
    },
    {
      title: t("columnAction"),
      key: "action",
      render: (_, record) => (
        <Space className="flex flex-row gap-4">
          <Switch
            checked={record.status === "Active"}
            onChange={(checked) => handleStatusChange(record.id, checked)}
          />
          <Button
            icon={<TbEye />}
            onClick={() => handleViewUser(record.id)}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <Spin
      spinning={loading}
      indicator={<LoadingOutlined spin />}
      tip={t("loadingTip")}
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      <div className="flex flex-row justify-end">
        <Button className="mt-4" onClick={() => navigate(DASHBOARD)}>
          {t("backButton")}
        </Button>
      </div>
      <ViewUserDetailModalDialog
        visible={showUserModal}
        user={selectedUser}
        loading={loadingUserDetail}
        onClose={() => setShowUserModal(false)}
      />
    </Spin>
  );
};

export default UserListTable;
