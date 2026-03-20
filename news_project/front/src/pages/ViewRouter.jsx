import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import IssuesDetailPage from "./issues/IssuesDetailPage";
import IssuesPage from "./issues/IssuesPage";
import ArchivePage from "./archive/ArchivePage";
import SupportPage from "./support/SupportPage";
import LoginPage from "./auth/LoginPage";
import SignupPage from "./auth/SignupPage";
import PasswordResetPage from "./auth/PasswordResetPage";
import MyPage from "./user/MyPage";
import MainPage from "./MainPage";
import ArticleListPage from "./article/ArticleListPage";
import ArticleDetailPage from "./article/ArticleDetailPage";


export default function ViewRouter() {
  const location = useLocation();

  const view = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("view") || "main";
  }, [location.search]);

  if (view === "issue-report") return <IssuesPage />;
  if (view === "issues") return <IssuesDetailPage />;
  if (view === "archive") return <ArchivePage />;
  if (view === "support") return <SupportPage />;
  if (view === "login") return <LoginPage />;
  if (view === "signup") return <SignupPage />;
  if (view === "password") return <PasswordResetPage />;
  if (view === "mypage") return <MyPage />;
  if (view === "article-list") return <ArticleListPage />;
  if (view === "article") return <ArticleDetailPage />;
  if (view === "main") return <MainPage />;


  return <MainPage />;
}
