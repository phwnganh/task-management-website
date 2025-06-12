import React, { useState, useEffect } from 'react';
import { apiGetUserDetail } from '../../../../../services/UserService/UserService';
import { apiGetProjectDetail } from "../../../../../services/UserService/UserService";
import { Avatar, Tooltip } from "antd";

const TaskDetailInformationSection = ({ task, currentUser }) => {
    const [assigneeData, setAssigneeData] = useState([]);
    const [loadingAssignees, setLoadingAssignees] = useState(true);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchAssigneesAndProject = async () => {
            if (!task || !currentUser || !task.assignee_ids || task.assignee_ids.length === 0) {
                setLoadingAssignees(false);
                return;
            }

            setLoadingAssignees(true);
            const fetchedAssigneeDetails = [];

            try {
                const fetchedProject = await apiGetProjectDetail(task.project_id);
                setProject(fetchedProject);

                for (const id of task.assignee_ids) {
                    const userDetail = await apiGetUserDetail(id);
                    if (userDetail) {
                        if (id === currentUser.id && fetchedProject.is_owner !== currentUser.id) {
                            fetchedAssigneeDetails.push({ ...userDetail, isMe: true });
                        } else {
                            fetchedAssigneeDetails.push(userDetail);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching assignees or project detail:", error);
            } finally {
                setAssigneeData(fetchedAssigneeDetails);
                setLoadingAssignees(false);
            }
        };

        fetchAssigneesAndProject();
    }, [task, currentUser]);

    const isOwner = project && currentUser && project.is_owner === currentUser.id;

    if (loadingAssignees) {
        return <div>Loading assignees...</div>;
    }

    if (!task) {
        return <div>No task data available.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4"></h2>
            <div className="space-y-6">
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="title">
                        Title:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="title"
                        type="text"
                        value={task.title}
                        readOnly
                    />
                </div>
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="assignedTo">
                        Assigned to:
                    </label>
                    <div className="flex items-center space-x-2 w-3/4">
                        {loadingAssignees ? (
                            <span>Loading assignees...</span>
                        ) : (
                            <Avatar.Group maxCount={5} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                                {isOwner ? (
                                    assigneeData.map(assignee => (
                                        <Tooltip title={`${assignee.first_name} ${assignee.last_name}`}
                                                 key={assignee.id}>
                                            <Avatar src={assignee.avatar_url}/>
                                        </Tooltip>
                                    ))
                                ) : (
                                    assigneeData.map(assignee => (
                                        <Tooltip title={assignee.isMe ? "Me" : `${assignee.first_name} ${assignee.last_name}`}
                                                 key={assignee.id}>
                                            <Avatar src={assignee.avatar_url}/>
                                        </Tooltip>
                                    ))
                                )}
                                {isOwner && (
                                    <Tooltip title="Add Assignee">
                                        <Avatar className="bg-gray-300 cursor-pointer">+</Avatar>
                                    </Tooltip>
                                )}
                            </Avatar.Group>
                        )}
                    </div>
                </div>
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="priority">
                        Priority:
                    </label>
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                        • {task.priority}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="status">
                        Status:
                    </label>
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                        • {task.status}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="startDate">
                        Start date:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="startDate"
                        type="text"
                        value={task.start_date ? task.start_date.split('T')[0] : 'N/A'}
                        readOnly
                    />
                </div>
                <div className="flex items-center mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold" htmlFor="dueDate">
                        Due date:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="dueDate"
                        type="text"
                        value={task.due_date ? task.due_date.split('T')[0] : 'N/A'}
                        readOnly
                    />
                </div>
                <div className="flex mb-2">
                    <label className="w-1/4 text-gray-700 text-sm font-bold mt-2" htmlFor="description">
                        Description:
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 h-32 leading-tight focus:outline-none focus:shadow-outline resize-none"
                        id="description"
                        value={task.description}
                        readOnly
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailInformationSection;