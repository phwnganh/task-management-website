import { Card, Col, Row, Statistic } from "antd";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import { TbChartBar, TbCheckbox, TbProgressCheck } from "react-icons/tb";

const UserOverviewDashboard = () => {
  return (
    <>
      <PostLoginLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl whitespace-nowrap">
                My Project
              </h1>
            </div>
          </div>
          <div className="flex flex-row w-full">
            <Row gutter={24} className="w-full">
              <Col span={8} className="w-full">
                <Card variant="outlined">
                  <Statistic
                    title={"Total Projects:"}
                    value={5}
                    prefix={<TbChartBar />}
                  />
                </Card>
              </Col>
              <Col span={8} className="w-full">
                <Card variant="outlined">
                  <Statistic
                    title={"In Progress Projects:"}
                    value={5}
                    prefix={<TbProgressCheck />}
                  />
                </Card>
              </Col>
              <Col span={8} className="w-full">
                <Card variant="outlined">
                  <Statistic
                    title={"Completed Projects:"}
                    value={5}
                    prefix={<TbCheckbox />}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </PostLoginLayout>
    </>
  );
};

export default UserOverviewDashboard;
