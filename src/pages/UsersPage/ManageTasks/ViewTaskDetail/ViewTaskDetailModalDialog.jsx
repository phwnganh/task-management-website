import TaskDetailAttachmentsSection from "./components/TaskDetailAttachmentsSection"
import TaskDetailCommentsSection from "./components/TaskDetailCommentsSection"
import TaskDetailInformationSection from "./components/TaskDetailInformationSection"

const ViewTaskDetailModalDialog = () => {
      return (<>
      <TaskDetailInformationSection/>
      <TaskDetailCommentsSection/>
      <TaskDetailAttachmentsSection/>
      </>)
}

export default ViewTaskDetailModalDialog