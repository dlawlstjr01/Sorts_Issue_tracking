const ISSUE_LIST = [];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const priorityByCategory = (category) => {
  if (category === "정책") return "높음";
  if (category === "경제" || category === "규제") return "중간";
  return "낮음";
};

const severityByStatus = (status) => {
  if (status === "분석중") return "위험";
  if (status === "모니터링") return "경고";
  return "보통";
};

const hydrateIssue = (issue) => ({
  ...issue,
  priority: priorityByCategory(issue.category),
  severity: severityByStatus(issue.status),
});

export async function getIssues() {
  await delay(200);
  return ISSUE_LIST.map(hydrateIssue);
}

export async function getIssueById(id) {
  await delay(200);
  const found = ISSUE_LIST.find((issue) => issue.id === id);
  return found ? hydrateIssue(found) : null;
}
