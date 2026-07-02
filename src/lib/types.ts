export type Stream = "Executive" | "Leadership" | "Professional" | "Operational";

export interface Entity {
  id: string;
  name: string;       // 예: 한국본사, 미국법인, 체코법인
  shortName: string;  // 예: Korea HQ
  color: string;       // hex, 조직도 색상
  gradeCeiling: number; // 1~10, 이 법인에서 운영 가능한 최고 Grade
}

export interface TitleMapping {
  entityId: string;
  glg: number;        // 1~10
  title: string;       // 해당 법인에서 이 Grade에 대응하는 실제 직책명 (비어있으면 미확정)
}

export type OrgUnitType = "division" | "department" | "team";

export interface OrgUnit {
  id: string;
  entityId: string;
  name: string;
  type: OrgUnitType;
  parentId: string | null;
  headName?: string; // 조직장 이름
  memberCount?: number; // 표기용 인원수 (예: 팀 인원 5명)
}

export interface Employee {
  id: string;
  orgUnitId: string;
  name: string;
  glg: number;         // 1~10, 표준 Grade
  tenureYears: number;  // 연차 (레벨 표기용)
  color?: string;       // 개별 강조색 (선택)
}

export const GLG_LEVELS: { glg: number; stream: Stream }[] = [
  { glg: 10, stream: "Executive" },
  { glg: 9, stream: "Executive" },
  { glg: 8, stream: "Executive" },
  { glg: 7, stream: "Leadership" },
  { glg: 6, stream: "Leadership" },
  { glg: 5, stream: "Leadership" },
  { glg: 4, stream: "Professional" },
  { glg: 3, stream: "Professional" },
  { glg: 2, stream: "Operational" },
  { glg: 1, stream: "Operational" },
];

export const STREAM_COLOR: Record<Stream, string> = {
  Executive: "#0B1F3A",
  Leadership: "#1E4E8C",
  Professional: "#3E7CB8",
  Operational: "#9FC2E0",
};
