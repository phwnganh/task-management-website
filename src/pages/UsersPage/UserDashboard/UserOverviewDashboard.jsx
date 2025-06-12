import { Card, Col, notification, Row, Statistic } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { TbChartBar, TbCheckbox, TbProgressCheck } from "react-icons/tb";
import { useAuth } from "../../../context/useAuth";
import { useEffect, useState } from "react";
import { apiGetUserProjectStatistics } from "../../../services/UserService/DashboardService";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#36A2EB", "#FF6384"];
const UserOverviewDashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({
    totalProjects: 0,
    ownedProjects: 0,
    memberProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await apiGetUserProjectStatistics(user.id);
        setStatistics(res);
      } catch (error) {
        notification.error({
          description: error,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, [user.id]);

  const pieData = [
    {
      name: "In Progress Projects",
      value: statistics.inProgressProjects,
      percentage:
        statistics.totalProjects > 0
          ? (
              (statistics.inProgressProjects / statistics.totalProjects) *
              100
            ).toFixed(2)
          : 0,
    },
    {
      name: "Completed Projects",
      value: statistics.completedProjects,
      percentage:
        statistics.totalProjects > 0
          ? (
              (statistics.completedProjects / statistics.totalProjects) *
              100
            ).toFixed(2)
          : 0,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          {" "}
          <p>{`${payload[0].name}: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };
  return (
  <PostLoginLayout>
    <div className="max-w-7xl mx-auto p-4 sm:p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl whitespace-nowrap">
            My Project
          </h1>
        </div>
      </div>
      <Row gutter={24} className="w-full">
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="Total Projects:"
              value={statistics.totalProjects}
              prefix={<TbChartBar />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="In Progress Projects:"
              value={statistics.inProgressProjects}
              prefix={<TbProgressCheck />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="Completed Projects:"
              value={statistics.completedProjects}
              prefix={<TbCheckbox />}
            />
          </Card>
        </Col>
      </Row>
      <div className="w-full mt-4">
          <p className="text-md text-start">Created {statistics.ownedProjects} Projects</p>
          <p className="text-md text-start">Joined {statistics.memberProjects} Projects</p>
        </div>
      <Row gutter={24} className="w-full mt-4">
        <Col span={24}>
          <Card variant="outlined" title="The pie chart shows the project status distribution">
            {statistics.totalProjects > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No projects available to display.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  </PostLoginLayout>
);
};

export default UserOverviewDashboard;
