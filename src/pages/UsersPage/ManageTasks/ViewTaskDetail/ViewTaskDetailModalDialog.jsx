import React, { useState, useEffect } from 'react';
import TaskDetailAttachmentsSection from "./components/TaskDetailAttachmentsSection"
import TaskDetailCommentsSection from "./components/TaskDetailCommentsSection"
import TaskDetailInformationSection from "./components/TaskDetailInformationSection"

const ViewTaskDetailModalDialog = ({ task, currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (!task || !currentUser) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [task, currentUser]);

    if (loading) {
        return <div>Loading task details...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (<>
      <TaskDetailInformationSection task={task} currentUser={currentUser}/>
      <TaskDetailCommentsSection/>
      <TaskDetailAttachmentsSection/>
      </>)
}

export default ViewTaskDetailModalDialog