import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Button } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TbChartBar, TbProgressCheck, TbCheckbox } from "react-icons/tb";
import { apiGetTaskList } from "../../../../services/UserService/ManageTasksService";
import { apiGetProjectList } from "../../../../services/UserService/ManageProjectsService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN } from "../../../../constants/routes.constants";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const COLORS = ["#36A2EB", "#FF9800", "#4CAF50"];

const ProjectOverviewDashboard = () => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
        const tasks = await apiGetTaskList();

        const activeProjects = projects.filter(
          (project) => !project.is_archieved
        );
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
        activeProjects.forEach((project) => {
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
          total: activeProjects.length,
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

  const exportProjectOverviewDataToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Project Overview");

    worksheet.columns = [
      { header: "Category", key: "category", width: 20 },
      { header: "Value", key: "value", width: 10 },
      { header: "Percentage", key: "percentage", width: 15 },
      { header: "Total Projects", key: "totalProjects", width: 15 },
    ];

    pieData.forEach((item) => {
      worksheet.addRow({
        category: item.name,
        value: item.value,
        percentage:
          statistics.total > 0
            ? ((item.value / statistics.total) * 100).toFixed(2) + "%"
            : "0%",
        totalProjects: statistics.total,
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      // cell.fill = {
      //   type: "pattern",
      //   pattern: "solid",
      //   fgColor: { argb: "FF40A9FF" },
      // };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Project_Overview.xlsx");
    });
  };

  // Tooltip cho Pie chart
  const CustomTooltip = ({ active, payload }) => {
    const { t } = useTranslation("dashboard");
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
        <b>{name}</b>: {value} {value > 1 ? t("projects") : t("project")}
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="max-w-6xl mx-auto p-4 sm:p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <div className="flex items-center space-x-4">
            <h5 className="text-left text-2xl sm:text-3xl md:text-4xl whitespace-nowrap mb-3">
              {t("projectOverviewTitle")}
            </h5>
          </div>
          <div className="mt-2 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2 md:gap-3">
            <Button
              type="primary"
              size="large"
              className="w-full md:w-auto"
              onClick={() =>
                navigate(ARCHIVED_PROJECT_OVERVIEW_DASHBOARD_ADMIN)
              }
            >
              View Detail
            </Button>
            <Button
              type="default"
              size="large"
              className="w-full md:w-auto"
              onClick={exportProjectOverviewDataToExcel}
            >
              Export Data
            </Button>
          </div>
        </div>

        <Row gutter={24} className="w-full">
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title={t("totalProjects")}
                value={statistics.total}
                prefix={<TbChartBar />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title={t("inProgressProjects")}
                value={statistics.inProgress}
                prefix={<TbProgressCheck />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="outlined">
              <Statistic
                title={t("completedProjects")}
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
                      {t("pieChartProjectTitle")}
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
