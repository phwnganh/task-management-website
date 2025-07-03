import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  apiGetProjectMembers,
  apiGetAllUsers,
  apiGetTasksByProject,
} from "../../../../../services/UserService/DashboardService";
import { useTranslation } from "react-i18next";

// Hàm tính số ngày giữa hai mốc
function diffInDays(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  return ms > 0 ? ms / (1000 * 60 * 60 * 24) : null;
}

// Hàm kiểm tra overdue chính xác (sau 23:59:59 ngày hạn)
function isTaskOverdue(task, now = new Date()) {
  if (task.status === "Completed" || !task.due_date) return false;
  let due = new Date(task.due_date);
  // Nếu chỉ có yyyy-mm-dd thì cộng lên cuối ngày
  if (/^\d{4}-\d{2}-\d{2}$/.test(task.due_date)) {
    due.setHours(23, 59, 59, 999);
  }
  return now > due;
}

// Tooltip cho biểu đồ 1 (số task + "tasks/task")
const CustomStatusTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload || !payload.length) return null;
  const fields = [
    { key: "To do", color: "#18448a" },
    { key: "In progress", color: "#299aff" },
    { key: "Completed", color: "#4CAF50" },
    { key: "Overdue", color: "#F44336" },
  ];
  return (
    <div
      style={{
        background: "#fff",
        color: "#222",
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
        minWidth: 160,
      }}
    >
      <b style={{ fontSize: 16 }}>{label}</b>
      <ul style={{ paddingLeft: 14, margin: "10px 0 0 0" }}>
        {fields.map((f) => {
          const item = payload.find((p) => p.dataKey === f.key);
          if (!item || !item.value) return null;
          return (
            <li key={f.key} style={{ color: f.color, marginBottom: 3 }}>
              {`${t(f.key)}: `}
              <b>{item.value}</b> {item.value > 1 ? t("tasks") : t("task")}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Tooltip cho biểu đồ 2 (ngày trung bình)
const CustomTooltip = ({ active, payload }) => {
  const { t } = useTranslation("dashboard");
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          color: "#222",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #eee",
          fontWeight: "bold",
        }}
      >
        <div>{payload[0].payload.member}</div>
        <div>
          {t("average")}: <b>{payload[0].payload.avg_days}</b> {t("days")}
        </div>
      </div>
    );
  }
  return null;
};

const TaskDetailDashboard = ({ projectId }) => {
  const { t } = useTranslation("dashboard");
  const [memberStats, setMemberStats] = useState([]);
  const [avgCompleteStats, setAvgCompleteStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const projectMembers = await apiGetProjectMembers(projectId);
      const allUsers = await apiGetAllUsers();
      const tasks = await apiGetTasksByProject(projectId);

      // 1. Biểu đồ trạng thái
      const now = new Date();
      const memberStatus = projectMembers.map((member) => {
        const user = allUsers.find((u) => u.id === member.user_id);
        const memberTasks = tasks.filter(
          (t) =>
            Array.isArray(t.assignee_ids) &&
            t.assignee_ids.includes(member.user_id)
        );

        let toDo = 0,
          inProgress = 0,
          completed = 0,
          overdue = 0;

        memberTasks.forEach((t) => {
          if (t.status === "To Do") toDo++;
          if (t.status === "In Progress") inProgress++;
          if (t.status === "Completed") completed++;
          if (isTaskOverdue(t, now)) {
            overdue++;
          }
        });

        return {
          member:
            user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username || member.user_id,
          "To do": toDo,
          "In progress": inProgress,
          Completed: completed,
          Overdue: overdue,
        };
      });
      setMemberStats(
        memberStatus.filter(
          (m) =>
            m["To do"] > 0 ||
            m["In progress"] > 0 ||
            m.Completed > 0 ||
            m.Overdue > 0
        )
      );

      // 2. Biểu đồ thời gian hoàn thành trung bình
      const avgStats = projectMembers.map((member) => {
        const user = allUsers.find((u) => u.id === member.user_id);

        // Chỉ lấy task completed
        const completedTasks = tasks.filter(
          (t) =>
            t.status === "Completed" &&
            Array.isArray(t.assignee_ids) &&
            t.assignee_ids.includes(member.user_id) &&
            t.completed_at &&
            t.start_date
        );
        const totalDays = completedTasks.reduce((sum, t) => {
          const days = diffInDays(t.start_date, t.completed_at);
          return days !== null ? sum + days : sum;
        }, 0);
        const avg =
          completedTasks.length > 0 ? totalDays / completedTasks.length : 0;

        return {
          member:
            user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username || member.user_id,
          avg_days: +avg.toFixed(2),
        };
      });
      setAvgCompleteStats(avgStats.filter((m) => m.avg_days > 0));
    };

    if (projectId) fetchDashboardData();
  }, [projectId, t]); // Thêm t vào dependency để re-fetch khi ngôn ngữ thay đổi

  return (
    <div className="p-4 flex flex-col items-center w-full">
      {/* BIỂU ĐỒ 1 */}
      {memberStats && memberStats.length > 0 && (
        <div
          className="bg-white rounded-xl p-4 shadow w-full max-w-3xl mb-6"
          style={{
            background: "#fff",
            border: "2px solid #40A9FF",
          }}
        >
          <h3
            className="font-bold text-lg mb-4 text-center"
            style={{
              color: "#1677ff",
              fontWeight: 800,
              textShadow: "0 1px 3px #e9f7ff",
            }}
          >
            {t("taskCompletionProgress")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={memberStats}
              margin={{ top: 16, right: 20, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="member" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomStatusTooltip t={t} />} />
              {/* <Legend /> */}
              <Legend
                formatter={(value) => {
                  const map = {
                    "To do": t("To do"),
                    "In progress": t("In progress"),
                    Completed: t("Completed"),
                    Overdue: t("Overdue"),
                  };
                  return map[value] || value;
                }}
              />

              <Bar dataKey="To do" fill="#18448a" />
              <Bar dataKey="In progress" fill="#299aff" />
              <Bar dataKey="Completed" fill="#4CAF50" />
              <Bar dataKey="Overdue" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* BIỂU ĐỒ 2 */}
      {avgCompleteStats && avgCompleteStats.length > 0 && (
        <div
          className="rounded-xl p-4 shadow w-full max-w-3xl"
          style={{
            background: "#fff",
            border: "2px solid #40A9FF",
          }}
        >
          <h3
            className="font-bold text-lg mb-4 text-center"
            style={{
              color: "#1677ff",
              fontWeight: 800,
              textShadow: "0 1px 3px #e9f7ff",
            }}
          >
            {t("avgCompletionTime")}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={avgCompleteStats}
              margin={{ top: 32, right: 30, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="member" />
              <YAxis unit={` ${t("days")}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="avg_days"
                fill="#40A9FF"
                name={`${t("average")} ${t("completionTime")} (${t("days")})`}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(!memberStats || memberStats.length === 0) &&
        (!avgCompleteStats || avgCompleteStats.length === 0) && (
          <div style={{ color: "#aaa", textAlign: "center", marginTop: 80 }}>
            {t("noDataAvailable")}
          </div>
        )}
    </div>
  );
};

export default TaskDetailDashboard;
