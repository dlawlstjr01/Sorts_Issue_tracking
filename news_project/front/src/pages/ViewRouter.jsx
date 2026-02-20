import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import IssuesPage from "./issues/IssuesPage";
import IssueDetailPage from "./issues/IssueDetailPage";
import ReportsPage from "./reports/ReportsPage";
import ReportsDetailPage from "./reports/ReportsDetailPage";
import ArchivePage from "./archive/ArchivePage";
import SupportPage from "./support/SupportPage";
import LoginPage from "./auth/LoginPage";
import SignupPage from "./auth/SignupPage";
import PasswordResetPage from "./auth/PasswordResetPage";
import MyPage from "./user/MyPage";
import MainPage from "./MainPage";


export default function ViewRouter() {
  const location = useLocation();

  const view = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("view") || "main";
  }, [location.search]);

  if (view === "issues") return <IssuesPage />;
  if (view === "issue") return <IssueDetailPage />;
  if (view === "reports") return <ReportsPage />;
  if (view === "report") return <ReportsDetailPage />;
  if (view === "archive") return <ArchivePage />;
  if (view === "support") return <SupportPage />;
  if (view === "login") return <LoginPage />;
  if (view === "signup") return <SignupPage />;
  if (view === "password") return <PasswordResetPage />;
  if (view === "mypage") return <MyPage />;
  if (view === "main") return <MainPage />;


  return <MainPage />;
}
