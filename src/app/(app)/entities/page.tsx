"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Entity } from "@/lib/types";

function emptyEntity(): Entity {
  return {
    id: `entity-${Date.now()}`,
    name: "",
    shortName: "",
    color: "#1E4E8C",
    gradeCeiling: 10,
  };
}

export default function EntitiesPage() {
  const { entities, addEntity, updateEntity, removeEntity, canEdit } = useStore();
  const [editing, setEditing] = useState<Entity | null>(null);

  const isNew = editing ? !entities.some((e) => e.id === editing.id) : false;

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    if (isNew) addEntity(editing);
    else updateEntity(editing);
    setEditing(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">법인 관리</h1>
          <p className="text-sm text-[#0B1F3A]/60 mt-1">
            조직도/Grade 매핑에서 사용할 법인을 추가·수정합니다.
          </p>
        </div>
        {canEdit ? (
          <button
            onClick={() => setEditing(emptyEntity())}
            className="bg-[#0B1F3A] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0B1F3A]/90"
          >
            + 법인 추가
          </button>
        ) : (
          <span className="text-xs text-[#0B1F3A]/40 border border-black/10 rounded-lg px-3 py-2">
            보기 전용 계정
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F6FA] text-left text-[#0B1F3A]/60">
              <th className="px-5 py-3 font-medium">색상</th>
              <th className="px-5 py-3 font-medium">법인명</th>
              <th className="px-5 py-3 font-medium">약칭</th>
              <th className="px-5 py-3 font-medium">Grade Ceiling</th>
              <th className="px-5 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-t border-black/5">
                <td className="px-5 py-3">
                  <span
                    className="inline-block w-4 h-4 rounded-full align-middle"
                    style={{ backgroundColor: e.color }}
                  />
                </td>
                <td className="px-5 py-3 font-medium">{e.name}</td>
                <td className="px-5 py-3 text-[#0B1F3A]/60">{e.shortName}</td>
                <td className="px-5 py-3">GLG{e.gradeCeiling}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  {canEdit ? (
                    <>
                      <button
                        onClick={() => setEditing(e)}
                        className="text-[#1E4E8C] hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${e.name}을(를) 삭제할까요? 소속 조직도/인원 데이터도 함께 삭제됩니다.`)) {
                            removeEntity(e.id);
                          }
                        }}
                        className="text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <span className="text-[#0B1F3A]/30">-</span>
                  )}
                </td>
              </tr>
            ))}
            {entities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#0B1F3A]/40">
                  등록된 법인이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl">
            <h2 className="font-semibold text-lg">{isNew ? "법인 추가" : "법인 수정"}</h2>

            <div>
              <label className="text-xs text-[#0B1F3A]/60">법인명</label>
              <input
                value={editing.name}
                onChange={(ev) => setEditing({ ...editing, name: ev.target.value })}
                className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
                placeholder="예: 인도법인"
              />
            </div>

            <div>
              <label className="text-xs text-[#0B1F3A]/60">약칭 (영문)</label>
              <input
                value={editing.shortName}
                onChange={(ev) => setEditing({ ...editing, shortName: ev.target.value })}
                className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
                placeholder="예: India Plant"
              />
            </div>

            <div className="flex gap-4">
              <div>
                <label className="text-xs text-[#0B1F3A]/60">색상</label>
                <input
                  type="color"
                  value={editing.color}
                  onChange={(ev) => setEditing({ ...editing, color: ev.target.value })}
                  className="block mt-1 w-16 h-9 rounded cursor-pointer border border-black/10"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#0B1F3A]/60">Grade Ceiling (최고 GLG)</label>
                <select
                  value={editing.gradeCeiling}
                  onChange={(ev) =>
                    setEditing({ ...editing, gradeCeiling: Number(ev.target.value) })
                  }
                  className="w-full mt-1 border border-black/10 rounded-md px-3 py-2 text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
                    <option key={n} value={n}>
                      GLG{n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm rounded-md border border-black/10"
              >
                취소
              </button>
              <button
                onClick={save}
                className="px-4 py-2 text-sm rounded-md bg-[#0B1F3A] text-white"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
