import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  return (
    <div className="page my-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="\uB4A4\uB85C\uAC00\uAE30"
        >
          {"\uB4A4\uB85C\uAC00\uAE30"}
        </button>
        <div className="pageTitle">마이페이지</div>
        <div className="pageDesc">개인 정보를 확인하고 수정할 수 있습니다.</div>
      </div>

      <div className="my-grid">
        <section className="my-card">
          <h3 className="my-section-title">계정 정보</h3>
          <div className="my-form">
            <label className="login-label">
              아이디
              <input
                className="login-input"
                type="text"
                defaultValue="teamzero_user"
                readOnly
                aria-readonly="true"
              />
            </label>
          </div>
        </section>

        <section className="my-card">
          <h3 className="my-section-title">기본 정보</h3>
          <div className="my-form">
            <label className="login-label">
              이름
              <input className="login-input" type="text" defaultValue="홍길동" />
            </label>
            <label className="login-label">
              이메일
              <input className="login-input" type="email" defaultValue="name@company.com" />
            </label>
            <label className="login-label">
              휴대폰 번호
              <input className="login-input" type="tel" defaultValue="010-0000-0000" />
            </label>
            <label className="login-label">
              생년월일
              <input className="login-input" type="date" />
            </label>
          </div>
        </section>

        <section className="my-card">
          <h3 className="my-section-title">보안 설정</h3>
          <div className="my-form">
            <label className="login-label">
              현재 비밀번호
              <input className="login-input" type="password" placeholder="현재 비밀번호" />
            </label>
            <label className="login-label">
              새 비밀번호
              <input className="login-input" type="password" placeholder="새 비밀번호" />
            </label>
            <label className="login-label">
              새 비밀번호 확인
              <input className="login-input" type="password" placeholder="새 비밀번호 재입력" />
            </label>
          </div>
        </section>

        <section className="my-card">
          <h3 className="my-section-title">알림/수신 설정</h3>
          <div className="my-form">
            <label className="login-check">
              <input type="checkbox" defaultChecked />
              <span>이메일 요약 브리핑 수신</span>
            </label>
            <label className="login-check">
              <input type="checkbox" />
              <span>주간 리포트 수신</span>
            </label>
            <label className="login-check">
              <input type="checkbox" defaultChecked />
              <span>핫이슈 푸시 알림</span>
            </label>
          </div>
        </section>
      </div>

      <div className="my-actions">
        <button className="login-btn primary" type="button">저장</button>
        <button className="login-btn" type="button">취소</button>
      </div>
    </div>
  );
}
