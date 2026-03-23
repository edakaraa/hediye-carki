// src/components/WheelPanel.tsx

import type { FC } from 'react';

// Referans görseldeki 8 canlı renk (Olabildiğince yakın kodlar)
const SEGMENT_COLORS = [
  '#00BFFF', // Cyan
  '#EE82EE', // Pink
  '#9400D3', // Purple
  '#FF8C00', // Orange
  '#FF4500', // Red
  '#FF1493', // Fuchsia
  '#00FF00', // Green
  '#FFD700'  // Yellow
];

// Dilim metin rengi (Beyaz, referans gibi)
const SEGMENT_TEXT_COLOR = 'text-white';

interface WheelPanelProps {
  selectedInterests: string[];
  isSpinning: boolean;
  rotation: number;
}

const WheelPanel: FC<WheelPanelProps> = ({ selectedInterests, isSpinning, rotation }) => {
  const numSegments = selectedInterests.length;
  // 0 segmente bölmeyi önlemek için default açıyı 360 yapıyoruz
  const ANGLE_PER_SEGMENT = numSegments > 0 ? 360 / numSegments : 360;
  const radius = 180; // Çarkın yarıçapı
  const center = 200; // SVG merkezi koordinatları (x,y)
  const outerBorderWidth = 12; // Işıklı dış çerçeve genişliği

  // SVG Path (yay dilimi) oluşturma fonksiyonu
  const createSegmentPath = (index: number) => {
    const startAngle = index * ANGLE_PER_SEGMENT - 90; // Saat 12 yönünden başla
    const endAngle = (index + 1) * ANGLE_PER_SEGMENT - 90;

    const largeArcFlag = ANGLE_PER_SEGMENT > 180 ? 1 : 0;

    const startX = center + radius * Math.cos(startAngle * Math.PI / 180);
    const startY = center + radius * Math.sin(startAngle * Math.PI / 180);
    const endX = center + radius * Math.cos(endAngle * Math.PI / 180);
    const endY = center + radius * Math.sin(endAngle * Math.PI / 180);

    return `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
  };

  // Dilim metninin pozisyonunu ve açısını hesaplama
  const getSegmentTextPosition = (index: number) => {
    const angle = (index + 0.5) * ANGLE_PER_SEGMENT - 90;
    const textRadius = radius - 55; // Metni dilimin içine yerleştir
    const x = center + textRadius * Math.cos(angle * Math.PI / 180);
    const y = center + textRadius * Math.sin(angle * Math.PI / 180);
    return { x, y, angle };
  };

  // Işıkları dairesel bir şekilde yerleştirme (12 ışık)
  const lights = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 360 - 90;
    const lightRadius = radius + outerBorderWidth / 2 + 2;
    const x = center + lightRadius * Math.cos(angle * Math.PI / 180);
    const y = center + lightRadius * Math.sin(angle * Math.PI / 180);
    lights.push({ x, y });
  }

  return (
    <>
      <div className="relative w-[400px] h-[400px]">
        {/* Çarkın kendisi (Dönen kısım) */}
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          // Yavaşlama efekti (ease-out) cubic-bezier eğrisi ile eklendi
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 1, 0.3, 1)' : 'none',
            transformOrigin: '50% 50%',
          }}
          className="will-change-transform"
        >
          {/* Gölge filtresi */}
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          <g filter="url(#shadow)">
            {numSegments > 0 ? (
              selectedInterests.map((interest, index) => {
                const path = createSegmentPath(index);
                const { x, y, angle } = getSegmentTextPosition(index);
                const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

                return (
                  <g key={`${interest}-${index}`}>
                    <path d={path} fill={color} stroke="#334155" strokeWidth="1.5" />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[11px] font-bold ${SEGMENT_TEXT_COLOR}`}
                      transform={`rotate(${angle + 90}, ${x}, ${y})`}
                    >
                      {interest}
                    </text>
                  </g>
                );
              })
            ) : (
              <g>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="#111827"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <text
                  x={center}
                  y={center}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-medium text-slate-500"
                >
                  İlgi alanlarını seçerek çarka ekle.
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* Çarkın merkezi (Koyu mavi daire + "SPIN" metni) */}
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-20 pointer-events-none">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#000080" stroke="#334155" strokeWidth="1.5" />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xl font-extrabold text-white">SPIN</text>
          </svg>
        </div>

        {/* Işıklı dış çerçeve (Dönmeyen kısım) */}
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10 pointer-events-none">
          <svg width="424" height="424" viewBox="0 0 424 424">
            {/* Koyu mavi dış çerçeve */}
            <circle cx="212" cy="212" r={radius + outerBorderWidth} fill="none" stroke="#00008B" strokeWidth={outerBorderWidth} />
            {/* 12 Işık */}
            {lights.map((light, index) => (
              <circle key={index} cx={light.x + (212 - 200)} cy={light.y + (212 - 200)} r="3" fill="#FFD700" />
            ))}
          </svg>
        </div>
      </div>

      {/* Çarkın üstündeki sarı işaretçi (Üçgen ok) */}
      <div
        className="absolute top-[-10px] left-[50%] translate-x-[-50%] z-30 w-[32px] h-[32px] bg-[#FFD700] rounded-sm"
        style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
      ></div>
      <p className="absolute bottom-6 text-sm font-medium text-slate-500 z-30">Bilgileri doldurup çarkı çevir</p>
    </>
  );
};

export default WheelPanel;