import { useState } from "react";
import { Save, Download, RotateCcw, ShieldCheck } from "lucide-react";
import { PageHeading, Notice, Modal } from "../components/UI";
import { saveFile, roleNames, canManage } from "./domain";
import { usePlatform, StatusMark } from "./Common";
export function Settings() {
  const { db, role, change, reset, notify } = usePlatform();
  const [organization, setOrganization] = useState(db.settings.organization);
  const [compact, setCompact] = useState(db.settings.compact);
  const [confirm, setConfirm] = useState(false);
  const admin = canManage(role, "settings");
  return (
    <>
      <PageHeading
        eyebrow="SETTINGS / DEMO WORKSPACE"
        title="ตั้งค่าพื้นที่ทำงาน"
        description="ข้อมูลของต้นแบบจัดเก็บเฉพาะเบราว์เซอร์นี้ ไม่มีระบบยืนยันตัวตนหรือ Backend จริง"
      />
      <div className="settings-grid">
        <form
          className="panel stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!admin) return;
            if (
              change({
                kind: "settings",
                value: { organization: organization.trim(), compact },
              })
            )
              notify("บันทึกการตั้งค่าพื้นที่ทำงานแล้ว");
          }}
        >
          <div className="panel-heading">
            <h2>Workspace Preferences</h2>
            <ShieldCheck size={21} />
          </div>
          <label className="field">
            ชื่อหน่วยงานสมมติ
            <input
              required
              maxLength={80}
              disabled={!admin}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              disabled={!admin}
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
            />
            แสดงรายการแบบกระชับ (Compact Tables)
          </label>
          {admin ? (
            <button className="primary">
              <Save size={17} />
              บันทึกการตั้งค่า
            </button>
          ) : (
            <Notice>Administrator เท่านั้นที่แก้ไขการตั้งค่าส่วนกลางได้</Notice>
          )}
          <div className="settings-role">
            <span>บทบาทปัจจุบัน</span>
            <strong>{roleNames[role]}</strong>
            <StatusMark label="Demo Role" />
          </div>
        </form>
        <section className="panel stack-form">
          <h2>ข้อมูลและความเป็นส่วนตัว</h2>
          <p>
            กรอกข้อมูลสมมติเท่านั้น LocalStorage ไม่เหมาะกับข้อมูลสุขภาพจริง
            ผู้ที่เข้าถึงเบราว์เซอร์นี้อาจเปิดดูหรือแก้ข้อมูลได้
          </p>
          <p>
            Role เป็นการจำลองสิทธิ์ใน Frontend
            ไม่ใช่ระบบรักษาความปลอดภัยสำหรับข้อมูลผู้ป่วยจริง
          </p>
          <button
            className="secondary"
            onClick={() =>
              saveFile(
                "TropoSense-demo-database.json",
                JSON.stringify(db, null, 2),
                "application/json;charset=utf-8",
              )
            }
          >
            <Download size={17} />
            ส่งออกข้อมูล Demo ตามสิทธิ์ (JSON)
          </button>
          {admin && (
            <button className="danger-outline" onClick={() => setConfirm(true)}>
              <RotateCcw size={17} />
              คืนข้อมูลตัวอย่างเริ่มต้น
            </button>
          )}
          <span className="small muted">
            การรีเซ็ตจะลบรายการที่เพิ่มในต้นแบบ และโหลดชุดข้อมูลสมมติเริ่มต้น
          </span>
        </section>
      </div>
      <section className="panel space-top">
        <h2>Demo Role Permissions</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>บทบาท</th>
                <th>ข้อมูลผู้ป่วย</th>
                <th>QC / Doctor Notes</th>
                <th>ตั้งค่า / ลบแฟ้ม</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Administrator</td>
                <td>ดู เพิ่ม แก้ไข ทุกแฟ้มสมมติ</td>
                <td>จัดการข้อมูลสาธิต</td>
                <td>แก้ไขและรีเซ็ตได้</td>
              </tr>
              <tr>
                <td>Healthcare Professional</td>
                <td>ดู เพิ่ม แก้ไข ทุกแฟ้มสมมติ</td>
                <td>จัดการข้อมูลสาธิต</td>
                <td>ไม่มีสิทธิ์ตั้งค่าหรือลบแฟ้มผู้ป่วย</td>
              </tr>
              <tr>
                <td>Patient</td>
                <td>ดูเฉพาะ PT-0001 · บันทึกอาการและค่าของตนเอง</td>
                <td>สร้างคำขอ / อ่านคำตอบเท่านั้น</td>
                <td>ไม่มีสิทธิ์ตั้งค่าหรือลบแฟ้ม</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {confirm && (
        <Modal
          title="คืนข้อมูลตัวอย่างเริ่มต้น"
          onClose={() => setConfirm(false)}
        >
          <p>
            รายการที่เพิ่มหรือแก้ไขในทุกโมดูลจะถูกแทนที่ด้วยข้อมูลตัวอย่างเริ่มต้น
            แนะนำส่งออก JSON ก่อนหากต้องการเก็บไว้
          </p>
          <div className="button-row">
            <button
              className="danger-button"
              onClick={() => {
                reset();
                setOrganization("TropoSense Research Lab");
                setCompact(false);
                setConfirm(false);
              }}
            >
              ยืนยันคืนข้อมูลเริ่มต้น
            </button>
            <button className="secondary" onClick={() => setConfirm(false)}>
              เก็บข้อมูลปัจจุบัน
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
