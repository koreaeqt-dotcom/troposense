import { useState } from "react";
import { Pencil, Trash2, ShieldCheck, Clock3, ShieldX } from "lucide-react";
import { PageHeading, Modal, Notice } from "../components/UI";
import { formatDate } from "../model";
import { type QC, uid, qcStatus, thaiNow } from "./domain";
import {
  usePlatform,
  AddButton,
  StatusMark,
  ExportButton,
  Empty,
} from "./Common";
const checklist = [
  "ตรวจสภาพอุปกรณ์และบรรจุภัณฑ์ตามแผนสาธิต",
  "ตรวจ Device ID, Lot และวันหมดอายุ",
  "บันทึกการตรวจสอบโดยผู้รับผิดชอบ",
];
export function Quality() {
  const { db, change, notify } = usePlatform();
  const [edit, setEdit] = useState<QC | null>(null);
  const [remove, setRemove] = useState<QC | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const rows = db.qc.filter(
    (q) =>
      (q.device + q.lot + q.id).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || qcStatus(q.checks, q.expiry, q.failed) === filter),
  );
  const report = [
    ["QC ID", "Device ID", "Lot", "Expiry", "Status", "Date", "Notes"],
    ...rows.map((q) => [
      q.id,
      q.device,
      q.lot,
      q.expiry,
      qcStatus(q.checks, q.expiry, q.failed),
      q.date,
      q.notes,
    ]),
  ];
  return (
    <>
      <PageHeading
        eyebrow="QUALITY CONTROL"
        title="ควบคุมคุณภาพการตรวจ"
        description="ตรวจความพร้อมของอุปกรณ์และตลับ บันทึกให้ตรวจสอบย้อนหลังได้"
        action={
          <AddButton
            onClick={() =>
              setEdit({
                id: uid("QC"),
                device: "",
                lot: "",
                expiry: "",
                checks: [false, false, false],
                failed: false,
                notes: "",
                date: new Date().toISOString(),
              })
            }
          >
            เพิ่มบันทึก QC
          </AddButton>
        }
      />
      <div className="stat-grid three">
        {[
          { s: "Pass", icon: ShieldCheck, label: "ตรวจครบตามรายการ" },
          { s: "Pending", icon: Clock3, label: "รอการตรวจสอบ" },
          { s: "Fail", icon: ShieldX, label: "พบรายการที่ต้องแก้ไข" },
        ].map((s) => (
          <div className="stat-card" key={s.s}>
            <s.icon size={21} />
            <span>{s.s}</span>
            <strong>
              {
                db.qc.filter(
                  (q) => qcStatus(q.checks, q.expiry, q.failed) === s.s,
                ).length
              }
            </strong>
            <small>{s.label}</small>
          </div>
        ))}
      </div>
      <Notice>
        QC Status เป็นผลตาม Checklist ของต้นแบบเท่านั้น
        ไม่ใช่การยืนยันความเข้ากันได้ ความแม่นยำ หรือการควบคุมคุณภาพทางคลินิก
      </Notice>
      <section className="panel space-top">
        <div className="filter-bar">
          <input
            aria-label="ค้นหา QC"
            placeholder="ค้นหา Device ID / Lot"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="กรอง QC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">ทุกสถานะ</option>
            <option>Pass</option>
            <option>Pending</option>
            <option>Fail</option>
          </select>
          <ExportButton name="qc-quality-report-demo.csv" rows={report} />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>อุปกรณ์ / QC ID</th>
                <th>Cartridge Lot</th>
                <th>วันหมดอายุ</th>
                <th>สถานะ</th>
                <th>บันทึกล่าสุด</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id}>
                  <td>
                    <strong>{q.device}</strong>
                    <span className="table-sub">{q.id}</span>
                  </td>
                  <td>{q.lot}</td>
                  <td>{q.expiry}</td>
                  <td>
                    <StatusMark
                      label={qcStatus(q.checks, q.expiry, q.failed)}
                    />
                  </td>
                  <td>{formatDate(q.date)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`แก้ไข ${q.id}`}
                        onClick={() => setEdit({ ...q, checks: [...q.checks] })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger-text"
                        aria-label={`ลบ ${q.id}`}
                        onClick={() => setRemove(q)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty text="ยังไม่มีบันทึก QC ตามเงื่อนไข" />}
      </section>
      {edit && (
        <Modal title="บันทึก Quality Control" onClose={() => setEdit(null)}>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!edit.device.trim() || !edit.lot.trim()) return;
              const value = {
                ...edit,
                device: edit.device.trim(),
                lot: edit.lot.trim(),
                date: new Date().toISOString(),
              };
              if (change({ kind: "saveQC", value })) {
                setEdit(null);
                notify("บันทึกการตรวจสอบ QC แล้ว");
              }
            }}
          >
            <label className="field">
              Device ID
              <input
                required
                maxLength={100}
                value={edit.device}
                onChange={(e) => setEdit({ ...edit, device: e.target.value })}
              />
            </label>
            <label className="field">
              Cartridge Lot Number
              <input
                required
                maxLength={100}
                value={edit.lot}
                onChange={(e) => setEdit({ ...edit, lot: e.target.value })}
              />
            </label>
            <label className="field">
              วันหมดอายุชุดตรวจ
              <input
                required
                type="date"
                value={edit.expiry}
                onInput={(e) =>
                  setEdit({ ...edit, expiry: e.currentTarget.value })
                }
              />
            </label>
            <fieldset>
              <legend>QC Checklist</legend>
              <div className="symptom-list">
                {checklist.map((s, i) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      checked={edit.checks[i]}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          checks: edit.checks.map((b, j) =>
                            j === i ? e.target.checked : b,
                          ),
                        })
                      }
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="check-field">
              <input
                type="checkbox"
                checked={edit.failed}
                onChange={(e) => setEdit({ ...edit, failed: e.target.checked })}
              />
              พบข้อบกพร่องในการตรวจสอบ (Fail)
            </label>
            <label className="field">
              หมายเหตุ
              <textarea
                maxLength={2000}
                value={edit.notes}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </label>
            <div className="qc-preview">
              สถานะตามรายการ{" "}
              <StatusMark
                label={qcStatus(edit.checks, edit.expiry, edit.failed)}
              />
            </div>
            {edit.expiry && edit.expiry < thaiNow().slice(0, 10) && (
              <p className="error">วันหมดอายุผ่านแล้ว ไม่สามารถแสดง Pass ได้</p>
            )}
            <button className="primary">บันทึก QC</button>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal title="ลบบันทึก QC" onClose={() => setRemove(null)}>
          <p>
            ลบบันทึก {remove.id} ของอุปกรณ์ {remove.device}?
          </p>
          <button
            className="danger-button"
            onClick={() => {
              if (change({ kind: "deleteQC", id: remove.id })) {
                setRemove(null);
                notify("ลบบันทึก QC แล้ว");
              }
            }}
          >
            ยืนยันลบ QC
          </button>
        </Modal>
      )}
    </>
  );
}
