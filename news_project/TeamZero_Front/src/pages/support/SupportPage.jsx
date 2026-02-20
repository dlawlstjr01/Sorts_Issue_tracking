import React, { useState } from "react";
import SideMenuCard from "../../components/SideMenuCard";

const FAQS = [
  {
    q: "아이디/비밀번호를 잊어버렸어요.",
    a: "로그인 화면의 ‘아이디/비밀번호 찾기’에서 이메일 인증으로 복구할 수 있습니다.",
  },
  {
    q: "알림을 끄거나 요약 브리핑을 변경하려면?",
    a: "마이페이지의 ‘알림/수신 설정’에서 이메일/푸시 수신을 켜고 끌 수 있습니다.",
  },
  {
    q: "관심 카테고리는 어디서 설정하나요?",
    a: "이슈 추적 화면의 카테고리에서 즐겨찾기 설정을 하면 맞춤 피드에 반영됩니다.",
  },
  {
    q: "기사를 저장하고 공유하는 방법은?",
    a: "기사 상세의 ‘저장’ 버튼으로 보관하고, ‘공유’로 팀원과 링크를 전달하세요.",
  },
];

const NOTICE_LIST = [];

const INQUIRY_HISTORY = [
  {
    id: 1,
    status: "진행중",
    category: "일반 문의",
    title: "로그인 오류 문의",
    date: "2026-02-01",
  },
  {
    id: 2,
    status: "답변완료",
    category: "알림 설정",
    title: "알림 설정 변경 문의",
    date: "2026-01-25",
  },
  {
    id: 3,
    status: "답변완료",
    category: "요약 문의",
    title: "요약 결과 피드백 전달",
    date: "2026-01-19",
  },
];

const TABS = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "자주 묻는 질문 (FAQ)" },
  { id: "inquiry", label: "1:1 문의" },
];

export default function SupportPage() {
  const [tab, setTab] = useState("notice");

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
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "notice" && (
        <>
          <div className="support-alert">요청 실패</div>
          <div className="support-panel">
            {NOTICE_LIST.length === 0 ? (
              <div className="support-empty">공지사항이 없습니다.</div>
            ) : (
              <div className="support-notice-list">
                {NOTICE_LIST.map((notice) => (
                  <div key={notice.id} className="support-notice-item">
                    <div className="support-notice-title">{notice.title}</div>
                    <div className="support-notice-date">{notice.date}</div>
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
                <input
                  className="support-input"
                  type="text"
                  placeholder="제목을 입력하세요"
                />
              </div>
              <textarea
                className="support-textarea"
                placeholder="문의 내용을 자세히 작성해주세요."
              />
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
                    <div key={item.id} className="support-table-row">
                      <span className={`support-status ${item.status === "진행중" ? "pending" : "done"}`}>
                        {item.status}
                      </span>
                      <span>{item.category}</span>
                      <span className="support-table-title">{item.title}</span>
                      <span className="support-table-date">{item.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </section>
        <aside className="support-side">
          <SideMenuCard />
        </aside>
      </div>
    </div>
  );
}
