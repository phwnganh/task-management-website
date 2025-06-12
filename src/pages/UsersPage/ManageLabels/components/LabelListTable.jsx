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
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { TbEye, TbPencil } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/useAuth";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { apiGetLabelList } from "../../../../services/UserService/ManageLabelsService";
import dayjs from "dayjs";

const LabelListTable = () => {
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTitleInput = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLabels = async () => {
      if (!user?.id) {
        console.warn("No user logged in or user.id is undefined");
        message.error("Please log in to view labels");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching labels for owner_id:", user.id);
        const data = await apiGetLabelList(user.id);
        console.log("API response:", data);
        if (!Array.isArray(data)) {
          console.warn("API did not return an array:", data);
          message.error("Invalid data format from API");
          setLabels([]);
          setFilteredLabels([]);
        } else if (data.length === 0) {
          console.warn("No labels found for owner_id:", user.id);
          message.info("No labels found for this user");
          setLabels([]);
          setFilteredLabels([]);
        } else {
          const isValid = data.every(
            (label) =>
              label.id &&
              label.title &&
              label.color &&
              label.created_at &&
              typeof label.is_public === "boolean"
          );
          console.log("Data is valid:", isValid);
          if (!isValid) {
            console.warn("Invalid label data structure:", data);
            message.error("Some labels are missing required fields");
            setLabels([]);
            setFilteredLabels([]);
          } else {
            setLabels(data);
            setFilteredLabels(data);
          }
        }
      } catch (error) {
        console.error("Error details:", error.message, error);
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
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
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
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchTitleInput.current?.select(), 100);
        }
      },
    },
  });

  // Handle actions
  const handleEdit = (record) => {
    console.log("Edit label:", record);
    // TODO: Implement edit modal
  };

  const handleView = (record) => {
    console.log("View label:", record);
    // TODO: Implement view modal
  };

  const handleTogglePublic = (record, checked) => {
    console.log(`Toggling is_public for ${record.title} to ${checked}`);
    // TODO: Call API to update is_public (e.g., apiUpdateLabel)
    setLabels(
      labels.map((label) =>
        label.id === record.id ? { ...label, is_public: checked } : label
      )
    );
    setFilteredLabels(
      filteredLabels.map((label) =>
        label.id === record.id ? { ...label, is_public: checked } : label
      )
    );
  };

  // Table columns configuration
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
      render: (created_at) => {
        return dayjs(created_at).format("YYYY-MM-DD");
      },
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
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip="Loading..."
    >
      <div className="mt-5">
        {labels.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredLabels}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </Spin>
  );
};

export default LabelListTable;
