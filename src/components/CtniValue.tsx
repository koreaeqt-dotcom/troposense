import { ctniDisplay, formatCtni, type TestRecord } from "../model";
export function CtniValue({
  record,
  legacyDemoValue = record.ctniDemo ?? null,
}: {
  record: TestRecord;
  legacyDemoValue?: number | null;
}) {
  const d = ctniDisplay(record, legacyDemoValue);
  return (
    <>
      <span>{formatCtni(d.valueNgL)} ng/L</span>
      <span
        className="table-sub"
        style={{ whiteSpace: "normal", maxWidth: 275 }}
      >
        {d.message}
      </span>
      <span
        className="table-sub"
        style={{ whiteSpace: "normal", maxWidth: 275 }}
      >
        {d.referenceStatus}
      </span>
    </>
  );
}
