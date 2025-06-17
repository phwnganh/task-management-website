import React, { useEffect, useState } from 'react';
import { Badge, Calendar, Empty, notification } from 'antd';
import dayjs from 'dayjs';
import PostLoginLayout from '../../../layouts/PostLoginLayout/PostLoginLayout';
import { useAuth } from '../../../context/useAuth';
import { apiGetAssigneeTasksInParticipatedProjects} from '../../../services/UserService/ManageTasksService';

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const myTaskList = await apiGetAssigneeTasksInParticipatedProjects(user.id);
        setTasks(myTaskList);
      } catch (error) {
        notification.error({
          message: 'Failed to fetch tasks',
          description: error.message,
          placement: 'bottomRight',
        });
      }
    };
    if (user?.id) {
      fetchMyTasks();
    }
  }, [user?.id]);

  const getListData = (value) => {
    const listData = [];
    const today = dayjs();

    tasks.forEach((task) => {
      const dueDate = dayjs(task.due_date);
      if (dueDate.isSame(value, 'day')) {
        const daysUntilDue = dueDate.diff(today, 'day');
        let type;
        if (dueDate.isBefore(today, 'day') && task.status !== 'Completed') {
          type = 'error'; // Overdue tasks
        } else if (daysUntilDue <= 1 && task.status !== 'Completed') {
          type = 'warning'; // Tasks due soon (within 1 day)
        } else {
          type = 'success'; // Other tasks
        }
        listData.push({
          type,
          taskTitle: task.title,
          projectTitle: task.project_title,
        });
      }
    });

    return listData;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="list-none m-0 p-0">
        {listData.map((item, index) => (
          <li key={`${item.taskTitle}-${index}`} className="mb-2 text-xs">
            <Badge
              status={item.type}
              text={
                <div className="flex flex-col">
                  <span className="font-semibold">{item.taskTitle}</span>
                  <span className="text-gray-500 text-[10px]">{item.projectTitle}</span>
                </div>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  return (
    <div>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">
              Calendar Tasks Notification
            </h1>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            {tasks.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Calendar cellRender={cellRender} className="border border-gray-200 rounded" />
            )}
          </div>
        </div>
      </PostLoginLayout>
    </div>
  );
};

export default TaskCalendar;