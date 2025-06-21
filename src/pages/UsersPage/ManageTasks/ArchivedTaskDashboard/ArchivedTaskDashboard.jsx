import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Card, Col, notification, Row, Empty } from "antd";
import { useAuth } from "../../../../context/useAuth";
import { apiGetTaskByProjectStatistics } from "../../../../services/UserService/DashboardService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ArchivedTaskDashboard = ({ projectId }) => {
  const { t } = useTranslation("dashboard");
  const [statistics, setStatistics] = useState([
    { name: t("lessThan7Days"), value: 0 },
    { name: t("from7To30Days"), value: 0 },
    { name: t("moreThan30Days"), value: 0 },
  ]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiGetTaskByProjectStatistics(projectId);
        setStatistics([
          { name: t("lessThan7Days"), value: data.archivedLessThan7Days },
          { name: t("from7To30Days"), value: data.archived7To30Days },
          { name: t("moreThan30Days"), value: data.archivedMoreThan30Days },
        ]);
      } catch (error) {
        notification.error({
          message: t("error"),
          description: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, [projectId, t]);

  // Check if there is no meaningful data
  const hasData = statistics.some((item) => item.value > 0);

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
            {t("archivedTaskDashboardTitle")}
          </h1>
        </div>
        <Row gutter={24} className="w-full">
          <Col span={24}>
            <Card variant="outlined" title={t("chartTitle")}>
              {hasData ? (
                <ResponsiveContainer width="100%" height={600}>
                  <BarChart
                    data={statistics}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      label={{
                        value: t("archivedTimeLabel"),
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: t("taskCountLabel"),
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#36A2EB"
                      name={t("archivedTaskCountLabel")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty
                  description={t("noArchivedTasks")}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </PostLoginLayout>
  );
};

export default ArchivedTaskDashboard;
