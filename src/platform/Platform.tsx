import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  HeartPulse,
  Siren,
  FolderHeart,
  Stethoscope,
  CalendarDays,
  Box,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Menu,
  X,
  LogOut,
  ScanLine,
  ClipboardList,
  ChevronDown,
  CheckCircle2,
  Users,
  UserRound,
  Info,
} from "lucide-react";
import { Modal, Notice } from "../components/UI";
import { Scan } from "../pages/Scan";
import { Results } from "../pages/Results";
import { createRecord, type TestRecord } from "../model";
import type { ReadingOptions } from "../calibration/evaluate";
import { AppContext, ClinicalDisclaimer, type Route } from "./Common";
import {
  type Role,
  type Database,
  type Change,
  STORAGE_KEY,
  seedDatabase,
  parseDatabase,
  scopedDatabase,
  mergeStoredChange,
  DEMO_PATIENT,
  roleNames,
} from "./domain";
import { Home, Wordmark } from "./Home";
import { Dashboard } from "./Dashboard";
import { Patients } from "./Patients";
import { Quality } from "./Quality";
import { ScreeningPage } from "./Screening";
import { EmergencyPage } from "./Emergency";
import { Doctors } from "./Doctors";
import { Followup } from "./Followup";
import { Products, Business } from "./Business";
import { Settings } from "./Settings";
const nav = [
  {
    id: "dashboard" as Route,
    icon: LayoutDashboard,
    label: "Dashboard",
    thai: "ภาพรวมการดูแล",
  },
  {
    id: "qc" as Route,
    icon: ShieldCheck,
    label: "Quality Control",
    thai: "ควบคุมคุณภาพ",
  },
  {
    id: "screening" as Route,
    icon: HeartPulse,
    label: "TropoBot",
    thai: "บันทึกอาการและคัดกรอง",
  },
  {
    id: "emergency" as Route,
    icon: Siren,
    label: "Emergency Center",
    thai: "ศูนย์ประสานงานฉุกเฉิน",
  },
  {
    id: "patients" as Route,
    icon: FolderHeart,
    label: "Patient Records",
    thai: "แฟ้มผู้ป่วย",
  },
  {
    id: "doctors" as Route,
    icon: Stethoscope,
    label: "Doctor Connect",
    thai: "เตรียมข้อมูลส่งปรึกษา",
  },
  {
    id: "followup" as Route,
    icon: CalendarDays,
    label: "Follow-up",
    thai: "ติดตามและนัดหมาย",
  },
];
const secondary = [
  { id: "products" as Route, icon: Box, label: "Products" },
  {
    id: "business" as Route,
    icon: ChartNoAxesCombined,
    label: "Business Model",
  },
  { id: "settings" as Route, icon: SettingsIcon, label: "Settings" },
];
const routeNames: Record<Route, string> = {
  home: "Home",
  dashboard: "Dashboard",
  qc: "Quality Control",
  screening: "AI Screening · TropoBot",
  emergency: "Emergency Center",
  patients: "Patient Records",
  doctors: "Doctor Connect",
  followup: "Follow-up",
  products: "Products",
  business: "Business Model",
  revenue: "Revenue Model",
  costs: "Cost Structure",
  calculator: "Break-even Calculator",
  settings: "Settings",
  scan: "Scan & Input",
  results: "Test Results",
};
const businessRoutes: Route[] = ["business", "revenue", "costs", "calculator"];
function routeFromHash(): Route {
  const hash = window.location.hash.slice(1);
  const aliases: Record<string, Route> = {
    overview: "home",
    health: "screening",
    "business/revenue": "revenue",
    "business/costs": "costs",
    "business/calculator": "calculator",
    features: "home",
  };
  return aliases[hash] ?? (hash in routeNames ? (hash as Route) : "home");
}
function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { db: seedDatabase(), warning: "" };
    const parsed = parseDatabase(saved);
    return parsed
      ? { db: parsed, warning: "" }
      : {
          db: seedDatabase(),
          warning:
            "ข้อมูลที่บันทึกมีรูปแบบไม่ถูกต้อง กำลังใช้ชุดตัวอย่างชั่วคราว ข้อมูลเดิมยังไม่ถูกเขียนทับจนกว่าจะมีการบันทึกใหม่",
        };
  } catch {
    return {
      db: seedDatabase(),
      warning: "เบราว์เซอร์ไม่อนุญาต LocalStorage ข้อมูลจะอยู่เฉพาะเซสชันนี้",
    };
  }
}
function rememberedRole(): Role | null {
  try {
    const r = sessionStorage.getItem("troposense-role");
    return ["admin", "professional", "patient"].includes(r ?? "")
      ? (r as Role)
      : null;
  } catch {
    return null;
  }
}
export default function Platform() {
  const [loaded] = useState(load);
  const [database, setDatabase] = useState<Database>(loaded.db);
  const [warning, setWarning] = useState(loaded.warning);
  const [role, setRole] = useState<Role | null>(rememberedRole);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [mobile, setMobile] = useState(false);
  const [login, setLogin] = useState(false);
  const [toast, setToast] = useState("");
  const [patientId, setPatientId] = useState(DEMO_PATIENT);
  const [requested, setRequested] = useState<Route>("dashboard");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const db = scopedDatabase(database, role ?? "patient");
  useEffect(() => {
    const update = () => {
      setRoute(routeFromHash());
      setMobile(false);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const latest = event.newValue ? parseDatabase(event.newValue) : null;
      if (latest) {
        setDatabase(latest);
        setWarning("");
      } else
        setWarning(
          "ข้อมูลในอีกแท็บถูกล้างหรือมีรูปแบบไม่ถูกต้อง กรุณาตรวจสอบก่อนบันทึก",
        );
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    try {
      if (role) sessionStorage.setItem("troposense-role", role);
      else sessionStorage.removeItem("troposense-role");
    } catch {
      /* session role is optional */
    }
  }, [role]);
  useEffect(() => {
    if (role === "patient") setPatientId(DEMO_PATIENT);
    else if (!database.patients.some((p) => p.id === patientId))
      setPatientId(database.patients[0]?.id ?? DEMO_PATIENT);
  }, [database.patients, role, patientId]);
  useEffect(() => {
    if (!role && !["home", "products", ...businessRoutes].includes(route)) {
      setRequested(route);
      setLogin(true);
    }
  }, [role, route]);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    document.title = `${routeNames[route]} · TropoSense`;
  }, [route]);
  function notify(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }
  function navigate(next: Route) {
    if (!role && !["home", "products", ...businessRoutes].includes(next)) {
      setRequested(next);
      setLogin(true);
      return;
    }
    setMobile(false);
    setRoute(next);
    const hash =
      next === "revenue"
        ? "business/revenue"
        : next === "costs"
          ? "business/costs"
          : next === "calculator"
            ? "business/calculator"
            : next;
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function persist(next: Database) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setWarning("");
    } catch {
      setWarning(
        "บันทึก LocalStorage ไม่สำเร็จ ข้อมูลล่าสุดยังอยู่ในเซสชันนี้ แต่จะหายเมื่อรีเฟรช กรุณาส่งออกรายงาน",
      );
    }
    setDatabase(next);
  }
  function change(c: Change) {
    if (!role) {
      notify("เลือกบัญชีก่อนบันทึก");
      return false;
    }
    try {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* retain in-memory fallback */
      }
      const next = mergeStoredChange(database, stored, role, c);
      persist(next);
      return true;
    } catch (e) {
      notify(e instanceof Error ? e.message : "ไม่สามารถบันทึกได้");
      return false;
    }
  }
  function reset() {
    if (role !== "admin") return;
    persist(seedDatabase());
    notify("คืนข้อมูลเริ่มต้นแล้ว");
  }
  function chooseRole(r: Role) {
    setRole(r);
    setPatientId(DEMO_PATIENT);
    setLogin(false);
    const next =
      r === "patient" && requested === "qc" ? "dashboard" : requested;
    setRoute(next);
    window.location.hash = next;
    window.scrollTo(0, 0);
    notify(`เข้าสู่พื้นที่ทำงาน: ${roleNames[r]}`);
  }
  const effectiveRole = role ?? "patient";
  const content = () => {
    if (!role && !["home", "products", ...businessRoutes].includes(route))
      return (
        <Home
          navigate={navigate}
          login={() => {
            setRequested("dashboard");
            setLogin(true);
          }}
        />
      );
    if (route === "home")
      return (
        <Home
          navigate={navigate}
          login={() => {
            setRequested("dashboard");
            setLogin(true);
          }}
        />
      );
    if (route === "dashboard") return <Dashboard />;
    if (route === "qc")
      return role === "patient" ? (
        <section className="panel">
          <h1>สิทธิ์สำหรับบุคลากรเท่านั้น</h1>
          <p>บัญชีผู้ป่วยไม่มีสิทธิ์เข้าถึงข้อมูล QC ของระบบ</p>
          <button className="primary" onClick={() => navigate("dashboard")}>
            กลับ Dashboard ของฉัน
          </button>
        </section>
      ) : (
        <Quality />
      );
    if (route === "patients") return <Patients />;
    if (route === "screening") return <ScreeningPage />;
    if (route === "emergency") return <EmergencyPage />;
    if (route === "doctors") return <Doctors />;
    if (route === "followup") return <Followup />;
    if (route === "products") return <Products />;
    if (businessRoutes.includes(route)) return <Business route={route} />;
    if (route === "settings") return <Settings />;
    if (route === "scan")
      return (
        <>
          <div className="scan-patient panel">
            <label className="field">
              ผู้ป่วยสำหรับการตรวจ
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {db.patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.id}
                  </option>
                ))}
              </select>
            </label>
            <span className="tag">TEST RECORD</span>
          </div>
          <Scan
            onConfirm={(
              value: string,
              source: TestRecord["source"],
              options: ReadingOptions,
            ) => {
              if (
                change({
                  kind: "saveTest",
                  value: {
                    ...createRecord(value, source, options),
                    demo: true,
                    patientId,
                    ctniDemo: null,
                  },
                })
              ) {
                notify("บันทึกค่า Glucose แล้ว");
                navigate("results");
              }
            }}
          />
        </>
      );
    if (route === "results")
      return db.tests.length ? (
        <>
          <div className="results-context">
            <span className="tag">
              {role === "patient" ? "PT-0001 เท่านั้น" : "ข้อมูลการตรวจทั้งหมด"}
            </span>
            <p>
              หน้านี้แสดงค่าที่อ่านและสถานะการสอบเทียบ ส่วนค่า cTnI
              สมมติที่บันทึกแยก ดูได้ที่ Patient Profile
            </p>
          </div>
          <Results records={db.tests} onScan={() => navigate("scan")} />
        </>
      ) : (
        <section className="panel">
          <h2>ยังไม่มีผลตรวจ</h2>
          <button className="primary" onClick={() => navigate("scan")}>
            นำเข้าค่าครั้งแรก
          </button>
        </section>
      );
    return null;
  };
  const publicHome =
    route === "home" ||
    (!role && !["products", ...businessRoutes].includes(route));
  const publicProduct = !role && !publicHome;
  return (
    <AppContext.Provider
      value={{
        db,
        role: effectiveRole,
        patientId,
        setPatientId,
        change,
        navigate,
        notify,
        reset,
      }}
    >
      <div
        className={`platform ${database.settings.compact ? "compact-tables" : ""}`}
      >
        {publicHome ? (
          content()
        ) : publicProduct ? (
          <div className="home-page">
            <nav className="home-nav" aria-label="เมนูเว็บไซต์">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("home");
                }}
              >
                <Wordmark />
              </a>
              <button className="secondary" onClick={() => navigate("home")}>
                กลับหน้าหลัก
              </button>
              <button
                className="primary"
                onClick={() => {
                  setRequested("dashboard");
                  setLogin(true);
                }}
              >
                เข้าสู่พื้นที่ทำงาน
              </button>
            </nav>
            <main className="public-content">
              {content()}
              <ClinicalDisclaimer />
            </main>
          </div>
        ) : (
          <div className="care-app">
            <aside
              className={`care-sidebar ${mobile ? "open" : ""}`}
              id="care-navigation"
            >
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("home");
                }}
              >
                <Wordmark />
              </a>
              <div className="care-brand-caption">
                SMART HEALTHCARE PLATFORM
              </div>
              <div className="care-nav-label">CARE WORKSPACE</div>
              <nav aria-label="เมนูพื้นที่ทำงาน">
                {nav
                  .filter((n) => role !== "patient" || n.id !== "qc")
                  .map((n) => (
                    <a
                      key={n.id}
                      href={`#${n.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(n.id);
                      }}
                      className={route === n.id ? "active" : ""}
                      aria-current={route === n.id ? "page" : undefined}
                    >
                      <n.icon size={19} />
                      <span>
                        {n.label}
                        <small>{n.thai}</small>
                      </span>
                      {route === n.id && <i />}
                    </a>
                  ))}
              </nav>
              <div className="care-nav-label">SYSTEM & RESOURCES</div>
              <nav aria-label="เครื่องมือและข้อมูล">
                <a
                  href="#scan"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("scan");
                  }}
                  className={
                    route === "scan" || route === "results" ? "active" : ""
                  }
                >
                  <ScanLine size={18} />
                  <span>Scan & Test Results</span>
                </a>
                {secondary.map((n) => (
                  <a
                    href={`#${n.id}`}
                    key={n.id}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(n.id);
                    }}
                    className={
                      route === n.id ||
                      (n.id === "business" && businessRoutes.includes(route))
                        ? "active"
                        : ""
                    }
                  >
                    <n.icon size={18} />
                    <span>{n.label}</span>
                  </a>
                ))}
              </nav>
              <div className="care-sidebar-bottom">
                <div>
                  <ShieldCheck size={19} />
                  <span>
                    TROPOSENSE CARE
                    <small>เครื่องมือจัดการข้อมูลการดูแล</small>
                  </span>
                </div>
                <button onClick={() => navigate("home")}>
                  <HomeIcon size={16} />
                  กลับเว็บไซต์หลัก
                </button>
              </div>
              <button
                className="close-mobile icon-button"
                aria-label="ปิดเมนู"
                onClick={() => setMobile(false)}
              >
                <X size={22} />
              </button>
            </aside>
            {mobile && (
              <button
                className="care-scrim"
                aria-label="ปิดเมนูด้านข้าง"
                onClick={() => setMobile(false)}
              />
            )}
            <div className="care-workspace">
              <header className="care-header">
                <div className="header-left">
                  <button
                    className="mobile-menu icon-button"
                    aria-label="เปิดเมนู"
                    aria-expanded={mobile}
                    aria-controls="care-navigation"
                    onClick={() => setMobile(!mobile)}
                  >
                    <Menu />
                  </button>
                  <span className="breadcrumb">
                    Workspace <span>/</span>
                    <strong>{routeNames[route]}</strong>
                  </span>
                </div>
                <div className="header-right">
                  <span className="local-status">
                    <span className="dot" />
                    Workspace
                  </span>
                  <button
                    className="profile-button"
                    onClick={() => {
                      setRequested("dashboard");
                      setLogin(true);
                    }}
                  >
                    <span className="avatar">
                      {role === "admin"
                        ? "AD"
                        : role === "professional"
                          ? "HP"
                          : "PT"}
                    </span>
                    <span>
                      {roleNames[effectiveRole]}
                      <small>จัดการบัญชีผู้ใช้</small>
                    </span>
                    <ChevronDown size={15} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="ออกจากระบบ"
                    onClick={() => {
                      setRole(null);
                      setRoute("home");
                      window.location.hash = "home";
                      notify("ออกจากพื้นที่ทำงานแล้ว");
                    }}
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              </header>
              {warning && (
                <div className="storage-warning" role="alert">
                  {warning}
                </div>
              )}
              <main className="care-main" key={`${route}-${role}`}>
                {content()}
                <ClinicalDisclaimer />
                <footer>
                  <span>© 2026 TropoSense · Smart Healthcare Platform</span>
                  <span>รุ่นนำเสนอ · ข้อมูลสำหรับการสาธิต · TH</span>
                </footer>
              </main>
            </div>
          </div>
        )}
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            {toast}
            <button aria-label="ปิดข้อความ" onClick={() => setToast("")}>
              <X size={15} />
            </button>
          </div>
        )}
        {login && (
          <Modal
            title="เข้าสู่พื้นที่ทำงาน"
            onClose={() => {
              setLogin(false);
              if (
                !role &&
                !["home", "products", ...businessRoutes].includes(route)
              ) {
                setRoute("home");
                window.location.hash = "home";
              }
            }}
          >
            <p>เลือกพื้นที่ทำงานตามบทบาทของคุณ</p>
            <div className="role-choices">
              {[
                {
                  id: "admin" as Role,
                  icon: ShieldCheck,
                  title: "Administrator",
                  text: "จัดการระบบ ผู้ใช้งาน และข้อมูลการดูแล",
                },
                {
                  id: "professional" as Role,
                  icon: Stethoscope,
                  title: "Healthcare Professional",
                  text: "จัดการผู้ป่วย QC คำตอบแพทย์ และติดตาม",
                },
                {
                  id: "patient" as Role,
                  icon: UserRound,
                  title: "Patient",
                  text: "ดูเฉพาะ PT-0001 บันทึกอาการและนัดหมายของตนเอง",
                },
              ].map((r) => (
                <button key={r.id} onClick={() => chooseRole(r.id)}>
                  <r.icon size={23} />
                  <span>
                    <strong>{r.title}</strong>
                    <small>{r.text}</small>
                  </span>
                </button>
              ))}
            </div>
            <Notice>
              <Users size={16} /> บัญชีสำหรับการนำเสนอ ไม่ใช่ระบบยืนยันตัวตนจริง
            </Notice>
          </Modal>
        )}
      </div>
    </AppContext.Provider>
  );
}
