import React from 'react';
import { useAuth } from '../../../../../context/useAuth';

const TaskDetailAttachmentsSection = ({projectData}) => {
      const {user} = useAuth()
      const isOwner = projectData && projectData.owner_id === user.id
      return (
            <div>
                  {isOwner ? <div>view task detail attachments section</div> : <div>edit task detail attachments section</div>}
                  
            </div>
      );
};

export default TaskDetailAttachmentsSection;