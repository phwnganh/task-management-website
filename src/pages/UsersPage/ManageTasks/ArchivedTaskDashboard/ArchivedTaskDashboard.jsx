import React, { useEffect, useState } from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Card, Col, notification, Row, Empty } from "antd"; // Import Empty
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
  const [statistics, setStatistics] = useState([
    { name: "Less than 7 days", value: 0 },
    { name: "From 7 to 30 days", value: 0 },
    { name: "More than 30 days", value: 0 },
  ]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiGetTaskByProjectStatistics(projectId);
        setStatistics([
          { name: "Less than 7 days", value: data.archivedLessThan7Days },
          { name: "From 7 to 30 days", value: data.archived7To30Days },
          { name: "More than 30 days", value: data.archivedMoreThan30Days },
        ]);
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, [projectId]);

  // Check if there is no meaningful data
  const hasData = statistics.some((item) => item.value > 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
          Archived Task Dashboard
        </h1>
      </div>
      <Row gutter={24} className="w-full">
        <Col span={24}>
          <Card
            variant="outlined"
            title="The chart shows the number of archived tasks by time"
          >
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
                      value: "Archived Time",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "The number of tasks",
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
                    name="The number of archived tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="No archived tasks available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ArchivedTaskDashboard;
