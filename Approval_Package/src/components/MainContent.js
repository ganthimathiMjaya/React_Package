
import DataGrid, {
  Column,
  Paging,
  FilterRow,
  HeaderFilter,
  SearchPanel,
  Editing, Selection,
} from "devextreme-react/data-grid";
import "devextreme/dist/css/dx.light.css";
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import 'devextreme/dist/css/dx.light.css';
import { TabPanel } from "devextreme-react/tab-panel";
import "../components/MainContent.css";

export const MainContent = ({ selectedArticle, onSelectArticle,clearTrigger, baseURL, UserId,projectId, onUpdateData }) => {
  const { groupId = null, postTypeId = null, actionId = null, ConversationId = null, title = "", InboxItemId = null } = selectedArticle || {};
  const [selectedTab, setSelectedTab] = useState(0);
  const [userSelectedTab, setUserSelectedTab] = useState(false); // Track manual selection
  const [articleListResponse, setArticleListResponse] = useState([]);
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(InboxItemId);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [initialArticleOpened, setInitialArticleOpened] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

 
  const fetchData = async () => {
    try {
      const response = await axios.post(`${baseURL}ArticleDashboard/GetApprovalPostList`,

      // const response = await axios.post(`${baseURL}ArticleDashboard/GetInboxItems`,
        {
          LoggedUserId: UserId,
          params: {
            ProjectId: projectId,
            PostTypeId: postTypeId
          
          }
        }
      );
      let resData = response.data.Data;
      setArticleListResponse(resData);
    } catch (error) {
      console.error('Error making API call:', error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [selectedArticle, projectId]);

  const handleUpdateData = () => {
    fetchData(); // This will refresh the data
  };

  const handleTabChange = (selectedIndex) => {
    setUserSelectedTab(true); // Mark as manually changed
    setSelectedArticleId(null);
    setSearchInput(""); // Clear SearchPanel input value

    setInitialArticleOpened(false);
    setSelectedTab(selectedIndex);
    onSelectArticle((prevArticle) => ({
      ...prevArticle,
      InboxItemId: 0,
      InboxItemTypeId: 0,
    }));
  };

  const handlePageChange = (e) => {
    if (e.fullName === "searchPanel.text") {
      setSearchInput(e.value);
    }
    if (e.fullName === "paging.pageIndex" || e.fullName === "paging.pageSize") {
      setSelectedArticleId(null);
      fetchData();
      // onSelectArticle({
      //   groupId: null,
      //   postTypeId: null,
      //   actionId: 0,
      //   ConversationId: "",
      //   title: "",
      //   InboxItemId: 0,
      //   InboxItemTypeId: 0,
      // });
    }
  };

  const handleArticleClick = async (article, action) => {
    setSelectedArticleId(article.Id);

    setClickedArticle(article.Id);
    onSelectArticle({
      groupId: article.GroupId,
      postTypeId: article.PostTypeId,
      actionId: 0,
      WorkflowStatusId: article.WorkflowStatusId,
      ConversationId,
      title: article.Title,
      InboxItemId: article.Id,
      InboxItemTypeId: article.PostTypeId,
    });
    try {
      const response = await axios.post(`${baseURL}Article/SubmitUserAction`, {
        params: {
          PostId: article.Id,
          UserId: UserId,
          Action: action
        }
      });
    } catch (error) {
      console.error("Error submitting user action: ", error);
    }

  };
  const pendingApproval = Array.isArray(articleListResponse?.KnolApprovalPending)
  ? articleListResponse.KnolApprovalPending.filter(article => 
      article.Title.toLowerCase().includes(searchInput.toLowerCase())
    )
  : [];

const approved = Array.isArray(articleListResponse?.KnolApprovedPost)
  ? articleListResponse.KnolApprovedPost.filter(article => 
     article.Title.toLowerCase().includes(searchInput.toLowerCase())
    )
  : [];

  const sortArticles = (articles) => {
    return articles.sort((a, b) => {
      if (sortBy === 'title') {
        return a.Title.localeCompare(b.Title);
      } else if (sortBy === 'date') {
        return new Date(b.Createddate) - new Date(a.Createddate);
      }
      return 0;
    });
  };

  const filteredArticles = selectedTab === 0
  ? sortArticles(pendingApproval)
  : selectedTab === 1
    ? sortArticles(approved)
    : [];


  const tabs = [
    { id: 0, title: `Approval Pending (${pendingApproval.length})` },
    { id: 1, title: `Approved (${approved.length})` },
  ];

  useEffect(() => {
    if (articleListResponse.length === 0 || userSelectedTab) return; // Don't override manual selection

    const pendingApproval = Array.isArray(articleListResponse?.KnolApprovalPending)
    ? articleListResponse.KnolApprovalPending.filter(article => 
        article.Title.toLowerCase().includes(searchInput.toLowerCase())
      )
    : [];
  
  const approved = Array.isArray(articleListResponse?.KnolApprovedPost)
    ? articleListResponse.KnolApprovedPost.filter(article => 
         article.Title.toLowerCase().includes(searchInput.toLowerCase())
      )
    : [];

    setInitialArticleOpened(false); 
  }, [articleListResponse, searchInput, selectedTab, userSelectedTab, projectId]);


  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [clearTrigger, groupId, projectId, selectedTab]);

  useEffect(() => {
    setSearchInput("");
  }, [selectedTab]);

  useEffect(() => {
    setSearchInput(""); 
  }, [clearTrigger]);


  return (
    <div id="Knol-MainContent"
      style={{
        minWidth: 300,
        boxShadow: "-5px 0 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1,
      }}
    >
      <div style={{ padding: "0", border: '2px solid #ccc', margin: '10px' }}>
        <TabPanel
          dataSource={tabs}
          selectedIndex={selectedTab}
          onSelectionChanged={(e) => handleTabChange(e.component.option("selectedIndex"))}
          showNavButtons={true}
          loop={true}
          animationEnabled={true}
          focusStateEnabled={false}
        />
      </div>


      <div style={{ marginTop: "16px", paddingLeft: '10px', paddingRight: '10px' }}>
        <DataGrid className="article_datagrid" style={{ width: '100%' }} 
        // onOptionChanged={(e) => {
        //   if (e.fullName === "searchPanel.text") {
        //     setSearchInput(e.value);
        //   }
        // }}
        onOptionChanged={handlePageChange}  // Listen for page change events

          dataSource={filteredArticles}
          keyExpr="Id"
          id="articleLatestList"
          // key={searchInput}
          showBorders={true}
          rowAlternationEnabled={true}
          onRowClick={(e) => handleArticleClick(e.data)}
          focusedRowEnabled={true}
          focusedRowKey={selectedArticleId}
        >
          <SearchPanel visible={true} 
            value={searchInput}
            text={searchInput}
            className="articleInput"
          />
          <HeaderFilter visible={true} />
          <Paging
                    defaultPageSize={15}
                    />          <Selection mode="single" />

          <Column dataField="Title" caption="" dataType="string" width={250} />

        </DataGrid>
      </div>

    </div>
  );
};

export default MainContent;
