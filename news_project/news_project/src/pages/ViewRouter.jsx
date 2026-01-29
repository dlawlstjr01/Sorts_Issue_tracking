import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import IssuesPage from "./issues/IssuesPage";
import ReportsPage from "./reports/ReportsPage";
import ArchivePage from "./archive/ArchivePage";
import SupportPage from "./support/SupportPage";
import LoginPage from "./auth/LoginPage";

export default function ViewRouter() {
  const location = useLocation();

  const view = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("view") || "issues";
  }, [location.search]);

  if (view === "issues") return <IssuesPage />;
  if (view === "reports") return <ReportsPage />;
  if (view === "archive") return <ArchivePage />;
  if (view === "support") return <SupportPage />;
  if (view === "login") return <LoginPage />;

  return <IssuesPage />;
}
