import React, { useEffect, useState } from "react";
import SideMenuCard from "../../components/SideMenuCard";
import { fetchNotices } from "../../api/newsApi";

const FAQS = [
  {
    q: "아이디 또는 비밀번호를 잊어버렸어요.",
    a: "로그인 화면의 아이디/비밀번호 찾기 메뉴에서 등록한 이메일로 안내를 받을 수 있습니다.",
  },
  {
    q: "알림 설정은 어디에서 변경하나요?",
    a: "마이페이지의 알림 설정 메뉴에서 관심 카테고리와 알림 주기를 직접 변경할 수 있습니다.",
  },
  {
    q: "요약 결과가 어색할 때는 어떻게 하나요?",
    a: "고객센터 1:1 문의로 예시를 보내주시면 품질 개선에 반영할 수 있도록 확인합니다.",
  },
  {
    q: "기사 저장과 공유는 어떻게 하나요?",
    a: "기사 상세 화면의 저장, 공유 버튼으로 바로 이용할 수 있습니다.",
  },
];

const INQUIRY_HISTORY = [
  {
    id: 1,
    status: "진행중",
    category: "일반 문의",
    title: "로그인 오류 문의",
    date: "2026-02-01",
    message: "로그인 후 메인 화면으로 이동하지 않고 다시 로그인 페이지로 돌아와 문의를 남겼습니다.",
  },
  {
    id: 2,
    status: "답변완료",
    category: "알림 설정",
    title: "알림 설정 변경 문의",
    date: "2026-01-25",
    message: "마이페이지에서 알림 빈도를 바꿨는데 바로 반영되지 않는 것 같아 확인을 요청했습니다.",
    answer: {
      title: "알림 설정 반영 안내",
      body: "확인 결과 일부 계정에서 설정 저장 직후 반영이 최대 5분 정도 지연되는 현상이 있었습니다. 현재는 수정이 완료되어 다시 저장하면 즉시 적용되며, 기존 설정도 정상 반영된 상태입니다.",
      answeredAt: "2026-01-26",
    },
  },
  {
    id: 3,
    status: "답변완료",
    category: "요약 문의",
    title: "요약 결과 피드백 전달",
    date: "2026-01-19",
    message: "메인 화면 요약문에서 문장 중복과 어색한 표현이 보여 예시와 함께 개선 요청을 보냈습니다.",
    answer: {
      title: "요약 품질 개선 적용 완료",
      body: "보내주신 사례를 기준으로 중복 문장 제거와 문맥 점수 보정을 적용했습니다. 이후 생성되는 요약부터 우선 반영되며, 기존 저장 요약도 순차적으로 재생성하고 있습니다.",
      answeredAt: "2026-01-20",
    },
  },
];

const TABS = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "자주 묻는 질문 (FAQ)" },
  { id: "inquiry", label: "1:1 문의" },
];

function formatDate(raw) {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw).slice(0, 10);
  return date.toLocaleDateString("ko-KR");
}

