import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function SignupPage() {
  const navigate = useNavigate();
  const go = (to) => navigate(`/?view=${encodeURIComponent(to)}`);

  const API_BASE = useMemo(
    () => import.meta?.env?.VITE_API_BASE || "http://localhost:5000",
    []
  );

  const [form, setForm] = useState({
    login_id: "",
    name: "", // 현재 백엔드/DB에 없음(일단 UI 유지용)
    email: "",
    password: "",
    password2: "",
    phone: "",
    birth: "", // 현재 백엔드/DB에 없음(일단 UI 유지용)
    agreeEmail: false,
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);

  //  아이디 중복확인 
  const [idCheck, setIdCheck] = useState({
    checked: false,
    available: false,
    message: "",
  });

  const normalizePhone = (v) => v.replace(/[^0-9]/g, "");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    const nextValue =
      type === "checkbox"
        ? checked
        : name === "phone"
        ? value // 하이픈 입력 허용 
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    //  login_id 변경 시 중복확인 무효화
    if (name === "login_id") {
      setIdCheck({ checked: false, available: false, message: "" });
    }
  };

  const validate = () => {
    if (!form.login_id.trim()) return "아이디를 입력해주세요.";

    //  중복확인 완료 강제
    if (!idCheck.checked || !idCheck.available) return "아이디 중복확인을 완료해주세요.";

    if (!form.email.trim()) return "이메일을 입력해주세요.";
    if (!form.password) return "비밀번호를 입력해주세요.";
    if (form.password.length < 8) return "비밀번호는 8자 이상 입력해주세요.";
    if (form.password !== form.password2) return "비밀번호가 일치하지 않습니다.";
    if (!form.phone.trim()) return "휴대폰 번호를 입력해주세요.";
    if (!form.agreeTerms) return "서비스 이용약관에 동의해주세요.";
    return null;
  };

  //  아이디 중복확인 실제 호출
  const handleCheckDup = async () => {
    if (!form.login_id.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/check-login-id`, {
        params: { login_id: form.login_id.trim() },
        withCredentials: true,
      });

      const available = !!res.data?.available;
      const message = res.data?.message || (available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");

      setIdCheck({
        checked: true,
        available,
        message,
      });

      alert(message);
    } catch (err) {
      const msg = err.response?.data?.message || "중복확인 실패";
      setIdCheck({ checked: true, available: false, message: msg });
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const msg = validate();
    if (msg) {
      alert(msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        login_id: form.login_id.trim(),
        password: form.password,
        email: form.email.trim(),
        phone: normalizePhone(form.phone.trim()), //  숫자만 저장
        age_group: null,
        gender: null,
      };

      const res = await axios.post(`${API_BASE}/auth/signup`, payload, {
        withCredentials: true,
      });

      alert(res.data?.message || "회원가입 성공");
      go("login");
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      alert(serverMsg || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page signup-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          {"뒤로가기"}
        </button>
        <div className="pageTitle">회원가입</div>
      </div>

      <div className="login-wrap">
        <div className="login-layout">
          <div className="login-grid">
            <section className="login-card">
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <label className="login-label">
                  아이디
                  <div className="login-inline">
                    <input
                      className="login-input"
                      type="text"
                      name="login_id"
                      value={form.login_id}
                      onChange={onChange}
                      placeholder="아이디 입력"
                      autoComplete="username"
                    />
                    <button
                      className="login-btn ghost login-check-btn"
                      type="button"
                      onClick={handleCheckDup}
                      disabled={loading}
                    >
                      중복확인
                    </button>
                  </div>

                  {/*  중복확인 결과 표시 */}
                  {idCheck.checked && (
                    <div
                      className="login-result"
                      style={{
                        marginTop: 8,
                        padding: "10px 12px",
                        borderRadius: 12,
                        fontSize: 13,
                        lineHeight: 1.3,
                        opacity: 0.95,
                      }}
                    >
                      {idCheck.available ? (
                        <>
                           <strong>사용 가능</strong> : {idCheck.message}
                        </>
                      ) : (
                        <>
                           <strong>사용 불가</strong> : {idCheck.message}
                        </>
                      )}
                    </div>
                  )}
                </label>

                <label className="login-label">
                  이름
                  <input
                    className="login-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="홍길동"
                  />
                </label>

                <label className="login-label">
                  이메일
                  <input
                    className="login-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </label>

                <label className="login-label">
                  비밀번호
                  <input
                    className="login-input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="8자 이상 입력"
                    autoComplete="new-password"
                  />
                </label>

                <label className="login-label">
                  비밀번호 확인
                  <input
                    className="login-input"
                    type="password"
                    name="password2"
                    value={form.password2}
                    onChange={onChange}
                    placeholder="비밀번호 재입력"
                    autoComplete="new-password"
                  />
                </label>

                <label className="login-label">
                  휴대폰 번호
                  <input
                    className="login-input"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="010-0000-0000"
                    inputMode="tel"
                  />
                </label>

                <label className="login-label">
                  생년월일
                  <input
                    className="login-input"
                    type="date"
                    name="birth"
                    value={form.birth}
                    onChange={onChange}
                  />
                </label>

                <div className="login-row">
                  <label className="login-check">
                    <input
                      type="checkbox"
                      name="agreeEmail"
                      checked={form.agreeEmail}
                      onChange={onChange}
                    />
                    <span>이메일 수신 동의</span>
                  </label>
                  <label className="login-check">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={form.agreeTerms}
                      onChange={onChange}
                    />
                    <span>서비스 이용약관 동의</span>
                  </label>
                </div>

                <button
                  className="login-btn primary"
                  type="button"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? "처리 중..." : "가입 완료"}
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