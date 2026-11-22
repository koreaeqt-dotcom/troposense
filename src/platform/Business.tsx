import { useState } from "react";
import {
  Box,
  Monitor,
  Building2,
  Users,
  Network,
  Calculator,
  Download,
} from "lucide-react";
import { PageHeading, Notice } from "../components/UI";
import { breakEven, exportRows } from "./domain";
import { usePlatform, type Route } from "./Common";
import { Hardware } from "./Home";
export function Products() {
  const { navigate } = usePlatform();
  return (
    <>
      <PageHeading
        eyebrow="PRODUCTS / THE CONNECTED SYSTEM"
        title="ฮาร์ดแวร์และซอฟต์แวร์ที่พัฒนาไปด้วยกัน"
        description="แนวคิดผลิตภัณฑ์ TropoSense · ยังอยู่ระหว่างทดสอบความเข้ากันได้และประสิทธิภาพ"
      />
      <div className="product-grid">
        <section className="product-card">
          <div className="product-art">
            <Hardware small />
          </div>
          <div className="product-copy">
            <span className="eyebrow">REUSABLE READER</span>
            <h2>TropoSense Reader</h2>
            <p>
              เครื่องอ่านผลตามแนวคิดที่สามารถนำกลับมาใช้ซ้ำ
              เชื่อมขั้นตอนอ่านค่าเข้ากับการบันทึกข้อมูลบนเว็บแอป
            </p>
            <div className="price">
              4,500 <span>บาท / เครื่อง</span>
            </div>
            <span className="tag">ราคาเป้าหมาย · ยังไม่ใช่ราคาจำหน่าย</span>
            <button className="secondary" onClick={() => navigate("business")}>
              ดูโมเดลธุรกิจ
            </button>
          </div>
        </section>
        <section className="product-card">
          <div className="cartridge-art">
            <div className="cartridge-package">
              <Box size={43} />
              <strong>TropoSense</strong>
              <span>HYBRID CARTRIDGE</span>
              <small>RESEARCH PROTOTYPE · SINGLE USE</small>
            </div>
          </div>
          <div className="product-copy">
            <span className="eyebrow">SINGLE-USE TEST CARTRIDGE</span>
            <h2>TropoSense Hybrid Cartridge</h2>
            <p>
              ชุดตรวจแบบใช้ครั้งเดียว ตามแนวคิด Magnetic Beads, Capture /
              Detection Antibody, Invertase และ Sucrose
            </p>
            <div className="price">
              350 <span>บาท / การตรวจ</span>
            </div>
            <span className="tag">ราคาเป้าหมาย · ต้นทุนยังไม่ยืนยัน</span>
            <button
              className="secondary"
              onClick={() => navigate("calculator")}
            >
              จำลองจุดคุ้มทุน
            </button>
          </div>
        </section>
      </div>
      <Notice>
        ภาพอุปกรณ์เป็นภาพวาดจากแนวคิด ไม่ใช่ภาพผลิตภัณฑ์ที่ผ่านการยืนยัน
        Accu-Chek Guide ยังไม่ได้รับการยืนยันความเข้ากันได้กับปฏิกิริยาของ
        TropoSense
      </Notice>
      <section className="science-strip">
        <Monitor size={26} />
        <div>
          <h3>TropoSense Web Application</h3>
          <p>
            เว็บไซต์เป็นส่วนเสริมของระบบชุดตรวจ
            สำหรับจัดการข้อมูลและสาธิตขั้นตอนการดูแล
          </p>
        </div>
        <button className="primary" onClick={() => navigate("dashboard")}>
          เปิดพื้นที่ทำงาน
        </button>
      </section>
    </>
  );
}
const tabs = [
  { id: "business" as Route, label: "Business Overview" },
  { id: "revenue" as Route, label: "Revenue Model" },
  { id: "costs" as Route, label: "Cost Structure" },
  { id: "calculator" as Route, label: "Break-even Calculator" },
];
export function Business({ route }: { route: Route }) {
  const { navigate } = usePlatform();
  const [investment, setInvestment] = useState("150000");
  const [price, setPrice] = useState("350");
  const [cost, setCost] = useState("");
  const [readers, setReaders] = useState("0");
  const [readerCost, setReaderCost] = useState("");
  const validRequired = [investment, price, readers].every(
    (s) => s.trim() !== "",
  );
  const result = validRequired
    ? breakEven(
        Number(investment),
        Number(price),
        cost.trim() === "" ? null : Number(cost),
        Number(readers),
        readerCost.trim() === "" ? null : Number(readerCost),
      )
    : null;
  const units = result
    ? Array.from({ length: 7 }, (_, i) =>
        Math.round((Math.max(result.tests * 1.4, 10) * i) / 6),
      )
    : [];
  const initial = Number(investment);
  const margin = result?.readerMargin ?? 0;
  const max = result
    ? Math.max(
        initial + Number(cost) * units[6],
        margin + Number(price) * units[6],
        1,
      )
    : 1;
  const px = (i: number) => 55 + i * 85;
  const py = (v: number) => 210 - (Math.max(0, v) / max) * 175;
  return (
    <>
      <PageHeading
        eyebrow="BUSINESS MODEL / CONCEPT ASSUMPTIONS"
        title="โมเดลธุรกิจที่ตรวจสอบสมมติฐานได้"
        description="ราคาและเงินลงทุนเป็นเป้าหมายหรือสมมติฐานสำหรับโครงงาน ไม่ใช่ผลประกอบการจริง"
      />
      <div className="tab-bar" role="navigation" aria-label="หน้าธุรกิจ">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={route === t.id ? "selected" : ""}
            onClick={() => navigate(t.id)}
            aria-current={route === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      {route === "business" ? (
        <>
          <div className="business-intro">
            <div>
              <span className="eyebrow">
                READER + CONSUMABLES + CONNECTED CARE
              </span>
              <h2>
                เครื่องอ่านใช้ซ้ำ
                <br />
                พร้อมชุดตรวจสำหรับแต่ละครั้ง
              </h2>
              <p>
                วางแนวคิดรายได้จากเครื่องอ่านและ Hybrid Cartridge
                โดยเว็บไซต์ช่วยจัดการข้อมูลประกอบการใช้งาน
                ไม่ใช่ผลิตภัณฑ์หลักที่แยกจากชุดตรวจ
              </p>
              <button
                className="primary"
                onClick={() => navigate("calculator")}
              >
                <Calculator size={18} />
                ทดลองคำนวณจุดคุ้มทุน
              </button>
            </div>
            <div className="business-price">
              <span>ราคาเป้าหมาย</span>
              <strong>
                ฿4,500 <small>/ Reader</small>
              </strong>
              <strong>
                ฿350 <small>/ Test</small>
              </strong>
            </div>
          </div>
          <div className="channel-grid">
            {[
              {
                icon: Building2,
                title: "B2B",
                text: "โรงพยาบาล คลินิก และหน่วยบริการสุขภาพ",
                sub: "แนวคิดการจำหน่ายเครื่องและชุดตรวจให้องค์กร",
              },
              {
                icon: Users,
                title: "B2C",
                text: "ผู้บริโภคโดยตรง ภายใต้ข้อกำหนดที่เกี่ยวข้อง",
                sub: "ต้องประเมินข้อกำหนดและความเหมาะสมก่อนใช้งานจริง",
              },
              {
                icon: Network,
                title: "B2B2C",
                text: "ความร่วมมือกับโรงพยาบาลและหน่วยงานสุขภาพ",
                sub: "แนวคิดบริการประชาชนผ่านพันธมิตรทางสุขภาพ",
              },
            ].map((c) => (
              <section className="panel" key={c.title}>
                <c.icon size={25} />
                <h2>{c.title}</h2>
                <p>{c.text}</p>
                <span className="small muted">{c.sub}</span>
              </section>
            ))}
          </div>
        </>
      ) : route === "revenue" ? (
        <section className="panel">
          <h2>Revenue Model · สมมติฐานรายได้</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>แหล่งรายได้</th>
                  <th>ราคาเป้าหมาย</th>
                  <th>สมมติฐาน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TropoSense Reader</td>
                  <td>4,500 บาท / เครื่อง</td>
                  <td>ขายเครื่องแบบใช้ซ้ำ · จำนวนเครื่อง × ราคาเป้าหมาย</td>
                </tr>
                <tr>
                  <td>Hybrid Cartridge</td>
                  <td>350 บาท / การตรวจ</td>
                  <td>รายได้ตามจำนวนครั้งการใช้ชุดตรวจแบบใช้ครั้งเดียว</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ไม่มีการกำหนดรายได้ค่าสมาชิกหรือค่าบริการแพทย์เพิ่มเติมในต้นแบบนี้
          </p>
          <Notice>
            รายได้ไม่เท่ากับกำไร ต้องหักต้นทุนเครื่อง ต้นทุนผันแปร
            และค่าใช้จ่ายที่เกี่ยวข้องก่อน
          </Notice>
        </section>
      ) : route === "costs" ? (
        <section className="panel">
          <h2>Cost Structure · รายการต้นทุนที่ต้องตรวจสอบ</h2>
          <div className="cost-list">
            {[
              [
                "ต้นทุนคงที่",
                "การวิจัยและพัฒนา เครื่องมือทดสอบ ซอฟต์แวร์ และการออกแบบระบบ",
              ],
              [
                "ต้นทุนผันแปรต่อการตรวจ",
                "วัสดุตลับ Magnetic Beads, Antibody, Invertase, Sucrose, strip, บรรจุภัณฑ์ และการควบคุมคุณภาพ",
              ],
              ["ต้นทุนเครื่องอ่าน", "ชิ้นส่วน การประกอบ และการทดสอบเครื่อง"],
              [
                "ค่าใช้จ่ายก่อนใช้งานจริง",
                "การทดสอบความเข้ากันได้ ประสิทธิภาพ ข้อกำหนด และการดำเนินงาน",
              ],
            ].map(([title, text]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="tag">ยังไม่ยืนยันต้นทุน</span>
              </div>
            ))}
          </div>
          <button className="secondary" onClick={() => navigate("calculator")}>
            ใส่สมมติฐานต้นทุนในเครื่องคำนวณ
          </button>
        </section>
      ) : (
        <div className="calculator-layout">
          <section className="panel stack-form">
            <div className="panel-heading">
              <h2>Break-even Calculator</h2>
              <Calculator size={21} />
            </div>
            <label className="field">
              เงินลงทุนเริ่มต้น (บาท)
              <input
                type="number"
                min="0"
                step="any"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
              />
              <small>150,000 บาท เป็นสมมติฐานเริ่มต้น</small>
            </label>
            <label className="field">
              ราคาขายต่อการตรวจ (บาท)
              <input
                type="number"
                min="0.01"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <small>350 บาท เป็นราคาเป้าหมาย</small>
            </label>
            <label className="field">
              ต้นทุนผันแปรต่อการตรวจ (บาท)
              <input
                type="number"
                min="0"
                step="any"
                placeholder="กรอกสมมติฐานต้นทุนที่ต้องการทดสอบ"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              <small>ยังไม่ยืนยันต้นทุน จึงไม่มีค่าเริ่มต้น</small>
            </label>
            <label className="field">
              จำนวนเครื่องอ่านที่ขาย
              <input
                type="number"
                min="0"
                step="1"
                value={readers}
                onChange={(e) => setReaders(e.target.value)}
              />
            </label>
            {Number(readers) > 0 && (
              <label className="field">
                ต้นทุนต่อเครื่องอ่าน (บาท)
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="ต้องระบุก่อนรวมกำไรจากเครื่อง"
                  value={readerCost}
                  onChange={(e) => setReaderCost(e.target.value)}
                />
                <small>ราคาเป้าหมายขายเครื่อง 4,500 บาท ยังไม่ใช่กำไร</small>
              </label>
            )}
            <button
              className="text-button"
              onClick={() => {
                setInvestment("150000");
                setPrice("350");
                setCost("");
                setReaders("0");
                setReaderCost("");
              }}
            >
              คืนค่าสมมติฐานเริ่มต้น
            </button>
          </section>
          <section className="panel calculator-result" aria-live="polite">
            <span className="eyebrow">
              ESTIMATED BREAK-EVEN / SCENARIO ONLY
            </span>
            <h2>จำนวนการตรวจเพื่อถึงจุดคุ้มทุน</h2>
            {result ? (
              <>
                <div className="break-even-number">
                  {result.tests.toLocaleString("th-TH")}
                  <span>ครั้ง</span>
                </div>
                <div className="calculation-details">
                  <span>
                    ส่วนเกินต่อการตรวจ{" "}
                    <strong>฿{result.margin.toLocaleString()}</strong>
                  </span>
                  <span>
                    ส่วนเกินจากเครื่องอ่าน{" "}
                    <strong>฿{result.readerMargin.toLocaleString()}</strong>
                  </span>
                </div>
                <figure className="break-even-chart">
                  <figcaption>
                    <span>
                      <i />
                      รายรับการตรวจ + ส่วนเกินจากเครื่อง
                    </span>
                    <span>
                      <i />
                      เงินลงทุน + ต้นทุนการตรวจ
                    </span>
                  </figcaption>
                  <svg
                    viewBox="0 0 620 260"
                    role="img"
                    aria-label={`กราฟสมมติจุดคุ้มทุน ${result.tests} ครั้ง`}
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <g key={n}>
                        <line
                          x1="55"
                          x2="580"
                          y1={210 - n * 55}
                          y2={210 - n * 55}
                          stroke="#e5edef"
                        />
                        <text
                          x="48"
                          y={214 - n * 55}
                          textAnchor="end"
                          fill="#82979e"
                          fontSize="9"
                        >
                          {Math.round((((n * 55) / 175) * max) / 1000)}k
                        </text>
                      </g>
                    ))}
                    <polyline
                      points={units
                        .map(
                          (u, i) =>
                            `${px(i)},${py(initial + Number(cost) * u)}`,
                        )
                        .join(" ")}
                      stroke="#c99d5b"
                      strokeWidth="2"
                      fill="none"
                    />
                    <polyline
                      points={units
                        .map(
                          (u, i) =>
                            `${px(i)},${py(margin + Number(price) * u)}`,
                        )
                        .join(" ")}
                      stroke="#16a89d"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    {units.map((u, i) => (
                      <text
                        key={i}
                        x={px(i)}
                        y="238"
                        textAnchor="middle"
                        fill="#7b9199"
                        fontSize="10"
                      >
                        {u}
                      </text>
                    ))}
                  </svg>
                  <p className="small muted">
                    แกนนอน: จำนวนการตรวจ · แกนตั้ง: บาท (k = พันบาท)
                  </p>
                </figure>
                <button
                  className="secondary"
                  onClick={() =>
                    exportRows("break-even-scenario.csv", [
                      ["สมมติฐาน / ไม่ใช่ข้อมูลทางการเงินจริง", "ค่า"],
                      ["เงินลงทุน", initial],
                      ["ราคาต่อการตรวจ", Number(price)],
                      ["ต้นทุนต่อการตรวจ", Number(cost)],
                      ["เครื่องที่ขาย", Number(readers)],
                      ["ต้นทุนเครื่อง", readerCost || "ไม่ใช้"],
                      ["จุดคุ้มทุน (ครั้ง)", result.tests],
                    ])
                  }
                >
                  <Download size={17} />
                  ดาวน์โหลดผลจำลอง CSV
                </button>
              </>
            ) : (
              <div className="calculator-empty">
                <Calculator size={43} />
                <h3>ระบุต้นทุนเพื่อเริ่มคำนวณ</h3>
                <p>
                  กรอกค่าที่ไม่ติดลบ ราคาขายต้องมากกว่าต้นทุนต่อครั้ง
                  และหากขายเครื่อง ต้องระบุต้นทุนเครื่องด้วย
                </p>
                {cost !== "" && Number(price) <= Number(cost) && (
                  <span className="error">
                    ส่วนเกินต่อครั้งเป็นศูนย์หรือติดลบ
                    จึงไม่มีจุดคุ้มทุนจากยอดตรวจ
                  </span>
                )}
              </div>
            )}
            <Notice>
              สูตร: ปัดขึ้นของ [เงินลงทุน − จำนวนเครื่อง × (4,500 −
              ต้นทุนเครื่อง)] ÷ (ราคาต่อครั้ง − ต้นทุนต่อครั้ง)
              โดยจำนวนครั้งไม่ต่ำกว่า 0 ไม่รวมภาษี ดอกเบี้ย
              และค่าใช้จ่ายอื่นที่ไม่ได้ระบุ
            </Notice>
          </section>
        </div>
      )}
    </>
  );
}
