export function Device() {
  return (
    <svg
      className="device"
      viewBox="0 0 530 360"
      role="img"
      aria-label="ภาพวาดประกอบเครื่องอ่านกลูโคสและตลับ TropoSense ไม่ใช่ภาพผลิตภัณฑ์จริง"
    >
      <defs>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="13"
            stdDeviation="13"
            floodColor="#203a43"
            floodOpacity=".13"
          />
        </filter>
        <linearGradient id="body" x2="1" y2="1">
          <stop stopColor="#303f44" />
          <stop offset="1" stopColor="#121e24" />
        </linearGradient>
      </defs>
      <ellipse cx="283" cy="316" rx="166" ry="18" fill="#c9dcd6" opacity=".5" />
      <g transform="translate(206 32) rotate(12 85 130)" filter="url(#shadow)">
        <path
          d="M27 0h112q26 0 27 33l3 208q-1 40-34 43H32Q0 278 0 246V35Q0 0 27 0"
          fill="url(#body)"
        />
        <text
          x="85"
          y="31"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          letterSpacing="1.4"
        >
          ACCU-CHEK
        </text>
        <text x="85" y="47" textAnchor="middle" fill="#d3dfdd" fontSize="11">
          Guide
        </text>
        <rect x="19" y="62" width="130" height="124" rx="5" fill="#c9d4c8" />
        <text x="34" y="84" fontSize="9" fill="#48574d">
          10:30
        </text>
        <text
          x="85"
          y="145"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="59"
          fill="#253b35"
        >
          124
        </text>
        <text x="120" y="168" textAnchor="end" fontSize="11" fill="#43584c">
          mg/dL
        </text>
        <circle cx="85" cy="222" r="21" fill="#44545a" />
        <path
          d="m79 214 10 8-10 8"
          fill="none"
          stroke="#cdd9d8"
          strokeWidth="2"
        />
        <path
          d="M36 217h16m-8-6-6 6 6 6m74-6h16m-7-6 6 6-6 6"
          stroke="#a8b9ba"
          fill="none"
          strokeWidth="2"
        />
        <rect x="66" y="275" width="36" height="38" fill="#fafcf9" />
        <rect x="72" y="303" width="24" height="17" fill="#d7b86b" />
      </g>
      <g transform="translate(85 214) rotate(-12)" filter="url(#shadow)">
        <rect width="133" height="66" rx="8" fill="white" stroke="#c6d9d3" />
        <rect x="12" y="14" width="25" height="38" rx="3" fill="#dcebe7" />
        <circle cx="24" cy="33" r="6" fill="#168f89" />
        <text x="46" y="29" fontSize="11" fontWeight="600" fill="#0f7774">
          TropoSense
        </text>
        <text x="46" y="44" fontSize="7" fill="#6d8383">
          HYBRID CARTRIDGE
        </text>
        <circle cx="117" cy="33" r="6" fill="#e1e8e4" />
      </g>
      <path d="M93 109h63m-63 4v-8m63 4 24 22" stroke="#8eb3a8" fill="none" />
      <text x="71" y="92" fontSize="10" fill="#527c72" letterSpacing="1">
        GLUCOSE READER
      </text>
    </svg>
  );
}
