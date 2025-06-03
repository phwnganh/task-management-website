import { useEffect, useState } from "react";
import {
  apiAddFavoriteProject,
  apiGetFavoriteProjects,
  apiGetProjectByUser,
  apiGetProjectList,
  apiGetTaskList,
  apiRemoveFavoriteProject,
} from "../../../../services/UserService/UserService";
import { TbHeart, TbHeartFilled } from "react-icons/tb";
import { Progress } from "antd";
import { useAuth } from "../../../../context/useAuth";

const ProjectListCard = ({ searchTerm, sortField, sortOrder, filters }) => {
  const [projectList, setProjectList] = useState([]);
  const [savedProjects, setSavedProjects] = useState({});
  const [taskProgress, setTaskProgress] = useState({});
  const [projectMemberList, setProjectMemberList] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { user } = useAuth();

  const renderProjects = async () => {
    try {
      const projects = await apiGetProjectList();
      const projectMembers = await apiGetProjectByUser();
      const tasks = await apiGetTaskList();
      const userProjects = projects.filter((project) => {
        const isOwner = project.owner_id === user.id;
        const isMember = projectMembers.some(
          (member) =>
            member.project_id === project.id &&
            member.user_id === user.id &&
            member.invite_status === "Accepted"
        );
        return isOwner || isMember;
      });

      const progressTaskData = userProjects.reduce((acc, project) => {
        const projectTasks = tasks.filter(
          (task) => task.project_id === project.id
        );
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(
          (task) => task.status === "Completed"
        ).length;
        const percent =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          ...acc,
          [project.id]: {
            percent: Math.round(percent),
            taskCount: `${completedTasks}/${totalTasks}`,
            status: percent === 100 && totalTasks > 0 ? "success" : "active",
          },
        };
      }, {});
      setProjectList(userProjects);
      setProjectMemberList(projectMembers)
      setTaskProgress(progressTaskData);

      const favoriteProjects = await apiGetFavoriteProjects(user.id);
      const savedState = userProjects.reduce((acc, project) => {
        const favorite = favoriteProjects.find(
          (fav) => fav.project_id === project.id
        );
        return { ...acc, [project.id]: favorite ? favorite.id : false };
      }, {});
      setSavedProjects(savedState);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    renderProjects();
  }, [user.id]);

  const handleSavedProjects = async (projectId) => {
    try {
      if (savedProjects[projectId]) {
        await apiRemoveFavoriteProject(savedProjects[projectId]);
        setSavedProjects((prev) => ({ ...prev, [projectId]: false }));
      } else {
        await apiAddFavoriteProject(user.id, projectId);
        const favoriteProjects = await apiGetFavoriteProjects(user.id);
        const newFavorite = favoriteProjects.find(
          (fav) => fav.project_id === projectId
        );
        setSavedProjects((prev) => ({ ...prev, [projectId]: newFavorite.id }));
      }
    } catch (error) {
      console.error("Error updating favorite project:", error);
    }
  };

  // Lọc projects theo searchTerm
  const filteredProjects = projectList.filter((project) =>
  {
    let matchesRole = true
    if(filters.role){
      const isOwner = project.owner_id === user.id && filters.role === "owner";
      const isMember = projectMemberList.some(pm => pm.project_id === project.id && pm.user_id === user.id && pm.role.toLowerCase() === filters.role && pm.invite_status === "Accepted");
      matchesRole = filters.role === "owner" ? isOwner : isMember
    }

    let matchesStatus = true;
    if(filters.projectStatus){
      const projectStatus = taskProgress[project.id]?.percent === 100 && taskProgress[project.id]?.taskCount !== "0/0" ? "completed" : "in-progress";
      matchesStatus = projectStatus === filters.projectStatus
    }

    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch
  }
  );

  // Sắp xếp projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if(!sortField || !sortOrder) return 0
    if (sortField === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }else if(sortField === "created_at"){
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    }
    return 0;
  });

  // Xác định danh sách projects để hiển thị
  const displayProjects = sortField && sortOrder ? sortedProjects : filteredProjects;

  // Tính toán phân trang dựa trên displayProjects
  const totalPages = Math.ceil(displayProjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = displayProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  return (
    <>
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-5 text-center shadow-md"
            >
              <div className="flex flex-row justify-between">
                <h3 className="text-black text-lg sm:text-xl md:text-2xl truncate">
                  {project.title}
                </h3>
                <button
                  onClick={() => handleSavedProjects(project.id)}
                  className={`text-lg sm:text-xl md:text-2xl transition-colors duration-200 hover:text-black ${
                    savedProjects[project.id] ? "text-black" : "text-gray-500"
                  }`}
                >
                  {savedProjects[project.id] ? <TbHeartFilled /> : <TbHeart />}
                </button>
              </div>

              <p className="mt-2 text-gray-500 text-sm sm:text-base text-start">
                {project.description}
              </p>
              <Progress
                percent={taskProgress[project.id]?.percent || 0}
                status={taskProgress[project.id]?.status || "active"}
              />
              <p className="text-sm sm:text-base text-gray-500 mt-2 sm:mt-3 text-end">
                ⏳ {taskProgress[project.id]?.taskCount || "0/0"}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectListCard;
