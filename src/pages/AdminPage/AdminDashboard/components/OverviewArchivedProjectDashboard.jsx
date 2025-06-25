import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard");
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
        // Ánh xạ lại pieChartData với các chuỗi đã dịch
        const translatedPieChartData = data.pieChartData.map((item) => ({
          ...item,
          name:
            item.name === "Active Projects"
              ? t("activeProjectsTitle")
              : t("archivedProjectsTitle"),
        }));
        setStatistics({ ...data, pieChartData: translatedPieChartData });
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, [t]);

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
            {t("overviewDashboardTitle")}
          </h1>
          <div className="mt-2 md:mt-0">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(MANAGE_OWNER_ARCHIVED_PROJECT_LIST)}
            >
              {t("viewArchivedProjects")}
            </Button>
          </div>
        </div>
        <Row gutter={24} className="w-full">
          <Col span={12}>
            <Card variant="outlined">
              <Statistic
                title={t("activeProjectsTitle")}
                value={statistics.activeProjects}
                prefix={<TbLayoutBoard />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card variant="outlined">
              <Statistic
                title={t("archivedProjectsTitle")}
                value={statistics.archivedProjects}
                prefix={<TbArchive />}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={24} className="w-full mt-4">
          <Col span={24}>
            <Card variant="outlined" title={t("chartTitle")}>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5 mr-6 justify-end">
          <Button onClick={() => navigate(DASHBOARD)}>{t("backButton")}</Button>
        </Row>
      </div>
    </PostLoginLayout>
  );
};

export default OverviewArchivedProjectDashboard;
