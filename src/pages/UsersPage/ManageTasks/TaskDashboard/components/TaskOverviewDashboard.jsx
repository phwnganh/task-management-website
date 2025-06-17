import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AiOutlineTeam } from "react-icons/ai";
import { MdOutlinePendingActions, MdAssignmentTurnedIn } from "react-icons/md";
import { TbProgressCheck } from "react-icons/tb";
import { apiGetTasksByProject } from "../../../../../services/UserService/DashboardService";
import { useTranslation } from "react-i18next";

// Màu sắc cho pie chart
const COLORS = ["#18448a", "#299aff", "#FF9800", "#4CAF50", "#f44336"];

function CustomTooltip({ active, payload }) {
  const { t } = useTranslation("dashboard");
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 10,
      }}
    >
      <span style={{ color: d.color, fontWeight: 600 }}>{d.name}: </span>
      <span style={{ fontWeight: 500 }}>
        {d.value} {d.value > 1 ? t("tasks") : t("task")}
      </span>
    </div>
  );
}

const TaskOverviewDashboard = ({ projectId }) => {
  const { t } = useTranslation("dashboard");
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inprogress: 0,
    completed: 0,
    overdue: 0,
  });
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const tasks = await apiGetTasksByProject(projectId);

        let todo = 0,
          inprogress = 0,
          completed = 0,
          overdue = 0;
        const now = new Date();

        tasks.forEach((t) => {
          if (t.status === "To Do") todo++;
          else if (t.status === "In Progress") inprogress++;
          else if (t.status === "Completed") completed++;
          // Overdue = chưa Completed và quá hạn
          if (
            t.status !== "Completed" &&
            t.due_date &&
            new Date(t.due_date) < now
          ) {
            overdue++;
          }
        });

        setStats({
          total: tasks.length,
          todo,
          inprogress,
          completed,
          overdue,
        });

        setPieData([
          { name: "Todo", value: todo },
          { name: "In Progress", value: inprogress },
          { name: "Completed", value: completed },
          { name: "Overdue", value: overdue },
        ]);
      } catch (error) {
        setStats({
          total: 0,
          todo: 0,
          inprogress: 0,
          completed: 0,
          overdue: 0,
        });
        setPieData([]);
      }
    };

    fetchData();
  }, [projectId, t]); // Thêm t vào dependency để re-fetch khi ngôn ngữ thay đổi

  // Không có task thì không hiển thị
  if (stats.total === 0) {
    return (
      <Card className="w-full my-6">
        <div className="text-center py-10 text-gray-500">
          {t("noTasksAvailable")}
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Statistic Card */}
      <Row gutter={24} className="w-full mb-2">
        <Col span={6}>
          <Card variant="outlined">
            <Statistic
              title={t("totalTasks")}
              value={stats.total}
              prefix={<AiOutlineTeam />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined">
            <Statistic
              title={t("todoTasks")}
              value={stats.todo}
              prefix={<MdOutlinePendingActions />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined">
            <Statistic
              title={t("inProgressTasks")}
              value={stats.inprogress}
              prefix={<TbProgressCheck />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined">
            <Statistic
              title={t("completedTasks")}
              value={stats.completed}
              prefix={<MdAssignmentTurnedIn />}
            />
          </Card>
        </Col>
      </Row>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="w-full flex items-center my-2">
          <span className="text-red-600 font-bold text-lg mr-1">⚠</span>
          <span className="text-red-600 font-bold">
            {t("overdueAlert", { count: stats.overdue })}
          </span>
        </div>
      )}

      {/* Pie Chart */}
      <Row gutter={24} className="w-full mt-2">
        <Col span={24}>
          <Card
            variant="outlined"
            title={
              <div className="font-bold text-center">{t("pieChartTitle")}</div>
            }
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
                    value > 0 && stats.total > 0
                      ? `${name}: ${((value / stats.total) * 100).toFixed(2)}%`
                      : ""
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TaskOverviewDashboard;
