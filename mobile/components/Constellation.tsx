import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";
import { View } from "react-native";
import { AXES } from "../lib/matching/axes";
import { colors } from "../lib/theme";
import type { AxisComparison } from "../lib/types";

interface ConstellationProps {
  axesSnapshot: AxisComparison[];
  size?: number;
}

/**
 * Visualisation multi-axes des deux profils (docs/architecture-app-rencontre.md
 * §3 et §7) — jamais réduite à un pourcentage unique : on montre les
 * positions relatives, pas un score de compatibilité.
 */
export function Constellation({ axesSnapshot, size = 280 }: ConstellationProps) {
  const center = size / 2;
  const radius = size / 2 - 32; // marge pour les labels
  const count = axesSnapshot.length;

  const angleFor = (i: number) => (i / count) * 2 * Math.PI - Math.PI / 2;
  const pointFor = (i: number, score: number) => {
    const normalized = (score + 1) / 2; // -1..1 -> 0..1
    const r = radius * normalized;
    const angle = angleFor(i);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const pointsA = axesSnapshot.map((a, i) => pointFor(i, a.scoreA));
  const pointsB = axesSnapshot.map((a, i) => pointFor(i, a.scoreB));

  const toPolygonPoints = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View>
      <Svg width={size} height={size}>
        {/* axes */}
        {axesSnapshot.map((_, i) => {
          const outer = pointFor(i, 1);
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}

        {/* anneau de référence */}
        <Circle cx={center} cy={center} r={radius} stroke={colors.border} strokeWidth={1} fill="none" />

        <Polygon
          points={toPolygonPoints(pointsA)}
          fill={colors.accent}
          fillOpacity={0.25}
          stroke={colors.accent}
          strokeWidth={2}
        />
        <Polygon
          points={toPolygonPoints(pointsB)}
          fill={colors.primary}
          fillOpacity={0.25}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {axesSnapshot.map((a, i) => {
          const labelPoint = pointFor(i, 1.28);
          const axisDef = AXES.find((ax) => ax.key === a.axis);
          return (
            <SvgText
              key={`label-${i}`}
              x={labelPoint.x}
              y={labelPoint.y}
              fill={colors.textMuted}
              fontSize={10}
              textAnchor="middle"
            >
              {axisDef?.label ?? a.axis}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
