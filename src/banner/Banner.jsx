import React from "react";
import "./Banner.css";
import { useTranslation, Trans } from "react-i18next";
import { FaFacebookSquare } from "react-icons/fa";

const Banner = () => {
  const { t } = useTranslation("header");

  return (
    <div className="banner-wrapper">
      <div className="banner-track">
        <Trans
          i18nKey="bannerContact"
          t={t}
          components={{
            phone: <a className="contact-link">0225550123</a>,
            email: <a className="contact-link">john.doe@gmail.com</a>,
          }}
        />
        &nbsp;
        <a
          href="https://www.facebook.com/profile.php?id=61577836761591"
          target="_blank"
          rel="noopener noreferrer"
          className="banner-link"
        >
          <FaFacebookSquare size={18} className="facebook-icon" />
          <span className="banner-text">{t("connectUs")}</span>
        </a>
      </div>
    </div>
  );
};

export default Banner;
