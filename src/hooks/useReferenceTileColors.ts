import { useEffect, useState } from "react";
import { getReferenceTileColors, type TileTargetColor } from "../lib/referenceImage";

export function useReferenceTileColors() {
  const [colors, setColors] = useState<TileTargetColor[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReferenceTileColors().then((c) => {
      if (!cancelled) setColors(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return colors;
}
