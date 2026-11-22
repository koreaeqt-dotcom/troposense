import { DEMO_WARNING, type ReadingOptions } from "../calibration/evaluate";
export function CalibrationControls({
  options,
  onChange,
  disabled = false,
}: {
  options: ReadingOptions;
  onChange: (options: ReadingOptions) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <label className="field">
        โหมดการสอบเทียบ
        <select
          disabled={disabled}
          value={options.mode}
          onChange={(e) =>
            onChange({
              ...options,
              mode: e.target.value as ReadingOptions["mode"],
              confirmed: false,
            })
          }
        >
          <option value="standard">Calibration ที่ผ่านการตรวจสอบ</option>
          <option value="demo">DEMO — ข้อมูลจำลอง</option>
        </select>
      </label>
      {options.mode === "demo" && (
        <p className="small amber-text" role="status">
          {DEMO_WARNING}
        </p>
      )}
      <label className="check-field">
        <input
          type="checkbox"
          disabled={disabled}
          checked={options.confirmed}
          onChange={(e) =>
            onChange({ ...options, confirmed: e.target.checked })
          }
        />
        ยืนยันว่าตัวเลขและหน่วย mg/dL ตรงกับค่าที่ต้องการบันทึก
      </label>
    </>
  );
}
