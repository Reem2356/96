import { useState } from "react";
import { MosaicCanvas } from "../components/MosaicCanvas";
import { TileDetailModal } from "../components/TileDetailModal";
import { useApprovedSubmissions } from "../hooks/useApprovedSubmissions";
import { useReferenceTileColors } from "../hooks/useReferenceTileColors";
import { useMosaicStats } from "../hooks/useMosaicStats";
import type { Submission } from "../lib/types";

export function MosaicPage() {
  const { submissions } = useApprovedSubmissions();
  const colors = useReferenceTileColors();
  const stats = useMosaicStats();
  const [selected, setSelected] = useState<Submission | null>(null);

  const completionPercent = stats ? Math.round(stats.completionRatio * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-saudi-green-dark sm:text-4xl">لوحة الوطن</h1>
        <p className="mt-2 text-ink/60">
          كل قطعة صنعها شخص شاركنا حبه لوطنه. اكتملت اللوحة بنسبة {completionPercent}% حتى الآن —
          كبّر واسحب لاستكشافها، واضغط على أي قطعة مضيئة لقراءة مشاركتها.
        </p>
      </div>

      <MosaicCanvas approvedSubmissions={submissions} colors={colors} onTileClick={setSelected} />

      <div className="mt-4 text-center text-sm text-ink/50">
        {stats?.approvedCount ?? 0} مشاركة معتمدة من أصل {stats?.totalTiles ?? "—"} قطعة
      </div>

      <TileDetailModal submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
