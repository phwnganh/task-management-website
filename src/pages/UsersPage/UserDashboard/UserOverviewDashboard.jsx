import { Button, Card, Col, notification, Row, Statistic } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { TbChartBar, TbCheckbox, TbProgressCheck } from "react-icons/tb";
import { useAuth } from "../../../context/useAuth";
import { useEffect, useState } from "react";
import { apiGetUserProjectStatistics } from "../../../services/UserService/DashboardService";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ARCHIVE_DASHBOARD } from "../../../constants/routes.constants";

const COLORS = ["#36A2EB", "#FF6384"];

const UserOverviewDashboard = () => {
  const { t } = useTranslation("userdashboard");
  const { user } = useAuth();
  const navigate = useNavigate()
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
      name: t("in_progress"),
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
      name: t("completed"),
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
          <p>{`${payload[0].name}: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
            {t("my_project")}
          </h1>
          <div className="mt-2 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2 md:gap-3">
            <Button type="primary" size="large" className="w-full md:w-auto" onClick={() => navigate(ARCHIVE_DASHBOARD)}>
              View Detail
            </Button>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <Card variant="outlined">
            <Statistic
              title={t("total_projects")}
              value={statistics.totalProjects}
              prefix={<TbChartBar />}
            />
          </Card>
          <Card variant="outlined">
            <Statistic
              title={t("in_progress_projects")}
              value={statistics.inProgressProjects}
              prefix={<TbProgressCheck />}
            />
          </Card>
          <Card variant="outlined">
            <Statistic
              title={t("completed_projects")}
              value={statistics.completedProjects}
              prefix={<TbCheckbox />}
            />
          </Card>
        </div>
        <Row className="w-full mt-4">
          <Col xs={24}>
            <div className="flex flex-col items-center w-full">
              <p className="text-md sm:text-center lg:text-start text-center break-words w-full">
                {t("created_projects", { count: statistics.ownedProjects })}
              </p>
              <p className="text-md sm:text-center lg:text-start text-center break-words w-full">
                {t("joined_projects", { count: statistics.memberProjects })}
              </p>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="w-full mt-4">
          <Col xs={24}>
            <Card variant="outlined" title={t("pie_title")}> 
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
                      label={({ name, percentage }) =>
                        `${name}: ${percentage}%`
                      }
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
                  <p className="text-gray-500">{t("no_projects")}</p>
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
