import { useState } from "react";
import { Stethoscope, Send, FileText, Pencil, UserRound } from "lucide-react";
import { PageHeading, Modal, Notice } from "../components/UI";
import { formatDate } from "../model";
import { uid, patientSummary, saveFile, type Referral } from "./domain";
import {
  usePlatform,
  PatientSelect,
  patientName,
  StatusMark,
  Empty,
} from "./Common";
export const doctors = [
  {
    id: "DR-01",
    name: "พญ. นลิน",
    department: "อายุรศาสตร์",
    initials: "NL",
    description:
      "โปรไฟล์สมมติสำหรับการสาธิตการปรึกษาและการส่งต่อ ไม่ใช่แพทย์ที่ให้บริการผ่านเว็บไซต์",
    schedule: "เวลาสำหรับการนัดหมาย: จันทร์–ศุกร์ 09:00–16:00",
  },
  {
    id: "DR-02",
    name: "นพ. ภัทร",
    department: "เวชศาสตร์ครอบครัว",
    initials: "PT",
    description:
      "โปรไฟล์สมมติสำหรับการสาธิตการดูแลและติดตามข้อมูล ไม่ใช่ผู้รับข้อความจริง",
    schedule: "เวลาสำหรับการนัดหมาย: อังคาร–เสาร์ 09:00–15:00",
  },
];
export function Doctors() {
  const { db, role, patientId, setPatientId, change, notify } = usePlatform();
  const [doctorId, setDoctorId] = useState("DR-01");
  const [profile, setProfile] = useState<string | null>(null);
  const [editor, setEditor] = useState<Referral | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const doctor = doctors.find((d) => d.id === doctorId)!;
  const summary = patientSummary(db, patientId);
  return (
    <>
      <PageHeading
        eyebrow="DOCTOR CONNECT"
        title="เตรียมข้อมูลเพื่อปรึกษาแพทย์"
        description="เลือกแพทย์ จัดเตรียมรายงาน และติดตามคำขอปรึกษาในพื้นที่เดียว"
      />
      <Notice>
        การส่งต่อยังไม่เชื่อมต่อบริการภายนอก คำขอและคำตอบจะบันทึกในพื้นที่ทำงานนี้เท่านั้น
      </Notice>
      <div className="doctor-grid space-top">
        {doctors.map((d) => (
          <section
            className={`doctor-card ${d.id === doctorId ? "chosen" : ""}`}
            key={d.id}
          >
            <div className="doctor-top">
              <span className="doctor-avatar">
                <Stethoscope size={28} />
              </span>
              <span className="tag">DOCTOR PROFILE</span>
            </div>
            <h3>{d.name}</h3>
            <p>{d.department}</p>
            <div className="button-row">
              <button
                className={doctorId === d.id ? "primary" : "secondary"}
                onClick={() => setDoctorId(d.id)}
              >
                {doctorId === d.id ? "เลือกแพทย์นี้แล้ว" : "เลือกแพทย์"}
              </button>
              <button className="text-button" onClick={() => setProfile(d.id)}>
                <UserRound size={15} />
                ดูโปรไฟล์
              </button>
            </div>
          </section>
        ))}
      </div>
      <div className="health-layout space-top">
        <form
          className="panel stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const value: Referral = {
              id: uid("RF"),
              patientId,
              doctorId,
              date: new Date().toISOString(),
              summary:
                summary + `\n\nข้อความส่งต่อสมมติ: ${referralNote || "—"}`,
              notes: "",
              status: "Requested",
              communications: [
                `${formatDate(new Date().toISOString())} · สร้างคำขอปรึกษา Demo ยังไม่ได้ส่งข้อมูลจริง`,
              ],
            };
            if (change({ kind: "saveReferral", value })) {
              setReferralNote("");
              notify("บันทึกคำขอแล้ว · ยังไม่มีการส่งข้อมูลภายนอก");
            }
          }}
        >
          <div className="panel-heading">
            <h2>Referral Request</h2>
            <Send size={21} />
          </div>
          <PatientSelect value={patientId} onChange={setPatientId} />
          <div className="referral-target">
            <Stethoscope size={19} />
            <span>
              แพทย์ที่เลือก
              <br />
              <strong>{doctor.name}</strong>
            </span>
          </div>
          <label className="field">
            ข้อมูลประกอบการส่งต่อ
            <textarea
              maxLength={2000}
              value={referralNote}
              onChange={(e) => setReferralNote(e.target.value)}
              placeholder="เหตุผลหรือรายละเอียดสำหรับสถานการณ์สาธิต"
            />
          </label>
          <button className="primary">
            <Send size={17} />
            บันทึกคำขอปรึกษา
          </button>
        </form>
        <section className="panel">
          <div className="panel-heading">
            <h2>Patient & Screening Report</h2>
            <button
              className="icon-button"
              aria-label="ดาวน์โหลดรายงานผู้ป่วย"
              onClick={() =>
                saveFile(`${patientId}-referral-demo.txt`, summary)
              }
            >
              <FileText size={20} />
            </button>
          </div>
          <pre className="report summary-preview">{summary}</pre>
        </section>
      </div>
      <section className="panel space-top">
        <div className="panel-heading">
          <h2>ประวัติคำขอปรึกษา</h2>
          <span className="small muted">Communication History</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ผู้ป่วย / คำขอ</th>
                <th>แพทย์</th>
                <th>วันเวลา</th>
                <th>Consultation Status</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {db.referrals.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{patientName(db, r.patientId)}</strong>
                    <span className="table-sub">{r.id}</span>
                  </td>
                  <td>{doctors.find((d) => d.id === r.doctorId)?.name}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <StatusMark label={r.status} />
                  </td>
                  <td>
                    <button
                      className="secondary small-button"
                      onClick={() =>
                        setEditor({
                          ...r,
                          communications: [...r.communications],
                        })
                      }
                    >
                      <Pencil size={15} />
                      {role === "patient" ? "ดูคำขอ" : "ดูรายละเอียด / บันทึกคำตอบ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!db.referrals.length && <Empty />}
      </section>
      {profile && (
        <Modal title="ข้อมูลแพทย์" onClose={() => setProfile(null)}>
          {doctors
            .filter((d) => d.id === profile)
            .map((d) => (
              <div key={d.id}>
                <h3>{d.name}</h3>
                <p>{d.department}</p>
                <p>{d.description}</p>
                <p>{d.schedule}</p>
                <button
                  className="primary"
                  onClick={() => {
                    setDoctorId(d.id);
                    setProfile(null);
                  }}
                >
                  เลือกแพทย์คนนี้
                </button>
              </div>
            ))}
        </Modal>
      )}
      {editor && (
        <Modal
          title="รายละเอียดคำขอปรึกษา"
          onClose={() => setEditor(null)}
        >
          <StatusMark label={editor.status} />
          <pre className="report space-top">{editor.summary}</pre>
          {role !== "patient" ? (
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                const value = {
                  ...editor,
                  communications: [
                    ...editor.communications,
                    `${formatDate(new Date().toISOString())} · อัปเดต ${editor.status} / บันทึกคำตอบจำลอง`,
                  ],
                };
                if (change({ kind: "saveReferral", value })) {
                  setEditor(null);
                  notify("บันทึกสถานะและหมายเหตุแล้ว");
                }
              }}
            >
              <label className="field">
                Consultation Status
                <select
                  value={editor.status}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      status: e.target.value as Referral["status"],
                    })
                  }
                >
                  <option>Requested</option>
                  <option>Reviewed</option>
                  <option>Closed</option>
                </select>
              </label>
              <label className="field">
                Doctor Notes (ผู้สาธิตบันทึกแทนแพทย์)
                <textarea
                  maxLength={2000}
                  value={editor.notes}
                  onChange={(e) =>
                    setEditor({ ...editor, notes: e.target.value })
                  }
                />
              </label>
              <button className="primary">บันทึกคำตอบ</button>
            </form>
          ) : (
            <p>Doctor Notes: {editor.notes || "ยังไม่มีคำตอบ"}</p>
          )}
          <h3 className="space-top">Communication History</h3>
          {editor.communications.map((s, i) => (
            <div className="timeline-item" key={i}>
              {s}
            </div>
          ))}
        </Modal>
      )}
    </>
  );
}
