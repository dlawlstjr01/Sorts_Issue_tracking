import React from "react";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function SignupPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  return (
    <div className="page signup-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="\uB4A4\uB85C\uAC00\uAE30"
        >
          {"\uB4A4\uB85C\uAC00\uAE30"}
        </button>
        <div className="pageTitle">회원가입</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
          <section className="login-card">
            <form className="login-form">
              <label className="login-label">
                아이디
                <div className="login-inline">
                  <input className="login-input" type="text" placeholder="아이디 입력" />
                  <button className="login-btn ghost login-check-btn" type="button">
                    중복확인
                  </button>
                </div>
              </label>

              <label className="login-label">
                이름
                <input className="login-input" type="text" placeholder="홍길동" />
              </label>

              <label className="login-label">
                이메일
                <input className="login-input" type="email" placeholder="name@company.com" />
              </label>

              <label className="login-label">
                비밀번호
                <input className="login-input" type="password" placeholder="8자 이상 입력" />
              </label>

              <label className="login-label">
                비밀번호 확인
                <input className="login-input" type="password" placeholder="비밀번호 재입력" />
              </label>

              <label className="login-label">
                휴대폰 번호
                <input className="login-input" type="tel" placeholder="010-0000-0000" />
              </label>

              <label className="login-label">
                생년월일
                <input className="login-input" type="date" />
              </label>

              <div className="login-row">
                <label className="login-check">
                  <input type="checkbox" />
                  <span>이메일 수신 동의</span>
                </label>
                <label className="login-check">
                  <input type="checkbox" />
                  <span>서비스 이용약관 동의</span>
                </label>
              </div>

              <button className="login-btn primary" type="button" onClick={() => go("login")}>
                가입 완료
              </button>

              <div className="login-row center">
                <span className="login-muted">이미 계정이 있나요?</span>
                <button className="login-link" type="button" onClick={() => go("login")}>
                  로그인
                </button>
              </div>
            </form>
          </section>

          <section className="login-side">
            <div className="login-side-card">
              <div className="login-side-badge">NEWS Issue Tracker</div>
              <h2 className="login-side-title">맞춤형 이슈 관리 시작</h2>
              <p className="login-side-desc">
                관심 분야와 알림 기준을 설정하면 핵심 기사만 빠르게 모아볼 수 있습니다.
              </p>
              <ul className="login-side-list">
                <li>카테고리별 주요 이슈 추적</li>
                <li>AI 요약 기반 핵심 브리핑</li>
                <li>팀 공유용 북마크/메모</li>
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
