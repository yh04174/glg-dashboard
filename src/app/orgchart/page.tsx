"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { OrgUnit, Employee, OrgUnitType } from "@/lib/types";

function emptyUnit(entityId: string, parentId: string | null): OrgUnit {
  return { id: `unit-${Date.now()}`, entityId, name: "", type: "team", parentId };
}

function emptyEmployee(orgUnitId: string): Employee {
  return { id: `emp-${Date.now()}`, orgUnitId, name: "", glg: 3, tenureYears: 1 };
}

function OrgChartInner() {
  const { entities, orgUnits, employees, titleMappings, addOrgUnit, updateOrgUnit, removeOrgUnit, addEmployee, updateEmployee, removeEmployee } = useStore();
  const params = useSearchParams();
  const router = useRouter();

  const entityId = params.get("entity") ?? entities[0]?.id ?? "";
  const entity = entities.find((e) => e.id === entityId);

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<OrgUnit | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const units = useMemo(
    () => orgUnits.filter((u) => u.entityId === entityId),
    [orgUnits, entityId]
  );
  const roots = units.filter((u) => u.parentId === null);

  const titleFor = (glg: number) =>
    titleMappings.find((m) => m.entityId === entityId && m.glg === glg)?.title || `GLG${glg}`;

  const childrenOf = (id: string) => units.filter((u) => u.parentId === id);

  const renderNode = (unit: OrgUnit) => {
    const kids = childrenOf(unit.id);
    const isSelected = selectedUnitId === unit.id;
    return (
      <div key={unit.id} className="flex flex-col items-center">
        <button
          onClick={() => setSelectedUnitId(isSelected ? null : unit.id)}
          className={`min-w-[140px] rounded-md px-4 py-2 text-sm text-white text-center shadow-sm transition-transform hover:scale-[1.03] ${
            isSelected ? "ring-2 ring-offset-2 ring-[#1E4E8C]" : ""
          }`}
          style={{ backgroundColor: entity?.color ?? "#1E4E8C" }}
        >
          <div className="font-medium">{unit.name || "(이름 없음)"}</div>
          {unit.headName && <div className="text-[11px] text-white/70">{unit.headName}</div>}
        </button>
        {kids.length > 0 && (
          <div className="flex gap-8 mt-6 border-t border-black/10 pt-6">
            {kids.map((k) => renderNode(k))}
          </div>
        )}
      </div>
    );
  };

  const selectedUnit = units.find((u) => u.id === selectedUnitId) ?? null;
  const selectedEmployees = selectedUnit
    ? employees.filter((e) => e.orgUnitId === selectedUnit.id)
    : [];

  if (!entity) {
    return (
      <div className="p-8 text-[#0B1F3A]/50">
        먼저 법인 관리에서 법인을 추가해주세요.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">조직도</h1>
          <p className="text-sm text-[#0B1F3A]/60 mt-1">
            조직 단위를 클릭하면 하위 인원을 확인·편집할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={entityId}
            onChange={(ev) => router.push(`/orgchart?entity=${ev.target.value}`)}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setEditingUnit(emptyUnit(entityId, null))}
            className="bg-[#0B1F3A] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90"
          >
            + 최상위 조직 추가
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-8 overflow-x-auto">
        {roots.length === 0 ? (
          <div className="text-center text-[#0B1F3A]/40 py-10">
            아직 등록된 조직이 없습니다. &quot;최상위 조직 추가&quot;로 시작하세요.
          </div>
        ) : (
          <div className="flex gap-10 justify-center">{roots.map((r) => renderNode(r))}</div>
        )}
      </div>

      {selectedUnit && (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg">{selectedUnit.name} · 인원 {selectedEmployees.length}명</div>
              <div className="text-xs text-[#0B1F3A]/50 mt-0.5">{selectedUnit.headName}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingUnit(emptyUnit(entityId, selectedUnit.id))}
                className="text-sm px-3 py-1.5 rounded-md border border-black/10"
              >
                + 하위 조직 추가
              </button>
              <button
                onClick={() => setEditingUnit(selectedUnit)}
                className="text-sm px-3 py-1.5 rounded-md border border-black/10"
              >
                조직 정보 수정
              </button>
              <button
                onClick={() => {
                  if (confirm(`${selectedUnit.name}을(를) 삭제할까요? 하위 조직과 소속 인원도 함께 삭제됩니다.`)) {
                    removeOrgUnit(selectedUnit.id);
                    setSelectedUnitId(null);
                  }
                }}
                className="text-sm px-3 py-1.5 rounded-md border border-red-200 text-red-500"
              >
                조직 삭제
              </button>
              <button
                onClick={() => setEditingEmp(emptyEmployee(selectedUnit.id))}
                className="text-sm px-3 py-1.5 rounded-md bg-[#1E4E8C] text-white"
              >
                + 인원 추가
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {selectedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="border border-black/10 rounded-lg p-3 relative group"
                style={{ borderLeft: `4px solid ${emp.color ?? entity.color}` }}
              >
                <div className="font-medium text-sm">{emp.name || "(이름 없음)"}</div>
                <div className="text-xs text-[#0B1F3A]/60 mt-1">{titleFor(emp.glg)}</div>
                <div className="text-xs text-[#0B1F3A]/40">Lv. {emp.tenureYears}년차 · GLG{emp.glg}</div>
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-2 text-xs">
                  <button onClick={() => setEditingEmp(emp)} className="text-[#1E4E8C]">
                    수정
                  </button>
                  <button onClick={() => removeEmployee(emp.id)} className="text-red-500">
                    삭제
                  </button>
                </div>
              </div>
            ))}
            {selectedEmployees.length === 0 && (
              <div className="col-span-4 text-center text-[#0B1F3A]/40 py-6">
                등록된 인원이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {editingUnit && (
        <UnitModal
          unit={editingUnit}
          isNew={!units.some((u) => u.id === editingUnit.id)}
          onCancel={() => setEditingUnit(null)}
          onSave={(u) => {
            if (!units.some((x) => x.id === u.id)) addOrgUnit(u);
            else updateOrgUnit(u);
            setEditingUnit(null);
          }}
        />
      )}

      {editingEmp && (
        <EmployeeModal
          emp={editingEmp}
          isNew={!employees.some((e) => e.id === editingEmp.id)}
          maxGlg={entity.gradeCeiling}
          onCancel={() => setEditingEmp(null)}
          onSave={(e) => {
            if (!employees.some((x) => x.id === e.id)) addEmployee(e);
            else updateEmployee(e);
            setEditingEmp(null);
          }}
        />
      )}
    </div>
  );
}

function UnitModal({
  unit,
  isNew,
  onCancel,
  onSave,
}: {
  unit: OrgUnit;
  isNew: boolean;
  onCancel: () => void;
  onSave: (u: OrgUnit) => void;
}) {
  const [draft, setDraft] = useState(unit);
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl">
        <h2 className="font-semibold text-lg">{isNew ? "조직 추가" : "조직 수정"}</h2>
        <div>
          <label className="text-xs text-[#0B1F3A]/60">조직명</label>
          <input
            value={draft.name}
            onChange={(ev) => setDraft({ ...draft, name: ev.target.value })}
            className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
            placeholder="예: 미래전략팀"
          />
        </div>
        <div>
          <label className="text-xs text-[#0B1F3A]/60">조직장 이름 (선택)</label>
          <input
            value={draft.headName ?? ""}
            onChange={(ev) => setDraft({ ...draft, headName: ev.target.value })}
            className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[#0B1F3A]/60">유형</label>
          <select
            value={draft.type}
            onChange={(ev) => setDraft({ ...draft, type: ev.target.value as OrgUnitType })}
            className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
          >
            <option value="division">본부/실</option>
            <option value="department">부서</option>
            <option value="team">팀</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-md border border-black/10">
            취소
          </button>
          <button
            onClick={() => draft.name.trim() && onSave(draft)}
            className="px-4 py-2 text-sm rounded-md bg-[#0B1F3A] text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeModal({
  emp,
  isNew,
  maxGlg,
  onCancel,
  onSave,
}: {
  emp: Employee;
  isNew: boolean;
  maxGlg: number;
  onCancel: () => void;
  onSave: (e: Employee) => void;
}) {
  const [draft, setDraft] = useState(emp);
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl">
        <h2 className="font-semibold text-lg">{isNew ? "인원 추가" : "인원 수정"}</h2>
        <div>
          <label className="text-xs text-[#0B1F3A]/60">이름</label>
          <input
            value={draft.name}
            onChange={(ev) => setDraft({ ...draft, name: ev.target.value })}
            className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-[#0B1F3A]/60">GLG (직급)</label>
            <select
              value={draft.glg}
              onChange={(ev) => setDraft({ ...draft, glg: Number(ev.target.value) })}
              className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
            >
              {Array.from({ length: maxGlg }, (_, i) => maxGlg - i).map((n) => (
                <option key={n} value={n}>
                  GLG{n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-[#0B1F3A]/60">연차</label>
            <input
              type="number"
              min={0}
              value={draft.tenureYears}
              onChange={(ev) => setDraft({ ...draft, tenureYears: Number(ev.target.value) })}
              className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#0B1F3A]/60">강조 색상 (선택)</label>
          <input
            type="color"
            value={draft.color ?? "#1E4E8C"}
            onChange={(ev) => setDraft({ ...draft, color: ev.target.value })}
            className="block mt-1 w-16 h-9 rounded cursor-pointer border border-black/10"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-md border border-black/10">
            취소
          </button>
          <button
            onClick={() => draft.name.trim() && onSave(draft)}
            className="px-4 py-2 text-sm rounded-md bg-[#0B1F3A] text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#0B1F3A]/40">불러오는 중...</div>}>
      <OrgChartInner />
    </Suspense>
  );
}
