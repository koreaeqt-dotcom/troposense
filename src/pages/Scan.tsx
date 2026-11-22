import { useState, useRef, useEffect } from "react";
import { Upload, ScanLine, Check, ImagePlus, LoaderCircle } from "lucide-react";
import { Device } from "../components/Device";
import { Notice, PageHeading } from "../components/UI";
import { validReading, type TestRecord } from "../model";
import { CalibrationControls } from "../components/CalibrationControls";
import type { ReadingOptions } from "../calibration/evaluate";
export function Scan({
  onConfirm,
}: {
  onConfirm: (
    value: string,
    source: TestRecord["source"],
    options: ReadingOptions,
  ) => void;
}) {
  const [image, setImage] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState<TestRecord["source"]>("manual");
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [error, setError] = useState("");
  const [options, setOptions] = useState<ReadingOptions>({
    mode: "standard",
    unit: "mg/dL",
    confirmed: false,
  });
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image);
    },
    [image],
  );
  function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("เลือกภาพ JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB");
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setImage(URL.createObjectURL(file));
    setStatus("idle");
    setError("");
    setValue("");
    setSource("manual");
    setOptions((o) => ({ ...o, confirmed: false }));
  }
  return (
    <>
      <PageHeading
        eyebrow="SCAN & INPUT"
        title="อ่านค่าและนำเข้าข้อมูล"
        description="นำเข้าค่า Glucose จากเครื่อง Accu-Chek Guide เพื่อบันทึกข้อมูลการตรวจ"
      />
      <div className="scan-layout">
        <section className="panel">
          <div className="panel-heading">
            <h2>ภาพจากเครื่องอ่าน</h2>
            <span className="tag">ACCU-CHEK GUIDE</span>
          </div>
          <div
            className={`upload-area ${image ? "has-image" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files[0]);
            }}
          >
            {image ? (
              <img src={image} alt="ภาพเครื่องอ่านที่อัปโหลด" />
            ) : (
              <>
                <Device />
                <div className="upload-hint">
                  <ImagePlus size={22} />
                  <span>อัปโหลดหรือลากภาพมาวางที่นี่</span>
                </div>
              </>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="upload-actions">
            <button
              className="secondary"
              onClick={() => input.current?.click()}
              disabled={status === "scanning"}
            >
              <Upload size={18} />
              {image ? "เปลี่ยนภาพ" : "Upload Image"}
            </button>
            <button
              className="primary"
              disabled={!image || status === "scanning"}
              onClick={() => {
                setStatus("scanning");
                setOptions((o) => ({ ...o, confirmed: false }));
                setError("");
                timer.current = setTimeout(() => {
                  setValue("124");
                  setOptions((o) => ({ ...o, confirmed: false }));
                  setSource("ocr-demo");
                  setStatus("done");
                }, 1600);
              }}
            >
              {status === "scanning" ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <ScanLine size={18} />
              )}{" "}
              {status === "scanning"
                ? "กำลังจำลองการสแกน…"
                : "Scan OCR (จำลอง)"}
            </button>
          </div>
          <p className="small muted">
            JPG, PNG, WebP · สูงสุด 10 MB · ภาพไม่ถูกส่งออกจากเบราว์เซอร์
          </p>
          <div aria-live="polite">
            {status === "done" && (
              <div className="success">
                <Check size={17} />
                การจำลองเสร็จสิ้น: ใช้ค่าตัวอย่าง 124 mg/dL ไม่ได้อ่านจากภาพ
              </div>
            )}
          </div>
        </section>
        <section className="panel input-panel">
          <div className="panel-heading">
            <h2>บันทึกค่าการตรวจ</h2>
            <span className="small muted">Manual Input</span>
          </div>
          <label htmlFor="glucose">Glucose Reading</label>
          <p className="small muted">กรอกค่าที่แสดงบนหน้าจอเครื่องอ่าน</p>
          <div className="reading-input">
            <input
              id="glucose"
              type="number"
              min="0.01"
              step="any"
              placeholder="—"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setSource("manual");
                setOptions((o) => ({ ...o, confirmed: false }));
                setError("");
              }}
            />
            <span>mg/dL</span>
          </div>
          <div className="source-line">
            แหล่งข้อมูล{" "}
            <strong>
              {source === "ocr-demo" ? "OCR จำลอง" : "กรอกด้วยตนเอง"}
            </strong>
          </div>
          <Notice>
            ค่าที่อ่านได้เป็น <strong>Glucose</strong> ไม่ใช่ cTnI โดยตรง
            การประมาณค่า cTnI ต้องใช้ Calibration Curve
            ที่ผ่านการพัฒนาและตรวจสอบ
          </Notice>
          <div className="input-bottom">
            <CalibrationControls
              options={options}
              onChange={setOptions}
              disabled={status === "scanning"}
            />
            <div role="alert" className="error">
              {error}
            </div>
            <button
              className="primary wide"
              disabled={status === "scanning"}
              onClick={() => {
                if (!validReading(value)) {
                  setError("กรุณากรอกค่าตัวเลขที่มากกว่า 0");
                  return;
                }
                try {
                  onConfirm(value, source, options);
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : "ไม่สามารถประมวลผลค่าได้",
                  );
                }
              }}
            >
              <Check size={18} />
              Confirm & Continue
            </button>
            <p className="small muted centered">
              ค่าที่บันทึกใช้สำหรับต้นแบบ ยังไม่ได้รับการตรวจสอบทางคลินิก
            </p>
          </div>
        </section>
      </div>
      <Notice>
        <strong>Mock OCR Interaction</strong> ฟีเจอร์นี้จำลองการทำงานเท่านั้น
        ทุกภาพจะได้ค่าตัวอย่างเดียวกัน
        กรุณากรอกค่าจริงด้วยตนเองหากต้องการบันทึกตามอุปกรณ์
      </Notice>
    </>
  );
}
