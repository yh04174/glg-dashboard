import { Entity, TitleMapping, OrgUnit, Employee } from "./types";

export const sampleEntities: Entity[] = [
  { id: "kr-hq", name: "한국 본사", shortName: "Korea HQ", color: "#0B1F3A", gradeCeiling: 10 },
  { id: "us-plant", name: "미국 대형법인", shortName: "USA Plant", color: "#1E4E8C", gradeCeiling: 10 },
  { id: "cz-plant", name: "체코 중형법인", shortName: "Czech Plant", color: "#3E7CB8", gradeCeiling: 8 },
  { id: "udas1", name: "UDAS1", shortName: "UDAS1", color: "#0B1F3A", gradeCeiling: 10 },
  { id: "udas2", name: "UDAS2", shortName: "UDAS2", color: "#1E4E8C", gradeCeiling: 10 },
];

// 직급 표준화 미확정 상태 — 가안(draft)으로 비워두거나 임시값만 채움
export const sampleTitleMappings: TitleMapping[] = [
  { entityId: "kr-hq", glg: 10, title: "부사장/사장" },
  { entityId: "kr-hq", glg: 9, title: "전무이사" },
  { entityId: "kr-hq", glg: 8, title: "상무이사" },
  { entityId: "kr-hq", glg: 7, title: "책임 G3" },
  { entityId: "kr-hq", glg: 6, title: "책임 G2" },
  { entityId: "kr-hq", glg: 5, title: "책임 G1" },
  { entityId: "kr-hq", glg: 4, title: "매니저 M2" },
  { entityId: "kr-hq", glg: 3, title: "매니저 M1" },
  { entityId: "kr-hq", glg: 2, title: "5급 사원" },
  { entityId: "kr-hq", glg: 1, title: "인턴" },

  { entityId: "us-plant", glg: 10, title: "VP" },
  { entityId: "us-plant", glg: 9, title: "Director" },
  { entityId: "us-plant", glg: 8, title: "Plant Manager" },
  { entityId: "us-plant", glg: 7, title: "Senior Manager" },
  { entityId: "us-plant", glg: 6, title: "Manager" },
  { entityId: "us-plant", glg: 5, title: "Assistant Manager" },
  { entityId: "us-plant", glg: 4, title: "Sr. Specialist" },
  { entityId: "us-plant", glg: 3, title: "Specialist" },
  { entityId: "us-plant", glg: 2, title: "Clerk" },
  { entityId: "us-plant", glg: 1, title: "Intern" },

  { entityId: "cz-plant", glg: 8, title: "Director-Deputy" },
  { entityId: "cz-plant", glg: 7, title: "Manager-Senior" },
  { entityId: "cz-plant", glg: 6, title: "Manager" },
  { entityId: "cz-plant", glg: 5, title: "Manager-Junior" },
  { entityId: "cz-plant", glg: 4, title: "Manager-Deputy" },
  { entityId: "cz-plant", glg: 3, title: "Specialist-Senior" },
  { entityId: "cz-plant", glg: 2, title: "Specialist-Junior" },
  { entityId: "cz-plant", glg: 1, title: "Assistant" },
];

export const udas1OrgUnits: OrgUnit[] = [
  { id: "udas1-root", entityId: "udas1", name: "법인장(총괄)", type: "division", parentId: null, headName: "정성철 전무" },

  { id: "udas1-admin", entityId: "udas1", name: "관리본부", type: "division", parentId: "udas1-root", headName: "김석교 책임" },
  { id: "udas1-plant", entityId: "udas1", name: "생산본부(공장장)", type: "division", parentId: "udas1-root", headName: "Patrick" },

  // 관리본부 산하 실
  { id: "udas1-mgmt", entityId: "udas1", name: "경영관리(실)", type: "department", parentId: "udas1-admin", headName: "홍종호 매니저" },
  { id: "udas1-dev", entityId: "udas1", name: "개발(실)", type: "department", parentId: "udas1-admin", headName: "양진만 책임" },
  { id: "udas1-sales", entityId: "udas1", name: "영업원가(실)", type: "department", parentId: "udas1-admin", headName: "정재욱 책임" },
  { id: "udas1-quality", entityId: "udas1", name: "품질(실)", type: "department", parentId: "udas1-admin", headName: "조현우 책임" },

  // 생산본부 산하 실
  { id: "udas1-mfg", entityId: "udas1", name: "제조 기술(실)", type: "department", parentId: "udas1-plant", headName: "신규용 책임" },
  { id: "udas1-mold", entityId: "udas1", name: "금형/프레스(실)", type: "department", parentId: "udas1-plant", headName: "정재환 책임" },
  { id: "udas1-material", entityId: "udas1", name: "생관/자재/IT(실)", type: "department", parentId: "udas1-plant" },

  // 경영관리(실) 산하 팀
  { id: "udas1-hr", entityId: "udas1", name: "인사", type: "team", parentId: "udas1-mgmt", headName: "한환희 차장", memberCount: 5 },
  { id: "udas1-finance", entityId: "udas1", name: "재경", type: "team", parentId: "udas1-mgmt", headName: "이경훈 차장", memberCount: 5 },
  { id: "udas1-ga", entityId: "udas1", name: "일반관리(총무)", type: "team", parentId: "udas1-mgmt", headName: "양설 차장", memberCount: 6 },

  // 개발(실) 산하 팀
  { id: "udas1-dev-team", entityId: "udas1", name: "개발팀", type: "team", parentId: "udas1-dev", headName: "안중만 차장", memberCount: 6 },

  // 영업원가(실) 산하 팀
  { id: "udas1-cost-team", entityId: "udas1", name: "원가팀", type: "team", parentId: "udas1-sales", headName: "허정현 차장", memberCount: 6 },

  // 품질(실) 산하 팀
  { id: "udas1-qc-team", entityId: "udas1", name: "품질팀", type: "team", parentId: "udas1-quality", headName: "이민호 차장", memberCount: 22 },
  { id: "udas1-qc-dev-team", entityId: "udas1", name: "품질 관리/개발팀", type: "team", parentId: "udas1-quality", headName: "유용진 차장", memberCount: 2 },

  // 제조 기술(실) 산하 팀
  { id: "udas1-maint-team", entityId: "udas1", name: "생기/보전팀", type: "team", parentId: "udas1-mfg", headName: "이영만 부장", memberCount: 8 },
  { id: "udas1-prod-team", entityId: "udas1", name: "생산팀", type: "team", parentId: "udas1-mfg", headName: "양향주 차장", memberCount: 6 },

  // 금형/프레스(실) 산하 팀
  { id: "udas1-press-team", entityId: "udas1", name: "프레스/금형", type: "team", parentId: "udas1-mold", memberCount: 7 },

  // 생관/자재/IT(실) 산하 팀
  { id: "udas1-prod2-team", entityId: "udas1", name: "생산솽히친", type: "team", parentId: "udas1-material", headName: "정새힘 차장", memberCount: 7 },
  { id: "udas1-material-team", entityId: "udas1", name: "자재팀", type: "team", parentId: "udas1-material", headName: "손오용 차장", memberCount: 7 },
  { id: "udas1-logistics-team", entityId: "udas1", name: "물류팀", type: "team", parentId: "udas1-material", headName: "서희두 과장", memberCount: 1 },
];

