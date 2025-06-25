import React, { useEffect, useState } from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Card, Col, notification, Row, Statistic } from "antd";
import { TbArchive, TbLayoutBoard } from "react-icons/tb";
import { apiGetArchivedProjectStatistics } from "../../../../services/UserService/DashboardService";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  DASHBOARD,
  MANAGE_OWNER_ARCHIVED_PROJECT_LIST,
} from "../../../../constants/routes.constants";

const COLORS = ["#0088FE", "#FFBB28"];
const OverviewArchivedProjectDashboard = () => {
  const [statistics, setStatistics] = useState({
    activeProjects: 0,
    archivedProjects: 0,
    pieChartData: [],
  });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiGetArchivedProjectStatistics();
        setStatistics(data);
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, []);

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
            {"Overview Project Status Dashboard"}
          </h1>
          <div className="mt-2 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2 md:gap-3">
            <Button
              type="primary"
              size="large"
              className="w-full md:w-auto"
              onClick={() => navigate(MANAGE_OWNER_ARCHIVED_PROJECT_LIST)}
            >
              View Archived Projects
            </Button>
          </div>
        </div>
        <Row gutter={[16, 16]} className="w-full">
          <Col xs={24} sm={12}>
            <Card variant="outlined">
              <Statistic
                title="Active Projects"
                value={statistics.activeProjects}
                prefix={<TbLayoutBoard />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card variant="outlined">
              <Statistic
                title="Archived Projects"
                value={statistics.archivedProjects}
                prefix={<TbArchive />}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="w-full mt-4">
          <Col xs={24}>
            <Card
              variant="outlined"
              title="The chart shows the proportion of active and archived projects"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics.pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  {/* <Tooltip/> */}
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5 mr-0 md:mr-6 justify-end">
          <Button className="w-full md:w-auto" onClick={() => navigate(DASHBOARD)}>Back</Button>
        </Row>
      </div>
    </PostLoginLayout>
  );
};

export default OverviewArchivedProjectDashboard;
