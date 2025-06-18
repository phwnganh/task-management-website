import React, { useEffect, useState } from "react";
import { TbHeartFilled, TbEye, TbPencil } from "react-icons/tb";
import {
  Button,
  Empty,
  message,
  Modal,
  notification,
  Progress,
  Spin,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { useAuth } from "../../../../context/useAuth";
import { LoadingOutlined } from "@ant-design/icons";
import {
  apiGetFavoriteProjects,
  apiGetProjectByUser,
  apiGetProjectList,
  apiRemoveFavoriteProject,
  apiUpdateRecentlyViewedProject,
} from "../../../../services/UserService/ManageProjectsService";
import { apiGetTaskList } from "../../../../services/UserService/ManageTasksService";
import UpdateProjectModalDialog from "../../../UsersPage/ManageProjects/UpdateProject/UpdateProjectModalDialog";
import ProjectDetailModalDialog from "../../../UsersPage/ManageProjects/ProjectDetail/ProjectDetailModalDialog";
import { useTranslation } from "react-i18next";

const SavedProjectCard = ({ searchTerm, sortField, sortOrder, filters }) => {
  const { t } = useTranslation("mp");
  const [projectList, setProjectList] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [taskProgress, setTaskProgress] = useState({});
  const [projectMemberList, setProjectMemberList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] =
    useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 9;
  const { user } = useAuth();

  const showProjectDetailModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsProjectDetailModalOpen(true);
  };

  const handleProjectDetailCancel = () => {
    setIsProjectDetailModalOpen(false);
    setSelectedProjectId(null);
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

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await apiRemoveFavoriteProject(favoriteId);
      setSavedProjects((prev) =>
        prev.filter((saved) => saved.id !== favoriteId)
      );
      notification.success({
        message: t("success"),
        description: t("unsavedSuccessfully"),
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("failedToUnsave"),
        placement: "bottomRight",
      });
    }
  };

  const renderSavedProjects = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const projects = await apiGetProjectList();
      const projectMembers = await apiGetProjectByUser();
      const tasks = await apiGetTaskList();
      const favoriteProjects = await apiGetFavoriteProjects(user.id);

      const userFavoriteProjects = projects.filter((project) =>
        favoriteProjects.some((fav) => fav.project_id === project.id)
      );

      const progressTaskData = userFavoriteProjects.reduce((acc, project) => {
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

      setProjectList(userFavoriteProjects);
      setSavedProjects(favoriteProjects);
      setProjectMemberList(projectMembers);
      setTaskProgress(progressTaskData);
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("errorFetchingData"),
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderSavedProjects();
  }, [user.id]);

  const filteredProjects = projectList.filter((project) => {
    let matchesStatus = true;
    if (filters?.projectStatus) {
      const projectStatus =
        taskProgress[project.id]?.percent === 100 &&
        taskProgress[project.id]?.taskCount !== "0/0"
          ? "completed"
          : "in-progress";
      matchesStatus = projectStatus === filters.projectStatus;
    }

    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchTerm?.toLowerCase() || "");
    return matchesStatus && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortField || !sortOrder) return 0;
    if (sortField === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === "created_at") {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const displayProjects =
    sortField && sortOrder ? sortedProjects : filteredProjects;

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

  const handleUpdateRecentlyViewedProject = async (userId, projectId) => {
    try {
      await apiUpdateRecentlyViewedProject(projectId, userId);
      console.log("Recently viewed updated successfully");
    } catch (error) {
      console.error("Failed to update recently viewed:", error);
    } finally {
      navigate(`${PROJECT_LIST}/${projectId}`);
    }
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentProjects.length > 0 ? (
            currentProjects.map((project) => {
              const favorite = savedProjects.find(
                (fav) => fav.project_id === project.id
              );
              return (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-5 text-center shadow-md"
                >
                  <div className="flex flex-row justify-between">
                    <h3 className="text-black text-lg sm:text-xl md:text-lg truncate">
                      {project.title}
                    </h3>
                    <div className="flex flex-row">
                      <button
                        className="text-lg sm:text-xl md:text-2xl mr-2 ml-3 transition-colors duration-200 hover:text-black text-black"
                        onClick={() => handleRemoveFavorite(favorite?.id)}
                      >
                        <TbHeartFilled />
                      </button>
                      <button
                        className="text-lg sm:text-xl md:text-2xl mr-2 duration-200 hover:text-black text-gray-500"
                        onClick={() => showProjectDetailModal(project.id)}
                      >
                        <TbEye />
                      </button>
                      {project.owner_id === user.id && (
                        <button
                          className="text-lg sm:text-xl md:text-2xl duration-200 hover:text-black text-gray-500"
                          onClick={() => {
                            setSelectedProject(project);
                            showEditProjectModal();
                          }}
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
                      onClick={() =>
                        handleUpdateRecentlyViewedProject(user.id, project.id)
                      }
                    >
                      {t("viewTaskInside")}
                    </Button>
                    <p className="text-sm sm:text-base text-gray-500 text-end">
                      ⏳ {taskProgress[project.id]?.taskCount || "0/0"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("noProjects")}
            />
          )}
        </div>
        <div className="text-gray-600">
          {t("page")} {currentPage} {t("of")} {totalPages} (
          {displayProjects.length} {t("projects")})
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            {t("previous")}
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {t("next")}
          </button>
        </div>
      </div>
      <UpdateProjectModalDialog
        open={isEditProjectModalOpen}
        onOk={handleEditProjectModalOk}
        onClose={handleEditProjectModalCancel}
        project={selectedProject}
      />

      <Modal
        title={
          <div
            style={{
              paddingBottom: "10px",
              borderBottom: "3px solid #1890ff",
              fontWeight: "bold",
            }}
          >
            {t("projectDetail")}
          </div>
        }
        width={750}
        open={isProjectDetailModalOpen}
        onCancel={handleProjectDetailCancel}
        footer={[
          <Button key="close" onClick={handleProjectDetailCancel}>
            {t("close")}
          </Button>,
        ]}
      >
        <ProjectDetailModalDialog projectId={selectedProjectId} />
      </Modal>
    </Spin>
  );
};

export default React.memo(SavedProjectCard);
