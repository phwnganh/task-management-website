import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Table, Badge, message, Switch, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { TbPencil, TbTrash } from "react-icons/tb";
import { useAuth } from "../../../../context/useAuth";
import {
  apiGetLabelList,
  apiUpdateLabel,
  apiRemoveLabel, // Đã có hàm này
} from "../../../../services/UserService/ManageLabelsService";
import dayjs from "dayjs";
import UpdateLabelModalDialog from "../UpdateLable/UpdateLableModalDialog";
import { useTranslation } from "react-i18next";

// Modal xác nhận toggle public
const ConfirmModal = ({ visible, onConfirm, onCancel, t }) => (
  <Modal
    open={visible}
    title={t("confirm_change")}
    onCancel={onCancel}
    onOk={onConfirm}
    okText={t("yes")}
    cancelText={t("no")}
  >
    <p>{t("confirm_change_text")}</p>
  </Modal>
);

// Modal xác nhận xóa label
const RemoveLabelConfirmModal = ({ visible, onOk, onCancel, labelTitle, loading }) => (
  <Modal
    open={visible}
    title="Remove Label"
    onCancel={onCancel}
    onOk={onOk}
    okText="Yes"
    cancelText="No"
    closable
    confirmLoading={loading}
  >
    <p>
      Are you sure you want to remove this label
      {labelTitle ? ` "${labelTitle}" ` : ""}?
    </p>
  </Modal>
);

const LabelListTable = () => {
  const { t } = useTranslation("labellist");
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false); // State cho modal remove
  const [removingLabel, setRemovingLabel] = useState(null); // Label đang muốn xóa
  const [removing, setRemoving] = useState(false); // Loading khi xóa
  const searchTitleInput = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLabels = async () => {
      if (!user?.id) {
        message.error(t("please_login"));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiGetLabelList(user.id);
        if (!Array.isArray(data)) {
          message.error(t("invalid_api_data"));
          setLabels([]);
          setFilteredLabels([]);
        } else {
          setLabels(data);
          setFilteredLabels(data);
        }
      } catch (error) {
        message.error(`${t("fetch_error")}: ${error.message}`);
        setLabels([]);
        setFilteredLabels([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabels();
  }, [user?.id, t]);

  // Search functionality
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    const filtered = labels.filter((label) =>
      label[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(selectedKeys[0]?.toLowerCase() || "")
    );
    setFilteredLabels(filtered);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setFilteredLabels(labels);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchTitleInput}
          placeholder={t("search")}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {t("search")}
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          {t("reset")}
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
  });

  // Handle actions
  const handleEdit = (record) => {
    setEditingLabel(record);
    setShowEditModal(true);
  };

  // Xử lý submit cập nhật label
  const handleUpdateLabel = async (updatedLabel) => {
    try {
      const res = await apiUpdateLabel(updatedLabel);
      setLabels((prev) =>
        prev.map((label) => (label.id === updatedLabel.id ? res : label))
      );
      setFilteredLabels((prev) =>
        prev.map((label) => (label.id === updatedLabel.id ? res : label))
      );
      setShowEditModal(false);
      setEditingLabel(null);
      message.success(t("updated"));
    } catch (error) {
      message.error(t("update_failed"));
    }
  };

  // Handle toggle switch with confirmation
  const handleTogglePublic = (record, checked) => {
    setSelectedLabel({ ...record, is_public: checked });
    setShowConfirmModal(true);
  };

  // Handle confirm modal change is_public
  const handleConfirmToggle = () => {
    const updatedLabel = { ...selectedLabel };
    setShowConfirmModal(false);
    setLabels((prev) =>
      prev.map((label) => (label.id === updatedLabel.id ? updatedLabel : label))
    );
    setFilteredLabels((prev) =>
      prev.map((label) => (label.id === updatedLabel.id ? updatedLabel : label))
    );
    apiUpdateLabel(updatedLabel)
      .then(() => message.success(t("status_updated")))
      .catch(() => message.error(t("status_update_failed")));
  };

  // Xử lý khi bấm nút Remove
  const handleRemoveClick = (record) => {
    setRemovingLabel(record);
    setShowRemoveModal(true);
  };

  // Xác nhận xóa label
  const handleRemoveConfirm = async () => {
    setRemoving(true);
    try {
      await apiRemoveLabel(removingLabel.id);
      setLabels((prev) => prev.filter((label) => label.id !== removingLabel.id));
      setFilteredLabels((prev) =>
        prev.filter((label) => label.id !== removingLabel.id)
      );
      message.success("Label removed successfully!");
    } catch (error) {
      message.error("Failed to remove label!");
    } finally {
      setShowRemoveModal(false);
      setRemovingLabel(null);
      setRemoving(false);
    }
  };

  const columns = [
    {
      title: t("title"),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
    },
    {
      title: t("color"),
      dataIndex: "color",
      key: "color",
      render: (color) => <Badge color={color} text={color} />,
    },
    {
      title: t("created_date"),
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => dayjs(created_at).format("YYYY-MM-DD"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <div className="flex flex-row items-center">
          <Button
            onClick={() => handleEdit(record)}
            style={{ marginLeft: 16 }}
            icon={<TbPencil />}
          />
          <Switch
            checked={record.is_public}
            onChange={(checked) => handleTogglePublic(record, checked)}
            style={{ marginLeft: 16 }}
          />
          <Button
            danger
            icon={<TbTrash />}
            style={{ marginLeft: 16 }}
            onClick={() => handleRemoveClick(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={filteredLabels}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      {/* Modal Update Label */}
      <Modal
        open={showEditModal}
        title={<h2 className="text-3xl font-bold">{t("edit")}</h2>}
        width={550}
        footer={null}
        onCancel={() => {
          setShowEditModal(false);
          setEditingLabel(null);
        }}
        destroyOnClose
      >
        <UpdateLabelModalDialog
          label={editingLabel}
          onSubmit={handleUpdateLabel}
          onCancel={() => {
            setShowEditModal(false);
            setEditingLabel(null);
          }}
        />
      </Modal>

      {/* Modal Confirm Change is_public */}
      <ConfirmModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmToggle}
        t={t}
      />

      {/* Modal Remove Label */}
      <RemoveLabelConfirmModal
        visible={showRemoveModal}
        onOk={handleRemoveConfirm}
        onCancel={() => {
          setShowRemoveModal(false);
          setRemovingLabel(null);
        }}
        labelTitle={removingLabel?.title}
        loading={removing}
      />
    </>
  );
};

export default LabelListTable;
