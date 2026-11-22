import { useState } from "react";
import {
  Activity,
  LayoutGrid,
  ScanLine,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  ChevronDown,
  Menu,
  PanelLeftClose,
} from "lucide-react";
import { Overview } from "./pages/Overview";
import { Scan } from "./pages/Scan";
import { Results } from "./pages/Results";
import { Health, emptyHealth } from "./pages/Health";
import { Modal } from "./components/UI";
import { createRecord, initialRecords, type TestRecord } from "./model";
export type Page = "overview" | "scan" | "results" | "health";
const nav = [
  {
    id: "overview" as Page,
    label: "Overview",
    th: "ภาพรวมระบบ",
    icon: LayoutGrid,
  },
  {
    id: "scan" as Page,
    label: "Scan & Input",
    th: "อ่านค่าและนำเข้าข้อมูล",
    icon: ScanLine,
  },
  {
    id: "results" as Page,
    label: "Test Results",
    th: "ผลการตรวจและประวัติ",
    icon: ClipboardList,
  },
  {
    id: "health" as Page,
    label: "Health Support",
    th: "สนับสนุนการประเมินสุขภาพ",
    icon: HeartPulse,
  },
];
export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [records, setRecords] = useState<TestRecord[]>(initialRecords);
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(false);
  const [health, setHealth] = useState(emptyHealth);
  function navigate(p: Page) {
    setPage(p);
    setMobile(false);
    window.scrollTo(0, 0);
  }
  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="wordmark"
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-symbol">
            <Activity size={25} />
          </span>
          Tropo<span>Sense</span>
          <span className="brand-period">.</span>
        </a>
        <div className="sidebar-caption">RESEARCH COMPANION</div>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="เมนูหลัก">
          {nav.map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
              aria-current={page === n.id ? "page" : undefined}
            >
              <n.icon size={21} />
              <span>
                {n.label}
                <small>{n.th}</small>
              </span>
              {page === n.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="prototype-box">
            <ShieldCheck size={21} />
            <strong>ออกแบบเพื่อการวิจัย</strong>
            <p>
              ต้นแบบสำหรับการนำเสนอโครงงาน
              <br />
              ไม่ใช้เพื่อวินิจฉัยทางการแพทย์
            </p>
            <span className="tag">PROTOTYPE V1.0</span>
          </div>
          <div className="sidebar-footer">
            <span className="dot" />
            TropoSense Research Project
          </div>
        </div>
        {mobile && (
          <button
            className="close-mobile icon-button"
            aria-label="ปิดเมนู"
            onClick={() => setMobile(false)}
          >
            <PanelLeftClose />
          </button>
        )}
      </aside>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <div className="workspace">
        <header>
          <div className="header-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobile(!mobile)}
              aria-label="เปิดเมนู"
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>{nav.find((n) => n.id === page)?.label}</strong>
            </span>
          </div>
          <div className="header-right">
            <span className="demo-label">DEMO ENVIRONMENT</span>
            <span className="language" aria-label="ภาษาไทย">
              TH
            </span>
            <span className="header-divider" />
            <button className="profile-button" onClick={() => setProfile(true)}>
              <span className="avatar">DR</span>
              <span>
                Demo Researcher<small>บัญชีสำหรับการนำเสนอ</small>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main id="main-content" key={page}>
          {page === "overview" ? (
            <Overview navigate={navigate} />
          ) : page === "scan" ? (
            <Scan
              onConfirm={(v, s, options) => {
                setRecords((r) => [createRecord(v, s, options), ...r]);
                navigate("results");
              }}
            />
          ) : page === "results" ? (
            <Results records={records} onScan={() => navigate("scan")} />
          ) : (
            <Health record={records[0]} data={health} setData={setHealth} />
          )}
          <footer>
            <span>© 2026 TropoSense · Healthcare innovation research</span>
            <span>
              ต้นแบบเว็บไซต์ประกอบชุดตรวจ <span className="footer-dot">·</span>{" "}
              ไม่ใช่เครื่องมือวินิจฉัยโรค
            </span>
          </footer>
        </main>
      </div>
      {profile && (
        <Modal title="Demo Researcher" onClose={() => setProfile(false)}>
          <p>
            บัญชีตัวอย่างสำหรับนำเสนอโครงงาน TropoSense ไม่มีระบบเข้าสู่ระบบจริง
          </p>
          <p>ภาษา: ไทย (TH)</p>
          <p>
            ค่าการตรวจและอาการอยู่ในหน่วยความจำของเซสชันนี้เท่านั้น
            เมื่อรีเฟรชจะกลับสู่ข้อมูลตัวอย่าง
            ภาพอัปโหลดไม่ถูกส่งไปยังเซิร์ฟเวอร์
          </p>
          <button className="primary" onClick={() => setProfile(false)}>
            เข้าใจแล้ว
          </button>
        </Modal>
      )}
    </div>
  );
}
