import React from 'react';

const Home = () => {
  // 샘플 데이터 - 실제 API 연결 시 이 구조를 활용하세요.
  const newsData = [
    {
      id: 1,
      title: "생성형 AI가 변화시키는 2026년의 뉴스 소비 환경",
      isHot: true,
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", // AI 테마 이미지
      summary: [
        "AI 기술의 발전으로 개인 맞춤형 뉴스 큐레이션이 더욱 정교해지고 있습니다.",
        "실시간 데이터 분석을 통해 속보의 정확도가 이전보다 40% 이상 향상되었습니다.",
        "사용자는 이제 텍스트뿐만 아니라 AI가 생성한 요약 영상을 함께 소비합니다.",
        "윤리적인 가이드라인 마련이 AI 뉴스 생태계의 핵심 과제로 떠오르고 있습니다.",
        "결국 인간 편집자의 통찰력과 AI의 효율성이 결합된 하이브리드 모델이 대세가 될 전망입니다."
      ]
    }
  ];

  return (
    <main className="page main">
      <div className="hdr-inner" style={{ padding: '0 24px' }}>
        <h2 className="pageTitle">오늘의 주요 이슈</h2>
        <p className="pageDesc">AI가 분석한 실시간 핵심 뉴스 요약입니다.</p>
      </div>

      <section className="main-grid">
        {newsData.map((news) => (
          <article key={news.id} className="card">
            <div className="cardPad">
              {/* 제목 및 뱃지 영역 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{news.title}</h3>
                {news.isHot && <span className="badge red">HOT ISSUE</span>}
              </div>

              {/* AI 뉴스 썸네일 */}
              <div className="img-hover-effect" style={{ borderRadius: '12px', marginBottom: '20px', height: '240px' }}>
                <img 
                  src={news.imageUrl} 
                  alt="News Thumbnail" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* 5줄 요약 내용 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {news.summary.map((line, index) => (
                  <p key={index} style={{ margin: 0, fontSize: '15px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>•</span>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Home;