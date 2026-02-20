import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);
  const [showIdResult, setShowIdResult] = useState(false);
  const [showResetResult, setShowResetResult] = useState(false);

  return (
    <div className="page login-page password-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="\uB4A4\uB85C\uAC00\uAE30"
        >
          {"\uB4A4\uB85C\uAC00\uAE30"}
        </button>
        <div className="pageTitle">아이디/비밀번호 찾기</div>
        <div className="pageDesc">아이디 찾기 또는 비밀번호 재설정을 진행하세요.</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
          <section className="login-card">
            <form className="login-form">
              <div className="login-section-title">아이디 찾기</div>
              <label className="login-label">
                이름
                <input className="login-input" type="text" placeholder="홍길동" />
              </label>

              <label className="login-label">
                휴대폰 번호
                <input className="login-input" type="tel" placeholder="010-0000-0000" />
              </label>

              <button
                className="login-btn primary"
                type="button"
                onClick={() => setShowIdResult(true)}
              >
                아이디 확인하기
              </button>

              {showIdResult && (
                <div className="login-result">
                  입력하신 정보로 확인된 아이디는 <strong>teamzero_user</strong> 입니다.
                </div>
              )}

              <div className="login-divider">
                <span>또는</span>
              </div>

              <div className="login-section-title">비밀번호 찾기</div>
              <label className="login-label">
                아이디
                <input className="login-input" type="text" placeholder="아이디 입력" />
              </label>

              <label className="login-label">
                이메일
                <input className="login-input" type="email" placeholder="name@company.com" />
              </label>

              <button
                className="login-btn primary"
                type="button"
                onClick={() => setShowResetResult(true)}
              >
                재설정 링크 보내기
              </button>

              {showResetResult && (
                <div className="login-result">
                  재설정 링크를 이메일로 전송했습니다. 받은편지함을 확인해 주세요.
                </div>
              )}

              <div className="login-row center">
                <span className="login-muted">로그인 화면으로 돌아가기</span>
                <button className="login-link" type="button" onClick={() => go("login")}>
                  로그인
                </button>
              </div>
            </form>
          </section>

          <section className="login-side">
            <div className="login-side-card">
              <div className="login-side-badge">NEWS Issue Tracker</div>
              <h2 className="login-side-title">계정을 안전하게 복구하세요</h2>
              <p className="login-side-desc">
                등록된 이메일을 확인하면 재설정 링크를 전송합니다.
                링크는 일정 시간 후 만료됩니다.
              </p>
              <ul className="login-side-list">
                <li>간편한 이메일 인증</li>
                <li>안전한 비밀번호 재설정</li>
                <li>새로운 기기에서도 즉시 로그인</li>
              </ul>
            </div>
          
          </section>
          </div>
          <aside className="login-side-menu">
            <SideMenuCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
