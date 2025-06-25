import { Button, Dropdown, Input, Modal, notification } from "antd";
import { useState, useCallback } from "react";
import { AudioOutlined } from "@ant-design/icons";
import ProjectFilterAction from "./ProjectFilterAction";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

const ProjectsListTableTool = ({ onSearch, onSort, onFilter }) => {
  const { t, i18n } = useTranslation("mp");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    role: null,
    projectStatus: null,
  });
  const [formInstance, setFormInstance] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [recognizing, setRecognizing] = useState(false);

  // Lấy ngôn ngữ hiện tại từ i18n
  const currentI18nLang = i18n.language || "vi";

  // Map từ i18n.lang → speech lang code
  const mapI18nToSpeechLang = (lang) => {
    switch (lang) {
      case "vi":
        return "vi-VN";
      case "en":
        return "en-US";
      case "ja":
        return "ja-JP";
      case "zh":
        return "zh-CN";
      case "ko":
        return "ko-KR";
      default:
        return "en-US";
    }
  };

  // Debounced search để giảm số lần gọi API
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const sortItems = [
    { key: "all", label: "All", onClick: () => onSort(null, null) },
    { key: "a-z", label: "A-Z", onClick: () => onSort("title", "asc") },
    { key: "z-a", label: "Z-A", onClick: () => onSort("title", "desc") },
    {
      key: "latest",
      label: "Latest",
      onClick: () => onSort("created_at", "desc"),
    },
    {
      key: "oldest",
      label: "Oldest",
      onClick: () => onSort("created_at", "asc"),
    },
  ];

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notification.error({
        message: "Trình duyệt không hỗ trợ nhận diện giọng nói",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = mapI18nToSpeechLang(currentI18nLang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecognizing(true);
    recognition.onend = () => setRecognizing(false);

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.trim().replace(/[\p{P}\p{S}]+$/gu, ""); // xoá dấu câu cuối

      setSearchText(transcript);
      onSearch(transcript);

      notification.success({
        message: "🎤 Đã nhận giọng nói",
        description: `"${transcript}"`,
      });
    };

    recognition.onerror = (event) => {
      notification.error({
        message: "Lỗi nhận giọng nói",
        description: event.error,
      });
    };

    recognition.start();
  };

  const showFilterModal = () => setIsModalOpen(true);
  const handleFilterOk = () => {
    setIsModalOpen(false);
    onFilter(filterData);
  };
  const handleFilterCancel = () => setIsModalOpen(false);
  const handleReset = () => {
    if (formInstance) formInstance.resetFields();
    setFilterData({ role: null, projectStatus: null });
    onFilter({ role: null, projectStatus: null });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      {/* SEARCH + MIC */}
      <div className="flex flex-row items-center gap-2 w-full md:w-full">
        <Input
          placeholder={t("Quick search")}
          size="large"
          className="w-full md:w-96"
          value={searchText}
          onChange={(e) => {
            const val = e.target.value;
            setSearchText(val);
            debouncedSearch(val);
          }}
          onPressEnter={() => onSearch(searchText)}
          allowClear
          suffix={
            <Button
              icon={<AudioOutlined />}
              type={recognizing ? "primary" : "default"}
              onClick={handleVoiceSearch}
              loading={recognizing}
              style={{
                border: "none",
                boxShadow: "none",
                paddingInline: 8,
                marginRight: -8,
              }}
            />
          }
        />
      </div>

      {/* FILTER + SORT */}
      <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto justify-start md:justify-end">
        <Button type="primary" size="large" onClick={showFilterModal}>
          {t("Filter")}
        </Button>
        <Dropdown menu={{ items: sortItems }} overlayClassName="mt-2">
          <Button
            size="large"
            className="border border-gray-400 whitespace-nowrap hover:bg-gray-100 flex items-center"
          >
            {t("Sort by")} <span className="ml-2">▼</span>
          </Button>
        </Dropdown>
        <Modal
          title={t("Filter Projects")}
          width={750}
          open={isModalOpen}
          onOk={handleFilterOk}
          onCancel={handleFilterCancel}
          footer={
            <div className="w-full flex flex-col md:flex-row justify-end items-end gap-2">
              <Button key="reset" onClick={handleReset}>
                {t("reset")}
              </Button>
              <Button key="submit" type="primary" onClick={handleFilterOk}>
                {t("apply")}
              </Button>
            </div>
          }
        >
          <ProjectFilterAction
            onChange={setFilterData}
            onFormInstance={setFormInstance}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProjectsListTableTool;
