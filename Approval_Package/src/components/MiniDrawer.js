import React, { useState, useEffect } from "react";
import ArticleDetails from "../components/ArticleDetails";
import MainContent from "../components/MainContent";
import "../App.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Tabs } from "devextreme-react/tabs";
import ContentLoader from 'react-content-loader';

const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function MiniDrawer({ customerId, projectId, token, searchValue, baseURL }) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [knowledgebaseId, setKnowledgebaseId] = useState("");
  const [listResponse, setListResponse] = useState([]);
  const [isMainContentVisible, setIsMainContentVisible] = useState(true);
  const [isArrowBack, setIsArrowBack] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const decodedToken = jwtDecode(token);
  const UserId = decodedToken?.UserId;


  const [selectedArticle, setSelectedArticle] = React.useState({
    groupId: null,
    postTypeId: null,
    ConversationId: "",
    actionId: 0,
    title: "",
    InboxItemId: 0,
    InboxItemTypeId: 0,
  });

  useEffect(() => {
    fetchKnowledgeData();
  }, [customerId, projectId]);

  const fetchKnowledgeData = async () => {
    const response = await axios.post(`${baseURL}Groups/GetKnowledgeBaseInfo`,
      {
        "loggedUserId": UserId,
        "params": {
          "CustomerId": customerId,
          "ProjectId": projectId
        }
      }
    );
    let resData = response?.data?.Data?.KnowledgebaseId;
    setKnowledgebaseId(resData);
  }

  useEffect(() => {
    if (selectedGroup?.ArticleInfo?.length > 0 && !selectedTab) {
      const defaultTab = selectedGroup.ArticleInfo[0];
      setSelectedTab(defaultTab.PostTypeId);

      setSelectedArticle((prev) => ({
        ...prev,
        postTypeId: defaultTab.PostTypeId,
        ConversationId: defaultTab.ConversationId || prev.ConversationId,
        title: defaultTab.PostTypeName || prev.title,
        InboxItemId: 0,
        actionId: 0,
        InboxItemTypeId: 0,
      }));
    }
  }, [selectedGroup, selectedTab, setSelectedTab, setSelectedArticle, projectId, customerId]);

  const handleTabChange = ({ itemData }) => {

    const newValue = itemData.PostTypeId;
    setIsMainContentVisible(true);
    setIsArrowBack(true);
    setSelectedTab(newValue);
    setClearTrigger(prev => !prev);
    setSearchTerm("");
    setSubmittedSearchTerm("");
    const selectedArticleDetails = selectedGroup?.ArticleInfo?.find(
      (article) => article.PostTypeId === newValue
    );

    setSelectedArticle((prev) => ({
      ...prev,
      postTypeId: newValue,
      ConversationId:
        selectedArticleDetails?.ConversationId || prev.ConversationId,
      title: selectedArticleDetails?.PostTypeName || prev.title,
      InboxItemId: 0,
      actionId: 0,
      InboxItemTypeId: 0,
    }));
    handleUpdateData(); // Trigger update for MainContent

  };

  const tabItems =
    selectedGroup?.ArticleInfo?.map((article) => ({
      PostTypeId: article.PostTypeId,
      text: `${article.PostTypeName} (${article.DocumentCreatedCount})`,
    })) || [];



  const toggleMainContent = () => {
    setIsMainContentVisible(!isMainContentVisible);
    setIsArrowBack(!isArrowBack);
  };


  const fetchData = async () => {
    const decodedToken = jwtDecode(token);
    const UserId = decodedToken?.UserId;
    const response = await axios.post(
      `${baseURL}ArticleDashboard/GetUserInboxGroupInfoByCustomerandProject`,
      {
        "LoggedUserId": UserId,
        "Params": {
          "CustomerId": customerId,
          "ProjectId": projectId
        }
      }
    );

    let resData = response.data.Data;
    if (resData?.Groups && resData.Groups.length > 0) {
      const defaultGroup = resData.Groups[0];

      const defaultPostTypeId =
        defaultGroup?.ArticleInfo?.[0]?.PostTypeId || null;

      setSelectedGroupId(defaultGroup.GroupId);
      setSelectedGroup(defaultGroup);
      setSelectedTab(defaultPostTypeId);

      setSelectedArticle({
        groupId: defaultGroup.GroupId,
        postTypeId: defaultPostTypeId,
        ConversationId: defaultGroup?.ConversationId || "",
        actionId: 0,
        title: "",
        InboxItemId: 0,
        InboxItemTypeId: 0,
      });
    }
    setListResponse(resData?.Groups);
  };
 

  useEffect(() => {
    fetchData();
  }, [projectId, customerId]);

  const handleUpdateData = () => {
    setClearTrigger(prev => !prev); // This will trigger the useEffect in MainContent.js to fetch new data
  };

  useEffect(() => {
    // Clear search value automatically when switching tabs
    setSearchTerm("");
    setSubmittedSearchTerm("");
  }, [selectedTab]);
  return (
    <div style={{ background: "#F0F0F0" }} id="knol-categoryTab">
      <div
        component="main"
        style={{
          flexGrow: 1,
          padding: "5px",
          paddingBottom: "16px",
          overflow: "auto",
          backgroundColor: "#F0F0F0",
          minHeight: "100vh", // Replicates `min-h-screen`
        }}
        bgcolor="#F0F0F0"
        className="min-h-screen"
      >
        <div
          align="center"
          justify="space-between"
          style={{ margin: "8px 0", display: 'flex' }}
        >
          <Tabs
            style={{ textAlign: "left" }}
            className="knoltab-slection"
            dataSource={tabItems}
            selectedIndex={tabItems.findIndex((tab) => tab.PostTypeId === selectedTab)}
            onItemClick={handleTabChange}
            itemRender={(item) => (
              <div className="category-tab"
                style={{
                  fontSize: "13px",
                  padding: "0 10px",
                  minWidth: "40px",
                  minHeight: "25px",
                  color: item.PostTypeId === selectedTab ? "#ffffff" : "black",
                  backgroundColor:
                    item.PostTypeId === selectedTab ? "#121559" : "transparent",
                  margin: "0 10px 0 0",
                  textTransform: "capitalize",
                  fontWeight: "bold",
                  border: "1px solid #113E70",
                  borderRadius: "3px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {item.text}
              </div>
            )}
          />
        </div>
        <div
          className="flex flex-col md:flex-row gap-5"
          style={{ height: "90vh", display: "flex" }}
        >
          {isMainContentVisible && (
            <div
              className="w-full md:w-1/4 bg-white left_art"
              style={{
                height: "calc(90vh - 50px)",
                // overflowY: "auto",
              }}
            >
              <MainContent
                selectedArticle={selectedArticle}
                onSelectArticle={setSelectedArticle}
                clearTrigger={clearTrigger} // Pass trigger to reset search field
                searchValue={submittedSearchTerm}
                baseURL={baseURL}
                UserId={UserId}
                projectId={projectId}
                onUpdateData={handleUpdateData} // Pass the callback
              />
            </div>
          )}

          <div
            className="flex-1 bg-white right_art"
            style={{
              height: "calc(90vh - 50px)",
              overflowY: "auto",
            }}
          >
            <ArticleDetails
              selectedArticle={selectedArticle}
              toggleMainContent={toggleMainContent}
              isArrowBack={isArrowBack}
              knowledgebaseId={knowledgebaseId}
              searchValue={submittedSearchTerm}
              clearTrigger={clearTrigger}
              baseURL={baseURL}
              UserId={UserId}
              projectId={projectId}
              onUpdateData={handleUpdateData} // Pass the callback
              />
          </div>
        </div>
      </div>
    </div>
  );
}
