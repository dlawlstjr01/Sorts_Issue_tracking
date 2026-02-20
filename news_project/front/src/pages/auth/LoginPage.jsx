import React from "react";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function LoginPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  return (
    <div className="page login-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="\uB4A4\uB85C\uAC00\uAE30"
        >
          {"\uB4A4\uB85C\uAC00\uAE30"}
        </button>
        <div className="pageTitle">로그인</div>
        <div className="pageDesc">뉴스 이슈 추적을 위한 개인화 서비스를 이용하세요.</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
            <section className="login-card">
              <form className="login-form">
                <label className="login-label">
                  아이디
                  <input className="login-input" type="text" placeholder="아이디 입력" />
                </label>

                <label className="login-label">
                  비밀번호
                  <input className="login-input" type="password" placeholder="비밀번호 입력" />
                </label>

                <div className="login-row">
                  <label className="login-check">
                    <input type="checkbox" />
                    <span>자동 로그인</span>
                  </label>
                  <button className="login-link" type="button" onClick={() => go("password")}>
                    아이디/비밀번호 찾기
                  </button>
                </div>

                <button className="login-btn primary" type="button" onClick={() => go("mypage")}>
                  로그인
                </button>

                <div className="login-row center">
                  <span className="login-muted">아직 계정이 없나요?</span>
                  <button className="login-link" type="button" onClick={() => go("signup")}>
                    회원가입
                  </button>
                </div>

                <div className="login-divider">
                  <span>또는</span>
                </div>

                <div className="login-social">
                  <button className="login-btn social google" type="button">
                    <span className="social-icon google" />
                    Google로 로그인
                  </button>

                  <button className="login-btn social kakao" type="button">
                    <span className="social-icon kakao" />
                    카카오로 로그인
                  </button>

                </div>
              </form>
            </section>

            <section className="login-side">
              <div className="login-side-card">
                <div className="login-side-badge">NEWS Issue Tracker</div>
                <h2 className="login-side-title">맞춤 이슈 브리핑을 시작하세요</h2>
                <p className="login-side-desc">
                  관심 카테고리와 알림 기준을 설정하면 핵심 기사만 빠르게 확인할 수 있습니다.
                </p>
                <ul className="login-side-list">
                  <li>AI 요약 기반 핵심 뉴스 브리핑</li>
                  <li>카테고리별 맞춤형 피드</li>
                  <li>저장/공유로 팀 협업</li>
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
