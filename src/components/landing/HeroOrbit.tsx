import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  COLOR_TEAL,
  COLOR_TEAL_LIGHT,
  COLOR_PURPLE,
  COLOR_TEXT_PRIMARY,
} from '../../tokens/chartColors';
import './HeroOrbit.css';

/* ── Ellipse rings ── */
const RINGS = [
  { rx: 110, ry: 70,  stroke: COLOR_TEAL,   opacity: 0.3 },
  { rx: 175, ry: 110, stroke: COLOR_TEAL,   opacity: 0.3 },
  { rx: 230, ry: 140, stroke: COLOR_PURPLE, opacity: 0.3 },
  { rx: 290, ry: 170, stroke: COLOR_PURPLE, opacity: 0.3 },
];

/* ── Node config — 7 nodes, Budget removed ── */
interface NodeConfig {
  rx: number;
  ry: number;
  startDeg: number;
  dur: number;
  label: string;
  isTeal: boolean;
}

const NODES: NodeConfig[] = [
  { rx: 110, ry: 70,  startDeg: 0,   dur: 14, label: 'Calories', isTeal: true  },
  { rx: 110, ry: 70,  startDeg: 180, dur: 14, label: 'Steps',    isTeal: true  },
  { rx: 175, ry: 110, startDeg: 60,  dur: 20, label: 'Protein',  isTeal: true  },
  { rx: 175, ry: 110, startDeg: 240, dur: 20, label: 'Carbs',    isTeal: true  },
  { rx: 230, ry: 140, startDeg: 120, dur: 26, label: 'Schedule', isTeal: false },
  { rx: 230, ry: 140, startDeg: 300, dur: 26, label: 'Recovery', isTeal: false },
  { rx: 290, ry: 170, startDeg: 30,  dur: 35, label: 'Variables',isTeal: false },
];

const CX = 280;
const CY = 280;
const LABEL_OFFSET = 12;

/* ── Stars (generated once, deterministic) ── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  size:    1 + (i * 7 % 3),
  top:     (i * 37 % 97) + '%',
  left:    (i * 53 % 99) + '%',
  color:   i % 2 === 0 ? 'teal' : 'purple',
  opacity: 0.15 + (i * 13 % 26) / 100,
  dur:     2 + (i * 11 % 30) / 10,
  delay:   (i * 7 % 30) / 10,
}));

const N = NODES.length;

export default function HeroOrbit() {
  const dotRefs   = useRef<(SVGCircleElement | null)[]>(Array(N).fill(null));
  const labelRefs = useRef<(SVGTextElement | null)[]>(Array(N).fill(null));
  const spokeRefs = useRef<(SVGLineElement | null)[]>(Array(N).fill(null));
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();

    function tick(now: number) {
      const t = (now - startTime) / 1000;

      NODES.forEach(({ rx, ry, startDeg, dur }, i) => {
        const startRad = (startDeg * Math.PI) / 180;
        const speed    = (2 * Math.PI) / dur;
        const angle    = startRad + speed * t;

        const nx = CX + rx * Math.cos(angle);
        const ny = CY + ry * Math.sin(angle);

        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute('cx', String(nx));
          dot.setAttribute('cy', String(ny));
        }

        const spoke = spokeRefs.current[i];
        if (spoke) {
          spoke.setAttribute('x2', String(nx));
          spoke.setAttribute('y2', String(ny));
        }

        /* Label: offset to the right of the node, always upright — no rotation */
        const lbl = labelRefs.current[i];
        if (lbl) {
          lbl.setAttribute('x', String(nx + LABEL_OFFSET));
          lbl.setAttribute('y', String(ny + 4));
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <motion.div
      className="hero-orbit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 0.5 }}
      aria-hidden="true"
    >
      {/* ── Stars ── */}
      <div className="hero-orbit__stars">
        {STARS.map((s, i) => (
          <div
            key={i}
            className={`ho-star ho-star--${s.color}`}
            style={{
              width:             s.size,
              height:            s.size,
              top:               s.top,
              left:              s.left,
              opacity:           s.opacity,
              animationDuration: `${s.dur}s`,
              animationDelay:    `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── SVG ── */}
      <svg
        className="hero-orbit__svg"
        viewBox="0 0 560 560"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rings */}
        {RINGS.map(({ rx, ry, stroke, opacity }, i) => (
          <ellipse
            key={i}
            cx={CX} cy={CY}
            rx={rx} ry={ry}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            opacity={opacity}
          />
        ))}

        {/* Spokes */}
        {NODES.map(({ isTeal }, i) => (
          <line
            key={i}
            ref={(el) => { spokeRefs.current[i] = el; }}
            x1={CX} y1={CY}
            x2={CX} y2={CY}
            stroke={isTeal ? COLOR_TEAL : COLOR_PURPLE}
            strokeWidth="1"
            opacity="0.15"
          />
        ))}

        {/* Centre brand */}
        <g className="ho-centre-group">
          <circle
            cx={CX} cy={CY} r={36}
            fill={COLOR_TEAL_LIGHT}
            stroke={COLOR_TEAL}
            strokeWidth="1.5"
            opacity="0.95"
          />
          <text
            x={CX} y={CY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontFamily="'Instrument Serif', serif"
            fontWeight="600"
          >
            <tspan fill={COLOR_TEAL}>Opti</tspan>
            <tspan fill={COLOR_TEXT_PRIMARY}>Fit</tspan>
          </text>
        </g>

        {/* Dots */}
        {NODES.map(({ isTeal }, i) => {
          const color = isTeal ? COLOR_TEAL : COLOR_PURPLE;
          return (
            <circle
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              cx={CX} cy={CY}
              r={7}
              fill={color}
              filter={`drop-shadow(0 0 6px ${color})`}
            />
          );
        })}

        {/* Labels — x/y updated each rAF frame, no rotation */}
        {NODES.map(({ isTeal, label }, i) => (
          <text
            key={i}
            ref={(el) => { labelRefs.current[i] = el; }}
            x={CX + LABEL_OFFSET}
            y={CY + 4}
            fill={isTeal ? COLOR_TEAL : COLOR_PURPLE}
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
            dominantBaseline="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    </motion.div>
  );
}
