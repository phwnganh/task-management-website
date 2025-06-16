import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TbChartBar, TbProgressCheck, TbCheckbox } from "react-icons/tb";
import { apiGetAllTasks } from "../../../../services/UserService/ManageTasksService";
import { apiGetProjectList } from "../../../../services/UserService/ManageProjectsService";

const COLORS = ["#36A2EB", "#FF9800", "#4CAF50"];

const ProjectOverviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
  });
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy toàn bộ project và task
        const projects = await apiGetProjectList();
        const tasks = await apiGetAllTasks();

        // Gom tasks theo project_id
        const tasksByProject = {};
        tasks.forEach((t) => {
          if (!tasksByProject[t.project_id]) {
            tasksByProject[t.project_id] = [];
          }
          tasksByProject[t.project_id].push(t);
        });

        // Tính trạng thái cho từng project
        let completed = 0,
          inProgress = 0;
        projects.forEach((project) => {
          const projectTasks = tasksByProject[project.id] || [];
          if (projectTasks.length === 0) {
            // Nếu project không có task, KHÔNG đếm vào completed/inprogress.
            return;
          }
          // Nếu tất cả task đều completed, thì project là completed
          if (projectTasks.every((t) => t.status === "Completed")) {
            completed++;
          } else if (
            projectTasks.some(
              (t) => t.status === "In Progress" || t.status === "To Do"
            )
          ) {
            inProgress++;
          } else {
            // Nếu không có task nào To Do/In Progress mà vẫn còn task thì project vẫn là inProgress
            inProgress++;
          }
        });

        setStatistics({
          total: projects.length,
          completed,
          inProgress,
        });

        setPieData([
          { name: "In Progress Projects", value: inProgress },
          { name: "Completed Projects", value: completed },
        ]);
      } catch (err) {
        setStatistics({ total: 0, completed: 0, inProgress: 0 });
        setPieData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tooltip cho Pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const { name, value } = payload[0].payload;
    return (
      <div
        style={{
          background: "#fff",
          padding: 10,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <b>{name}</b>: {value} project{value > 1 ? "s" : ""}
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="max-w-6xl mx-auto p-4">
        <h4 className="text-left text-3xl sm:text-4xl md:text-5xl whitespace-nowrap mb-3">
          Project Overview Dashboard
        </h4>

        <Row gutter={24} className="w-full">
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title="Total Projects:"
                value={statistics.total}
                prefix={<TbChartBar />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title="In Progress Projects:"
                value={statistics.inProgress}
                prefix={<TbProgressCheck />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title="Completed Projects:"
                value={statistics.completed}
                prefix={<TbCheckbox />}
              />
            </Card>
          </Col>
        </Row>
        {/* Ẩn toàn bộ chart nếu không có dữ liệu */}
        {statistics.total > 0 &&
          (statistics.completed > 0 || statistics.inProgress > 0) && (
            <Row gutter={24} className="w-full mt-8">
              <Col span={24}>
                <Card
                  variant="outlined"
                  title={
                    <div className="font-bold text-center">
                      The pie chart shows the project status distribution
                    </div>
                  }
                  style={{
                    background: "#fff",
                    border: "2px solid #40A9FF",
                  }}
                >
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
                        label={({ name, value }) =>
                          `${name}: ${
                            statistics.total > 0
                              ? ((value / statistics.total) * 100).toFixed(2)
                              : 0
                          }%`
                        }
                      >
                        {pieData.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          )}
      </div>
    </Spin>
  );
};

export default ProjectOverviewDashboard;
