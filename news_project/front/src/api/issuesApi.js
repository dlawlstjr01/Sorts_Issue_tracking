const ISSUE_LIST = [
  {
    id: "ISS-001",
    title: "정책 발표 이후 시장 반응 급등",
    category: "정책",
    status: "모니터링",
    updatedAt: "오늘",
    summary: "핵심 발표 이후 투자 심리가 급변하며 변동성 확대.",
    detail: {
      why: "정책 방향성과 수치 해석 차이가 커서 시장이 재평가 국면으로 진입.",
      now: "시장 반응이 업종별로 분화되고 있고, 추가 발언/지표에 민감하게 반응 중.",
      next: "추가 브리핑, 주요 지표 발표, 해외 시장 동조 여부를 관찰할 필요.",
      summary: "정책 발표 이후 단기 금리 기대가 바뀌며 변동성이 확대되었습니다.",
      highlights: [
        "정책 발표 직후 거래량 급증",
        "관련 업종 변동성 확대",
        "해외 시장과의 동조성 강화",
      ],
      timeline: [
        { time: "10:20", event: "정책 발표", source: "연합뉴스" },
        { time: "10:35", event: "시장 급등락", source: "Reuters" },
        { time: "11:05", event: "전문가 코멘트 확산", source: "BBC" },
      ],
      evidence: [
        {
          sum: "발표 직후 금리 경로가 재조정됨",
          ev: "선물 금리 기대치가 급격히 변화했다",
          source: "Reuters",
        },
        {
          sum: "업종별 변동성이 크게 차이남",
          ev: "방어주는 견조, 성장주는 변동 확대",
          source: "BBC",
        },
      ],
      keywords: ["금리", "정책", "증시", "브리핑"],
    },
  },
  {
    id: "ISS-002",
    title: "공급망 리스크 재부각",
    category: "산업",
    status: "분석중",
    updatedAt: "어제",
    summary: "핵심 부품 수급 이슈로 일부 업종 생산 차질.",
    detail: {
      why: "원자재 수급 문제와 물류 지연이 동시에 발생.",
      now: "핵심 부품의 재고가 감소하고 대체 공급이 지연됨.",
      next: "대체 공급망 확보 여부와 정책 대응을 관찰.",
      summary: "공급망 리스크가 재부각되며 주요 생산 일정이 조정 중입니다.",
      highlights: ["핵심 부품 재고 감소", "대체 공급 지연", "생산 차질 확대"],
      timeline: [
        { time: "D-3", event: "물류 지연 확대", source: "업계 리포트" },
        { time: "D-2", event: "재고 감소 확인", source: "기업 공시" },
        { time: "D-1", event: "대체 공급 협상", source: "시장 뉴스" },
      ],
      evidence: [
        {
          sum: "재고 지표가 급락",
          ev: "핵심 부품 재고가 2주 연속 감소했다",
          source: "기업 공시",
        },
      ],
      keywords: ["공급망", "물류", "재고"],
    },
  },
  {
    id: "ISS-003",
    title: "금리 인상 기조 지속",
    category: "경제",
    status: "요약완료",
    updatedAt: "2일 전",
    summary: "인플레이션 압력으로 금리 인상 가능성 유지.",
    detail: {
      why: "인플레이션 지표가 목표 범위 상단을 유지.",
      now: "시장 기대치는 추가 인상 가능성에 무게.",
      next: "중앙은행 발언과 CPI 발표를 모니터링.",
      summary: "금리 인상 기조가 유지되며 시장의 경계 심리가 높습니다.",
      highlights: ["인플레이션 둔화 속도 제한", "채권 금리 상승", "소비 심리 위축"],
      timeline: [
        { time: "D-5", event: "CPI 발표", source: "통계청" },
        { time: "D-3", event: "중앙은행 연설", source: "정책 브리핑" },
        { time: "D-1", event: "시장 예상치 상향", source: "금융지표" },
      ],
      evidence: [
        {
          sum: "CPI 지표가 높은 수준 유지",
          ev: "핵심 CPI가 목표치 상단을 지속",
          source: "통계청",
        },
      ],
      keywords: ["금리", "인플레이션", "CPI"],
    },
  },
  {
    id: "ISS-004",
    title: "신기술 규제 논의 확대",
    category: "규제",
    status: "분석중",
    updatedAt: "3일 전",
    summary: "관련 법안 초안 공개로 업계 반응 집중.",
    detail: {
      why: "규제 범위와 책임 주체에 대한 논의 확대.",
      now: "업계 의견 수렴 단계에서 쟁점이 부각.",
      next: "법안 세부 조항과 시행 일정이 확정될 예정.",
      summary: "신기술 규제 논의가 본격화되며 이해관계자 의견이 집중되고 있습니다.",
      highlights: ["법안 초안 공개", "산업계 의견 제출", "시행 일정 논의"],
      timeline: [
        { time: "D-7", event: "법안 초안 공개", source: "정부 발표" },
        { time: "D-5", event: "산업계 의견 수렴", source: "협회 공지" },
        { time: "D-2", event: "공청회 일정 발표", source: "국회" },
      ],
      evidence: [
        {
          sum: "초안 공개로 의견 수렴 시작",
          ev: "업계는 규제 범위 축소를 요구",
          source: "협회 공지",
        },
      ],
      keywords: ["규제", "법안", "산업계"],
    },
  },
];

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
