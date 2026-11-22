import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Pencil,
  Bell,
  Trash2,
} from "lucide-react";
import { PageHeading, Modal, Notice } from "../components/UI";
import { formatDate } from "../model";
import { CtniValue } from "../components/CtniValue";
import { type Appointment, uid, thaiNow, appointmentState } from "./domain";
import {
  usePlatform,
  PatientSelect,
  patientName,
  StatusMark,
  AddButton,
  Empty,
  ExportButton,
  DataChart,
} from "./Common";
export function Followup() {
  const { db, role, patientId, setPatientId, change, notify } = usePlatform();
  const [month, setMonth] = useState(thaiNow().slice(0, 7));
  const [day, setDay] = useState("");
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState<Appointment | null>(null);
  const [cancel, setCancel] = useState<Appointment | null>(null);
  const [remove, setRemove] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const appointments = db.appointments
    .filter(
      (a) =>
        (!day || a.date.startsWith(day)) &&
        (filter === "all" || appointmentState(a.date, a.status) === filter),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const comparison = db.tests
    .filter((t) => t.patientId === patientId)
    .sort((a, b) => a.date.localeCompare(b.date));
  function shift(n: number) {
    const d = new Date(Date.UTC(year, mon - 1 + n, 1));
    setMonth(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
    setDay("");
  }
  function add() {
    setError("");
    setEdit({
      id: uid("FU"),
      patientId,
      date: `${day || (month === thaiNow().slice(0, 7) ? thaiNow().slice(0, 10) : month + "-01")}T10:00`,
      reason: "",
      notes: "",
      status: "Scheduled",
      reminder: false,
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="FOLLOW-UP"
        title="ติดตามและนัดหมาย"
        description="จัดตารางการติดตาม บันทึกอาการ และเปรียบเทียบข้อมูลย้อนหลัง"
        action={<AddButton onClick={add}>เพิ่มนัดหมาย</AddButton>}
      />
      <div className="follow-layout">
        <section className="panel calendar">
          <div className="panel-heading">
            <h2>Follow-up Calendar</h2>
            <CalendarDays size={21} />
          </div>
          <div className="calendar-month">
            <button
              className="icon-button"
              aria-label="เดือนก่อนหน้า"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={19} />
            </button>
            <label className="month-label">
              <span>เลือกเดือน</span>
              <input
                aria-label="เดือนปฏิทิน"
                type="month"
                min="2020-01"
                max="2100-12"
                value={month}
                onInput={(e) => {
                  if (e.currentTarget.value) {
                    setMonth(e.currentTarget.value);
                    setDay("");
                  }
                }}
              />
            </label>
            <button
              className="icon-button"
              aria-label="เดือนถัดไป"
              onClick={() => shift(1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
          <div className="calendar-grid">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((w) => (
              <span className="weekday" key={w}>
                {w}
              </span>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <span key={`empty${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, "0")}`;
              const count = db.appointments.filter(
                (a) => a.date.startsWith(date) && a.status !== "Cancelled",
              ).length;
              return (
                <button
                  key={date}
                  className={`${date === day ? "selected-day" : ""} ${date === thaiNow().slice(0, 10) ? "today" : ""}`}
                  onClick={() => setDay(day === date ? "" : date)}
                  aria-label={`${date} ${count} นัดหมาย`}
                  aria-pressed={date === day}
                >
                  {i + 1}
                  {count > 0 && <span className="calendar-count">{count}</span>}
                </button>
              );
            })}
          </div>
          <button
            className="text-button"
            onClick={() => {
              setMonth(thaiNow().slice(0, 7));
              setDay("");
            }}
          >
            แสดงทุกวัน / กลับเดือนปัจจุบัน
          </button>
          <Notice>
            Reminder เป็นการบันทึกสถานะในต้นแบบ ไม่มีอีเมล SMS
            หรือการแจ้งเตือนเบื้องหลัง
          </Notice>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>{day ? `นัดหมาย ${day}` : "รายการนัดหมายทั้งหมด"}</h2>
            <select
              aria-label="กรองนัดหมาย"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option>Scheduled</option>
              <option>Missed</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          {appointments.map((a) => (
            <div className="appointment-item" key={a.id}>
              <div className="appointment-date">
                <CalendarDays size={19} />
                <span>
                  {a.date.slice(8, 10)}
                  <small>{a.date.slice(11)}</small>
                </span>
              </div>
              <div className="appointment-content">
                <strong>{patientName(db, a.patientId)}</strong>
                <p>{a.reason}</p>
                <span className="small muted">
                  {a.date.slice(0, 10)} · เวลาไทย
                </span>
                <div className="button-row">
                  <StatusMark label={appointmentState(a.date, a.status)} />
                  {a.reminder && (
                    <span className="small teal">
                      <Bell size={12} /> Reminder
                    </span>
                  )}
                </div>
                {a.notes && <p className="small muted">{a.notes}</p>}
              </div>
              <div className="appointment-actions">
                <button
                  className="icon-button"
                  aria-label={`แก้ไข ${a.id}`}
                  onClick={() => {
                    setEdit({ ...a });
                    setError("");
                  }}
                >
                  <Pencil size={16} />
                </button>
                {a.status === "Scheduled" && (
                  <button
                    className="text-button danger-text"
                    onClick={() => setCancel(a)}
                  >
                    ยกเลิกนัด
                  </button>
                )}
                {role === "admin" && (
                  <button
                    className="icon-button danger-text"
                    aria-label={`ลบ ${a.id}`}
                    onClick={() => setRemove(a)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {!appointments.length && <Empty text="ไม่มีนัดหมายตามเงื่อนไข" />}
          <ExportButton
            name="followup-report-demo.csv"
            rows={[
              [
                "ID",
                "Patient",
                "Date Thailand",
                "Reason",
                "Status",
                "Reminder",
                "Notes",
              ],
              ...appointments.map((a) => [
                a.id,
                patientName(db, a.patientId),
                a.date,
                a.reason,
                appointmentState(a.date, a.status),
                a.reminder ? "Yes" : "No",
                a.notes,
              ]),
            ]}
          />
        </section>
      </div>
      <section className="panel space-top">
        <div className="panel-heading">
          <h2>เปรียบเทียบผลตรวจย้อนหลัง</h2>
          <span className="tag">บันทึกแล้ว</span>
        </div>
        <PatientSelect value={patientId} onChange={setPatientId} />
        <DataChart
          values={comparison.map((t) => t.glucose)}
          labels={comparison.map((t) => t.date.slice(5, 10))}
          title="แนวโน้มค่าที่บันทึก · ไม่มีการแปลผลทางคลินิก"
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>วันเวลา</th>
                <th>Glucose</th>
                <th>cTnI ที่บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.glucose} mg/dL</td>
                  <td>
                    <CtniValue record={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          cTnI เป็นตัวเลขสมมติอิสระ ไม่ได้แปลงจาก Glucose
          และยังไม่มีข้อมูลสอบเทียบ
        </p>
      </section>
      {edit && (
        <Modal title="บันทึกนัดหมาย · Follow-up" onClose={() => setEdit(null)}>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!edit.reason.trim()) {
                setError("กรุณาระบุเหตุผลนัดหมาย");
                return;
              }
              if (
                change({
                  kind: "saveAppointment",
                  value: { ...edit, reason: edit.reason.trim() },
                })
              ) {
                setEdit(null);
                notify("บันทึกนัดหมายแล้ว");
              }
            }}
          >
            <PatientSelect
              value={edit.patientId}
              onChange={(id) => setEdit({ ...edit, patientId: id })}
            />
            <label className="field">
              วันเวลานัดหมาย (ประเทศไทย)
              <input
                required
                type="datetime-local"
                min="2020-01-01T00:00"
                max="2100-12-31T23:59"
                value={edit.date}
                onInput={(e) =>
                  setEdit({ ...edit, date: e.currentTarget.value })
                }
              />
            </label>
            <label className="field">
              เหตุผลนัดหมาย
              <input
                required
                maxLength={200}
                value={edit.reason}
                onChange={(e) => setEdit({ ...edit, reason: e.target.value })}
              />
            </label>
            <label className="field">
              สถานะนัดหมาย
              <select
                value={edit.status}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    status: e.target.value as Appointment["status"],
                  })
                }
              >
                <option>Scheduled</option>
                {(role !== "patient" || edit.status === "Completed") && (
                  <option>Completed</option>
                )}
                <option>Cancelled</option>
              </select>
            </label>
            <label className="field">
              บันทึกอาการ / หมายเหตุ
              <textarea
                maxLength={2000}
                value={edit.notes}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={edit.reminder}
                onChange={(e) =>
                  setEdit({ ...edit, reminder: e.target.checked })
                }
              />
              ติดตามการเตือนนัดในระบบ (ยังไม่ส่งการแจ้งเตือนภายนอก)
            </label>
            {edit.date < thaiNow() && edit.status === "Scheduled" && (
              <p className="small amber-text">
                วันเวลานี้ผ่านแล้ว ระบบจะแสดง Missed Appointment
              </p>
            )}
            {error && <p className="error">{error}</p>}
            <button className="primary">บันทึกนัดหมาย</button>
          </form>
        </Modal>
      )}
      {cancel && (
        <Modal title="ยกเลิกนัดหมาย" onClose={() => setCancel(null)}>
          <p>
            ยกเลิกนัด {cancel.reason} วันที่ {cancel.date.replace("T", " ")}?
            ประวัติจะยังคงอยู่
          </p>
          <button
            className="danger-button"
            onClick={() => {
              if (
                change({
                  kind: "saveAppointment",
                  value: { ...cancel, status: "Cancelled" },
                })
              ) {
                setCancel(null);
                notify("ยกเลิกนัดหมายแล้ว");
              }
            }}
          >
            ยืนยันยกเลิกนัดหมาย
          </button>
        </Modal>
      )}
      {remove && (
        <Modal title="ลบประวัตินัดหมาย" onClose={() => setRemove(null)}>
          <p>ลบประวัตินัด {remove.id} ออกจากข้อมูลในเบราว์เซอร์?</p>
          <button
            className="danger-button"
            onClick={() => {
              if (change({ kind: "deleteAppointment", id: remove.id })) {
                setRemove(null);
                notify("ลบประวัตินัดหมายแล้ว");
              }
            }}
          >
            ยืนยันลบประวัติ
          </button>
        </Modal>
      )}
    </>
  );
}
