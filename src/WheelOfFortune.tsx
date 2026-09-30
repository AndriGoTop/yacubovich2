import React, { useState, useRef, useEffect } from 'react';

/* ---------- Данные ---------- */
const SPECIAL: Record<string, string> = {
  'П': 'Приз',
  '+': 'Плюс',
  'К': 'Ключ',
  'Ш': 'Шанс',
  'Б': 'Банкрот',
  '0': 'Ноль',
  '×2': 'Удвоение',
};

// 36 секторов: 29 с очками + 7 специальных (спец. не повторяются)
const SECTORS: string[] = [
  '350', '400', 'П',   '450', '500',  '600', '650', '700', '+',  '750',
  '800', '850', '100',   '950', '1000', '350', '400', '450', 'Ш',  '500',
  '600', '650', '700', '750', 'Б',    '800', '850', '950', '1000','350',
  '400', '0',   '450', '500', '×2',   '600',
];

/* ---------- Геометрия ---------- */
const SIZE = 960;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 450;
const STEP = 360 / SECTORS.length; // 10°

function polar(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function sectorPath(a1: number, a2: number, r: number): string {
  const [x1, y1] = polar(a1, r);
  const [x2, y2] = polar(a2, r);
  return `M ${CX} ${CY} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

/* ---------- Компонент ---------- */
export default function WheelOfFortune() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const rotationRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const spin = () => {
    if (spinning) return;
    setResult(null);

    const idx = Math.floor(Math.random() * SECTORS.length);
    const center = idx * STEP + STEP / 2;
    // небольшой разброс, чтобы стрелка не всегда вставала ровно в центр
    const jitter = (Math.random() - 0.5) * (STEP - 2);
    const targetAngle = -(center + jitter);

    const current = rotationRef.current;
    const currentMod = ((current % 360) + 360) % 360;
    const targetMod = ((targetAngle % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;

    const newRot = current + 360 * 7 + delta; // 7 полных оборотов + доводка
    rotationRef.current = newRot;

    setSpinning(true);
    setRotation(newRot);

    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setResult(SECTORS[idx]);
    }, 5300);
  };

  const closeOverlay = () => setResult(null);

  return (
    <div className="wof-root">
      <style>{`
        .wof-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px;
          box-sizing: border-box;
          background: radial-gradient(circle at 50% 30%, #781e8a 0%, #400b4d 60%, #220520 100%);
          font-family: Arial, Helvetica, sans-serif;
        }

        .wof-stage {
          position: relative;
          width: min(96vw, 90vh, 960px);
          aspect-ratio: 1 / 1;
        }

        .wof-wheel {
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .wof-pointer {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 30px solid transparent;
          border-right: 30px solid transparent;
          border-top: 68px solid #ffffff;
          filter: drop-shadow(0 4px 9px rgba(0, 0, 0, 0.7));
          z-index: 5;
        }

        .wof-spin {
          padding: 14px 48px;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffffff;
          background: linear-gradient(180deg, #a925eb, #861e8a);
          border: 2px solid #ffffff;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 6px 18px rgba(232, 37, 235, 0.55);
        }
        .wof-spin:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(166, 37, 235, 0.8);
        }
        .wof-spin:active:not(:disabled) { transform: translateY(1px); }
        .wof-spin:disabled { opacity: 0.6; cursor: not-allowed; }

        .wof-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(5, 11, 34, 0.85);
          backdrop-filter: blur(6px);
          animation: wof-fade 0.25s ease-out;
        }

        .wof-modal {
          width: min(92vw, 520px);
          padding: 40px 48px;
          border-radius: 26px;
          text-align: center;
          background: linear-gradient(160deg, #ffffff 0%, #dbeafe 100%);
          border: 4px solid #a61dd8;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
          animation: wof-pop 0.35s cubic-bezier(0.2, 1.2, 0.4, 1);
        }

        .wof-modal-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #6d1e8a;
          margin-bottom: 14px;
        }

        .wof-modal-value {
          font-size: clamp(60px, 14vw, 140px);
          font-weight: 900;
          line-height: 1;
          color: #bc1dd8;
          margin-bottom: 6px;
          text-shadow: 0 4px 0 rgba(169, 29, 216, 0.15);
          word-break: break-word;
        }

        .wof-modal-symbol {
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 800;
          color: #711e8a;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }

        .wof-modal-btn {
          margin-top: 26px;
          padding: 12px 36px;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(180deg, #3a3a3a, #781e8a);
          border: none;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(235, 37, 215, 0.5);
          transition: transform 0.15s;
        }
        .wof-modal-btn:hover { transform: translateY(-2px); }

        @keyframes wof-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wof-pop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      <div className="wof-stage">
        <div className="wof-pointer" />

        <div
          className="wof-wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 5.2s cubic-bezier(0.15, 0.9, 0.2, 1)'
              : 'none',
          }}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
            {/* Внешние кольца */}
            <circle cx={CX} cy={CY} r={R + 18} fill="#3d083a" />
            <circle cx={CX} cy={CY} r={R + 10} fill="#ffffff" stroke="#7d1f92" strokeWidth="6" />

            {/* Сектора */}
            {SECTORS.map((label, i) => {
              const a1 = i * STEP;
              const a2 = (i + 1) * STEP;
              const isBlue = i % 2 === 1;
              const fill = isBlue ? '#d868ba' : '#ffffff';
              const textFill = isBlue ? '#ffffff' : '#9c4f87';
              const [tx, ty] = polar(a1 + STEP / 2, R * 0.76);

              return (
                <g key={i}>
                  <path
                    d={sectorPath(a1, a2, R)}
                    fill={fill}
                    stroke="#0b1e4d"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill={textFill}
                    fontSize={label.length > 2 ? 20 : 30}
                    fontWeight={800}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${a1 + STEP / 2} ${tx} ${ty})`}
                    style={{ userSelect: 'none' }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Ступица */}
            <circle cx={CX} cy={CY} r={56} fill="#4d0b4c" />
            <circle cx={CX} cy={CY} r={46} fill="#ffffff" />
            <circle cx={CX} cy={CY} r={36} fill="#882756" />
          </svg>
        </div>
      </div>

      <button className="wof-spin" onClick={spin} disabled={spinning}>
        {spinning ? 'Крутится…' : 'Крутить'}
      </button>

      {result && (
        <div className="wof-overlay" onClick={closeOverlay}>
          <div className="wof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wof-modal-title">
              {SPECIAL[result] ? 'Специальный сектор' : 'Выпало'}
            </div>

            <div className="wof-modal-value">
              {SPECIAL[result] ? SPECIAL[result] : result}
            </div>

            {SPECIAL[result] && (
              <div className="wof-modal-symbol">«{result}»</div>
            )}

            <button className="wof-modal-btn" onClick={closeOverlay}>
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
