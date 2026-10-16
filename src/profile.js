// README에 들어가는 프로필 원본 데이터입니다.
// README.md와 assets/는 `npm start`가 이 파일을 바탕으로 다시 만들기 때문에 내용 수정은 여기서 합니다.

export const profile = {
  github: "tkv00",
  name: { ko: "김도연", en: "DOYEON KIM" },
  role: "BACKEND ENGINEER",
  email: "tkv0098@gmail.com",
  intro: "안녕하세요, 요구 사항을 서버 구조 설계와 데이터 흐름으로 풀어내는 백엔드 개발자 김도연입니다.",
  tagline: "요구사항을 서버 구조와 데이터 흐름으로 풀어냅니다.",
  // 히어로 배너 콘솔에 한 줄씩 타이핑되는 문구 (Orbitron 글꼴이라 영문 대문자만 씁니다)
  consoleLines: [
    "CORRECT COMPLETION OVER 200 OK",
    "REQUIREMENTS > ARCHITECTURE > DATA FLOW",
    "RERUN SAFE. CONSISTENT. RECOVERABLE.",
    "LOAD TEST. FIND THE BREAK. WRITE DOWN WHY.",
  ],
  solvedac: "tkv00",
};

export const blog = {
  url: "https://tkv00.github.io/",
  feed: "https://tkv00.github.io/rss.xml",
  name: "깃돌",
  tagline: "부하를 걸어보고, 깨지는 지점을 찾고, 왜 깨졌는지 적어둡니다.",
  count: 5,
};

// icon은 go-skill-icons 아이콘 이름입니다. 새 아이콘은 처음 생성할 때 src/icons/에 내려받아 둡니다.
export const skills = [
  {
    category: "LANGUAGE",
    items: [
      ["java", "Java"],
      ["js", "JavaScript"],
      ["ts", "TypeScript"],
      ["c", "C"],
      ["cpp", "C++"],
      ["kotlin", "Kotlin"],
      ["python", "Python"],
    ],
  },
  { category: "FRAMEWORK", items: [["spring", "Spring"], ["react", "React"]] },
  {
    category: "DATABASE",
    items: [
      ["postgres", "PostgreSQL"],
      ["mysql", "MySQL"],
      ["dbeaver", "DBeaver"],
      ["sqlite", "SQLite"],
      ["redis", "Redis"],
    ],
  },
  {
    category: "DEVOPS",
    items: [["jenkins", "Jenkins"], ["docker", "Docker"], ["githubactions", "Actions"]],
  },
  { category: "CLOUD & INFRA", items: [["ec2", "EC2"], ["s3", "S3"], ["ubuntu", "Ubuntu"]] },
  { category: "TESTING", items: [["junit", "JUnit"], ["postman", "Postman"], ["grafana", "Grafana"]] },
  {
    category: "COLLABORATION",
    items: [
      ["notion", "Notion"],
      ["github", "GitHub"],
      ["slack", "Slack"],
      ["figma", "Figma"],
      ["jira", "Jira"],
    ],
  },
  { category: "SECURITY", items: [["jwt", "JWT"]] },
];

// 최신 프로젝트가 위에 오도록 정렬합니다. 미션 번호는 시간순으로 붙습니다.
export const projects = [
  {
    name: "Holliverse",
    url: "https://github.com/one-year-gap",
    period: ["2026.02.04", "2026.03.20"],
    award: "URECA 3기 최종융합 프로젝트 우수상",
    description: "고객 이탈률 예측, 추천 기능, 상담 데이터 분석을 통해 데이터 기반 운영 의사결정을 지원하는 CRM 서비스",
  },
  {
    name: "TR1L",
    url: "https://github.com/Team-TR1L",
    period: ["2026.01.07", "2026.01.27"],
    award: "URECA 3기 종합 프로젝트 우수상",
    description: "대규모 청구·정산 데이터를 기반으로 고객별 청구서 생성과 발송을 안정적으로 처리하는 통신 정산 플랫폼",
  },
  {
    name: "Shoot Pointer",
    url: "https://github.com/ShootPointer/ShootPointer_BE",
    period: ["2025.05", "2025.12"],
    description: "농구 영상을 업로드하면 개인 하이라이트를 생성하고, 생성된 결과를 커뮤니티 게시글과 랭킹으로 연결하는 서비스",
  },
  {
    name: "Qampus",
    url: "https://github.com/Team-Qampus/Quampus_BE",
    period: ["2025.01.20", "2025.03.15"],
    description: "대학생 대상 질문·정보 공유 기반 캠퍼스 커뮤니티 서비스",
  },
  {
    name: "Vero",
    url: "https://github.com/sw-security-web-app/sw-security-web-app_BE",
    period: ["2025.01.26", "2025.03.07"],
    description: "정보보안 SW 웹/앱 개발 공모전을 위해 진행한 보안 중심 웹 서비스 프로젝트",
  },
  {
    name: "WealthTracker",
    url: "https://github.com/software-project-yu/WealthTracker-BE",
    period: ["2024.09.28", "2024.12.06"],
    description: "가계부 데이터 기반 소비 분석과 맞춤형 피드백을 제공하는 자산 관리 서비스",
  },
  {
    name: "Beginner Fit",
    url: "https://github.com/Likelion-YeungNam-Univ/12th-BeginnerFit-FE",
    period: ["2024.07.14", "2024.08.07"],
    description: "운동 초보자를 위한 맞춤형 운동 루틴 추천 및 기록 서비스",
  },
];

export const activities = [
  { emoji: "🦁", name: "멋쟁이 사자처럼", detail: "12th", period: ["2024.03", "2024.12"] },
  { emoji: "💻", name: "SWYP", detail: "8기 BE파트", period: ["2025.01", "2025.03"] },
  { emoji: "💻", name: "LG U+ URECA", detail: "3기 백엔드", period: ["2025.08", "2026.03"] },
  { emoji: "💻", name: "SSAFY (서울)", detail: "16기", period: ["2026.07", null] },
  { emoji: "💻", name: "DND", detail: "15기", period: ["2026.07", null] },
];

export const certificates = [
  { name: "SQLD", detail: "SQL 개발자" },
  { name: "정보처리기사", detail: "국가기술자격" },
  { name: "ADsP", detail: "데이터분석 준전문가" },
  { name: "TOEIC Speaking", detail: "140 (IH)" },
];

export const openSource = [
  {
    repo: "microsoft/markitdown",
    number: 2412,
    url: "https://github.com/microsoft/markitdown/pull/2412",
    title: "Fix CSV parsing for CR-only line endings",
    description: "CR-only 줄바꿈이 포함된 CSV 파싱 문제 수정 및 회귀 테스트 추가",
    status: "MERGED",
    date: "2026.09",
  },
  {
    repo: "github/spec-kit",
    number: 4964,
    url: "https://github.com/github/spec-kit/pull/4964",
    title: "fix(extensions): list commands the way the active agent registers them",
    description: "확장 명령 목록이 에이전트가 실제로 등록한 이름과 다르게 표시되던 문제 수정 및 테스트 추가",
    status: "MERGED",
    date: "2026.10",
  },
];
