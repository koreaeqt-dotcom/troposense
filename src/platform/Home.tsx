import {
  Activity,
  ShieldCheck,
  HeartPulse,
  Siren,
  FolderHeart,
  Stethoscope,
  CalendarDays,
  ScanLine,
  Check,
  ChevronRight,
} from "lucide-react";
import { ClinicalDisclaimer, type Route } from "./Common";
export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brand-symbol">
        <Activity size={26} />
      </span>
      Tropo<span>Sense</span>
      <span className="brand-period">.</span>
    </span>
  );
}
export function Hardware({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`hardware-scene ${small ? "hardware-small" : ""}`}
      role="img"
      aria-label="ภาพวาดเครื่อง TropoSense Reader และ Hybrid Cartridge ตามแนวคิด ยังไม่ใช่ผลิตภัณฑ์ที่ผ่านการตรวจสอบ"
    >
      <div className="hardware-halo" />
      <div className="reader-model">
        <span className="reader-brand">
          Tropo<span>Sense</span>
        </span>
        <div className="reader-screen">
          <small>GLUCOSE READING</small>
          <strong>124</strong>
          <span>Glucose · mg/dL</span>
          <div className="reader-screen-rule" />
          <small>cTnI · ยังไม่มีข้อมูลสอบเทียบ</small>
        </div>
        <div className="reader-control">
          <span />
          <Activity size={22} />
          <span />
        </div>
        <div className="reader-slot" />
      </div>
      <div className="cartridge-model">
        <div className="cartridge-window">
          <span />
        </div>
        <div>
          <strong>TropoSense</strong>
          <small>HYBRID CARTRIDGE</small>
        </div>
        <span className="cartridge-port" />
      </div>
    </div>
  );
}
const features = [
  {
    id: "qc" as Route,
    icon: ShieldCheck,
    title: "Quality Control",
    text: "ตรวจความพร้อมอุปกรณ์และบันทึกคุณภาพ",
  },
  {
    id: "screening" as Route,
    icon: HeartPulse,
    title: "TropoBot Screening",
    text: "รวบรวมอาการและสรุปข้อมูลอย่างเป็นระบบ",
  },
  {
    id: "emergency" as Route,
    icon: Siren,
    title: "Emergency Center",
    text: "เตรียมข้อมูลและจัดการการประสานงานฉุกเฉิน",
  },
  {
    id: "patients" as Route,
    icon: FolderHeart,
    title: "Patient Records",
    text: "แฟ้มข้อมูลผู้ป่วยและประวัติการตรวจ",
  },
  {
    id: "doctors" as Route,
    icon: Stethoscope,
    title: "Doctor Connect",
    text: "เตรียมรายงานและคำขอปรึกษา",
  },
  {
    id: "followup" as Route,
    icon: CalendarDays,
    title: "Continuous Follow-up",
    text: "นัดหมายและติดตามข้อมูลอย่างต่อเนื่อง",
  },
];
export function Home({
  navigate,
  login,
}: {
  navigate: (r: Route) => void;
  login: () => void;
}) {
  return (
    <div className="home-page">
      <nav className="home-nav" aria-label="เมนูเว็บไซต์">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          <Wordmark />
        </a>
        <div className="home-nav-links">
          <a href="#features">ฟีเจอร์</a>
          <button onClick={() => navigate("products")}>ผลิตภัณฑ์</button>
          <button onClick={() => navigate("business")}>Business Model</button>
        </div>
        <button className="secondary" onClick={login}>
          เข้าสู่ระบบ
        </button>
      </nav>
      <main className="home-main">
        <section className="landing-hero">
          <div className="landing-copy">
            <div className="pill">
              <span className="dot" />
              CONNECTED CARE, THOUGHTFULLY DESIGNED
            </div>
            <p className="platform-label">
              TropoSense – Smart Healthcare Platform
            </p>
            <h1>
              ข้อมูลที่เชื่อมถึงกัน
              <br />
              <span>เพื่อการดูแลที่ต่อเนื่อง</span>
            </h1>
            <p className="landing-subtitle">
              แพลตฟอร์มคัดกรองสุขภาพอัจฉริยะ
              เพื่อการติดตามและดูแลผู้ป่วยอย่างต่อเนื่อง
            </p>
            <p className="landing-description">
              เชื่อมข้อมูลจากชุดตรวจและเว็บแอปในระบบเดียว ตั้งแต่บันทึกค่าจากอุปกรณ์
              จัดการข้อมูล ไปจนถึงเตรียมข้อมูลสำหรับบุคลากรทางการแพทย์
            </p>
            <div className="button-row">
              <button className="primary" onClick={login}>
                ทดลองใช้งานแพลตฟอร์ม
              </button>
              <a className="secondary" href="#features">
                สำรวจฟีเจอร์
              </a>
            </div>
            <div className="landing-proof">
              <span>
                <Check size={15} />6 โมดูลเชื่อมโยงกัน
              </span>
              <span>
                <Check size={15} />
                ข้อมูลการดูแลในพื้นที่เดียว
              </span>
            </div>
          </div>
          <div className="landing-visual">
            <div className="visual-label">
              <span className="dot" />
              TROPOSENSE CONNECTED SYSTEM
            </div>
            <Hardware />
            <div className="phone-model">
              <div className="phone-speaker" />
              <div className="phone-brand">TropoSense</div>
              <small>ข้อมูลสุขภาพของฉัน</small>
              <span className="phone-status">บันทึกแล้ว</span>
              <strong>
                124 <small>mg/dL</small>
              </strong>
              <div className="phone-chart">
                <svg viewBox="0 0 130 60">
                  <path
                    d="M0 49 20 38 40 43 60 20 80 30 100 14 130 20"
                    stroke="#16a89d"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="phone-next">
                <CalendarDays size={15} />
                นัดหมายครั้งถัดไป
                <br />
                23 พ.ย. · 10:00
              </span>
            </div>
            <div className="mini-dashboard">
              <div>
                <Activity size={17} />
                <strong>Care workspace</strong>
                <span>CARE</span>
              </div>
              <div className="mini-dash-body">
                <span>
                  Patient records<strong>04</strong>
                </span>
                <span>
                  QC checklist
                  <strong>
                    01 <small>Pass</small>
                  </strong>
                </span>
              </div>
              <div className="mini-dash-line" />
              <small>Patient records · Connected care</small>
            </div>
            <div className="visual-footnote">
              TropoSense Reader + Hybrid Cartridge
            </div>
          </div>
        </section>
        <div className="home-disclaimer">
          <ShieldCheck size={20} />
          <p>
            Connected healthcare workflow{" "}
            <span>เชื่อมต่ออุปกรณ์ ข้อมูล และการติดตามในระบบเดียว</span>
          </p>
          <span className="tag">TROPOSENSE PLATFORM</span>
        </div>
        <section className="home-section" id="features">
          <div className="home-section-title">
            <div className="eyebrow">ONE PLATFORM. CONNECTED WORKFLOWS.</div>
            <h2>หกฟีเจอร์ เพื่อข้อมูลการดูแลที่เป็นระบบ</h2>
            <p>
              ออกแบบให้แต่ละขั้นตอนเชื่อมต่อกัน
              และเข้าถึงข้อมูลที่ต้องการได้ง่าย
            </p>
          </div>
          <div className="home-feature-grid">
            {features.map((f) => (
              <button
                key={f.id}
                className="home-feature"
                onClick={() => navigate(f.id)}
              >
                <f.icon size={25} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <span>
                  เปิดพื้นที่ทำงาน
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="home-product-banner">
          <div>
            <div className="eyebrow">HARDWARE + CONNECTED CARE</div>
            <h2>
              ชุดตรวจคือจุดเริ่มต้น
              <br />
              ข้อมูลคือส่วนต่อของการดูแล
            </h2>
            <p>TropoSense Reader · Hybrid Cartridge · Web Application</p>
            <div className="button-row">
              <button className="primary" onClick={() => navigate("products")}>
                ดูผลิตภัณฑ์และราคาเป้าหมาย
              </button>
              <button
                className="secondary"
                onClick={() => navigate("business")}
              >
                สำรวจ Business Model
              </button>
            </div>
          </div>
          <div className="product-price-preview">
            <strong>
              4,500<span>บาท / เครื่อง · ราคาเป้าหมาย</span>
            </strong>
            <div />
            <strong>
              350<span>บาท / การตรวจ · ราคาเป้าหมาย</span>
            </strong>
          </div>
        </section>
        <ClinicalDisclaimer />
        <footer>
          <span>© 2026 TropoSense · Smart Healthcare Platform</span>
          <span>รุ่นนำเสนอ · ข้อมูลสำหรับการสาธิต</span>
        </footer>
      </main>
    </div>
  );
}
