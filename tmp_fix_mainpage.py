from pathlib import Path
import re

path = Path('news_project/TeamZero_Front/src/pages/MainPage.jsx')
text = path.read_text(encoding='utf-8')

categories_block = """const CATEGORIES = [
  { key: \"all\", label: \"전체\" },
  { key: \"politics\", label: \"정치\" },
  { key: \"economy\", label: \"경제\" },
  { key: \"society\", label: \"사회\" },
  { key: \"world\", label: \"국제\" },
  { key: \"it\", label: \"IT/과학\" },
  { key: \"culture\", label: \"문화\" },
  { key: \"sports\", label: \"스포츠\" },
];
"""

articles_block = """const INITIAL_ARTICLES = [
  {
    id: 1,
    category: \"it\",
    badge: \"HOT\",
    title: \"생성형 AI 경쟁 심화로 모델 성능·비용 최적화 관련\",
    thumbnailUrl: `${THUMB.it}${UQ}`,
    summary: [
      \"글로벌 기업들이 생성형 AI 모델 고도화 경쟁을 벌이고 있습니다.\",
      \"성능 향상과 운영 비용 최적화가 핵심 이슈로 떠올랐습니다.\",
      \"보안과 개인정보 보호 기준도 강화되는 추세입니다.\",
      \"모델 경량화와 멀티모달 기능이 빠르게 확산 중입니다.\",
      \"규제와 표준화 논의도 함께 진행되고 있습니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: 2,
    category: \"economy\",
    badge: \"최신\",
    title: \"물가·금리 변수 속 소비심리 변화… 유통 업계 전략 수정\",
    thumbnailUrl: `${THUMB.economy}${UQ}`,
    summary: [
      \"금리와 물가 변동성이 유통업계 전략에 영향을 주고 있습니다.\",
      \"프로모션과 가격 정책을 유연하게 조정하는 추세입니다.\",
      \"필수재 중심 소비가 강화되는 모습입니다.\",
      \"할인 경쟁과 PB 전략이 동시에 강화되고 있습니다.\",
      \"연말 수요 회복을 대비한 재고 조정도 진행 중입니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 3,
    category: \"society\",
    badge: \"HOT\",
    title: \"도심 교통 혼잡 완화 대책… 대중교통 확대·수요 분산\",
    thumbnailUrl: `${THUMB.society}${UQ}`,
    summary: [
      \"도심 교통 혼잡을 줄이기 위한 정책이 논의 중입니다.\",
      \"대중교통 확대와 수요 분산 정책이 핵심입니다.\",
      \"지자체는 교통 인프라 개선에 집중하고 있습니다.\",
      \"혼잡 통행료 등 추가 대책도 검토됩니다.\",
      \"시민 참여형 모니터링도 도입될 예정입니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: 4,
    category: \"politics\",
    badge: \"HOT\",
    title: \"국회, 핵심 법안 조정 논의 확대\",
    thumbnailUrl: `${THUMB.politics}${UQ}`,
    summary: [
      \"정치 분야에서 주요 법안 조정 논의가 진행 중입니다.\",
      \"사회적 합의를 통해 정책을 보완하는 방향입니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 5,
    category: \"world\",
    badge: \"최신\",
    title: \"국제 경제 재편, 공급망 안정 전략 부각\",
    thumbnailUrl: `${THUMB.world}${UQ}`,
    summary: [
      \"국제 공급망 리스크 대응을 위한 협상이 이어지고 있습니다.\",
      \"해외 투자와 회복 시나리오가 논의됩니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 110,
  },
  {
    id: 6,
    category: \"culture\",
    badge: \"HOT\",
    title: \"대형 페스티벌 회복으로 문화 수요 회복\",
    thumbnailUrl: `${THUMB.culture}${UQ}`,
    summary: [
      \"지역 축제 재개로 관광 수요가 살아나고 있습니다.\",
      \"전시·공연 예약이 활발해지고 있습니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 130,
  },
  {
    id: 7,
    category: \"sports\",
    badge: \"최신\",
    title: \"프로리그 시즌 개막, 신인 선수 활약\",
    thumbnailUrl: `${THUMB.sports}${UQ}`,
    summary: [
      \"신인 선수들의 활약으로 경기 흐름이 빨라지고 있습니다.\",
      \"팀 간 전술 대결이 본격적으로 시작됩니다.\",
    ],
    createdAt: Date.now() - 1000 * 60 * 150,
  }
];
"""

title_pool_block = """const TITLE_POOL = {
  politics: [
    \"국회, 주요 현안 논의와 민생 법안 처리 속도\",
    \"야당·여당, 예산안 조정 협상 진행\",
    \"지방 정책 발표와 지역 현안 해법 모색\",
  ],
  economy: [
    \"환율 변동성 확대, 수출 기업 대응 분주\",
    \"금리 동결 전망 속 시장 관망세\",
    \"물가 안정 조짐… 유통·소비 업계 변화\",
  ],
  society: [
    \"교육 현장 디지털 전환… 학습 격차 해소 과제\",
    \"지역 의료 공백 해소 위한 공공 인프라 강화\",
    \"재난 대응 강화로 생활 SOC 개선 추진\",
  ],
  world: [
    \"글로벌 공급망 재편으로 기업 전략 변화\",
    \"주요국 통화정책 변화에 국제 시장 출렁\",
    \"기후 협력 강화… 탄소 감축 논의 확대\",
  ],
  it: [
    \"AI 서비스 고도화로 개인정보 보안 기준 강화\",
    \"반도체 투자 확대… 첨단 공정 경쟁 심화\",
    \"클라우드 비용 최적화와 기업 IT 전략 재정비\",
  ],
  culture: [
    \"공연·전시 수요 회복, 문화 콘텐츠 시장 활기\",
    \"OTT 시장 경쟁 심화… 콘텐츠 투자 확대\",
    \"출판 시장 변화 속 디지털 콘텐츠 성장\",
  ],
  sports: [
    \"프로리그 순위 경쟁 치열… 중반 판도 변동\",
    \"국제 대회 참가 명단 발표… 팬 관심 집중\",
    \"부상 복귀 선수 합류로 전력 변화\",
  ],
};
"""

text = re.sub(r"const CATEGORIES = \[[\s\S]*?\];\n", categories_block, text, count=1)
text = re.sub(r"const INITIAL_ARTICLES = \[[\s\S]*?\];\n", articles_block, text, count=1)
text = re.sub(r"const TITLE_POOL = \{[\s\S]*?\};\n", title_pool_block, text, count=1)

path.write_text(text, encoding='utf-8')
