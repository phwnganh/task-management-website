import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AiOutlineTeam } from "react-icons/ai";
import { MdOutlinePendingActions, MdAssignmentTurnedIn } from "react-icons/md";
import { apiGetTasksByProject } from "../../../../../services/UserService/DashboardService";

const COLORS = ["#18448a", "#299aff", "#b3d7ff", "#f44336"];

const TaskOverviewDashboard = ({ projectId }) => {
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    completed: 0,
    overdue: 0,
    ongoing: 0,
  });
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const tasks = await apiGetTasksByProject(projectId);

        // Xử lý trạng thái
        let todo = 0,
          ongoing = 0,
          completed = 0,
          overdue = 0;
        const now = new Date();

        tasks.forEach((t) => {
          if (t.status === "To Do") todo++;
          else if (t.status === "In Progress") ongoing++;
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
          ongoing,
          completed,
          overdue,
        });

        setPieData([
          { name: "Todo", value: todo },
          { name: "Ongoing", value: ongoing },
          { name: "Completed", value: completed },
          { name: "Overdue", value: overdue },
        ]);
      } catch (error) {
        setStats({ total: 0, todo: 0, ongoing: 0, completed: 0, overdue: 0 });
        setPieData([]);
      }
    };

    fetchData();
  }, [projectId]);

  // Nếu chưa có task, không hiển thị gì
  if (stats.total === 0) return null;

  return (
    <div className="flex flex-col items-center w-full mt-6">
      {/* Top Stats */}
      <div className="flex flex-wrap gap-4 mb-4 w-full justify-center">
        <div className="flex items-center gap-2 bg-gray-200 px-6 py-3 rounded-xl shadow">
          <AiOutlineTeam className="text-2xl" />
          <span className="font-bold text-lg">Total:</span>
          <span className="text-lg">{stats.total} tasks</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-200 px-6 py-3 rounded-xl shadow">
          <MdOutlinePendingActions className="text-2xl" />
          <span className="font-bold text-lg">Todo:</span>
          <span className="text-lg">{stats.todo} tasks</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-200 px-6 py-3 rounded-xl shadow">
          <MdAssignmentTurnedIn className="text-2xl" />
          <span className="font-bold text-lg">Completed:</span>
          <span className="text-lg">{stats.completed} tasks</span>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="w-full flex justify-center items-center mb-2">
          <span className="text-red-600 font-bold text-lg mr-1">⚠</span>
          <span className="text-red-600 font-bold">
            {stats.overdue} task{stats.overdue > 1 ? "s" : ""}
          </span>
          <span className="ml-1 text-black">has been overdued</span>
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-semibold mt-4 mb-3 text-center">
        Member’s Task Status
      </h2>

      {/* Pie Chart */}
      <div className="w-full flex flex-col items-center">
        <div className="w-[340px] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={46}
                label={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} task${value > 1 ? "s" : ""}`,
                  name,
                ]}
                contentStyle={{ borderRadius: 8, fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex gap-6 mt-4 justify-center">
          <LegendItem color={COLORS[0]} label="Todo" />
          <LegendItem color={COLORS[1]} label="Ongoing" />
          <LegendItem color={COLORS[2]} label="Completed" />
          <LegendItem color={COLORS[3]} label="Overdue" />
        </div>
      </div>
    </div>
  );
};

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      <span className="text-base">{label}</span>
    </div>
  );
}

export default TaskOverviewDashboard;