function InquiryHistoryRow({ item, isOpen, onToggle }) {
  const isAnswered = Boolean(item.answer);

  return (
    <div className={`support-table-entry ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className={`support-table-row ${isAnswered ? "expandable" : ""} ${isOpen ? "open" : ""}`}
        onClick={() => {
          if (!isAnswered) return;
          onToggle(item.id);
        }}
        aria-expanded={isAnswered ? isOpen : undefined}
        disabled={!isAnswered}
      >
        <span className={`support-status ${item.status === "진행중" ? "pending" : "done"}`}>
          {item.status}
        </span>
        <span>{item.category}</span>
        <span className="support-table-title-wrap">
          <span className="support-table-title">{item.title}</span>
          {isAnswered ? (
            <span className={`support-table-detail-link ${isOpen ? "open" : ""}`}>
              답변 확인
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                  d="m7 10 5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : (
            <span className="support-table-detail-link pending">답변 준비 중</span>
          )}
        </span>
        <span className="support-table-date">{item.date}</span>
      </button>

      {isAnswered && isOpen ? (
        <div className="support-inquiry-card">
          <div className="support-inquiry-card-head">
            <span className="support-inquiry-card-badge">답변완료</span>
            <span className="support-inquiry-card-date">{item.answer.answeredAt}</span>
          </div>

          <div className="support-inquiry-card-block">
            <div className="support-inquiry-card-label">문의 내용</div>
            <div className="support-inquiry-card-text">{item.message}</div>
          </div>

          <div className="support-inquiry-card-block answer">
            <div className="support-inquiry-card-label">{item.answer.title}</div>
            <div className="support-inquiry-card-text">{item.answer.body}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SupportPage() {
  const [tab, setTab] = useState("notice");
  const [openedInquiryId, setOpenedInquiryId] = useState(null);

  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeError, setNoticeError] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setNoticeLoading(true);
        setNoticeError("");

        const res = await fetchNotices();
        const rows = Array.isArray(res?.data) ? res.data : [];

        setNotices(rows);
      } catch (error) {
        console.error("공지사항 조회 실패:", error);
        setNoticeError("요청 실패");
      } finally {
        setNoticeLoading(false);
      }
    };

    loadNotices();
  }, []);

  return (
    <div className="page support-page">
      <div className="support-layout">
        <section className="support-main">
          <div className="support-title">고객센터</div>

          <div className="support-tabs">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`support-tab ${tab === item.id ? "active" : ""}`}
                onClick={() => {
                  setTab(item.id);
                  if (item.id !== "inquiry") setOpenedInquiryId(null);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "notice" && (
            <>
              {noticeError && <div className="support-alert">{noticeError}</div>}

              <div className="support-panel">
                {noticeLoading ? (
                  <div className="support-empty">공지사항을 불러오는 중입니다.</div>
                ) : notices.length === 0 ? (
                  <div className="support-empty">공지사항이 없습니다.</div>
                ) : (
                  <div className="support-notice-list">
                    {notices.map((notice) => (
                      <div key={notice.id} className="support-notice-item">
                        <div className="support-notice-title">{notice.title}</div>
                        <div className="support-notice-date">
                          {formatDate(notice.created_at || notice.date)}
                        </div>
                        <div className="support-notice-content">{notice.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "faq" && (
            <div className="support-panel">
              <div className="support-panel-title">자주 묻는 질문</div>
              <div className="support-faq-list">
                {FAQS.map((item) => (
                  <div key={item.q} className="support-faq-item">
                    <div className="support-faq-q">{item.q}</div>
                    <div className="support-faq-a">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "inquiry" && (
            <div className="support-stack">
              <div className="support-panel">
                <div className="support-panel-title">문의 작성</div>
                <div className="support-form">
                  <div className="support-form-row">
                    <select className="support-select" defaultValue="일반 문의">
                      <option>일반 문의</option>
                      <option>계정/로그인</option>
                      <option>알림</option>
                      <option>요약</option>
                      <option>버그 신고</option>
                    </select>
                    <input className="support-input" type="text" placeholder="제목을 입력해주세요." />
                  </div>
                  <textarea className="support-textarea" placeholder="문의 내용을 자세히 작성해주세요." />
                  <div className="support-form-actions">
                    <button className="support-submit" type="button">
                      문의하기
                    </button>
                  </div>
                </div>
              </div>

              <div className="support-panel">
                <div className="support-panel-title">나의 문의 내역</div>
                <div className="support-table">
                  <div className="support-table-head">
                    <span>상태</span>
                    <span>분류</span>
                    <span>제목</span>
                    <span>작성일</span>
                  </div>
                  <div className="support-table-body">
                    {INQUIRY_HISTORY.length === 0 ? (
                      <div className="support-table-empty">문의 내역이 없습니다.</div>
                    ) : (
                      INQUIRY_HISTORY.map((item) => (
                        <InquiryHistoryRow
                          key={item.id}
                          item={item}
                          isOpen={openedInquiryId === item.id}
                          onToggle={(id) => setOpenedInquiryId((prev) => (prev === id ? null : id))}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="support-side">
          <SideMenuCard collapsible showScrollTop />
        </aside>
      </div>
    </div>
  );
}