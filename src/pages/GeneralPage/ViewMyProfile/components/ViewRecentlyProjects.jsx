import { useCallback, useEffect, useState } from "react";
import {
  Empty,
  message,
  Progress,
  Modal,
  Button,
  Spin,
  notification,
} from "antd";
import { PROJECT_LIST } from "../../../../constants/routes.constants";
import { useAuth } from "../../../../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  TbEye,
  TbHeart,
  TbHeartFilled,
  TbPencil,
  TbTrash,
} from "react-icons/tb";
import { LoadingOutlined } from "@ant-design/icons";
import {
  apiAddFavoriteProject,
  apiArchieveProjects,
  apiGetFavoriteProjects,
  apiGetProjectList,
  apiGetRecentlyViewedProject,
  apiRemoveFavoriteProject,
  apiUpdateRecentlyViewedProject,
} from "../../../../services/UserService/ManageProjectsService";
import { apiGetTaskList } from "../../../../services/UserService/ManageTasksService";
import UpdateProjectModalDialog from "../../../UsersPage/ManageProjects/UpdateProject/UpdateProjectModalDialog";
import ProjectDetailModalDialog from "../../../UsersPage/ManageProjects/ProjectDetail/ProjectDetailModalDialog";
import { useTranslation } from "react-i18next";

const ViewRecentlyProject = () => {
  const { t } = useTranslation("taskcalendar");
  const [projectList, setProjectList] = useState([]);
  const [recentlyProject, setRecentlyProject] = useState([]);
  const [taskProgress, setTaskProgress] = useState({});
  const [savedProjects, setSavedProjects] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] =
    useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 9;
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderRecentlyViewedProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
        .filter(
          (project) =>
            latestViewedMap[project.id] && project.is_archieved === false
        )
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
      notification.error({
        message: t("error"),
        description: `${t("errorFetchingData")}: ${error.message}`,
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, t]);

  useEffect(() => {
    renderRecentlyViewedProjects();
  }, [renderRecentlyViewedProjects, user.id]);

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
        setSavedProjects((prev) => ({ ...prev, [projectId]: newFavorite?.id }));
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
    } finally {
      navigate(`${PROJECT_LIST}/${projectId}`);
    }
  };

  const handleArchiveProject = (projectId) => {
    Modal.confirm({
      title: t("archiveProject"),
      content: t("archiveConfirm"),
      okText: t("archive"),
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await apiArchieveProjects(projectId, true);
          notification.success({
            message: t("success"),
            description: t("archiveSuccess"),
            placement: "bottomRight",
          });
        } catch (error) {
          notification.error({
            message: t("error"),
            description: t("archiveFailed"),
            placement: "bottomRight",
          });
        }
      },
    });
  };

  return (
    <Spin
      spinning={isLoading}
      indicator={<LoadingOutlined spin />}
      tip={t("loading")}
    >
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projectList.length > 0 ? (
            currentProjects.map((project) => (
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
                      onClick={() => showProjectDetailModal(project.id)}
                    >
                      <TbEye />
                    </button>
                    {project.owner_id === user.id && (
                      <>
                        <button
                          className="text-lg sm:text-xl md:text-2xl duration-200 hover:text-black text-gray-500"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditProjectModalOpen(true);
                          }}
                        >
                          <TbPencil />
                        </button>
                        <button
                          className="text-lg sm:text-xl md:text-2xl duration-200 hover:text-black text-gray-500"
                          onClick={() => handleArchiveProject(project.id)}
                        >
                          <TbTrash />
                        </button>
                      </>
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
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("noProjects")}
            />
          )}
        </div>
        <div className="text-gray-600">
          {t("page")} {currentPage} {t("of")} {totalPages} ({projectList.length}{" "}
          {t("projects")})
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

export default ViewRecentlyProject;
