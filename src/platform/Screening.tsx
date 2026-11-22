import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, HeartPulse, Phone } from "lucide-react";
import { PageHeading, Notice } from "../components/UI";
import { formatDate } from "../model";
import { REFERENCE_UNAVAILABLE } from "../calibration/evaluate";
import {
  uid,
  screeningLabel,
  patientSummary,
  saveFile,
  type Screening,
} from "./domain";
import {
  usePlatform,
  PatientSelect,
  StatusMark,
  patientName,
  Empty,
} from "./Common";
const symptoms = [
  "เจ็บหน้าอก",
  "แน่นหน้าอก",
  "หายใจเหนื่อย / ลำบาก",
  "เวียนศีรษะ",
  "หน้ามืด",
];
export function ScreeningPage() {
  const { db, patientId, setPatientId, change, navigate, notify } =
    usePlatform();
  const [chosen, setChosen] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [history, setHistory] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Screening | null>(null);
  const urgent = chosen.some((s) => symptoms.slice(0, 3).includes(s));
  const patient = db.patients.find((p) => p.id === patientId);
  function scenario(s: "low" | "moderate" | "high") {
    setChosen(
      s === "low"
        ? []
        : s === "moderate"
          ? ["เวียนศีรษะ"]
          : ["เจ็บหน้าอก", "หายใจเหนื่อย / ลำบาก"],
    );
    setDuration(
      s === "low" ? "ไม่ระบุ (สถานการณ์สมมติ)" : "15 นาที (สถานการณ์สมมติ)",
    );
    setNotes("สถานการณ์ตัวอย่างเพื่อสาธิตลำดับงาน ไม่ใช้ประเมินความเสี่ยงจริง");
    setResult(null);
  }
  useEffect(() => {
    setChosen([]);
    setDuration("");
    setHistory("");
    setNotes("");
    setResult(null);
  }, [patientId]);
  return (
    <>
      <PageHeading
        eyebrow="AI SCREENING / TROPObot"
        title="TropoBot · ผู้ช่วยบันทึกอาการ"
        description="บันทึกอาการเบื้องต้นและจัดเตรียมข้อมูลสำหรับการปรึกษาแพทย์"
      />
      <div className="screening-banner">
        <HeartPulse size={24} />
        <div>
          <strong>สรุปข้อมูลก่อนปรึกษาบุคลากรทางการแพทย์</strong>
          <p>
            Low / Moderate / High Risk เป็นป้ายสถานการณ์สาธิต
            ไม่ใช่ระดับความเสี่ยงทางคลินิก และไม่ใช้ตัดสินว่าปลอดภัยหรือเป็นโรค
            <br />
            {REFERENCE_UNAVAILABLE} · ไม่มีการใช้ cTnI
            จำลองเพื่อประเมินผู้ป่วยจริง
          </p>
        </div>
      </div>
      <div className="health-layout">
        <form
          className="panel stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const value: Screening = {
              id: uid("SC"),
              patientId,
              date: new Date().toISOString(),
              symptoms: chosen,
              duration,
              history: history || patient?.history || "",
              notes,
              risk: screeningLabel(chosen),
            };
            if (change({ kind: "saveScreening", value })) {
              setResult(value);
              notify("บันทึกข้อมูลอาการแล้ว");
            }
          }}
        >
          <div className="panel-heading">
            <h2>Symptom Questionnaire</h2>
            <span className="tag">SYMPTOM ASSESSMENT</span>
          </div>
          <PatientSelect
            value={patientId}
            onChange={(id) => {
              setPatientId(id);
              setResult(null);
            }}
          />
          <div className="scenario-buttons">
            <span>โหลดสถานการณ์สาธิต</span>
            <div className="button-row">
              <button type="button" onClick={() => scenario("low")}>
                Low
              </button>
              <button type="button" onClick={() => scenario("moderate")}>
                Moderate
              </button>
              <button type="button" onClick={() => scenario("high")}>
                High
              </button>
            </div>
          </div>
          <fieldset>
            <legend>อาการที่พบ</legend>
            <div className="symptom-list">
              {symptoms.map((s) => (
                <label key={s} className={chosen.includes(s) ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={chosen.includes(s)}
                    onChange={(e) => {
                      setChosen(
                        e.target.checked
                          ? [...chosen, s]
                          : chosen.filter((v) => v !== s),
                      );
                      setResult(null);
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          {urgent && (
            <div role="alert" className="urgent-inline">
              <strong>
                หากเป็นอาการจริง: ติดต่อ 1669 หรือเข้ารับการรักษาทันที
              </strong>
              <br />
              ไม่ต้องรอผลจากเว็บไซต์ ป้าย Demo ไม่มีผลต่อคำแนะนำฉุกเฉิน
            </div>
          )}
          <label className="field">
            ระยะเวลาที่มีอาการ
            <input
              maxLength={150}
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setResult(null);
              }}
              placeholder="เช่น 15 นาที"
            />
          </label>
          <label className="field">
            ประวัติสุขภาพเพิ่มเติม
            <textarea
              maxLength={2000}
              placeholder={patient?.history}
              value={history}
              onChange={(e) => {
                setHistory(e.target.value);
                setResult(null);
              }}
            />
          </label>
          <label className="field">
            ข้อมูลประกอบการสรุป
            <textarea
              maxLength={2000}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setResult(null);
              }}
            />
          </label>
          <button className="primary">
            <ClipboardCheck size={17} />
            สร้างสรุปข้อมูลอาการ
          </button>
        </form>
        <section className="panel screening-result" aria-live="polite">
          <div className="panel-heading">
            <h2>Screening Summary</h2>
            <span className="tag">WORKFLOW</span>
          </div>
          {result ? (
            <>
              <StatusMark label={result.risk} />
              <h3 className="space-top">
                ผลสำหรับการสาธิต · ไม่ใช่ความเสี่ยงทางคลินิก
              </h3>
              <p className="muted">{patientName(db, result.patientId)}</p>
              <dl className="detail-list">
                <dt>อาการ</dt>
                <dd>{result.symptoms.join(", ") || "ไม่ได้เลือกอาการ"}</dd>
                <dt>ระยะเวลา</dt>
                <dd>{result.duration || "ไม่ระบุ"}</dd>
                <dt>ประวัติ</dt>
                <dd>{result.history || "ไม่ระบุ"}</dd>
                <dt>ข้อมูลเพิ่มเติม</dt>
                <dd>{result.notes || "ไม่ระบุ"}</dd>
              </dl>
              <Notice>
                {result.risk === "High Risk"
                  ? "หากมีอาการจริง ให้ขอความช่วยเหลือทางการแพทย์ทันที ไม่ต้องรอปรึกษาผ่านระบบนี้"
                  : "ป้าย Demo ไม่ได้ตัดภาวะฉุกเฉินออก หากอาการน่ากังวลให้รับการประเมินจากแพทย์"}
              </Notice>
              <div className="button-row space-top">
                <button
                  className="secondary"
                  onClick={() =>
                    saveFile(
                      `${result.id}-screening-demo.txt`,
                      patientSummary(db, result.patientId),
                    )
                  }
                >
                  <FileText size={17} />
                  ดาวน์โหลดรายงาน
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    setPatientId(result.patientId);
                    navigate("doctors");
                  }}
                >
                  เตรียมข้อมูลส่งปรึกษา
                </button>
              </div>
            </>
          ) : (
            <Empty text="สรุปข้อมูลอย่างเป็นระบบ" />
          )}
          <div className="rules-note">
            <strong>กติกาสาธิตที่ใช้</strong>
            <p>
              มีเจ็บ/แน่นหน้าอก หรือหายใจลำบาก → High Demo
              <br />
              เลือกอาการอื่น → Moderate Demo
              <br />
              ไม่เลือกอาการ → Low Demo (ไม่ได้ยืนยันว่าปลอดภัย)
            </p>
          </div>
          <button className="text-button" onClick={() => navigate("emergency")}>
            <Phone size={16} />
            เปิดศูนย์ประสานงานฉุกเฉิน
          </button>
          <a
            className="source-link"
            target="_blank"
            rel="noreferrer"
            href="https://www.maelanoihospital.go.th/webhos/wp-content/download/manual/ER.pdf"
          >
            แหล่งข้อมูลการแจ้งเหตุ 1669 · คู่มือประชาชน
          </a>
        </section>
      </div>
      <section className="panel space-top">
        <div className="panel-heading">
          <h2>ประวัติการบันทึกอาการ</h2>
          <span className="tag">SYMPTOM RECORDS</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ผู้ป่วย</th>
                <th>วันเวลา</th>
                <th>อาการที่บันทึก</th>
                <th>ระดับสถานการณ์สาธิต</th>
              </tr>
            </thead>
            <tbody>
              {db.screenings.map((s) => (
                <tr key={s.id}>
                  <td>{patientName(db, s.patientId)}</td>
                  <td>{formatDate(s.date)}</td>
                  <td>{s.symptoms.join(", ") || "ไม่เลือกอาการ"}</td>
                  <td>
                    <StatusMark label={s.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!db.screenings.length && <Empty />}
      </section>
    </>
  );
}
