import { createContext, useContext, type ReactNode } from "react";
import { Download, Plus, Search, CheckCircle2, Info } from "lucide-react";
import {
  type Database,
  type Role,
  type Change,
  exportRows,
  DISCLAIMER,
} from "./domain";
export type Route =
  | "home"
  | "dashboard"
  | "qc"
  | "screening"
  | "emergency"
  | "patients"
  | "doctors"
  | "followup"
  | "products"
  | "business"
  | "revenue"
  | "costs"
  | "calculator"
  | "settings"
  | "scan"
  | "results";
export type AppContextValue = {
  db: Database;
  role: Role;
  patientId: string;
  setPatientId: (id: string) => void;
  change: (c: Change) => boolean;
  navigate: (r: Route) => void;
  notify: (s: string) => void;
  reset: () => void;
};
export const AppContext = createContext<AppContextValue | null>(null);
export function usePlatform() {
  const value = useContext(AppContext);
  if (!value) throw new Error("Missing platform provider");
  return value;
}
export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "amber" | "red" | "gray";
}) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
export function Empty({
  text = "ยังไม่มีข้อมูล",
  action,
}: {
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Info size={30} />
      <h3>{text}</h3>
      <p>เริ่มเพิ่มรายการเพื่อจัดการข้อมูลในพื้นที่ทำงาน</p>
      {action}
    </div>
  );
}
export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button className="primary" onClick={onClick}>
      <Plus size={17} />
      {children}
    </button>
  );
}
export function ExportButton({
  name,
  rows,
}: {
  name: string;
  rows: (string | number)[][];
}) {
  return (
    <button className="secondary" onClick={() => exportRows(name, rows)}>
      <Download size={16} />
      Export CSV
    </button>
  );
}
export function PatientSelect({
  value,
  onChange,
  label = "เลือกผู้ป่วย",
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const { db } = usePlatform();
  return (
    <label className="field">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="" disabled>
          เลือกผู้ป่วย
        </option>
        {db.patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.id}
          </option>
        ))}
      </select>
    </label>
  );
}
export function FilterBar({
  search,
  setSearch,
  children,
}: {
  search: string;
  setSearch: (s: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="filter-bar">
      <label className="search-input">
        <Search size={18} />
        <input
          aria-label="ค้นหา"
          placeholder="ค้นหาชื่อหรือ Patient ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {children}
    </div>
  );
}
export const patientName = (db: Database, id: string) =>
  db.patients.find((p) => p.id === id)?.name ?? "ไม่พบผู้ป่วย";
export function StatusMark({ label }: { label: string }) {
  const bad = ["Fail", "Emergency", "High Risk", "Missed"].includes(label);
  const amber = [
    "Pending",
    "Warning",
    "Moderate Risk",
    "Requested",
    "Scheduled",
    "ติดตาม",
  ].includes(label);
  return (
    <Badge
      tone={
        bad
          ? "red"
          : amber
            ? "amber"
            : label === "Cancelled" || label === "Closed"
              ? "gray"
              : "teal"
      }
    >
      {label}
    </Badge>
  );
}
export function ClinicalDisclaimer() {
  return (
    <section className="clinical-disclaimer">
      <Info size={19} />
      <details>
        <summary>เกี่ยวกับระบบและข้อจำกัดการใช้งาน <span>รุ่นนำเสนอ</span></summary>
        <p>{DISCLAIMER}</p>
        <span>
          Accu-Chek Guide ยังไม่ได้รับการยืนยันความเข้ากันได้กับปฏิกิริยาของ
          TropoSense · ไม่มีการเชื่อมต่อฐานข้อมูลผู้ป่วยภาครัฐ
        </span>
      </details>
    </section>
  );
}
export function DataChart({
  values,
  labels,
  title,
  unit = "mg/dL",
}: {
  values: number[];
  labels: string[];
  title: string;
  unit?: string;
}) {
  if (!values.length) return <Empty text="ยังไม่มีข้อมูลสำหรับกราฟ" />;
  const max = Math.max(...values, 1) * 1.15;
  const w = 620,
    h = 165;
  const px = (i: number) =>
    45 + (values.length === 1 ? 0.5 : i / (values.length - 1)) * 550;
  const py = (v: number) => h - 15 - (v / max) * 125;
  const line = values.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  return (
    <figure className="data-chart">
      <figcaption>
        {title}
        <span>{unit}</span>
      </figcaption>
      <svg
        role="img"
        aria-label={`${title}: ${values.map((v, i) => `${labels[i]} ${v}`).join(", ")} ${unit}`}
        viewBox={`0 0 ${w} 200`}
      >
        {[0, 1, 2, 3].map((n) => (
          <g key={n}>
            <line
              x1="45"
              x2="595"
              y1={h - 15 - n * 40}
              y2={h - 15 - n * 40}
              stroke="#e6eeef"
              strokeDasharray="3 4"
            />
            <text
              x="33"
              y={h - 11 - n * 40}
              textAnchor="end"
              fill="#849ba1"
              fontSize="10"
            >
              {Math.round(((n * 40) / 125) * max)}
            </text>
          </g>
        ))}
        <polyline
          points={line}
          fill="none"
          stroke="#16a89d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle
              cx={px(i)}
              cy={py(v)}
              r="4"
              fill="white"
              stroke="#16a89d"
              strokeWidth="2"
            />
            {(values.length <= 8 || i % Math.ceil(values.length / 7) === 0) && (
              <text
                x={px(i)}
                y="187"
                textAnchor="middle"
                fill="#83979f"
                fontSize="10"
              >
                {labels[i]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </figure>
  );
}
export function SuccessLine({ children }: { children: ReactNode }) {
  return (
    <div className="inline-success">
      <CheckCircle2 size={17} />
      {children}
    </div>
  );
}
