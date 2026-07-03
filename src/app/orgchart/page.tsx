"use client";

import { MouseEvent, Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { OrgUnit, Employee, OrgUnitType, computeTenureYears } from "@/lib/types";

function emptyUnit(entityId: string, parentId: string | null): OrgUnit {
  return { id: `unit-${Date.now()}`, entityId, name: "", type: "team", parentId };
}

function emptyEmployee(orgUnitId: string): Employee {
  return { id: `emp-${Date.now()}`, orgUnitId, name: "", glg: 3, joinYear: new Date().getFullYear() };
}

// 계층 깊이별 박스 색상 (최상위일수록 진하게)
const LEVEL_STYLES = [
  { bg: "#0B1F3A", text: "#FFFFFF", sub: "rgba(255,255,255,0.7)", border: "transparent" },
  { bg: "#1E4E8C", text: "#FFFFFF", sub: "rgba(255,255,255,0.7)", border: "transparent" },
  { bg: "#3E7CB8", text: "#FFFFFF", sub: "rgba(255,255,255,0.75)", border: "transparent" },
  { bg: "#FFFFFF", text: "#0B1F3A", sub: "rgba(11,31,58,0.5)", border: "#3E7CB8" },
  { bg: "#EEF2F7", text: "#0B1F3A", sub: "rgba(11,31,58,0.45)", border: "#C7D0DC" },
];
const levelStyle = (depth: number) => LEVEL_STYLES[Math.min(depth, LEVEL_STYLES.length - 1)];

function OrgChartInner() {
  const {
    entities,
    orgUnits,
    employees,
    titleMappings,
    addOrgUnit,
    updateOrgUnit,
    removeOrgUnit,
    countDescendants,
    addEmployee,
    updateEmployee,
    removeEmployee,
    canUndo,
    undo,
    checkpoints,
    saveCheckpoint,
    restoreCheckpoint,
    deleteCheckpoint,
  } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const [showVersions, setShowVersions] = useState(false);

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

  // 팬(드래그 스크롤)
  const panRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ dragging: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 확대/축소 — 인원이 많아질 것을 대비해 기본값을 작게 시작
  const [zoom, setZoom] = useState(0.6);
  const zoomIn = () => setZoom((z) => Math.min(1.2, Math.round((z + 0.1) * 100) / 100));
  const zoomOut = () => setZoom((z) => Math.max(0.3, Math.round((z - 0.1) * 100) / 100));

  const onPanMouseDown = (ev: MouseEvent) => {
    const el = panRef.current;
    if (!el) return;
    dragState.current = {
      dragging: true,
      moved: false,
      startX: ev.clientX,
      startY: ev.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    setIsDragging(true);
  };

  const onPanMouseMove = (ev: MouseEvent) => {
    const el = panRef.current;
    const ds = dragState.current;
    if (!ds.dragging || !el) return;
    const dx = ev.clientX - ds.startX;
    const dy = ev.clientY - ds.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) ds.moved = true;
    el.scrollLeft = ds.scrollLeft - dx;
    el.scrollTop = ds.scrollTop - dy;
  };

  const endPan = () => {
    dragState.current.dragging = false;
    setIsDragging(false);
  };

  // 인접한 실/본부로 조직 이동
  const moveUnit = (unit: OrgUnit, direction: "prev" | "next") => {
    if (!unit.parentId) return;
    const parent = units.find((u) => u.id === unit.parentId);
    if (!parent) return;
    const uncles = units.filter((u) => u.parentId === parent.parentId);
    const idx = uncles.findIndex((u) => u.id === parent.id);
    const targetParent = direction === "prev" ? uncles[idx - 1] : uncles[idx + 1];
    if (!targetParent) return;
    updateOrgUnit({ ...unit, parentId: targetParent.id });
  };

  const canMove = (unit: OrgUnit, direction: "prev" | "next") => {
    if (!unit.parentId) return false;
    const parent = units.find((u) => u.id === unit.parentId);
    if (!parent) return false;
    const uncles = units.filter((u) => u.parentId === parent.parentId);
    const idx = uncles.findIndex((u) => u.id === parent.id);
    return direction === "prev" ? idx > 0 : idx < uncles.length - 1;
  };

  const renderNode = (unit: OrgUnit, depth: number = 0) => {
    const kids = childrenOf(unit.id);
    const isSelected = selectedUnitId === unit.id;
    const style = levelStyle(depth);
    return (
      <li key={unit.id}>
        {/* -mt-7/pt-7 는 li 상단 연결선 여백(28px)만큼 히트 영역을 위로 넓혀서,
            버튼→화살표로 이동할 때 커서가 그룹을 벗어나 화살표에 닿지 못하는 사각지대를 없앤다. */}
        <div className={`group relative inline-block ${unit.parentId ? "-mt-7 pt-7" : ""}`}>
          {unit.parentId && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 z-20">
              <button
                title="왼쪽 실/본부로 이동"
                disabled={!canMove(unit, "prev")}
                onClick={(ev) => {
                  ev.stopPropagation();
                  moveUnit(unit, "prev");
                }}
                className="w-6 h-6 rounded bg-white border border-black/10 shadow text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
              >
                ◀
              </button>
              <button
                title="오른쪽 실/본부로 이동"
                disabled={!canMove(unit, "next")}
                onClick={(ev) => {
                  ev.stopPropagation();
                  moveUnit(unit, "next");
                }}
                className="w-6 h-6 rounded bg-white border border-black/10 shadow text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
              >
                ▶
              </button>
            </div>
          )}
          <button
            onClick={() => {
              if (dragState.current.moved) return;
              setSelectedUnitId(isSelected ? null : unit.id);
            }}
            className={`min-w-[140px] rounded-md px-4 py-2 text-sm text-center shadow-sm transition-transform hover:scale-[1.03] border ${
              isSelected ? "ring-2 ring-offset-2 ring-[#1E4E8C]" : ""
            }`}
            style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
          >
            <div className="font-medium">{unit.name || "(이름 없음)"}</div>
            {unit.headName && (
              <div className="text-[11px]" style={{ color: style.sub }}>
                {unit.headName}
              </div>
            )}
          </button>
        </div>
        {kids.length > 0 && (
          <ul>
            {kids.map((k) => renderNode(k, depth + 1))}
          </ul>
        )}
      </li>
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="바로 직전 변경을 취소합니다"
            className="text-sm px-3 py-1.5 rounded-md border border-black/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
          >
            ↩ 실행 취소
          </button>
          <button
            onClick={() => {
              const label = window.prompt("저장할 버전 이름을 입력하세요", `${entity?.name ?? ""} ${new Date().toLocaleString("ko-KR")}`);
              if (label !== null) saveCheckpoint(label);
            }}
            className="text-sm px-3 py-1.5 rounded-md border border-black/10 hover:bg-black/5"
          >
            💾 현재 상태 저장
          </button>
          <button
            onClick={() => setShowVersions((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-md border border-black/10 hover:bg-black/5"
          >
            저장된 버전 ({checkpoints.length}) {showVersions ? "▲" : "▼"}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="w-7 h-7 rounded border border-black/10 bg-white text-sm hover:bg-black/5"
            title="축소"
          >
            −
          </button>
          <span className="text-xs text-[#0B1F3A]/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomIn}
            className="w-7 h-7 rounded border border-black/10 bg-white text-sm hover:bg-black/5"
            title="확대"
          >
            +
          </button>
        </div>
      </div>

      {showVersions && (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4">
          {checkpoints.length === 0 ? (
            <div className="text-sm text-[#0B1F3A]/40 py-2">저장된 버전이 없습니다.</div>
          ) : (
            <ul className="divide-y divide-black/5">
              {[...checkpoints].reverse().map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{c.label}</div>
                    <div className="text-xs text-[#0B1F3A]/40">
                      {new Date(c.savedAt).toLocaleString("ko-KR")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`"${c.label}" 시점으로 되돌릴까요? 현재 상태는 실행 취소로 복구할 수 있습니다.`)) {
                          restoreCheckpoint(c.id);
                          setSelectedUnitId(null);
                        }
                      }}
                      className="text-[#1E4E8C] px-2 py-1"
                    >
                      복원
                    </button>
                    <button
                      onClick={() => deleteCheckpoint(c.id)}
                      className="text-red-500 px-2 py-1"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        ref={panRef}
        onMouseDown={onPanMouseDown}
        onMouseMove={onPanMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        className={`org-pan bg-white rounded-xl border border-black/5 shadow-sm p-8 overflow-auto max-h-[75vh] ${
          isDragging ? "dragging" : ""
        }`}
      >
        {roots.length === 0 ? (
          <div className="text-center text-[#0B1F3A]/40 py-10">
            아직 등록된 조직이 없습니다. &quot;최상위 조직 추가&quot;로 시작하세요.
          </div>
        ) : (
          <div style={{ zoom }}>
            <ul className="org-tree">{roots.map((r) => renderNode(r))}</ul>
          </div>
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
                  const descendants = countDescendants(selectedUnit.id);
                  const isRoot = selectedUnit.parentId === null;
                  const warning = isRoot
                    ? `\n\n※ "${selectedUnit.name}"은(는) 최상위 조직입니다. 삭제하면 이 법인의 조직도 전체(${descendants}개 하위 조직)가 사라집니다.`
                    : descendants > 0
                    ? `\n\n하위 조직 ${descendants}개도 함께 삭제됩니다.`
                    : "";
                  if (confirm(`"${selectedUnit.name}"을(를) 삭제할까요?${warning}\n\n(실행 취소로 되돌릴 수 있습니다)`)) {
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
                <div className="text-xs text-[#0B1F3A]/40">Lv. {computeTenureYears(emp.joinYear)}년차 · GLG{emp.glg}</div>
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
            <label className="text-xs text-[#0B1F3A]/60">입사연도</label>
            <input
              type="number"
              min={1970}
              max={new Date().getFullYear()}
              value={draft.joinYear}
              onChange={(ev) => setDraft({ ...draft, joinYear: Number(ev.target.value) })}
              className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
            />
            <div className="text-[11px] text-[#0B1F3A]/40 mt-1">
              {computeTenureYears(draft.joinYear)}년차 (매년 1/1 자동 갱신)
            </div>
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
