import React, { useEffect, useState } from "react";
import PostLoginLayout from "../../../../layouts/PostLoginLayout/PostLoginLayout";
import { Button, Card, Col, notification, Row } from "antd";
import { useAuth } from "../../../../context/useAuth";
import { apiGetUserArchivedProjectStatistics } from "../../../../services/UserService/DashboardService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { DASHBOARD } from "../../../../constants/routes.constants";
import { useTranslation } from "react-i18next";

const UserArchivedProjectsDashboard = () => {
  const { t } = useTranslation("dashboard");
  const [statistics, setStatistics] = useState([
    { key: "lessThan7", value: 0 },
    { key: "from7to30", value: 0 },
    { key: "moreThan30", value: 0 },
  ]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiGetUserArchivedProjectStatistics(user.id);
        setStatistics([
          { key: "lessThan7", value: data.archivedLessThan7Days },
          { key: "from7to30", value: data.archived7To30Days },
          { key: "moreThan30", value: data.archivedMoreThan30Days },
        ]);
      } catch (error) {
        notification.error({
          message: error.message,
          placement: "bottomRight",
        });
      }
    };
    fetchStatistics();
  }, [user.id]);

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        <Row gutter={[16, 16]} className="w-full mt-4">
          <Col xs={24}>
            <Card
              variant="outlined"
              title={t(
                "The chart shows the number of archived projects by time"
              )}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={statistics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="key"
                    tickFormatter={(key) => {
                      switch (key) {
                        case "lessThan7":
                          return t("Less than 7 days");
                        case "from7to30":
                          return t("From 7 to 30 days");
                        case "moreThan30":
                          return t("More than 30 days");
                        default:
                          return key;
                      }
                    }}
                    label={{
                      value: t("Archived Time"),
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: t("The number of projects"),
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      value,
                      t("The number of archived projects"),
                    ]}
                    labelFormatter={(label) => {
                      switch (label) {
                        case "lessThan7":
                          return t("Less than 7 days");
                        case "from7to30":
                          return t("From 7 to 30 days");
                        case "moreThan30":
                          return t("More than 30 days");
                        default:
                          return label;
                      }
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#36A2EB"
                    name={t("The number of archived projects")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5 mr-0 md:mr-6 justify-end">
          <Button
            className="w-full md:w-auto"
            onClick={() => navigate(DASHBOARD)}
          >
            {t("Back")}
          </Button>
        </Row>
      </div>
    </PostLoginLayout>
  );
};

export default UserArchivedProjectsDashboard;
