import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
export const Hello: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0b6e4f", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", fontSize: 64, opacity }}>Remotion ✓</h1>
    </AbsoluteFill>
  );
};
