import { Entity, TitleMapping, OrgUnit, Employee } from "./types";

export const sampleEntities: Entity[] = [
  { id: "kr-hq", name: "한국 본사", shortName: "Korea HQ", color: "#0B1F3A", gradeCeiling: 10 },
  { id: "us-plant", name: "미국 대형법인", shortName: "USA Plant", color: "#1E4E8C", gradeCeiling: 10 },
  { id: "cz-plant", name: "체코 중형법인", shortName: "Czech Plant", color: "#3E7CB8", gradeCeiling: 8 },
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

export const sampleOrgUnits: OrgUnit[] = [
  { id: "kr-root", entityId: "kr-hq", name: "미래전략실", type: "division", parentId: null, headName: "임훈호 상무" },
  { id: "kr-team-1", entityId: "kr-hq", name: "미래전략팀", type: "team", parentId: "kr-root", headName: "김규태 책임" },

  { id: "us-root", entityId: "us-plant", name: "Operations", type: "division", parentId: null, headName: "J. Carter" },
  { id: "us-team-1", entityId: "us-plant", name: "Production Team", type: "team", parentId: "us-root", headName: "M. Lee" },

  { id: "cz-root", entityId: "cz-plant", name: "Plant Management", type: "division", parentId: null, headName: "P. Novak" },
  { id: "cz-team-1", entityId: "cz-plant", name: "Quality Team", type: "team", parentId: "cz-root", headName: "K. Dvorak" },
];

export const sampleEmployees: Employee[] = [
  { id: "e1", orgUnitId: "kr-team-1", name: "김규태", glg: 7, tenureYears: 12 },
  { id: "e2", orgUnitId: "kr-team-1", name: "김채정", glg: 4, tenureYears: 3 },
  { id: "e3", orgUnitId: "kr-team-1", name: "박지연", glg: 4, tenureYears: 4 },
  { id: "e4", orgUnitId: "kr-team-1", name: "이준수", glg: 3, tenureYears: 2 },
  { id: "e5", orgUnitId: "kr-team-1", name: "김명조", glg: 4, tenureYears: 5 },

  { id: "e6", orgUnitId: "us-team-1", name: "M. Lee", glg: 6, tenureYears: 8 },
  { id: "e7", orgUnitId: "us-team-1", name: "A. Cole", glg: 3, tenureYears: 2 },

  { id: "e8", orgUnitId: "cz-team-1", name: "K. Dvorak", glg: 6, tenureYears: 6 },
  { id: "e9", orgUnitId: "cz-team-1", name: "L. Horak", glg: 3, tenureYears: 3 },
];
