import { useState } from "react";
import SavedProjectCard from "./SavedProjectCard"
import SavedProjectTableTools from "./SavedProjectTableTools"

const ViewSavedProject = () => {    
        const [searchTerm, setSearchTerm] = useState("");
        const [sortField, setSortField] = useState(null); // Mặc định sắp xếp theo title
        const [sortOrder, setSortOrder] = useState(null); // Mặc định thứ tự tăng dần
        const [filters, setFilters] = useState({role: null, projectStatus: null})  
      return (<>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
            <SavedProjectTableTools onSearch={setSearchTerm}
            onSort={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            onFilter={setFilters}/>
            <SavedProjectCard searchTerm={searchTerm}
            sortField={sortField}
            sortOrder={sortOrder}
            filters={filters}/>
      </div>
      </>)
}

export default ViewSavedProject