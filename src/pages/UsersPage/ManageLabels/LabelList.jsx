import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import LabelListActionTool from "./components/LabelListActionTool";
import LabelListTable from "./components/LabelListTable";

const LabelList = () => {
  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <LabelListActionTool />
          <LabelListTable />
        </div>
      </PostLoginLayout>
    </>
  );
};

export default LabelList;
