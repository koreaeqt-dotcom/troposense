import {
  ScanLine,
  ClipboardList,
  HeartPulse,
  Check,
  FlaskConical,
  MoveUpRight,
} from "lucide-react";
import { Device } from "../components/Device";
import { Notice } from "../components/UI";
import type { Page } from "../App";
export function Overview({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <>
      <div className="intro-line">
        <span className="eyebrow">TROPOSENSE / OVERVIEW</span>
        <span className="small muted">ระบบต้นแบบสำหรับการนำเสนอโครงงาน</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="pill">
            <span className="dot" /> RESEARCH & INNOVATION
          </div>
          <h1>
            เชื่อมต่อข้อมูลการตรวจ
            <br />
            สู่การดูแลที่เข้าใจง่าย
          </h1>
          <p>
            TropoSense เว็บไซต์ประกอบชุดตรวจคัดกรอง
            <br className="desktop-break" /> Cardiac Troponin I
            เพื่อจัดการข้อมูลและเตรียม
            <br className="desktop-break" />
            ความพร้อมก่อนปรึกษาบุคลากรทางการแพทย์
          </p>
          <button className="primary" onClick={() => navigate("scan")}>
            <ScanLine size={19} />
            เริ่มนำเข้าค่าการตรวจ
          </button>
          <div className="hero-foot">
            <Check size={15} /> กรอกข้อมูลได้ด้วยตนเอง <span />{" "}
            ไม่ต้องสมัครสมาชิก
          </div>
        </div>
        <div className="hero-art">
          <div className="art-caption">A CONNECTED TESTING CONCEPT</div>
          <Device />
          <div className="device-caption">
            <span className="mini-line" />
            Hybrid Cartridge + Glucose Reader
          </div>
          <span className="schematic-label">
            ภาพวาดจำลองอุปกรณ์เพื่ออธิบายแนวคิด
          </span>
        </div>
      </section>
      <Notice>
        <strong>ต้นแบบเพื่อการวิจัยและการนำเสนอ</strong>
        <span className="notice-separator">·</span> ไม่ใช้เพื่อวินิจฉัยโรค ค่า
        Glucose ไม่ใช่ค่า cTnI โดยตรง และยังไม่มีข้อมูลสอบเทียบสำหรับการแปลงค่า
      </Notice>
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">YOUR TESTING WORKFLOW</span>
            <h2>ทุกขั้นตอน เชื่อมต่อกันอย่างเป็นระบบ</h2>
          </div>
          <span className="small muted">3 ฟีเจอร์หลักของ TropoSense</span>
        </div>
        <div className="feature-grid">
          {[
            {
              p: "scan" as Page,
              icon: ScanLine,
              n: "01",
              title: "อ่านค่าและนำเข้าข้อมูล",
              en: "Scan & Input",
              text: "อัปโหลดภาพเครื่องอ่าน หรือกรอกค่า Glucose ที่ได้จากอุปกรณ์ด้วยตนเอง",
              cta: "นำเข้าค่าการตรวจ",
            },
            {
              p: "results" as Page,
              icon: ClipboardList,
              n: "02",
              title: "ผลการตรวจและประวัติ",
              en: "Test Results & History",
              text: "ดูข้อมูลการตรวจย้อนหลัง พร้อมแยกค่าที่อ่านได้และสถานะการสอบเทียบ",
              cta: "ดูผลการตรวจ",
            },
            {
              p: "health" as Page,
              icon: HeartPulse,
              n: "03",
              title: "สนับสนุนการประเมินสุขภาพ",
              en: "Health Support",
              text: "บันทึกอาการและเตรียมข้อมูลสำหรับการปรึกษาบุคลากรทางการแพทย์",
              cta: "บันทึกข้อมูลอาการ",
            },
          ].map((f) => (
            <button className="feature" key={f.n} onClick={() => navigate(f.p)}>
              <div className="feature-top">
                <span className="feature-icon">
                  <f.icon size={23} />
                </span>
                <span className="step-number">{f.n}</span>
              </div>
              <div className="feature-en">{f.en}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <span className="feature-link">
                {f.cta}
                <MoveUpRight size={17} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="science-strip">
        <FlaskConical size={24} />
        <div>
          <h3>หนึ่งระบบ ตั้งแต่ชุดตรวจจนถึงข้อมูล</h3>
          <p>
            Hybrid Cartridge · Magnetic Beads · Antibody Pair · Invertase &
            Sucrose · Accu-Chek Guide
          </p>
        </div>
        <span className="tag">CONCEPT PROTOTYPE</span>
      </section>
    </>
  );
}
