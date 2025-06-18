import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Switch, Modal, Space, Checkbox } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { TbEye } from 'react-icons/tb';
import moment from 'moment';
import {
  apiGetAllUserWithoutAdminList,
  apiUpdateUserStatus,
} from '../../../../services/AdminService/ManageUsersService';

const UserListTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [statusFilters, setStatusFilters] = useState({
    Active: false,
    Inactive: false,
  });
  const [sorter, setSorter] = useState({ field: null, order: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await apiGetAllUserWithoutAdminList();
      const transformedUsers = users.map(user => ({
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      }));
      setData(transformedUsers);
      setFilteredData(transformedUsers);
      setPagination((prev) => ({ ...prev, total: transformedUsers.length }));
    } catch (error) {
      Modal.error({
        title: 'Error',
        content: 'Failed to fetch user list!',
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
      Active: checkedValues.includes('Active'),
      Inactive: checkedValues.includes('Inactive'),
    };
    setStatusFilters(newFilters);
    filterData(searchText, newFilters, sorter);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSorter({ field: sorter.field, order: sorter.order });
    setPagination(pagination);
    filterData(searchText, statusFilters, { field: sorter.field, order: sorter.order });
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
      result = result.filter((item) =>
        item.address && item.address.toLowerCase().includes(search.address.toLowerCase())
      );
    }

    if (statusFilters.Active || statusFilters.Inactive) {
      result = result.filter((item) => {
        const status = item.status || '';
        return (
          (!statusFilters.Active || status === 'Active') &&
          (!statusFilters.Inactive || status === 'Inactive')
        );
      });
    }

    if (sort.field && sort.order) {
      result.sort((a, b) => {
        let fieldA = a[sort.field] || '';
        let fieldB = b[sort.field] || '';
        if (sort.field === 'name') {
          fieldA = a.name;
          fieldB = b.name;
        } else if (sort.field === 'date_of_birth') {
          fieldA = moment(fieldA).unix();
          fieldB = moment(fieldB).unix();
          return sort.order === 'ascend' ? fieldA - fieldB : fieldB - fieldA;
        }
        return sort.order === 'ascend'
          ? fieldA.toString().localeCompare(fieldB.toString())
          : fieldB.toString().localeCompare(fieldA.toString());
      });
    }

    setFilteredData(result);
    setPagination((prev) => ({ ...prev, total: result.length }));
  };

  const handleStatusChange = (userId, checked) => {
    Modal.confirm({
      title: `Are you sure you want to ${checked ? 'activate' : 'deactivate'} this user?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Confirm',
      cancelText: 'Cancel',
      okType: 'primary',
      onOk: async () => {
        try {
          const newStatus = checked ? 'Active' : 'Inactive';
          await apiUpdateUserStatus(userId, { status: newStatus });
          setData((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: newStatus } : user
            )
          );
          filterData(searchText, statusFilters, sorter);
          Modal.success({
            content: `User status updated to ${newStatus}`,
          });
        } catch (error) {
          Modal.error({
            title: 'Error',
            content: 'Failed to update user status',
          });
        }
      },
      onCancel: () => {
      },
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 70,
      render: (_, __, index) => (
        (pagination.current - 1) * pagination.pageSize + index + 1
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={searchText.name}
            onChange={(e) => handleSearch('name', e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search email"
            value={searchText.email}
            onChange={(e) => handleSearch('email', e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: 'Date of Birth',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      sorter: true,
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search address"
            value={searchText.address}
            onChange={(e) => handleSearch('address', e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            value={Object.keys(statusFilters).filter(key => statusFilters[key])}
            onChange={handleStatusFilterChange}
            style={{ display: 'block', marginBottom: 8 }}
          >
            <Checkbox value="Active">Active</Checkbox>
            <Checkbox value="Inactive">Inactive</Checkbox>
          </Checkbox.Group>
          <div style={{ textAlign: 'right' }}>
            <Button
              onClick={() => {
                setStatusFilters({ Active: false, Inactive: false });
                clearFilters();
                handleStatusFilterChange([]);
              }}
              style={{ marginRight: 8 }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() => confirm()}
            >
              OK
            </Button>
          </div>
        </div>
      ),
      filterIcon: <SearchOutlined />,
      onFilter: (value, record) => {
        const status = record.status || '';
        return (
          (!statusFilters.Active || status === 'Active') &&
          (!statusFilters.Inactive || status === 'Inactive')
        );
      },
      render: (status) => (
        <span style={{ color: status === 'Active' ? 'green' : 'red' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
         
          <Switch
            checked={record.status === 'Active'}
            onChange={(checked) => handleStatusChange(record.id, checked)}
          />
           <TbEye
            style={{ cursor: 'pointer', fontSize: '18px', color: '#1890ff' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default UserListTable;