import { useCallback, useEffect, useState } from "react";
import {
  apiAddFavoriteProject,
  apiGetFavoriteProjects,
  apiGetProjectList,
  apiGetRecentlyViewedProject,
  apiGetTaskList,
  apiRemoveFavoriteProject,
  apiUpdateRecentlyViewedProject,
} from "../../../../services/UserService/UserService";
import { Empty, message, Progress, Modal, Button } from "antd";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { useAuth } from "../../../../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { TbEye, TbHeart, TbHeartFilled, TbPencil } from "react-icons/tb";

const ViewRecentlyProject = () => {
  const [projectList, setProjectList] = useState([]);
  const [recentlyProject, setRecentlyProject] = useState([]);
  const [taskProgress, setTaskProgress] = useState({});
  const [savedProjects, setSavedProjects] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] =
    useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const itemsPerPage = 9;
  const { user } = useAuth();
  const navigate = useNavigate();
  const renderRecentlyViewedProjects = useCallback(async () => {
    try {
      const projects = await apiGetProjectList();
      const tasks = await apiGetTaskList();
      const recentlyViewedProjects = await apiGetRecentlyViewedProject(user.id);

      const sortedRecentlyViewed = recentlyViewedProjects.sort(
        (a, b) => new Date(b.viewed_at) - new Date(a.viewed_at)
      );

      const latestViewedMap = sortedRecentlyViewed.reduce((acc, rv) => {
        if (
          !acc[rv.project_id] ||
          new Date(rv.viewed_at) > new Date(acc[rv.project_id].viewed_at)
        ) {
          acc[rv.project_id] = rv;
        }
        return acc;
      }, {});

      const userRecentlyViewedProjects = projects
        .filter((project) => latestViewedMap[project.id])
        .sort(
          (a, b) =>
            new Date(latestViewedMap[b.id].viewed_at) -
            new Date(latestViewedMap[a.id].viewed_at)
        );

      const progressTaskData = userRecentlyViewedProjects.reduce(
        (acc, project) => {
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
        },
        {}
      );

      setProjectList(userRecentlyViewedProjects);
      console.log(
        "user recently viewed projects: ",
        userRecentlyViewedProjects
      );
      console.log("recently viewed projects: ", recentlyViewedProjects);

      setRecentlyProject(sortedRecentlyViewed);
      setTaskProgress(progressTaskData);

      const favoriteProjects = await apiGetFavoriteProjects(user.id);
      const savedState = userRecentlyViewedProjects.reduce((acc, project) => {
        const favorite = favoriteProjects.find(
          (fav) => fav.project_id === project.id
        );
        return { ...acc, [project.id]: favorite ? favorite.id : false };
      }, {});
      setSavedProjects(savedState);
    } catch (error) {
      message.error(
        `Error fetching recently viewed projects: ${error.message}`
      );
    }
  }, [user.id]);

  useEffect(() => {
    renderRecentlyViewedProjects();
  }, [renderRecentlyViewedProjects, user.id]);

  const showProjectDetailModal = () => {
    setIsProjectDetailModalOpen(true);
  };

  const handleProjectDetailCancel = () => {
    setIsProjectDetailModalOpen(false);
  };

  const showEditProjectModal = () => {
    setIsEditProjectModalOpen(true);
  };

  const handleEditProjectModalOk = () => {
    setIsEditProjectModalOpen(false);
  };

  const handleEditProjectModalCancel = () => {
    setIsEditProjectModalOpen(false);
  };

  const totalPages = Math.ceil(projectList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projectList.slice(indexOfFirstItem, indexOfLastItem);

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

    const handleUpdateRecentlyViewedProject = async (userId, projectId) => {
      try {
        await apiUpdateRecentlyViewedProject(projectId, userId);
        console.log("Recently viewed updated successfully");
      } catch (error) {
        console.error("Failed to update recently viewed:", error);
      }finally{
        navigate(`${PROJECT_LIST}/${projectId}`)
      }
    };

  return (
    <>
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projectList.length > 0 ? (
            currentProjects.map((project) => {
              const recentlyViewedProject = recentlyProject.find(
                (rv) => rv.project_id === project.id
              );
              return (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-5 text-center shadow-md"
                >
                  <div className="flex flex-row justify-between">
                    <Link
                      to={`${PROJECT_LIST}/${project.id}`}
                      className="text-black text-lg sm:text-xl md:text-lg truncate hover:text-blue-400"
                    >
                      {project.title}
                    </Link>
                    <div className="flex flex-row">
                      <button
                        onClick={() => handleSavedProjects(project.id)}
                        className={`text-lg sm:text-xl md:text-2xl mr-2 ml-3 transition-colors duration-200 hover:text-black ${
                          savedProjects[project.id]
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      >
                        {savedProjects[project.id] ? (
                          <TbHeartFilled />
                        ) : (
                          <TbHeart />
                        )}
                      </button>
                      <button
                        className="text-lg sm:text-xl md:text-2xl mr-2 duration-200 hover:text-black text-gray-500"
                        onClick={showProjectDetailModal}
                      >
                        <TbEye />
                      </button>
                      {project.owner_id === user.id && (
                        <button
                          className="text-lg sm:text-xl md:text-2xl duration-200 hover:text-black text-gray-500"
                          onClick={showEditProjectModal}
                        >
                          <TbPencil />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-500 text-sm sm:text-base text-start">
                    {project.description}
                  </p>
                  <Progress
                    percent={taskProgress[project.id]?.percent || 0}
                    status={taskProgress[project.id]?.status || "active"}
                  />
                  <div className="flex flex-row justify-between mt-2 sm:mt-3">
                    <Button
                      type="primary"
                      onClick={() => handleUpdateRecentlyViewedProject(user.id, project.id)}
                    >
                      View Task Inside
                    </Button>
                    <p className="text-sm sm:text-base text-gray-500 text-end">
                      ⏳ {taskProgress[project.id]?.taskCount || "0/0"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
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
      <Modal
        title="Project Details"
        open={isProjectDetailModalOpen}
        onCancel={handleProjectDetailCancel}
        footer={null}
      >
        <p>Display project details here...</p>
      </Modal>
      <Modal
        title="Edit Project"
        open={isEditProjectModalOpen}
        onOk={handleEditProjectModalOk}
        onCancel={handleEditProjectModalCancel}
      >
        <p>Edit project form here...</p>
      </Modal>
    </>
  );
};

export default ViewRecentlyProject;
