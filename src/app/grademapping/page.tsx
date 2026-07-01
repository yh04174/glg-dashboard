"use client";

import { useStore } from "@/lib/store";
import { GLG_LEVELS, STREAM_COLOR } from "@/lib/types";

export default function GradeMappingPage() {
  const { entities, titleMappings, setTitle } = useStore();

  const getTitle = (entityId: string, glg: number) =>
    titleMappings.find((m) => m.entityId === entityId && m.glg === glg)?.title ?? "";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Grade 매핑</h1>
        <p className="text-sm text-[#0B1F3A]/60 mt-1">
          GLG1~GLG10 공통 축을 기준으로 법인별 실제 직책명을 입력·수정합니다. 비어 있으면 아직 표준화가 확정되지 않은 항목입니다.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-[#F4F6FA] text-left text-[#0B1F3A]/60">
              <th className="px-4 py-3 font-medium w-24">GLG</th>
              <th className="px-4 py-3 font-medium w-32">Stream</th>
              {entities.map((e) => (
                <th key={e.id} className="px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: e.color }}
                    />
                    {e.shortName}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GLG_LEVELS.map(({ glg, stream }) => (
              <tr key={glg} className="border-t border-black/5">
                <td className="px-4 py-2 font-semibold">GLG{glg}</td>
                <td className="px-4 py-2">
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: STREAM_COLOR[stream] }}
                  >
                    {stream}
                  </span>
                </td>
                {entities.map((e) => {
                  const aboveCeiling = glg > e.gradeCeiling;
                  return (
                    <td key={e.id} className="px-4 py-2">
                      {aboveCeiling ? (
                        <span className="text-xs text-[#0B1F3A]/25">— (Ceiling 이상)</span>
                      ) : (
                        <input
                          value={getTitle(e.id, glg)}
                          onChange={(ev) => setTitle(e.id, glg, ev.target.value)}
                          placeholder="미확정"
                          className="w-full border border-transparent hover:border-black/10 focus:border-[#1E4E8C] rounded-md px-2 py-1.5 text-sm outline-none bg-transparent focus:bg-white placeholder:text-[#0B1F3A]/25"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
