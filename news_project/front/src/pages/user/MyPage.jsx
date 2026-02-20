import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();

  const API_BASE = useMemo(
    () => import.meta?.env?.VITE_API_BASE || "http://localhost:5000",
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // 원본(취소 시 되돌리기 용)
  const [origin, setOrigin] = useState(null);

  // 백엔드 연동되는 사용자 정보(현재 users 테이블 기준)
  const [user, setUser] = useState({
    login_id: "",
    email: "",
    phone: "",
  });

  // UI 유지용(현재 DB에 없음 -> 저장 안 함)
  const [uiOnly, setUiOnly] = useState({
    name: "",
    birth: "",
    agreeEmailBriefing: true,
    agreeWeeklyReport: false,
    agreeHotIssuePush: true,
  });

  // 비밀번호 변경 폼
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPassword2: "",
  });

  const normalizePhone = (v) => String(v || "").replace(/\D/g, "");

  //  마이페이지 진입 시 내 정보 로딩
  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          withCredentials: true,
        });

        const me = res.data || {};
        const next = {
          login_id: me.login_id || "",
          email: me.email || "",
          phone: me.phone || "",
        };

        setUser(next);
        setOrigin(next); // 취소 시 복원용
      } catch (err) {
        alert(err.response?.data?.message || "로그인이 필요합니다.");
        // 로그인 페이지로 이동
        navigate("/?view=login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [API_BASE, navigate]);

  const onChangeUser = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onChangeUiOnly = (e) => {
    const { name, value, type, checked } = e.target;
    setUiOnly((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangePw = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  //  저장(이메일/폰)
  const handleSave = async () => {
    if (!user.email.trim()) return alert("이메일을 입력해주세요.");
    if (!user.phone.trim()) return alert("휴대폰 번호를 입력해주세요.");

    setSaving(true);
    try {
      const payload = {
        email: user.email.trim(),
        phone: normalizePhone(user.phone.trim()),
      };

      const res = await axios.put(`${API_BASE}/auth/me`, payload, {
        withCredentials: true,
      });

      alert(res.data?.message || "저장 완료");

      // 서버가 최신 user 내려주면 반영
      if (res.data?.user) {
        const next = {
          login_id: res.data.user.login_id || user.login_id,
          email: res.data.user.email || user.email,
          phone: res.data.user.phone || payload.phone,
        };
        setUser(next);
        setOrigin(next);
      } else {
        // 서버가 message만 주면 현재 값으로 origin 갱신
        const next = {
          ...user,
          phone: payload.phone,
        };
        setUser(next);
        setOrigin(next);
      }
    } catch (err) {
      alert(err.response?.data?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  //  취소
  const handleCancel = () => {
    if (origin) setUser(origin);
    setPwForm({ currentPassword: "", newPassword: "", newPassword2: "" });
    alert("변경사항을 취소했습니다.");
  };

  //  비밀번호 변경
  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) return alert("현재 비밀번호를 입력해주세요.");
    if (!pwForm.newPassword) return alert("새 비밀번호를 입력해주세요.");
    if (pwForm.newPassword.length < 8) return alert("새 비밀번호는 8자 이상 입력해주세요.");
    if (pwForm.newPassword !== pwForm.newPassword2) return alert("새 비밀번호가 일치하지 않습니다.");

    setPwSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE}/auth/password/change`,
        {
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        },
        { withCredentials: true }
      );

      alert(res.data?.message || "비밀번호 변경 완료");
      setPwForm({ currentPassword: "", newPassword: "", newPassword2: "" });
    } catch (err) {
      alert(err.response?.data?.message || "비밀번호 변경 실패");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page my-page">
        <div className="login-head">
          <button className="login-back" type="button" onClick={() => navigate(-1)}>
            {"뒤로가기"}
          </button>
          <div className="pageTitle">마이페이지</div>
          <div className="pageDesc">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page my-page">
      <div className="login-head">
        <button
          className="login-back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          {"뒤로가기"}
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
                value={user.login_id}
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
              <input
                className="login-input"
                type="text"
                name="name"
                value={uiOnly.name}
                onChange={onChangeUiOnly}
                placeholder="홍길동"
              />
            </label>

            <label className="login-label">
              이메일
              <input
                className="login-input"
                type="email"
                name="email"
                value={user.email}
                onChange={onChangeUser}
                placeholder="name@company.com"
              />
            </label>

            <label className="login-label">
              휴대폰 번호
              <input
                className="login-input"
                type="tel"
                name="phone"
                value={user.phone}
                onChange={onChangeUser}
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
                value={uiOnly.birth}
                onChange={onChangeUiOnly}
              />
            </label>
          </div>
        </section>

        <section className="my-card">
          <h3 className="my-section-title">보안 설정</h3>
          <div className="my-form">
            <label className="login-label">
              현재 비밀번호
              <input
                className="login-input"
                type="password"
                name="currentPassword"
                value={pwForm.currentPassword}
                onChange={onChangePw}
                placeholder="현재 비밀번호"
                autoComplete="current-password"
              />
            </label>
            <label className="login-label">
              새 비밀번호
              <input
                className="login-input"
                type="password"
                name="newPassword"
                value={pwForm.newPassword}
                onChange={onChangePw}
                placeholder="새 비밀번호 (8자 이상)"
                autoComplete="new-password"
              />
            </label>
            <label className="login-label">
              새 비밀번호 확인
              <input
                className="login-input"
                type="password"
                name="newPassword2"
                value={pwForm.newPassword2}
                onChange={onChangePw}
                placeholder="새 비밀번호 재입력"
                autoComplete="new-password"
              />
            </label>

            <button
              className="login-btn primary"
              type="button"
              onClick={handleChangePassword}
              disabled={pwSaving}
              style={{ marginTop: 10 }}
            >
              {pwSaving ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </section>

        <section className="my-card">
          <h3 className="my-section-title">알림/수신 설정 (현재 DB 저장 X)</h3>
          <div className="my-form">
            <label className="login-check">
              <input
                type="checkbox"
                name="agreeEmailBriefing"
                checked={uiOnly.agreeEmailBriefing}
                onChange={onChangeUiOnly}
              />
              <span>이메일 요약 브리핑 수신</span>
            </label>
            <label className="login-check">
              <input
                type="checkbox"
                name="agreeWeeklyReport"
                checked={uiOnly.agreeWeeklyReport}
                onChange={onChangeUiOnly}
              />
              <span>주간 리포트 수신</span>
            </label>
            <label className="login-check">
              <input
                type="checkbox"
                name="agreeHotIssuePush"
                checked={uiOnly.agreeHotIssuePush}
                onChange={onChangeUiOnly}
              />
              <span>핫이슈 푸시 알림</span>
            </label>
          </div>
        </section>
      </div>

      <div className="my-actions">
        <button className="login-btn primary" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        <button className="login-btn" type="button" onClick={handleCancel} disabled={saving || pwSaving}>
          취소
        </button>
      </div>
    </div>
  );
}