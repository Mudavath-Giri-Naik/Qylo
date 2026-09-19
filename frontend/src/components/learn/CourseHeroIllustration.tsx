// Purely decorative -- a stylized Bloch sphere and gate diagram for the
// course hero banner, not a real circuit simulation (see BlochSphere.tsx /
// the circuit builder for the real thing).
export default function CourseHeroIllustration() {
  return (
    <svg viewBox="0 0 360 220" className="w-full max-w-[300px]" role="presentation" aria-hidden>
      <g opacity={0.9}>
        <circle cx={110} cy={110} r={78} fill="#ffffff" fillOpacity={0.08} stroke="#c9b8ff" strokeOpacity={0.5} strokeWidth={1.5} />
        <ellipse cx={110} cy={110} rx={78} ry={22} fill="none" stroke="#c9b8ff" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="4 4" />
        <line x1={32} y1={110} x2={188} y2={110} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1} />
        <line x1={110} y1={32} x2={110} y2={188} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1} />
        <line x1={110} y1={110} x2={158} y2={62} stroke="#a78bfa" strokeWidth={3} strokeLinecap="round" />
        <circle cx={158} cy={62} r={5} fill="#a78bfa" />
        <circle cx={110} cy={110} r={2.5} fill="#ffffff" fillOpacity={0.6} />
        <text x={110} y={22} textAnchor="middle" fontSize={13} fill="#e9e4ff">|0⟩</text>
        <text x={110} y={206} textAnchor="middle" fontSize={13} fill="#e9e4ff">|1⟩</text>
      </g>

      <g fontFamily="ui-monospace, monospace">
        <line x1={222} y1={88} x2={340} y2={88} stroke="#8ea2c9" strokeWidth={1.5} />
        <line x1={222} y1={144} x2={340} y2={144} stroke="#8ea2c9" strokeWidth={1.5} />
        <line x1={252} y1={88} x2={252} y2={144} stroke="#8ea2c9" strokeWidth={1.5} />

        <rect x={228} y={70} width={48} height={36} rx={10} fill="#4c3fae" stroke="#a78bfa" strokeWidth={1.5} />
        <text x={252} y={94} textAnchor="middle" fontSize={16} fontWeight={700} fill="#ffffff">H</text>

        <circle cx={252} cy={144} r={16} fill="none" stroke="#8ea2c9" strokeWidth={1.5} />
        <text x={252} y={149} textAnchor="middle" fontSize={14} fontWeight={700} fill="#e9e4ff">X</text>

        <text x={334} y={83} textAnchor="end" fontSize={12} fill="#e9e4ff">|0⟩</text>
        <text x={334} y={139} textAnchor="end" fontSize={12} fill="#e9e4ff">|1⟩</text>
      </g>
    </svg>
  );
}
