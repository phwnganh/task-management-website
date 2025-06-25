import React from "react";
import "./Banner.css";
import { useTranslation } from "react-i18next";

const Banner = () => {
  const { t } = useTranslation("header");
  return (
    <div className="banner-wrapper">
      <div className="banner-track">{t("bannerContact")}</div>
    </div>
  );
};

export default Banner;