export const udas2OrgUnits: OrgUnit[] = [
  { id: "udas2-root", entityId: "udas2", name: "법인장(총괄)", type: "division", parentId: null, headName: "정성철 전무" },
  { id: "udas2-branch", entityId: "udas2", name: "지점장", type: "division", parentId: "udas2-root", headName: "임준욱 책임", memberCount: 27 },

  { id: "udas2-mgmt-team", entityId: "udas2", name: "경영관리팀", type: "department", parentId: "udas2-branch", headName: "김현중 책임", memberCount: 10 },
  { id: "udas2-quality-dev-team", entityId: "udas2", name: "품질 개발팀", type: "department", parentId: "udas2-branch", headName: "허준 책임", memberCount: 4 },
  { id: "udas2-maint-team", entityId: "udas2", name: "생기/보전팀", type: "department", parentId: "udas2-branch", headName: "임준욱 책임(겸)", memberCount: 3 },
  { id: "udas2-prod-material-team", entityId: "udas2", name: "생산/자재팀", type: "department", parentId: "udas2-branch", headName: "박지홍 책임", memberCount: 6 },
];

export const sampleOrgUnits: OrgUnit[] = [
  { id: "kr-root", entityId: "kr-hq", name: "미래전략실", type: "division", parentId: null, headName: "임훈호 상무" },
  { id: "kr-team-1", entityId: "kr-hq", name: "미래전략팀", type: "team", parentId: "kr-root", headName: "김규태 책임" },

  { id: "us-root", entityId: "us-plant", name: "Operations", type: "division", parentId: null, headName: "J. Carter" },
  { id: "us-team-1", entityId: "us-plant", name: "Production Team", type: "team", parentId: "us-root", headName: "M. Lee" },

  { id: "cz-root", entityId: "cz-plant", name: "Plant Management", type: "division", parentId: null, headName: "P. Novak" },
  { id: "cz-team-1", entityId: "cz-plant", name: "Quality Team", type: "team", parentId: "cz-root", headName: "K. Dvorak" },

  ...udas1OrgUnits,
  ...udas2OrgUnits,
];

const CURRENT_YEAR = new Date().getFullYear();

export const sampleEmployees: Employee[] = [
  { id: "e1", orgUnitId: "kr-team-1", name: "김규태", glg: 7, joinYear: CURRENT_YEAR - 12 },
  { id: "e2", orgUnitId: "kr-team-1", name: "김채정", glg: 4, joinYear: CURRENT_YEAR - 3 },
  { id: "e3", orgUnitId: "kr-team-1", name: "박지연", glg: 4, joinYear: CURRENT_YEAR - 4 },
  { id: "e4", orgUnitId: "kr-team-1", name: "이준수", glg: 3, joinYear: CURRENT_YEAR - 2 },
  { id: "e5", orgUnitId: "kr-team-1", name: "김명조", glg: 4, joinYear: CURRENT_YEAR - 5 },

  { id: "e6", orgUnitId: "us-team-1", name: "M. Lee", glg: 6, joinYear: CURRENT_YEAR - 8 },
  { id: "e7", orgUnitId: "us-team-1", name: "A. Cole", glg: 3, joinYear: CURRENT_YEAR - 2 },

  { id: "e8", orgUnitId: "cz-team-1", name: "K. Dvorak", glg: 6, joinYear: CURRENT_YEAR - 6 },
  { id: "e9", orgUnitId: "cz-team-1", name: "L. Horak", glg: 3, joinYear: CURRENT_YEAR - 3 },
];
