import { useState } from "react";
import { Phone, ClipboardCheck, Download, TriangleAlert } from "lucide-react";
import { PageHeading, Notice, Modal } from "../components/UI";
import { downloadText, type TestRecord } from "../model";
const symptoms = [
  "อาการแน่นหน้าอก",
  "อาการเจ็บหน้าอก",
  "หายใจลำบาก",
  "เหงื่อออกผิดปกติ",
  "หน้ามืดหรือเวียนศีรษะ",
];
export type HealthData = {
  age: string;
  symptoms: string[];
  duration: string;
  notes: string;
};
export const emptyHealth: HealthData = {
  age: "",
  symptoms: [],
  duration: "",
  notes: "",
};
export function Health({
  record,
  data,
  setData,
}: {
  record: TestRecord;
  data: HealthData;
  setData: (d: HealthData) => void;
}) {
  const [summary, setSummary] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [error, setError] = useState("");
  const urgent = data.symptoms.some((s) => symptoms.slice(0, 3).includes(s));
  function update(next: Partial<HealthData>) {
    setData({ ...data, ...next });
    setSummary("");
    setError("");
  }
  return (
    <>
      <PageHeading
        eyebrow="HEALTH SUPPORT"
        title="การสนับสนุนการประเมินสุขภาพ"
        description="บันทึกอาการเบื้องต้น เพื่อเตรียมข้อมูลสำหรับปรึกษาบุคลากรทางการแพทย์"
      />
      <div className="emergency-strip">
        <TriangleAlert size={23} />
        <div>
          <strong>หากมีอาการฉุกเฉิน ไม่ต้องรอผลจากเว็บไซต์</strong>
          <p>
            เจ็บหรือแน่นหน้าอก หายใจลำบาก หรือมีอาการฉุกเฉิน ให้ติดต่อ 1669
            หรือเข้ารับการรักษาทันที
          </p>
        </div>
        <button onClick={() => setEmergency(true)}>
          <Phone size={17} />
          ข้อมูลฉุกเฉิน 1669
        </button>
      </div>
      <div className="health-layout">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              data.age &&
              (!Number.isInteger(Number(data.age)) ||
                Number(data.age) < 1 ||
                Number(data.age) > 130)
            ) {
              setError(
                "กรุณาระบุอายุเป็นจำนวนเต็มระหว่าง 1–130 ปี หรือเว้นว่าง",
              );
              return;
            }
            setSummary(
              `สรุปข้อมูลเพื่อปรึกษาบุคลากรทางการแพทย์ (ต้นแบบ)\nอายุ: ${data.age || "ไม่ได้ระบุ"}\nอาการ: ${data.symptoms.join(", ") || "ไม่ได้เลือกอาการ"}\nระยะเวลา: ${data.duration || "ไม่ได้ระบุ"}\nข้อมูลเพิ่มเติม: ${data.notes || "ไม่ได้ระบุ"}\n\nผลตรวจที่มี: ${record.id}\nGlucose: ${record.glucose} mg/dL (${record.demo ? "ข้อมูลจำลอง" : "ผู้ใช้กรอก ยังไม่ได้ตรวจสอบ"})\ncTnI: ยังไม่มีข้อมูลสอบเทียบ\n\nข้อมูลนี้ไม่ใช่การวินิจฉัยหรือคะแนนความเสี่ยง และยังไม่ได้ส่งให้แพทย์\nหากมีอาการฉุกเฉิน ให้ติดต่อ 1669 หรือเข้ารับการรักษาทันที`,
            );
          }}
        >
          <div className="panel-heading">
            <h2>ข้อมูลอาการเบื้องต้น</h2>
            <span className="small muted">Symptom Assessment</span>
          </div>
          <fieldset>
            <legend>เลือกอาการที่พบ</legend>
            <div className="symptom-list">
              {symptoms.map((s) => (
                <label
                  key={s}
                  className={data.symptoms.includes(s) ? "checked" : ""}
                >
                  <input
                    type="checkbox"
                    checked={data.symptoms.includes(s)}
                    onChange={(e) =>
                      update({
                        symptoms: e.target.checked
                          ? [...data.symptoms, s]
                          : data.symptoms.filter((x) => x !== s),
                      })
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          {urgent && (
            <div role="alert" className="urgent-inline">
              โปรดติดต่อ 1669 หรือเข้ารับการรักษาทันที
              ไม่ต้องรอบันทึกข้อมูลหรือรอผลตรวจ
            </div>
          )}
          <div className="form-row">
            <label>
              อายุ <span className="muted">(ไม่บังคับ)</span>
              <input
                type="number"
                placeholder="ระบุอายุ (ปี)"
                min="1"
                max="130"
                value={data.age}
                onChange={(e) => update({ age: e.target.value })}
              />
            </label>
            <label>
              ระยะเวลาที่มีอาการ
              <input
                placeholder="เช่น 20 นาที"
                value={data.duration}
                maxLength={100}
                onChange={(e) => update({ duration: e.target.value })}
              />
            </label>
          </div>
          <label>
            ข้อมูลประกอบการประเมิน
            <textarea
              placeholder="รายละเอียดอาการหรือข้อมูลที่ต้องการแจ้งบุคลากรทางการแพทย์"
              maxLength={2000}
              rows={3}
              value={data.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </label>
          <p className="small muted">
            ข้อมูลอยู่ในเซสชันนี้เท่านั้น และจะหายไปเมื่อรีเฟรชหน้า
          </p>
          <div role="alert" className="error">
            {error}
          </div>
          <button className="primary" type="submit">
            <ClipboardCheck size={18} />
            สร้างสรุปข้อมูลสุขภาพ
          </button>
        </form>
        <section className="panel health-summary" aria-live="polite">
          <div className="panel-heading">
            <h2>สรุปข้อมูลสุขภาพ</h2>
            <span className="small muted">Health Summary</span>
          </div>
          {summary ? (
            <>
              <pre className="report">{summary}</pre>
              <button
                className="secondary"
                onClick={() =>
                  downloadText("TropoSense-health-summary-demo.txt", summary)
                }
              >
                <Download size={17} />
                ดาวน์โหลดสรุปข้อมูล
              </button>
            </>
          ) : (
            <div className="empty-summary">
              <ClipboardCheck size={42} strokeWidth={1.2} />
              <h3>เตรียมข้อมูลก่อนปรึกษา</h3>
              <p>
                กรอกอาการและกดสร้างสรุปข้อมูล
                <br />
                เพื่อรวบรวมอาการและผลตรวจไว้ด้วยกัน
              </p>
            </div>
          )}
          <Notice>
            ไม่มีการวินิจฉัยหรือให้คะแนนความเสี่ยง
            และยังไม่มีการเชื่อมต่อแพทย์หรือระบบฉุกเฉินจริง
          </Notice>
        </section>
      </div>
      {emergency && (
        <Modal title="ข้อมูลติดต่อฉุกเฉิน" onClose={() => setEmergency(false)}>
          <div className="emergency-number">
            <Phone size={32} />
            <strong>1669</strong>
          </div>
          <h3>การแพทย์ฉุกเฉิน</h3>
          <p>
            หากเจ็บหรือแน่นหน้าอก หายใจลำบาก หรือมีอาการฉุกเฉิน ให้โทร 1669
            ด้วยโทรศัพท์ หรือเข้ารับการรักษาทันที ไม่ต้องรอผลจากเว็บไซต์
          </p>
          <Notice>
            หน้าต่างนี้แสดงข้อมูลติดต่อเท่านั้น ไม่มีการโทร ส่งข้อมูล
            หรือเรียกรถพยาบาลจากเว็บไซต์
          </Notice>
          <button className="secondary" onClick={() => setEmergency(false)}>
            ปิดข้อมูลติดต่อ
          </button>
        </Modal>
      )}
    </>
  );
}
