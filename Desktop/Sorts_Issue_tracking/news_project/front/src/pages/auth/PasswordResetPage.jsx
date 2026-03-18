import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  // 아이디 찾기 폼
  const [findForm, setFindForm] = useState({
    name: "",
    phone: "",
  });

  // 비번 재설정 폼
  const [resetForm, setResetForm] = useState({
    login_id: "",
    email: "",
    phone: "",
    code: "",
    newPassword: "",
    newPassword2: "",
  });
  // 비밀번호 재설정 기본값은 email, phone은 보조 복구 용도로 선택 가능하게 둔다.
  const [resetMethod, setResetMethod] = useState("email");

  const [loadingFind, setLoadingFind] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [showResetResult, setShowResetResult] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  // 백엔드가 code를 내려주면 표시
  const [devCode, setDevCode] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const [idResultModal, setIdResultModal] = useState({
    open: false,
    loginId: "",
  });

  // 공통 알림 모달(검증/요청 실패/완료 메시지)
  const [noticeModal, setNoticeModal] = useState({
    open: false,
    message: "",
    redirectTo: "",
  });

  const openNotice = (message, redirectTo = "") => {
    setNoticeModal({
      open: true,
      message: String(message || "").trim() || "요청을 처리하지 못했습니다. 다시 시도해주세요.",
      redirectTo,
    });
  };

  const closeNotice = () => {
    const redirectTo = noticeModal.redirectTo;
    setNoticeModal({
      open: false,
      message: "",
      redirectTo: "",
    });
    if (redirectTo) go(redirectTo);
  };

  const closeIdResultModal = () => {
    setIdResultModal({ open: false, loginId: "" });
  };

  const onChangeFind = (e) => {
    const { name, value } = e.target;
    setFindForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeReset = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");
  const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
  const isEmailReset = resetMethod === "email";

  const handleChangeResetMethod = (nextMethod) => {
    if (nextMethod === resetMethod) return;
    setResetMethod(nextMethod);
    // 채널을 바꾸면 이전 채널에서 받은 인증결과를 초기화해 혼선을 막는다.
    setShowResetResult(false);
    setResetMsg("");
    setDevCode("");
    setResetForm((prev) => ({ ...prev, code: "" }));
  };

  const handleFindId = async () => {
    const nameT = String(findForm.name || "").trim();
    const phoneN = normalizePhone(findForm.phone);

    if (!nameT) {
      openNotice("이름을 입력해주세요.");
      return;
    }
    if (!phoneN) {
      openNotice("휴대폰 번호를 입력해주세요.");
      return;
    }

    setLoadingFind(true);
    try {
      const res = await axios.post(
        `/auth/find-id`,
        {
          name: nameT,
          phone: phoneN,
        },
        { withCredentials: true }
      );

      const loginId = String(res.data?.login_id || "").trim();
      if (!loginId) {
        openNotice("아이디를 찾지 못했습니다.");
        return;
      }
      // 아이디 찾기 결과는 별도 모달로 노출
      setIdResultModal({ open: true, loginId });
    } catch (err) {
      openNotice(err.response?.data?.message || "아이디 찾기에 실패했습니다.");
    } finally {
      setLoadingFind(false);
    }
  };

  const handleRequestReset = async () => {
    const loginIdT = String(resetForm.login_id || "").trim();
    const emailT = normalizeEmail(resetForm.email);
    const phoneN = normalizePhone(resetForm.phone);

    if (!loginIdT) {
      openNotice("아이디를 입력해주세요.");
      return;
    }
    if (isEmailReset && !emailT) {
      openNotice("이메일을 입력해주세요.");
      return;
    }
    if (!isEmailReset && !phoneN) {
      openNotice("휴대폰 번호를 입력해주세요.");
      return;
    }

    setLoadingReq(true);
    setShowResetResult(false);
    setResetMsg("");
    setDevCode("");

    try {
      const res = await axios.post(
        `/auth/password/reset-request`,
        {
          login_id: loginIdT,
          email: emailT,
          phone: phoneN,
          // 선택한 복구 수단을 서버로 전달해 동일한 검증 규칙을 적용한다.
          method: resetMethod,
        },
        { withCredentials: true }
      );

      setResetMsg(res.data?.message || (isEmailReset ? "인증코드를 이메일로 전송했습니다." : "인증코드를 문자로 전송했습니다."));
      // 개발 환경 fallback일 때만 서버가 debugCode를 내려준다.
      if (res.data?.debugCode) setDevCode(String(res.data.debugCode));
      setShowResetResult(true);
      // 인증코드 발송 성공 시 바로 재설정 모달 오픈
      setResetModalOpen(true);
    } catch (err) {
      openNotice(err.response?.data?.message || "재설정 요청에 실패했습니다.");
    } finally {
      setLoadingReq(false);
    }
  };

  const handleOpenResetModal = () => {
    if (!showResetResult) {
      openNotice("먼저 인증코드를 받아주세요.");
      return;
    }
    setResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    const loginIdT = String(resetForm.login_id || "").trim();
    const emailT = normalizeEmail(resetForm.email);
    const phoneN = normalizePhone(resetForm.phone);

    if (!loginIdT) {
      openNotice("아이디를 입력해주세요.");
      return;
    }
    if (isEmailReset && !emailT) {
      openNotice("이메일을 입력해주세요.");
      return;
    }
    if (!isEmailReset && !phoneN) {
      openNotice("휴대폰 번호를 입력해주세요.");
      return;
    }
    if (!resetForm.code.trim()) {
      openNotice("인증코드를 입력해주세요.");
      return;
    }
    if (!resetForm.newPassword) {
      openNotice("새 비밀번호를 입력해주세요.");
      return;
    }
    if (resetForm.newPassword.length < 4) {
      openNotice("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (resetForm.newPassword !== resetForm.newPassword2) {
      openNotice("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoadingReset(true);
    try {
      const res = await axios.post(
        `/auth/password/reset`,
        {
          login_id: loginIdT,
          email: emailT,
          phone: phoneN,
          // 인증코드 검증도 요청 시점과 동일한 method 기준으로 맞춘다.
          method: resetMethod,
          code: resetForm.code.trim(),
          newPassword: resetForm.newPassword,
        },
        { withCredentials: true }
      );

      setResetModalOpen(false);
      setResetForm((prev) => ({
        ...prev,
        code: "",
        newPassword: "",
        newPassword2: "",
      }));
      openNotice(res.data?.message || "비밀번호가 변경되었습니다.", "login");
    } catch (err) {
      openNotice(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="page login-page password-page">
      <div className="login-head">
        <button className="login-back" type="button" onClick={() => navigate(-1)} aria-label="뒤로가기">
          {"뒤로가기"}
        </button>
        <div className="pageTitle">아이디/비밀번호 찾기</div>
        <div className="pageDesc">비밀번호 재설정은 이메일을 기본으로 하고, 휴대폰은 보조 복구 수단으로 제공합니다.</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
            <section className="login-card password-card">
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

                <button className="login-btn primary" type="button" onClick={handleFindId} disabled={loadingFind}>
                  {loadingFind ? "처리 중..." : "아이디 확인하기"}
                </button>

                <div className="login-row center">
                  <span className="login-muted">로그인 화면으로 돌아가기</span>
                  <button className="login-link" type="button" onClick={() => go("login")}>
                    로그인
                  </button>
                </div>
              </form>
            </section>

            <section className="login-card password-card">
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <div className="login-section-title">비밀번호 재설정</div>

                <div className="reset-method-wrap">
                  {/* 비밀번호 재설정 채널을 명시적으로 선택해 사용자 실수를 줄인다. */}
                  <div className="reset-method-tabs" role="tablist" aria-label="비밀번호 재설정 인증 수단">
                    <button
                      className={`login-btn ghost reset-method-btn ${isEmailReset ? "active" : ""}`}
                      type="button"
                      onClick={() => handleChangeResetMethod("email")}
                    >
                      이메일(기본)
                    </button>
                    <button
                      className={`login-btn ghost reset-method-btn ${!isEmailReset ? "active" : ""}`}
                      type="button"
                      onClick={() => handleChangeResetMethod("phone")}
                    >
                      휴대폰(보조복구)
                    </button>
                  </div>
                  <p className="reset-method-hint">
                    {isEmailReset
                      ? "권장: 가입 시 등록한 이메일로 인증코드를 받아 비밀번호를 재설정합니다."
                      : "보조 복구: 이메일에 접근할 수 없을 때 휴대폰 문자 인증으로 진행합니다."}
                  </p>
                </div>

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

                {isEmailReset ? (
                  <label className="login-label">
                    이메일
                    <input
                      className="login-input"
                      type="email"
                      name="email"
                      value={resetForm.email}
                      onChange={onChangeReset}
                      placeholder="email@example.com"
                      autoComplete="email"
                    />
                  </label>
                ) : (
                  <label className="login-label">
                    휴대폰 번호
                    <input
                      className="login-input"
                      type="tel"
                      name="phone"
                      value={resetForm.phone}
                      onChange={onChangeReset}
                      placeholder="010-0000-0000"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </label>
                )}

                {isEmailReset && (
                  <label className="login-label">
                    휴대폰 번호 (보조 복구용, 선택)
                    <input
                      className="login-input"
                      type="tel"
                      name="phone"
                      value={resetForm.phone}
                      onChange={onChangeReset}
                      placeholder="010-0000-0000"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </label>
                )}

                <button
                  className="login-btn primary"
                  type="button"
                  onClick={handleRequestReset}
                  disabled={loadingReq}
                >
                  {loadingReq ? "처리 중..." : isEmailReset ? "이메일 인증코드 받기" : "문자 인증코드 받기"}
                </button>

                {showResetResult && (
                  <div className="login-result">
                    {resetMsg || (isEmailReset ? "인증코드를 이메일로 전송했습니다." : "인증코드를 문자로 전송했습니다.")}
                    {devCode ? (
                      <>
                        <br />
                        <span style={{ opacity: 0.85 }}>
                          (개발용 코드: <strong>{devCode}</strong>)
                        </span>
                      </>
                    ) : null}
                  </div>
                )}

                <button className="login-btn ghost" type="button" onClick={handleOpenResetModal}>
                  인증번호 입력하고 비밀번호 변경하기
                </button>
              </form>
            </section>
          </div>

          <aside className="login-side-menu">
            <SideMenuCard mobileCollapsible />
          </aside>
        </div>
      </div>

      {idResultModal.open && (
        // 아이디 찾기 결과 모달
        <div className="my-notice-modal-backdrop" onClick={closeIdResultModal}>
          <div className="my-notice-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h4 className="my-notice-title">아이디 확인 결과</h4>
            <p className="my-notice-message">
              입력하신 정보로 확인된 아이디는 <strong>{idResultModal.loginId}</strong> 입니다.
            </p>
            <div className="my-notice-actions">
              <button className="login-btn primary" type="button" onClick={closeIdResultModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModalOpen && (
        // 인증코드 + 새 비밀번호 입력 모달
        <div className="my-notice-modal-backdrop" onClick={() => setResetModalOpen(false)}>
          <div
            className="my-notice-modal password-reset-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="my-notice-title">비밀번호 재설정</h4>
            <p className="password-reset-hint">
              {isEmailReset
                ? "이메일로 받은 인증번호와 새 비밀번호를 입력해주세요."
                : "문자로 받은 인증번호와 새 비밀번호를 입력해주세요."}
            </p>

            <div className="login-form">
              {/* 요청 때 선택한 채널과 같은 인증코드를 입력해야 검증이 맞는다. */}
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
            </div>

            <div className="my-notice-actions">
              <button className="login-btn ghost" type="button" onClick={() => setResetModalOpen(false)}>
                취소
              </button>
              <button className="login-btn primary" type="button" onClick={handleResetPassword} disabled={loadingReset}>
                {loadingReset ? "처리 중..." : "비밀번호 변경"}
              </button>
            </div>
          </div>
        </div>
      )}

      {noticeModal.open && (
        <div className="my-notice-modal-backdrop" onClick={closeNotice}>
          <div className="my-notice-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h4 className="my-notice-title">알림</h4>
            <p className="my-notice-message">{noticeModal.message}</p>
            <div className="my-notice-actions">
              <button className="login-btn primary" type="button" onClick={closeNotice}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
