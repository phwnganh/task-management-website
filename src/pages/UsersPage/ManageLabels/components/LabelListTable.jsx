import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Empty,
  Input,
  Spin,
  Table,
  Badge,
  message,
  Switch,
  Modal,
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { TbEye, TbPencil } from "react-icons/tb";
import { useAuth } from "../../../../context/useAuth";
import {
  apiGetLabelList,
  apiUpdateLabel,
} from "../../../../services/UserService/ManageLabelsService";
import dayjs from "dayjs";
import UpdateLabelModalDialog from "../UpdateLable/UpdateLableModalDialog";

const ConfirmModal = ({ visible, onConfirm, onCancel }) => (
  <Modal
    open={visible}
    title="Confirm Change"
    onCancel={onCancel}
    onOk={onConfirm}
    okText="Yes"
    cancelText="No"
  >
    <p>Are you sure you want to change the label status?</p>
  </Modal>
);

const LabelListTable = () => {
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const searchTitleInput = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLabels = async () => {
      if (!user?.id) {
        message.error("Please log in to view labels");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiGetLabelList(user.id);
        if (!Array.isArray(data)) {
          message.error("Invalid data format from API");
          setLabels([]);
          setFilteredLabels([]);
        } else if (data.length === 0) {
          message.info("No labels found for this user");
          setLabels([]);
          setFilteredLabels([]);
        } else {
          setLabels(data);
          setFilteredLabels(data);
        }
      } catch (error) {
        message.error(`Error fetching labels: ${error.message}`);
        setLabels([]);
        setFilteredLabels([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabels();
  }, [user?.id]);

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
          placeholder={`Search ${dataIndex}`}
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
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
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
      message.success("Label updated!");
    } catch (error) {
      message.error("Update label failed!");
    }
  };

  // Handle toggle switch with confirmation
  const handleTogglePublic = (record, checked) => {
    setSelectedLabel(record);
    setShowConfirmModal(true); // Show confirmation modal
  };

  // Handle confirm modal change is_public
  const handleConfirmToggle = (checked) => {
    const updatedLabel = { ...selectedLabel, is_public: checked };
    setShowConfirmModal(false);
    setLabels((prev) =>
      prev.map((label) =>
        label.id === updatedLabel.id ? { ...label, is_public: checked } : label
      )
    );
    setFilteredLabels((prev) =>
      prev.map((label) =>
        label.id === updatedLabel.id ? { ...label, is_public: checked } : label
      )
    );
    // Update on server as well
    apiUpdateLabel(updatedLabel)
      .then(() => message.success("Label status updated!"))
      .catch(() => message.error("Failed to update label status!"));
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => <Badge color={color} text={color} />,
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => dayjs(created_at).format("YYYY-MM-DD"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Action",
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
        pagination={{ pageSize: 10 }}
      />
      {/* Modal Update Label */}
      <Modal
        open={showEditModal}
        title={<h2 className="text-3xl font-bold">Edit Label</h2>}
        width={550}
        footer={null}
        onCancel={() => {
          setShowEditModal(false);
          setEditingLabel(null);
        }}
        destroyOnHidden
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
        onConfirm={() => handleConfirmToggle(!selectedLabel.is_public)}
      />
    </>
  );
};

export default LabelListTable;
