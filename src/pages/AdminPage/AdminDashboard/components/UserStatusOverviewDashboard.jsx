import React, { useEffect, useState } from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiGetAllUsers } from "../../../../services/UserService/DashboardService";

// Màu cho pie chart
const COLORS = ["#52c41a", "#f5222d"];

const UserStatusOverviewDashboard = () => {
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await apiGetAllUsers();
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.status === "Active").length;
        const inactiveUsers = users.filter(
          (u) => u.status === "Inactive"
        ).length;
        setTotal(totalUsers);
        setActive(activeUsers);
        setInactive(inactiveUsers);

        setPieData([
          { name: "Active", value: activeUsers },
          { name: "Inactive", value: inactiveUsers },
        ]);
      } catch (err) {
        setTotal(0);
        setActive(0);
        setInactive(0);
        setPieData([]);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full">
      <Row gutter={24} className="mt-4">
        <Col xs={24} sm={8}>
          <Card variant="outlined">
            <Statistic title="Total Users" value={total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="outlined">
            <Statistic
              title="Active Users"
              value={active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="outlined">
            <Statistic
              title="Inactive Users"
              value={inactive}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} className="mt-8">
        <Col span={24}>
          <Card
            variant="outlined"
            title={
              <div className="font-bold text-center">
                The pie chart shows the user status distribution
              </div>
            }
            style={{
              background: "#fff",
              border: "2px solid #40A9FF",
            }}
          >
            {total > 0 ? (
              <div style={{ width: 400, height: 320, margin: "0 auto" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} users`, name]}
                      contentStyle={{ borderRadius: 8, fontWeight: 500 }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No users available to display.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStatusOverviewDashboard;
