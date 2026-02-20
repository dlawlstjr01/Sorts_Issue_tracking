import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  const API_BASE = useMemo(
    () => import.meta?.env?.VITE_API_BASE || "http://localhost:5000",
    []
  );

  // 아이디 찾기 폼
  const [findForm, setFindForm] = useState({
    name: "",
    phone: "",
  });

  // 비번 재설정 폼
  const [resetForm, setResetForm] = useState({
    login_id: "",
    email: "",
    code: "",
    newPassword: "",
    newPassword2: "",
  });

  const [loadingFind, setLoadingFind] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [showIdResult, setShowIdResult] = useState(false);
  const [foundLoginId, setFoundLoginId] = useState("");

  const [showResetResult, setShowResetResult] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [devCode, setDevCode] = useState(""); // 백엔드가 code를 내려주면 표시

  const onChangeFind = (e) => {
    const { name, value } = e.target;
    setFindForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeReset = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePhone = (v) => v.replace(/\D/g, "");

  const handleFindId = async () => {
    const phoneN = normalizePhone(findForm.phone);
    if (!findForm.name.trim()) return alert("이름을 입력해주세요.");
    if (!phoneN) return alert("휴대폰 번호를 입력해주세요.");

    setLoadingFind(true);
    setShowIdResult(false);
    setFoundLoginId("");

    try {
      const res = await axios.post(
        `${API_BASE}/auth/find-id`,
        {
          name: findForm.name.trim(),
          phone: phoneN,
        },
        { withCredentials: true }
      );

      setFoundLoginId(res.data?.login_id || "");
      setShowIdResult(true);
    } catch (err) {
      alert(err.response?.data?.message || "아이디 찾기 실패");
    } finally {
      setLoadingFind(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetForm.login_id.trim()) return alert("아이디를 입력해주세요.");
    if (!resetForm.email.trim()) return alert("이메일을 입력해주세요.");

    setLoadingReq(true);
    setShowResetResult(false);
    setResetMsg("");
    setDevCode("");

    try {
      const res = await axios.post(
        `${API_BASE}/auth/password/reset-request`,
        {
          login_id: resetForm.login_id.trim(),
          email: resetForm.email.trim(),
        },
        { withCredentials: true }
      );

      setResetMsg(res.data?.message || "인증코드를 전송했습니다.");
      // 백엔드가 code를 내려주면 표시
      if (res.data?.code) setDevCode(String(res.data.code));
      setShowResetResult(true);
    } catch (err) {
      alert(err.response?.data?.message || "재설정 요청 실패");
    } finally {
      setLoadingReq(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.login_id.trim()) return alert("아이디를 입력해주세요.");
    if (!resetForm.email.trim()) return alert("이메일을 입력해주세요.");
    if (!resetForm.code.trim()) return alert("인증코드를 입력해주세요.");
    if (!resetForm.newPassword) return alert("새 비밀번호를 입력해주세요.");
    if (resetForm.newPassword.length < 8) return alert("비밀번호는 8자 이상 입력해주세요.");
    if (resetForm.newPassword !== resetForm.newPassword2) return alert("비밀번호가 일치하지 않습니다.");

    setLoadingReset(true);
    try {
      const res = await axios.post(
        `${API_BASE}/auth/password/reset`,
        {
          login_id: resetForm.login_id.trim(),
          email: resetForm.email.trim(),
          code: resetForm.code.trim(),
          newPassword: resetForm.newPassword,
        },
        { withCredentials: true }
      );

      alert(res.data?.message || "비밀번호 변경 완료");
      go("login");
    } catch (err) {
      alert(err.response?.data?.message || "비밀번호 변경 실패");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="page login-page password-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          {"뒤로가기"}
        </button>
        <div className="pageTitle">아이디/비밀번호 찾기</div>
        <div className="pageDesc">아이디 찾기 또는 비밀번호 재설정을 진행하세요.</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
            <section className="login-card">
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <div className="login-section-title">아이디 찾기</div>
                <label className="login-label">
                  이름
                  <input
                    className="login-input"
                    type="text"
                    name="name"
                    value={findForm.name}
                    onChange={onChangeFind}
                    placeholder="홍길동"
                  />
                </label>

                <label className="login-label">
                  휴대폰 번호
                  <input
                    className="login-input"
                    type="tel"
                    name="phone"
                    value={findForm.phone}
                    onChange={onChangeFind}
                    placeholder="010-0000-0000"
                    inputMode="tel"
                  />
                </label>

                <button
                  className="login-btn primary"
                  type="button"
                  onClick={handleFindId}
                  disabled={loadingFind}
                >
                  {loadingFind ? "처리 중..." : "아이디 확인하기"}
                </button>

                {showIdResult && (
                  <div className="login-result">
                    입력하신 정보로 확인된 아이디는{" "}
                    <strong>{foundLoginId || "(없음)"}</strong> 입니다.
                  </div>
                )}

                <div className="login-divider">
                  <span>또는</span>
                </div>

                <div className="login-section-title">비밀번호 찾기</div>

                <label className="login-label">
                  아이디
                  <input
                    className="login-input"
                    type="text"
                    name="login_id"
                    value={resetForm.login_id}
                    onChange={onChangeReset}
                    placeholder="아이디 입력"
                    autoComplete="username"
                  />
                </label>

                <label className="login-label">
                  이메일
                  <input
                    className="login-input"
                    type="email"
                    name="email"
                    value={resetForm.email}
                    onChange={onChangeReset}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </label>

                <button
                  className="login-btn primary"
                  type="button"
                  onClick={handleRequestReset}
                  disabled={loadingReq}
                >
                  {loadingReq ? "처리 중..." : "인증코드 받기"}
                </button>

                {showResetResult && (
                  <div className="login-result">
                    {resetMsg || "인증코드를 전송했습니다."}
                    {devCode ? (
                      <>
                        <br />
                        <span style={{ opacity: 0.8 }}>
                          (개발용 코드: <strong>{devCode}</strong>)
                        </span>
                      </>
                    ) : null}
                  </div>
                )}

                {/* 인증코드 + 새 비번 입력 (메일 없이도 완성되게) */}
                <label className="login-label">
                  인증코드
                  <input
                    className="login-input"
                    type="text"
                    name="code"
                    value={resetForm.code}
                    onChange={onChangeReset}
                    placeholder="예: 123456"
                    inputMode="numeric"
                  />
                </label>

                <label className="login-label">
                  새 비밀번호
                  <input
                    className="login-input"
                    type="password"
                    name="newPassword"
                    value={resetForm.newPassword}
                    onChange={onChangeReset}
                    placeholder="8자 이상"
                    autoComplete="new-password"
                  />
                </label>

                <label className="login-label">
                  새 비밀번호 확인
                  <input
                    className="login-input"
                    type="password"
                    name="newPassword2"
                    value={resetForm.newPassword2}
                    onChange={onChangeReset}
                    placeholder="비밀번호 재입력"
                    autoComplete="new-password"
                  />
                </label>

                <button
                  className="login-btn primary"
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loadingReset}
                >
                  {loadingReset ? "처리 중..." : "비밀번호 변경"}
                </button>

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
                  등록된 이메일을 확인하면 재설정 인증코드를 전송합니다.
                  인증코드는 일정 시간 후 만료됩니다.
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