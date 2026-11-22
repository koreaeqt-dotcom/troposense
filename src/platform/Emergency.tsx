import { useState } from "react";
import { Phone, TriangleAlert, MapPin, Send, CheckCircle2 } from "lucide-react";
import { PageHeading, Modal, Notice } from "../components/UI";
import { formatDate } from "../model";
import { uid, type Emergency } from "./domain";
import {
  usePlatform,
  PatientSelect,
  StatusMark,
  patientName,
  ExportButton,
  Empty,
} from "./Common";
export function EmergencyPage() {
  const { db, patientId, setPatientId, change, notify } = usePlatform();
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("ผู้ติดต่อฉุกเฉิน");
  const [severity, setSeverity] = useState<Emergency["severity"]>("Emergency");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [details, setDetails] = useState<Emergency | null>(null);
  const active = db.emergencies.filter((x) => !x.resolved);
  const status = active.some((x) => x.severity === "Emergency")
    ? "Emergency"
    : active.some((x) => x.severity === "Warning")
      ? "Warning"
      : "Normal";
  function update(v: Emergency) {
    if (change({ kind: "saveEmergency", value: v })) {
      if (details?.id === v.id) setDetails(v);
      notify("บันทึกขั้นตอนแล้ว · ยังไม่ส่งข้อมูลภายนอก");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="EMERGENCY CENTER"
        title="ศูนย์ประสานงานฉุกเฉิน"
        description="แสดงขั้นตอนเตรียมข้อมูลและการแจ้งเตือน สำหรับสาธิตเท่านั้น"
        action={
          <button className="danger-button" onClick={() => setOpen(true)}>
            <TriangleAlert size={18} />
            บันทึกเหตุฉุกเฉิน
          </button>
        }
      />
      <div className="emergency-strip">
        <Phone size={25} />
        <div>
          <strong>เหตุฉุกเฉินจริง โทร 1669 หรือเข้ารับการรักษาทันที</strong>
          <p>
            เจ็บหรือแน่นหน้าอก หายใจลำบาก หรือมีอาการฉุกเฉิน
            ไม่ต้องรอผลจากเว็บไซต์นี้
          </p>
        </div>
        <span className="emergency-hotline">1669</span>
      </div>
      <div className="stat-grid three">
        <div className="stat-card">
          <span>สถานะเหตุการณ์</span>
          <strong className="status-value">
            <StatusMark label={status} />
          </strong>
          <small>สถานะการจัดการเหตุการณ์ ไม่ใช่สถานะสุขภาพ</small>
        </div>
        <div className="stat-card">
          <span>เหตุการณ์ที่ยังเปิด</span>
          <strong>{active.length}</strong>
          <small>รายการในพื้นที่ทำงาน</small>
        </div>
        <div className="stat-card">
          <span>ประวัติเหตุการณ์ทั้งหมด</span>
          <strong>{db.emergencies.length}</strong>
          <small>ไม่มีการแจ้งไปยัง 1669 จริง</small>
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Emergency History</h2>
          <ExportButton
            name="emergency-history-demo.csv"
            rows={[
              [
                "ID",
                "Patient ID",
                "Date",
                "Severity",
                "Resolved",
                "Location Demo",
              ],
              ...db.emergencies.map((x) => [
                x.id,
                x.patientId,
                x.date,
                x.severity,
                x.resolved ? "Yes" : "No",
                x.location,
              ]),
            ]}
          />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>เหตุการณ์ / ผู้ป่วย</th>
                <th>วันเวลา</th>
                <th>ระดับเหตุการณ์</th>
                <th>บันทึกการประสานงาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {db.emergencies.map((x) => (
                <tr key={x.id}>
                  <td>
                    <strong>{patientName(db, x.patientId)}</strong>
                    <span className="table-sub">{x.id}</span>
                  </td>
                  <td>{formatDate(x.date)}</td>
                  <td>
                    <StatusMark label={x.severity} />
                    <span className="table-sub">
                      {x.resolved ? "ปิดเหตุการณ์แล้ว" : "ยังเปิด"}
                    </span>
                  </td>
                  <td>
                    <span className="table-sub">
                      แพทย์: {x.doctorSent ? "บันทึกแล้ว" : "ยังไม่บันทึก"}
                    </span>
                    <span className="table-sub">
                      ผู้ติดต่อ: {x.contactSent ? "บันทึกแล้ว" : "ยังไม่บันทึก"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="secondary small-button"
                      onClick={() => setDetails(x)}
                    >
                      ดู / จัดการเหตุการณ์
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!db.emergencies.length && <Empty />}
      </section>
      {open && (
        <Modal
          title="สร้างเหตุการณ์ฉุกเฉิน · Simulation"
          onClose={() => setOpen(false)}
        >
          <Notice>
            นี่คือการสาธิต ไม่มีการติดต่อแพทย์ ผู้ติดต่อ หรือ 1669 จริง
            หากมีเหตุฉุกเฉิน ให้ใช้โทรศัพท์ติดต่อ 1669 ทันที
          </Notice>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              const value: Emergency = {
                id: uid("EM"),
                patientId,
                date: new Date().toISOString(),
                contact,
                severity,
                location,
                notes,
                doctorSent: false,
                contactSent: false,
                resolved: false,
              };
              if (change({ kind: "saveEmergency", value })) {
                setOpen(false);
                setDetails(value);
                notify("บันทึกเหตุการณ์แล้ว");
              }
            }}
          >
            <PatientSelect value={patientId} onChange={setPatientId} />
            <label className="field">
              ระดับเหตุการณ์
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as Emergency["severity"])
                }
              >
                <option>Normal</option>
                <option>Warning</option>
                <option>Emergency</option>
              </select>
            </label>
            <label className="field">
              ผู้ติดต่อฉุกเฉิน
              <input
                required
                maxLength={150}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
            <label className="field">
              ตำแหน่งที่ระบุ
              <input
                value={location}
                maxLength={200}
                placeholder="ระบุจุดสมมติ ไม่ใช้ตำแหน่งจริง"
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <button
              className="secondary"
              type="button"
              onClick={() =>
                setLocation("จุดสาธิต A · 13.0000, 100.0000 (พิกัดสมมติ)")
              }
            >
              <MapPin size={16} />
              ใช้จุดที่ตั้งไว้
            </button>
            <label className="field">
              หมายเหตุ
              <textarea
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <button className="danger-button">บันทึกเหตุการณ์</button>
          </form>
        </Modal>
      )}
      {details && (
        <Modal title="รายละเอียดเหตุการณ์" onClose={() => setDetails(null)}>
          <div className="button-row">
            <StatusMark label={details.severity} />
            <span className="record-id">{details.id}</span>
          </div>
          <dl className="detail-list">
            <dt>Patient ID</dt>
            <dd>
              {details.patientId} · {patientName(db, details.patientId)}
            </dd>
            <dt>วันเวลา</dt>
            <dd>{formatDate(details.date)}</dd>
            <dt>ผู้ติดต่อฉุกเฉิน</dt>
            <dd>{details.contact}</dd>
            <dt>ตำแหน่งที่ระบุ</dt>
            <dd>{details.location || "ยังไม่ระบุ"}</dd>
            <dt>หมายเหตุ</dt>
            <dd>{details.notes || "—"}</dd>
          </dl>
          <div className="stack-form">
            <button
              className="secondary"
              disabled={details.doctorSent}
              onClick={() => update({ ...details, doctorSent: true })}
            >
              <Send size={17} />
              {details.doctorSent
                ? "บันทึกการประสานแพทย์แล้ว"
                : "บันทึกการประสานแพทย์"}
            </button>
            <button
              className="secondary"
              disabled={details.contactSent}
              onClick={() => update({ ...details, contactSent: true })}
            >
              <Phone size={17} />
              {details.contactSent
                ? "บันทึกการแจ้งผู้ติดต่อแล้ว"
                : "บันทึกการแจ้งผู้ติดต่อ"}
            </button>
            <button
              className="primary"
              disabled={details.resolved}
              onClick={() => update({ ...details, resolved: true })}
            >
              <CheckCircle2 size={17} />
              {details.resolved ? "ปิดเหตุการณ์แล้ว" : "ปิดเหตุการณ์"}
            </button>
          </div>
          <Notice>
            การเปลี่ยนสถานะทั้งหมดเกิดขึ้นใน LocalStorage เท่านั้น
            ไม่ได้ส่งข้อความ โทรศัพท์ หรือติดต่อบริการฉุกเฉิน
          </Notice>
        </Modal>
      )}
    </>
  );
}
