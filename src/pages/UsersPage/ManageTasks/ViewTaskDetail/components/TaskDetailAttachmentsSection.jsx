import React, { useState } from 'react';
import { useAuth } from '../../../../../context/useAuth';

const TaskDetailAttachmentsSection = ({projectData}) => {
      const {user} = useAuth()
      const isOwner = projectData && projectData.owner_id === user.id
      const [fileList, setFileList] = useState([])
      const [avatarBase64, setAvatarBase64] = useState("")
      const [previewVisible, setPreviewVisible] = useState(false)
      const [previewImage, setPreviewImage] = useState("")
      
      return (
            <div>
                  {isOwner ? <div>view task detail attachments section</div> : <div>edit task detail attachments section</div>}
                  
            </div>
      );
};

export default TaskDetailAttachmentsSection;