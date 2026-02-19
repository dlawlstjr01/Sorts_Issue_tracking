import React from "react";

export default function LoginPage() {
  return (
    <div className="page">
      <div className="pageTitle">로그인</div>
      <div className="pageDesc">기본 로그인 UI</div>

      <div className="card">
        <div className="cardPad form">
          <input className="input" placeholder="이메일" />
          <input className="input" type="password" placeholder="비밀번호" />
          <button className="btnPrimary" type="button">
            로그인
          </button>
          <div className="divider" />
          <button className="btn" type="button">Google 로그인</button>
          <button className="btn" type="button">Kakao 로그인</button>
        </div>
      </div>
    </div>
  );
}
