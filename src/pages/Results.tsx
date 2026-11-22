import { useState } from "react";
import { Download, Eye, ScanLine, FlaskConical } from "lucide-react";
import { PageHeading, Notice, Modal } from "../components/UI";
import {
  formatDate,
  reportText,
  downloadText,
  ctniDisplay,
  formatCtni,
  type TestRecord,
} from "../model";
export function Results({
  records,
  onScan,
}: {
  records: TestRecord[];
  onScan: () => void;
}) {
  const [selected, setSelected] = useState(records[0]);
  const [detail, setDetail] = useState<TestRecord | null>(null);
  const ctni = ctniDisplay(selected);
  return (
    <>
      <PageHeading
        eyebrow="TEST RESULTS & HISTORY"
        title="ผลการตรวจและประวัติ"
        description="ข้อมูลที่อ่านจากอุปกรณ์ และสถานะการประมาณค่า cTnI"
        action={
          <button className="primary" onClick={onScan}>
            <ScanLine size={18} />
            นำเข้าค่าใหม่
          </button>
        }
      />
      <div className="result-summary">
        <div className="summary-meta">
          <div>
            <span className="eyebrow">TEST SUMMARY</span>
            <h2>ข้อมูลการตรวจล่าสุดที่เลือก</h2>
          </div>
          <span className="tag">
            {selected.demo ? "บันทึกแล้ว" : "ผู้ใช้กรอก · ยังไม่ได้ตรวจสอบ"}
          </span>
        </div>
        <div className="result-values">
          <div>
            <span className="metric-label">Glucose Reading</span>
            <div className="big-value">
              {selected.glucose}
              <span>mg/dL</span>
            </div>
            <p className="small muted">ค่าที่บันทึกจากเครื่องอ่านกลูโคส</p>
          </div>
          <div>
            <span className="metric-label">Estimated cTnI</span>
            <div className="big-value muted">
              {formatCtni(ctni.valueNgL)}
              <span>ng/L</span>
            </div>
            <span className="calibration">
              <FlaskConical size={15} />
              {ctni.message}
            </span>
            <p className="small muted">{ctni.referenceStatus}</p>
          </div>
          <dl className="test-meta">
            <dt>Test ID</dt>
            <dd>{selected.id}</dd>
            <dt>วันที่และเวลาตรวจ (ไทย)</dt>
            <dd>{formatDate(selected.date)}</dd>
            <dt>วิธีนำเข้า</dt>
            <dd>
              {selected.source === "ocr-demo" ? "OCR จำลอง" : "กรอกด้วยตนเอง"}
            </dd>
          </dl>
        </div>
        <div className="summary-bottom">
          <span className="small muted">
            ไม่มีการระบุผลปกติ / ผิดปกติ หรือการวินิจฉัยจากข้อมูลนี้
          </span>
          <button
            className="secondary"
            onClick={() =>
              downloadText(`${selected.id}-demo.txt`, reportText(selected))
            }
          >
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>
      <Notice>
        ใช้แบบจำลอง C = C0 × 10^((G − b) / a) เฉพาะชุด Calibration ที่เหมาะสม
        หรือโหมด DEMO ที่เลือกไว้อย่างชัดเจน ไม่ใช้ cTnI
        ค่าเดียววินิจฉัยภาวะหัวใจวาย
      </Notice>
      <section className="panel history">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">TEST HISTORY</span>
            <h2>ประวัติการตรวจ</h2>
          </div>
          <span className="small muted">
            {records.length} รายการ · บันทึกในเบราว์เซอร์
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Test ID / วันที่</th>
                <th>Glucose</th>
                <th>Estimated cTnI</th>
                <th>แหล่งข้อมูล</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className={selected.id === r.id ? "selected-row" : ""}
                >
                  <td>
                    <strong>{r.id}</strong>
                    <span className="table-sub">{formatDate(r.date)}</span>
                  </td>
                  <td>
                    <strong className="table-number">{r.glucose}</strong>{" "}
                    <span className="muted small">mg/dL</span>
                  </td>
                  <td>
                    <span>{formatCtni(ctniDisplay(r).valueNgL)} ng/L</span>
                    <span
                      className="table-sub"
                      style={{ whiteSpace: "normal", maxWidth: 270 }}
                    >
                      {ctniDisplay(r).message}
                    </span>
                  </td>
                  <td>
                    <span className="tag">
                      {r.demo ? "บันทึกแล้ว" : "กรอกด้วยตนเอง"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelected(r);
                        setDetail(r);
                      }}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {detail && (
        <Modal title="รายละเอียดการตรวจ" onClose={() => setDetail(null)}>
          <pre className="report">{reportText(detail)}</pre>
          <button
            className="primary"
            onClick={() =>
              downloadText(`${detail.id}-demo.txt`, reportText(detail))
            }
          >
            <Download size={17} />
            ดาวน์โหลดรายงาน
          </button>
        </Modal>
      )}
    </>
  );
}
