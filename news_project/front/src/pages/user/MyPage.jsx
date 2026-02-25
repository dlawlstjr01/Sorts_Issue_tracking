import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideMenuCard from "../../components/SideMenuCard";

export default function MyPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  const [noticeModal, setNoticeModal] = useState({
    open: false,
    message: "",
  });

  const openNotice = (message = "수정 완료") => {
    setNoticeModal({ open: true, message });
  };

  const closeNotice = () => {
    setNoticeModal((prev) => ({ ...prev, open: false }));
  };

  // 원본(취소 시 되돌리기 용)
  const [origin, setOrigin] = useState(null);

  //  백엔드 연동되는 사용자 정보(users 테이블 기준)
  const [user, setUser] = useState({
    login_id: "",
    name: "",
    email: "",
    phone: "",
    birth_date: "", 
  });

  // UI 유지용(현재 DB 저장 X)
  const [uiOnly, setUiOnly] = useState({
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

  //  date input용 normalize (백엔드가 DateTime/String 어떤 걸 주든 YYYY-MM-DD로 맞춤)
  const toYMD = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      // 이미 YYYY-MM-DD면 그대로, 아니면 앞 10자리
      return String(v).slice(0, 10);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 마이페이지 진입 시 내 정보 로딩
  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/auth/me`, {
          withCredentials: true,
        });

        const me = res.data || {};
        const next = {
          login_id: me.login_id || "",
          name: me.name || "",
          email: me.email || "",
          phone: me.phone || "",
          birth_date: toYMD(me.birth_date), 
        };

        setUser(next);
        setOrigin(next); // 취소 시 복원용
      } catch (err) {
        alert(err.response?.data?.message || "로그인이 필요합니다.");
        navigate("/?view=login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

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

  //  저장(name/email/phone/birth_date)
  const handleSave = async () => {
    if (!user.name.trim()) return alert("이름을 입력해주세요.");
    if (!user.email.trim()) return alert("이메일을 입력해주세요.");
    if (!user.phone.trim()) return alert("휴대폰 번호를 입력해주세요.");

    //  birth_date는 선택값이면 빈문자열 -> null로 보냄 (백엔드에서 null 허용 시)
    const bd = user.birth_date ? String(user.birth_date).trim() : "";
    if (bd && !/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
      return alert("생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)");
    }

    setSaving(true);
    try {
      const payload = {
        name: user.name.trim(),
        email: user.email.trim(),
        phone: normalizePhone(user.phone.trim()),
        birth_date: bd || null, 
      };

      const res = await axios.put(`/auth/me`, payload, {
        withCredentials: true,
      });

      openNotice(res.data?.message || "수정 완료");

      // 서버가 최신 user 내려주면 반영
      if (res.data?.user) {
        const next = {
          login_id: res.data.user.login_id ?? user.login_id,
          name: res.data.user.name ?? payload.name,
          email: res.data.user.email ?? payload.email,
          phone: res.data.user.phone ?? payload.phone,
          birth_date: toYMD(res.data.user.birth_date ?? payload.birth_date),
        };
        setUser(next);
        setOrigin(next);
      } else {
        // 서버가 message만 주면 현재 값으로 origin 갱신
        const next = {
          ...user,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          birth_date: payload.birth_date ? toYMD(payload.birth_date) : "",
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

  const handleSaveName = async () => {
    if (!user.name.trim()) return alert("\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
    if (!user.email.trim()) return alert("\uC774\uB984 \uC800\uC7A5\uC744 \uC704\uD574 \uC774\uBA54\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
    if (!user.phone.trim()) return alert("\uC774\uB984 \uC800\uC7A5\uC744 \uC704\uD574 \uD734\uB300\uD3F0 \uBC88\uD638\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.");

    setNameSaving(true);
    try {
      const payload = {
        name: user.name.trim(),
        email: user.email.trim(),
        phone: normalizePhone(user.phone.trim()),
      };

      const res = await axios.put(`${API_BASE}/auth/me`, payload, {
        withCredentials: true,
      });

      const next = res.data?.user
        ? {
            login_id: res.data.user.login_id ?? user.login_id,
            name: res.data.user.name ?? payload.name,
            email: res.data.user.email ?? payload.email,
            phone: res.data.user.phone ?? payload.phone,
          }
        : {
            ...user,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
          };

      setUser(next);
      setOrigin(next);
      setNameEditing(false);
      openNotice(res.data?.message || "수정 완료");
    } catch (err) {
      alert(err.response?.data?.message || "\uC774\uB984 \uC800\uC7A5 \uC2E4\uD328");
    } finally {
      setNameSaving(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (origin) setUser(origin);
    setNameEditing(false);
    setPwForm({ currentPassword: "", newPassword: "", newPassword2: "" });
    alert("변경사항을 취소했습니다.");
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) return alert("현재 비밀번호를 입력해주세요.");
    if (!pwForm.newPassword) return alert("새 비밀번호를 입력해주세요.");
    if (pwForm.newPassword.length < 8) return alert("새 비밀번호는 8자 이상 입력해주세요.");
    if (pwForm.newPassword !== pwForm.newPassword2) return alert("새 비밀번호가 일치하지 않습니다.");

    setPwSaving(true);
    try {
      const res = await axios.post(
        `/auth/password/change`,
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
        <SideMenuCard />
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

      <SideMenuCard />

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
              <div className="my-field-head">
                <span>{"\uC774\uB984"}</span>
                <button
                  className="login-btn ghost my-inline-btn"
                  type="button"
                  onClick={() => (nameEditing ? handleSaveName() : setNameEditing(true))}
                  disabled={saving || nameSaving}
                >
                  {nameSaving
                    ? "\uC800\uC7A5 \uC911..."
                    : nameEditing
                    ? "\uC774\uB984 \uC800\uC7A5"
                    : "\uC218\uC815"}
                </button>
              </div>
              <input
                className="login-input"
                type="text"
                name="name"
                value={user.name}
                onChange={onChangeUser}
                readOnly={!nameEditing}
                aria-readonly={!nameEditing}
                placeholder={"\uD64D\uAE38\uB3D9"}
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

            {/*  birth_date를 DB와 연동 */}
            <label className="login-label">
              생년월일
              <input
                className="login-input"
                type="date"
                name="birth_date"
                value={user.birth_date}
                onChange={onChangeUser}
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
        <button className="login-btn primary" type="button" onClick={handleSave} disabled={saving || nameSaving}>
          {saving ? "저장 중..." : "저장"}
        </button>
        <button className="login-btn" type="button" onClick={handleCancel} disabled={saving || pwSaving}>
          취소
        </button>
      </div>

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
