import {
  Users,
  ScanLine,
  CalendarDays,
  Bell,
  ShieldCheck,
  Activity,
  Plus,
} from "lucide-react";
import { PageHeading } from "../components/UI";
import { formatDate } from "../model";
import { CtniValue } from "../components/CtniValue";
import { appointmentState, qcStatus, roleNames } from "./domain";
import {
  usePlatform,
  patientName,
  StatusMark,
  DataChart,
  Empty,
} from "./Common";
export function Dashboard() {
  const { db, role, navigate } = usePlatform();
  const tests = [...db.tests].sort((a, b) => b.date.localeCompare(a.date));
  const trend = [...tests].reverse().slice(-10);
  const upcoming = db.appointments.filter((a) => a.status === "Scheduled");
  const alerts = db.emergencies.filter((x) => !x.resolved);
  const stats =
    role === "patient"
      ? [
          {
            label: "การตรวจของฉัน",
            n: tests.length,
            icon: ScanLine,
            sub: "บันทึกการตรวจทั้งหมด",
          },
          {
            label: "นัดหมายที่ยังเปิด",
            n: upcoming.length,
            icon: CalendarDays,
            sub: "รวมรายการที่ผ่านกำหนด",
          },
          {
            label: "ประวัติอาการ",
            n: db.screenings.length,
            icon: Activity,
            sub: "บันทึกอาการล่าสุด",
          },
          {
            label: "คำขอปรึกษา",
            n: db.referrals.length,
            icon: Users,
            sub: "คำขอปรึกษาในระบบ",
          },
        ]
      : [
          {
            label: "ผู้ป่วยในระบบ",
            n: db.patients.length,
            icon: Users,
            sub: "แฟ้มผู้ป่วย",
          },
          {
            label: "การตรวจทั้งหมด",
            n: tests.length,
            icon: ScanLine,
            sub: "บันทึกข้อมูลการตรวจ",
          },
          {
            label: "เคสที่ต้องติดตาม",
            n: db.patients.filter((p) => p.status === "ติดตาม").length,
            icon: CalendarDays,
            sub: `${upcoming.length} นัดหมายที่ยังเปิด`,
          },
          {
            label: "เหตุการณ์ที่ยังเปิด",
            n: alerts.length,
            icon: Bell,
            sub: "เหตุการณ์ที่รอดำเนินการ",
          },
        ];
  const activity = [
    ...db.tests.map((x) => ({
      id: x.id,
      patientId: x.patientId,
      date: x.date,
      label: "บันทึกข้อมูลการตรวจ",
      icon: ScanLine,
    })),
    ...db.screenings.map((x) => ({
      id: x.id,
      patientId: x.patientId,
      date: x.date,
      label: "บันทึกอาการ",
      icon: Activity,
    })),
    ...db.referrals.map((x) => ({
      id: x.id,
      patientId: x.patientId,
      date: x.date,
      label: "สร้างคำขอปรึกษา",
      icon: Users,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  return (
    <>
      <PageHeading
        eyebrow={`CARE WORKSPACE / ${roleNames[role].toUpperCase()}`}
        title={
          role === "patient" ? "ภาพรวมสุขภาพของฉัน" : "ภาพรวมการดูแลผู้ป่วย"
        }
        description={
          role === "patient"
            ? "ติดตามผลการตรวจ นัดหมาย และข้อมูลการดูแลของคุณ"
            : "เชื่อมโยงการตรวจ ข้อมูลผู้ป่วย และการติดตามในพื้นที่ทำงานเดียว"
        }
        action={
          <button className="primary" onClick={() => navigate("scan")}>
            <Plus size={18} />
            บันทึกการตรวจใหม่
          </button>
        }
      />
      <div className="dashboard-greeting">
        <div>
          <span className="dot" />
          <strong>{db.settings.organization}</strong>
          <span className="small muted">
            บันทึกข้อมูลในเบราว์เซอร์เครื่องนี้
          </span>
        </div>
        <span className="tag">CARE OVERVIEW</span>
      </div>
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <s.icon size={21} />
            </div>
            <strong>{s.n.toLocaleString("th-TH")}</strong>
            <small>{s.sub}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-main-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">TEST READING TREND</span>
              <h2>แนวโน้มข้อมูลการตรวจ</h2>
            </div>
            <span className="tag">GLUCOSE</span>
          </div>
          <DataChart
            values={trend.map((t) => t.glucose)}
            labels={trend.map((t) => t.date.slice(5, 10))}
            title={
              role === "patient"
                ? "ค่าการตรวจย้อนหลังของฉัน"
                : "ข้อมูลการตรวจตามลำดับเวลา"
            }
          />
          <p className="chart-caption">
            แสดงข้อมูลการตรวจที่บันทึกตามลำดับเวลา · cTnI ยังไม่มีข้อมูลสอบเทียบ
          </p>
        </section>
        <section className="panel qc-overview">
          <div className="panel-heading">
            <h2>
              {role === "patient" ? "นัดหมายที่ต้องติดตาม" : "Quality Control"}
            </h2>
            <ShieldCheck size={21} />
          </div>
          {role === "patient" ? (
            <>
              {upcoming.slice(0, 3).map((a) => (
                <div key={a.id} className="qc-status-row">
                  <div>
                    <strong>{a.date.replace("T", " ")}</strong>
                    <small>{a.reason}</small>
                  </div>
                  <StatusMark label={appointmentState(a.date, a.status)} />
                </div>
              ))}
              {!upcoming.length && <Empty text="ยังไม่มีนัดหมาย" />}
              <button
                className="secondary wide"
                onClick={() => navigate("followup")}
              >
                ดูตารางติดตาม
              </button>
            </>
          ) : (
            <>
              {["Pass", "Pending", "Fail"].map((s) => (
                <div key={s} className="qc-status-row">
                  <StatusMark label={s} />
                  <strong>
                    {
                      db.qc.filter(
                        (q) => qcStatus(q.checks, q.expiry, q.failed) === s,
                      ).length
                    }
                    <small>รายการ</small>
                  </strong>
                </div>
              ))}
              <p className="small muted">สถานะจากรายการตรวจสอบอุปกรณ์</p>
              <button className="secondary wide" onClick={() => navigate("qc")}>
                จัดการ Quality Control
              </button>
            </>
          )}
        </section>
      </div>
      <section className="panel space-top">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">RECENT TESTS</span>
            <h2>รายการตรวจล่าสุด</h2>
          </div>
          <button className="text-button" onClick={() => navigate("results")}>
            ดูผลและประวัติทั้งหมด
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ผู้ป่วย / Test ID</th>
                <th>วันเวลาตรวจ</th>
                <th>Glucose Reading</th>
                <th>cTnI ที่บันทึก</th>
                <th>สถานะข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice(0, 4).map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{patientName(db, t.patientId)}</strong>
                    <span className="table-sub">{t.id}</span>
                  </td>
                  <td>{formatDate(t.date)}</td>
                  <td>
                    <span className="table-number">{t.glucose}</span> mg/dL
                  </td>
                  <td>
                    <CtniValue record={t} />
                  </td>
                  <td>
                    <span className="tag">บันทึกแล้ว</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!tests.length && <Empty />}
      </section>
      <div className="dashboard-bottom-grid space-top">
        <section className="panel">
          <div className="panel-heading">
            <h2>Patient Activity</h2>
            <Activity size={20} />
          </div>
          {activity.map((a) => (
            <div className="activity-item" key={a.id}>
              <span>
                <a.icon size={17} />
              </span>
              <div>
                <strong>{a.label}</strong>
                <p>{patientName(db, a.patientId)}</p>
                <small>{formatDate(a.date)}</small>
              </div>
            </div>
          ))}
          {!activity.length && <Empty />}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent Emergency Alerts</h2>
            <button
              className="text-button"
              onClick={() => navigate("emergency")}
            >
              ดูทั้งหมด
            </button>
          </div>
          {db.emergencies.slice(0, 3).map((e) => (
            <div className="alert-item" key={e.id}>
              <div>
                <strong>{patientName(db, e.patientId)}</strong>
                <span>{formatDate(e.date)}</span>
              </div>
              <StatusMark label={e.severity} />
              <p>
                {e.resolved ? "ปิดเหตุการณ์แล้ว" : "รอดำเนินการ"} ·
                การแจ้งภายนอกยังไม่เชื่อมต่อ
              </p>
            </div>
          ))}
          {!db.emergencies.length && <Empty text="ยังไม่มีเหตุการณ์" />}
        </section>
      </div>
    </>
  );
}
