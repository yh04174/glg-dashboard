"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const { entities, orgUnits, employees, titleMappings } = useStore();

  const undefinedTitles = titleMappings.filter((m) => !m.title.trim()).length;

  const stats = [
    { label: "법인 수", value: entities.length },
    { label: "조직 단위 수", value: orgUnits.length },
    { label: "등록 인원 수", value: employees.length },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">대시보드 개요</h1>
        <p className="text-sm text-[#0B1F3A]/60 mt-1">
          법인별 조직도 및 Global Grade Matrix 현황
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
            <div className="text-sm text-[#0B1F3A]/50">{s.label}</div>
            <div className="text-3xl font-semibold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {undefinedTitles > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <span className="text-amber-500 text-xl leading-none">!</span>
          <div>
            <div className="font-medium text-amber-800">직급 표준화 미확정 항목 {undefinedTitles}건</div>
            <div className="text-sm text-amber-700/80 mt-1">
              일부 법인의 GLG 등급에 대응하는 직책명이 아직 입력되지 않았습니다. Grade 매핑 화면에서 확정해주세요.
            </div>
            <Link
              href="/grademapping"
              className="inline-block mt-3 text-sm font-medium text-amber-800 underline underline-offset-2"
            >
              Grade 매핑으로 이동 →
            </Link>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">법인 목록</h2>
        <div className="grid grid-cols-3 gap-4">
          {entities.map((e) => {
            const unitCount = orgUnits.filter((u) => u.entityId === e.id).length;
            const empCount = employees.filter((emp) =>
              orgUnits.some((u) => u.id === emp.orgUnitId && u.entityId === e.id)
            ).length;
            return (
              <Link
                key={e.id}
                href={`/orgchart?entity=${e.id}`}
                className="bg-white rounded-xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="font-medium">{e.name}</span>
                </div>
                <div className="text-xs text-[#0B1F3A]/50">{e.shortName}</div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-[#0B1F3A]/60">조직 {unitCount}개 · 인원 {empCount}명</span>
                  <span className="text-[#0B1F3A]/60">Ceiling GLG{e.gradeCeiling}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
