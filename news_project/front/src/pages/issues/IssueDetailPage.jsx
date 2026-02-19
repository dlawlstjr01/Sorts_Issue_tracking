import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MOCK = {
  "ISS-101": {
    title: "정책 발표 이후 시장 변동 확대",
    category: "경제",
    updatedAt: "방금",
    core: [
      { s: "발표 내용이 단기 금리 기대를 바꾸며 변동성이 확대됨", src: "Reuters", link: "#" },
      { s: "주요 지표 해석이 엇갈려 투자자 포지션이 빠르게 교체됨", src: "BBC", link: "#" },
    ],
    why: "정책 방향성과 수치 해석 차이가 커서 시장이 재평가 국면으로 진입.",
    now: "시장 반응이 업종별로 분화되고 있고, 추가 발언/지표에 민감하게 반응 중.",
    next: "추가 브리핑, 주요 지표 발표, 해외 시장 동조 여부를 관찰할 필요.",
    timeline: [
      { t: "10:20", e: "정책 발표", src: "연합뉴스" },
      { t: "10:35", e: "시장 급등락", src: "Reuters" },
      { t: "11:05", e: "전문가 코멘트 확산", src: "BBC" },
      { t: "11:20", e: "관련 키워드 언급 급증", src: "SNS" },
    ],
    keywords: ["금리", "물가", "증시", "정책", "브리핑"],
    evidence: [
      { sum: "변동성 확대의 직접 원인은 기대 경로 변화", ev: "선물 금리 경로가 발표 직후 크게 재조정됐다", src: "Reuters", link: "#" },
      { sum: "업종별 분화가 심화", ev: "방어주는 상대적으로 견조, 성장주는 변동 확대", src: "BBC", link: "#" },
    ],
  },
};

export default function IssueDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const id = params.get("id") || "ISS-101";

  const data = MOCK[id] || MOCK["ISS-101"];

  const [level, setLevel] = useState("short");

  return (
    <div className="page">
      <div className="detailTop">
        <button className="btn ghost" onClick={() => navigate("/?view=issues")} type="button">
          뒤로
        </button>

        <div className="detailHead">
          <div className="badge">{data.category}</div>
          <div className="detailTitle">{data.title}</div>
          <div className="muted">업데이트 {data.updatedAt}</div>
        </div>

        <div className="detailActions">
          <button className={`seg ${level === "short" ? "is-on" : ""}`} onClick={() => setLevel("short")} type="button">
            짧게
          </button>
          <button className={`seg ${level === "full" ? "is-on" : ""}`} onClick={() => setLevel("full")} type="button">
            자세히
          </button>
        </div>
      </div>

      <div className="grid2">
        <section className="card">
          <div className="cardHead">
            <div className="cardTitle">핵심 요약</div>
            <div className="cardMeta">문장별 출처</div>
          </div>

          <div className="bulletList">
            {data.core.map((x, i) => (
              <div key={i} className="bullet">
                <div className="bulletText">{x.s}</div>
                <div className="bulletSrc">
                  <a className="link" href={x.link} target="_blank" rel="noreferrer">
                    {x.src}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {level === "full" ? (
            <div className="detailBlock">
              <div className="subTitle">관련 키워드</div>
              <div className="pillRow">
                {data.keywords.map((k) => (
                  <span key={k} className="pill">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="card">
          <div className="cardHead">
            <div className="cardTitle">타임라인</div>
            <div className="cardMeta">시간 흐름</div>
          </div>

          <div className="timeline">
            {data.timeline.map((x, i) => (
              <div key={i} className="tlRow">
                <div className="tlTime">{x.t}</div>
                <div className="tlEvent">{x.e}</div>
                <div className="tlSrc">{x.src}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="section">
        <div className="sectionHead">
          <div className="sectionTitle">왜 발생했는가</div>
        </div>
        <div className="card pad">{data.why}</div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div className="sectionTitle">지금 상황은</div>
        </div>
        <div className="card pad">{data.now}</div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div className="sectionTitle">앞으로 주목할 포인트</div>
        </div>
        <div className="card pad">{data.next}</div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <div className="sectionTitle">근거</div>
          <div className="sectionMeta">요약 왜곡을 줄이기 위한 근거 문장 + 출처</div>
        </div>

        <div className="grid2">
          {data.evidence.map((x, i) => (
            <div key={i} className="card pad">
              <div className="subTitle">요약 문장</div>
              <div className="quote">{x.sum}</div>
              <div className="subTitle">근거 문장</div>
              <div className="evidence">{x.ev}</div>
              <div className="eviFoot">
                <a className="link" href={x.link} target="_blank" rel="noreferrer">
                  {x.src} 원문
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
