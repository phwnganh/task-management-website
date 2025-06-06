import { useState } from "react";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import ProjectListCard from "./components/ProjectListCard";
import ProjectsListActionTool from "./components/ProjectsListActionTool";
import ProjectsListTableTool from "./components/ProjectsListTableTool";

const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null); // Mặc định sắp xếp theo title
  const [sortOrder, setSortOrder] = useState(null); // Mặc định thứ tự tăng dần
  const [filters, setFilters] = useState({role: null, projectStatus: null})
  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <ProjectsListActionTool />
          <ProjectsListTableTool
            onSearch={setSearchTerm}
            onSort={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            onFilter={setFilters}
          />
          <ProjectListCard
            searchTerm={searchTerm}
            sortField={sortField}
            sortOrder={sortOrder}
            filters={filters}
          />
        </div>
      </PostLoginLayout>
    </>
  );
};

export default ProjectList;
