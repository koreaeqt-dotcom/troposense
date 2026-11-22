import { useState } from "react";
import { Eye, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { PageHeading, Modal, Notice } from "../components/UI";
import { formatDate, createRecord, formatCtni } from "../model";
import { CalibrationControls } from "../components/CalibrationControls";
import { CtniValue } from "../components/CtniValue";
import { evaluateCtni, type ReadingOptions } from "../calibration/evaluate";
import {
  type Patient,
  uid,
  canManage,
  patientSummary,
  saveFile,
} from "./domain";
import {
  usePlatform,
  FilterBar,
  AddButton,
  StatusMark,
  Empty,
  DataChart,
  ExportButton,
} from "./Common";
const blankPatient: Patient = {
  id: "",
  name: "",
  age: 30,
  sex: "ไม่ระบุ",
  contact: "",
  history: "",
  notes: "",
  status: "ทั่วไป",
};
export function Patients() {
  const { db, role, change, notify } = usePlatform();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState<Patient | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [remove, setRemove] = useState<Patient | null>(null);
  const [testForm, setTestForm] = useState(false);
  const [glucose, setGlucose] = useState("");
  const [options, setOptions] = useState<ReadingOptions>({
    mode: "standard",
    unit: "mg/dL",
    confirmed: false,
  });
  const [error, setError] = useState("");
  const profile = db.patients.find((p) => p.id === profileId);
  const editable = canManage(role, "patients");
  const patients = db.patients.filter(
    (p) =>
      (p.name + p.id + p.contact)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" || p.status === filter),
  );
  const tests = db.tests
    .filter((t) => t.patientId === profileId)
    .sort((a, b) => a.date.localeCompare(b.date));
  function openEditor(p: Patient) {
    setEditor({ ...p });
    setError("");
  }
  return (
    <>
      <PageHeading
        eyebrow="PATIENT RECORDS"
        title={role === "patient" ? "ข้อมูลสุขภาพของฉัน" : "ประวัติผู้ป่วย"}
        description="จัดการข้อมูลผู้ป่วย ประวัติการตรวจ อาการ และแผนการติดตาม"
        action={
          editable ? (
            <AddButton
              onClick={() => openEditor({ ...blankPatient, id: uid("PT") })}
            >
              เพิ่มผู้ป่วย
            </AddButton>
          ) : undefined
        }
      />
      <Notice>
        รวมประวัติการตรวจ อาการ และแผนการติดตามไว้ในแฟ้มเดียว
        เลือกผู้ป่วยเพื่อเปิดดูรายละเอียดหรือบันทึกข้อมูลเพิ่มเติม
      </Notice>
      <section className="panel space-top">
        <FilterBar search={search} setSearch={setSearch}>
          <select
            aria-label="กรองสถานะผู้ป่วย"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">ทุกสถานะ</option>
            <option>ทั่วไป</option>
            <option>ติดตาม</option>
          </select>
          <ExportButton
            name="patients-demo.csv"
            rows={[
              ["Patient ID", "ชื่อผู้ป่วย", "อายุ", "เพศ", "สถานะ"],
              ...patients.map((p) => [p.id, p.name, p.age, p.sex, p.status]),
            ]}
          />
        </FilterBar>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ผู้ป่วย / Patient ID</th>
                <th>อายุ / เพศ</th>
                <th>การตรวจ</th>
                <th>สถานะติดตาม</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <span className="table-sub">{p.id}</span>
                  </td>
                  <td>
                    {p.age} ปี · {p.sex}
                  </td>
                  <td>
                    {db.tests.filter((t) => t.patientId === p.id).length} รายการ
                  </td>
                  <td>
                    <StatusMark label={p.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="secondary small-button"
                        onClick={() => {
                          setProfileId(p.id);
                          setTestForm(false);
                        }}
                      >
                        <Eye size={15} />
                        ดูประวัติ
                      </button>
                      {editable && (
                        <button
                          className="icon-button"
                          title="แก้ไข"
                          aria-label={`แก้ไข ${p.id}`}
                          onClick={() => openEditor(p)}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {role === "admin" && p.id !== "PT-0001" && (
                        <button
                          className="icon-button danger-text"
                          aria-label={`ลบ ${p.id}`}
                          onClick={() => setRemove(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!patients.length && <Empty text="ไม่พบผู้ป่วยตามเงื่อนไข" />}
      </section>
      {editor && (
        <Modal
          title={
            db.patients.some((p) => p.id === editor.id)
              ? "แก้ไขข้อมูลผู้ป่วย"
              : "เพิ่มผู้ป่วย"
          }
          onClose={() => setEditor(null)}
        >
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editor.name.trim()) {
                setError("กรุณาระบุชื่อผู้ป่วย");
                return;
              }
              if (
                change({
                  kind: "savePatient",
                  value: { ...editor, name: editor.name.trim() },
                })
              ) {
                setEditor(null);
                notify("บันทึกข้อมูลผู้ป่วยแล้ว");
              }
            }}
          >
            <BadgeId id={editor.id} />
            <label className="field">
              ชื่อผู้ป่วย
              <input
                required
                maxLength={100}
                value={editor.name}
                onChange={(e) => setEditor({ ...editor, name: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label className="field">
                อายุ
                <input
                  required
                  type="number"
                  min="1"
                  max="130"
                  step="1"
                  value={editor.age}
                  onChange={(e) =>
                    setEditor({ ...editor, age: Number(e.target.value) })
                  }
                />
              </label>
              <label className="field">
                เพศ
                <select
                  value={editor.sex}
                  onChange={(e) =>
                    setEditor({ ...editor, sex: e.target.value })
                  }
                >
                  <option>ไม่ระบุ</option>
                  <option>หญิง</option>
                  <option>ชาย</option>
                  <option>อื่น ๆ</option>
                </select>
              </label>
            </div>
            <label className="field">
              ข้อมูลติดต่อ
              <input
                maxLength={150}
                placeholder="เช่น demo@example.test"
                value={editor.contact}
                onChange={(e) =>
                  setEditor({ ...editor, contact: e.target.value })
                }
              />
            </label>
            <label className="field">
              ประวัติสุขภาพ
              <textarea
                maxLength={2000}
                value={editor.history}
                onChange={(e) =>
                  setEditor({ ...editor, history: e.target.value })
                }
              />
            </label>
            <label className="field">
              สถานะ
              <select
                value={editor.status}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    status: e.target.value as Patient["status"],
                  })
                }
              >
                <option>ทั่วไป</option>
                <option>ติดตาม</option>
              </select>
            </label>
            <label className="field">
              หมายเหตุ
              <textarea
                maxLength={2000}
                value={editor.notes}
                onChange={(e) =>
                  setEditor({ ...editor, notes: e.target.value })
                }
              />
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="primary">บันทึกผู้ป่วย</button>
          </form>
        </Modal>
      )}
      {profile && (
        <Modal title="ข้อมูลผู้ป่วย" onClose={() => setProfileId(null)}>
          <div className="patient-profile-head">
            <span className="patient-avatar">{profile.name.slice(0, 1)}</span>
            <div>
              <h3>{profile.name}</h3>
              <p>
                {profile.id} · {profile.age} ปี · {profile.sex}
              </p>
            </div>
            <StatusMark label={profile.status} />
          </div>
          <div className="profile-info">
            <p>
              <strong>ข้อมูลติดต่อ</strong>
              <br />
              {profile.contact || "—"}
            </p>
            <p>
              <strong>ประวัติสุขภาพ</strong>
              <br />
              {profile.history || "—"}
            </p>
            <p>
              <strong>หมายเหตุ</strong>
              <br />
              {profile.notes || "—"}
            </p>
          </div>
          <div className="button-row">
            <button
              className="secondary"
              onClick={() =>
                saveFile(
                  `${profile.id}-demo-summary.txt`,
                  patientSummary(db, profile.id),
                )
              }
            >
              <FileText size={16} />
              ดาวน์โหลดสรุป
            </button>
            {editable && (
              <button
                className="secondary"
                onClick={() => {
                  setTestForm(!testForm);
                  setOptions({
                    mode: "standard",
                    unit: "mg/dL",
                    confirmed: false,
                  });
                  setError("");
                }}
              >
                <Plus size={16} />
                บันทึกผลการตรวจ
              </button>
            )}
          </div>
          {testForm && (
            <form
              className="inset-form stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  glucose.trim() === "" ||
                  !Number.isFinite(Number(glucose)) ||
                  Number(glucose) <= 0
                ) {
                  setError("กรอกค่ากลูโคสมากกว่า 0");
                  return;
                }
                try {
                  const value = {
                    ...createRecord(glucose, "manual", options),
                    patientId: profile.id,
                    demo: true,
                    ctniDemo: null,
                  };
                  if (change({ kind: "saveTest", value })) {
                    setTestForm(false);
                    setGlucose("");
                    setOptions({
                      mode: "standard",
                      unit: "mg/dL",
                      confirmed: false,
                    });
                    notify("บันทึกผลการตรวจแล้ว");
                  }
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : "ไม่สามารถคำนวณได้",
                  );
                }
              }}
            >
              <label className="field">
                Glucose (mg/dL)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  value={glucose}
                  onChange={(e) => {
                    setGlucose(e.target.value);
                    setOptions((o) => ({ ...o, confirmed: false }));
                  }}
                />
              </label>
              <CalibrationControls options={options} onChange={setOptions} />
              <label className="field">
                cTnI (ng/L) · คำนวณจาก Calibration
                <input
                  readOnly
                  value={
                    options.confirmed
                      ? formatCtni(
                          evaluateCtni({
                            glucose,
                            source: "manual",
                            ...options,
                          }).valueNgL,
                        )
                      : "—"
                  }
                />
              </label>
              <p className="small muted">
                cTnI ใช้ฟังก์ชัน Logarithmic Calibration เดียวกับหน้า Scan &
                Input หากไม่มีข้อมูลสอบเทียบที่ผ่านการตรวจสอบ
                จะไม่แสดงผลตรวจจริง
              </p>
              {error && <p className="error">{error}</p>}
              <button className="primary">บันทึกผลการตรวจ</button>
            </form>
          )}
          <DataChart
            values={tests.map((t) => t.glucose)}
            labels={tests.map((t) => t.date.slice(5, 10))}
            title="เปรียบเทียบ Glucose ย้อนหลัง"
          />
          <h3>ประวัติผลตรวจ</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>Glucose</th>
                  <th>cTnI ที่บันทึก</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
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
            ข้อมูล cTnI จำลองเดิมคงไว้เพื่อดูประวัติ ส่วนรายการใหม่ใช้
            Logarithmic Calibration และไม่ใช้ค่าเดียววินิจฉัยโรค
          </p>
          <h3>Screening History</h3>
          {db.screenings
            .filter((s) => s.patientId === profile.id)
            .map((s) => (
              <div className="timeline-item" key={s.id}>
                <StatusMark label={s.risk} />
                <p>
                  {s.symptoms.join(", ") || "ไม่เลือกอาการ"} ·{" "}
                  {s.duration || "ไม่ระบุระยะเวลา"}
                </p>
                <small>{formatDate(s.date)} · สถานการณ์สาธิตเท่านั้น</small>
              </div>
            ))}
          {!db.screenings.some((s) => s.patientId === profile.id) && (
            <p className="muted">ยังไม่มีประวัติอาการ</p>
          )}
        </Modal>
      )}
      {remove && (
        <Modal title="ลบข้อมูลผู้ป่วย" onClose={() => setRemove(null)}>
          <p>
            ลบ {remove.name} และผลตรวจ อาการ การส่งปรึกษา นัดหมาย
            และเหตุการณ์จำลองที่ผูกกับรายนี้ออกจากเบราว์เซอร์?
          </p>
          <div className="button-row">
            <button
              className="danger-button"
              onClick={() => {
                if (change({ kind: "deletePatient", id: remove.id })) {
                  setRemove(null);
                  notify("ลบข้อมูลและรายการที่เกี่ยวข้องแล้ว");
                }
              }}
            >
              ยืนยันลบข้อมูล
            </button>
            <button className="secondary" onClick={() => setRemove(null)}>
              เก็บข้อมูลไว้
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function BadgeId({ id }: { id: string }) {
  return <div className="record-id">{id} · PATIENT RECORD</div>;
}
