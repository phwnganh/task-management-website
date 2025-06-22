import React from "react";
import { useTranslation } from "react-i18next";
import PostLoginLayout from "../../../layouts/PostLoginLayout/PostLoginLayout";
import MapOSMIn from "../../../mapOSM/components/MapOSMOIn";

const CompanyLocation = () => {
  const { t } = useTranslation("map");

  return (
    <PostLoginLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-5 h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-bold mb-4">{t("companyLocationTitle")}</h2>
        <p className="mb-4 text-gray-700">{t("companyLocationDescription")}</p>
        <div className="w-full h-full">
          <MapOSMIn />
        </div>
      </div>
    </PostLoginLayout>
  );
};

export default CompanyLocation;
