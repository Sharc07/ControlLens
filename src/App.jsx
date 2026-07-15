import React, { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard,
  Database,
  Shield,
  ClipboardCheck,
  AlertTriangle,
  FileBarChart2,
  Search,
  Bell,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  Download,
  FileText,
  X,
  Users,
  Lock,
  Copy,
  FileWarning,
  ChevronRight,
  Sparkles,
  Loader2,
  Building2,
  Calendar,
  ShieldCheck,
  Bot,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Wrench,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { api } from "./lib/api";

/* ------------------------------------------------------------------ */
/* MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const CSV_HEADERS = [
  "Name",
  "Role",
  "Department",
  "System",
  "Status",
  "MFA",
  "Access Level",
  "Last Login",
];

const MOCK_ACCESS_ROWS = [
  ["John Mercer", "Administrator", "Information Technology", "Core Banking System", "Terminated", "No", "Admin", "2026-04-02"],
  ["Sarah Chen", "Analyst", "Finance", "Oracle Financials", "Active", "Yes", "Standard", "2026-07-10"],
  ["David Okafor", "Engineer", "Information Technology", "AWS Production", "Active", "No", "Privileged", "2026-07-11"],
  ["Priya Nair", "Manager", "Finance", "Oracle Financials", "Active", "Yes", "Elevated", "2026-07-09"],
  ["Robert Klein", "Analyst", "Operations", "Workday HR", "terminated", "Yes", "Standard", "2026-03-18"],
  ["Elena Petrova", "Analyst", "Risk", "SAP ERP", "Active", "Yes", "Standard", "2026-07-08"],
  ["E. Petrova", "Analyst", "Risk", "SAP ERP", "Active", "Yes", "Standard", "2026-07-08"],
  ["Marcus Webb", "Engineer", "Information Technology", "AWS Production", "Active", "no", "Privileged", "2026-07-12"],
  ["Aisha Rahman", "Associate", "Compliance", "Salesforce CRM", "Active", "Yes", "Standard", "2026-07-05"],
  ["Thomas Nguyen", "Administrator", "Information Technology", "Active Directory", "Terminated", "No", "Admin", "2026-02-27"],
  ["Laura Dimitrov", "Analyst", "Finance", "Oracle Financials", "Active", "", "Standard", "2026-07-01"],
  ["Carlos Mendes", "Associate", "Operations", "Workday HR", "Active", "Yes", "Standard", "2026-06-30"],
  ["Grace Liu", "Engineer", "Information Technology", "Murex Trading Platform", "Active", "Yes", "Privileged", "2026-07-13"],
  ["Nadia Farouk", "Analyst", "", "Salesforce CRM", "Active", "Yes", "Standard", "2026-06-22"],
  ["Michael Osei", "Administrator", "Information Technology", "Core Banking System", "Active", "Yes", "Admin", "2026-07-12"],
  ["Carlos Mendes", "Associate", "Operations", "Workday HR", "Active", "Yes", "Standard", "2026-06-30"],
];

const rowsToObjects = (headers, rows) =>
  rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));

const MOCK_ACCESS_DATA = rowsToObjects(CSV_HEADERS, MOCK_ACCESS_ROWS);

const RISK_CONTROL_MATRIX = [
  {
    risk: "Unauthorized access by terminated employees",
    control: "Terminated employee access must be disabled within 24 hours of separation date.",
    procedure: "Compare HR termination file against active directory and application account status.",
    frequency: "Monthly",
    owner: "IT Security",
  },
  {
    risk: "Weak authentication on privileged accounts",
    control: "All privileged and administrative accounts must have multi-factor authentication enabled.",
    procedure: "Review MFA enrollment status for every account holding elevated or admin access.",
    frequency: "Quarterly",
    owner: "IAM Team",
  },
  {
    risk: "Excessive access / privilege creep",
    control: "User access must align with job role in accordance with least-privilege principles.",
    procedure: "Compare assigned access level against the role-based access matrix by department.",
    frequency: "Quarterly",
    owner: "Application Owners",
  },
  {
    risk: "Identity data integrity failures",
    control: "User identity records must be unique, complete, and consistently formatted.",
    procedure: "Profile source data for duplicate records, missing fields, and formatting inconsistencies.",
    frequency: "Monthly",
    owner: "Data Governance",
  },
  {
    risk: "Segregation of duties conflicts",
    control: "Incompatible access combinations must be restricted across financial systems.",
    procedure: "Test user access combinations against the approved SoD conflict matrix.",
    frequency: "Quarterly",
    owner: "Internal Audit",
  },
  {
    risk: "Unauthorized access provisioning",
    control: "New access requests must be approved by a system owner prior to provisioning.",
    procedure: "Sample new account creations and trace each to an approved access request.",
    frequency: "Monthly",
    owner: "IT Security",
  },
];

const CONTROL_TESTS = [
  {
    id: "terminated-access",
    name: "Terminated User Access",
    objective: "Verify terminated employees do not retain active access to in-scope systems.",
    recordsTested: 1248,
    exceptions: 3,
    lastTest: "Jul 12, 2026",
    status: "Ineffective",
    columns: ["Name", "System", "Termination Date", "Days Since Termination", "Access Status"],
    results: [
      ["John Mercer", "Core Banking System", "Apr 2, 2026", "101", "Active"],
      ["Thomas Nguyen", "Active Directory", "Feb 27, 2026", "135", "Active"],
      ["Robert Klein", "Workday HR", "Mar 18, 2026", "118", "Active"],
    ],
  },
  {
    id: "privileged-mfa",
    name: "Privileged Account MFA",
    objective: "Verify multi-factor authentication is enabled for all privileged and admin accounts.",
    recordsTested: 187,
    exceptions: 6,
    lastTest: "Jul 11, 2026",
    status: "Ineffective",
    columns: ["Name", "System", "Access Level", "MFA Status", "Last Login"],
    results: [
      ["David Okafor", "AWS Production", "Privileged", "Disabled", "Jul 11, 2026"],
      ["Marcus Webb", "AWS Production", "Privileged", "Disabled", "Jul 12, 2026"],
      ["John Mercer", "Core Banking System", "Admin", "Disabled", "Apr 2, 2026"],
      ["Thomas Nguyen", "Active Directory", "Admin", "Disabled", "Feb 27, 2026"],
      ["Kevin Park", "SAP ERP", "Admin", "Disabled", "Jul 9, 2026"],
      ["Natalie Brooks", "Murex Trading Platform", "Privileged", "Disabled", "Jul 8, 2026"],
    ],
  },
  {
    id: "excessive-privileges",
    name: "Excessive Privileges",
    objective: "Verify assigned access level is consistent with the role-based access matrix.",
    recordsTested: 1248,
    exceptions: 11,
    lastTest: "Jul 10, 2026",
    status: "Needs Review",
    columns: ["Name", "Role", "Assigned Level", "Expected Level", "System"],
    results: [
      ["Grace Liu", "Engineer", "Privileged", "Standard", "Murex Trading Platform"],
      ["Priya Nair", "Manager", "Elevated", "Standard", "Oracle Financials"],
      ["Aisha Rahman", "Associate", "Standard", "Standard", "Salesforce CRM"],
      ["Sofia Reyes", "Analyst", "Privileged", "Standard", "SAP ERP"],
      ["Daniel Osei", "Associate", "Elevated", "Standard", "Workday HR"],
    ],
    note: "5 of 11 exceptions shown. Remaining records pending role owner confirmation.",
  },
  {
    id: "duplicate-records",
    name: "Duplicate Access Records",
    objective: "Identify duplicate or inconsistent identity records across in-scope systems.",
    recordsTested: 1248,
    exceptions: 4,
    lastTest: "Jul 9, 2026",
    status: "Needs Review",
    columns: ["Name", "System", "Issue Type", "Matched Record"],
    results: [
      ["Elena Petrova", "SAP ERP", "Inconsistent identity", "E. Petrova"],
      ["Carlos Mendes", "Workday HR", "Exact duplicate", "Carlos Mendes (row 16)"],
      ["N. Farouk", "Salesforce CRM", "Inconsistent identity", "Nadia Farouk"],
      ["M. Osei", "Core Banking System", "Inconsistent identity", "Michael Osei"],
    ],
  },
  {
    id: "missing-data",
    name: "Missing User Data",
    objective: "Verify completeness of required identity fields for all provisioned accounts.",
    recordsTested: 1248,
    exceptions: 2,
    lastTest: "Jul 8, 2026",
    status: "Effective",
    columns: ["Name", "System", "Missing Field"],
    results: [
      ["Laura Dimitrov", "Oracle Financials", "MFA Status"],
      ["Nadia Farouk", "Salesforce CRM", "Department"],
    ],
  },
];

const FINDINGS = [
  {
    id: "F-2026-014",
    risk: "Unauthorized system access",
    system: "Core Banking System",
    severity: "Critical",
    controlStatus: "Ineffective",
    reviewStatus: "Open",
    controlObjective: "Terminated employee access must be disabled within 24 hours of separation date.",
    testPerformed: "Compared HR termination records against active account status across in-scope applications.",
    exception: "3 terminated employees retained active administrative access. One account retained access to the core banking system for 101 days post-termination.",
    impact: "Unauthorized access by former employees could result in fraudulent transactions, unauthorized data extraction, or undetected changes to core banking records.",
    aiSummary:
      "Access for three former employees was not removed on schedule, including one administrator account on the core banking platform that stayed active for more than three months after departure. Until deprovisioning is enforced automatically, the bank is exposed to unauthorized transactions or data access that would be difficult to trace back to an active employee.",
  },
  {
    id: "F-2026-015",
    risk: "Weak authentication on privileged accounts",
    system: "AWS Production",
    severity: "High",
    controlStatus: "Ineffective",
    reviewStatus: "Under Review",
    controlObjective: "All privileged and administrative accounts must have multi-factor authentication enabled.",
    testPerformed: "Reviewed MFA enrollment status for all accounts holding privileged or admin-level access.",
    exception: "6 of 187 privileged accounts, including two production infrastructure engineers, do not have MFA enabled.",
    impact: "A compromised password on an unprotected privileged account could allow direct, undetected access to production infrastructure and sensitive data.",
    aiSummary:
      "Six accounts with elevated system privileges, including two engineers with direct production access, are not protected by multi-factor authentication. A single stolen password would be enough to compromise these accounts, so closing this gap should be treated as a near-term priority.",
  },
  {
    id: "F-2026-016",
    risk: "Excessive privileged access",
    system: "Active Directory",
    severity: "High",
    controlStatus: "Needs Review",
    reviewStatus: "Open",
    controlObjective: "User access must align with job role in accordance with least-privilege principles.",
    testPerformed: "Compared assigned access levels against the approved role-based access matrix by department.",
    exception: "11 users hold access levels above what their role requires, including two associate-level staff with elevated access to financial systems.",
    impact: "Excess privileges increase the risk of unauthorized or erroneous transactions and widen the population of accounts a bad actor could exploit.",
    aiSummary:
      "Eleven employees currently have more system access than their job requires, including two junior staff with elevated rights on financial platforms. This is common as roles change over time, but each excess grant is an unnecessary door left open and should be walked back to what each role actually needs.",
  },
  {
    id: "F-2026-017",
    risk: "Identity data integrity failures",
    system: "SAP ERP / Workday HR",
    severity: "Medium",
    controlStatus: "Needs Review",
    reviewStatus: "Open",
    controlObjective: "User identity records must be unique, complete, and consistently formatted across systems.",
    testPerformed: "Profiled identity data for duplicate records and inconsistent naming across source systems.",
    exception: "4 records identified as duplicate or inconsistent, including one exact duplicate account and three records with inconsistent name formatting.",
    impact: "Inconsistent identity records make it difficult to reliably match access to a single individual, reducing confidence in downstream access reviews.",
    aiSummary:
      "A handful of employee records appear more than once, or under slightly different spellings, across HR and system data. On their own these are data-entry issues, but they make it harder to trust the results of any access review built on top of this data, so cleanup is worth prioritizing.",
  },
  {
    id: "F-2026-018",
    risk: "Segregation of duties conflict",
    system: "Oracle Financials",
    severity: "Medium",
    controlStatus: "Needs Review",
    reviewStatus: "Closed",
    controlObjective: "Incompatible access combinations must be restricted across financial systems.",
    testPerformed: "Tested user access combinations against the approved segregation-of-duties conflict matrix.",
    exception: "1 user held both payment initiation and payment approval rights within the same workflow.",
    impact: "Combined initiation and approval rights allow a single individual to originate and approve a transaction without independent review.",
    aiSummary:
      "One user could both create and approve payments in the same system, removing the second set of eyes that this control depends on. Access has since been split between two roles, and the fix has been confirmed and closed.",
  },
  {
    id: "F-2026-019",
    risk: "Incomplete user provisioning data",
    system: "Salesforce CRM",
    severity: "Low",
    controlStatus: "Effective",
    reviewStatus: "Closed",
    controlObjective: "Required identity fields must be complete for all provisioned accounts.",
    testPerformed: "Reviewed provisioning records for completeness of required identity and access fields.",
    exception: "2 records missing a required field (MFA status or department) at the time of testing.",
    impact: "Incomplete records have limited standalone impact but reduce the reliability of automated monitoring that depends on complete data.",
    aiSummary:
      "Two accounts were missing a required data field at the time of testing. The impact is minor on its own, and both records have since been corrected, but it is worth reinforcing the provisioning checklist so the same fields aren't skipped again.",
  },
];

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"];

const KPI = {
  controlsTested: CONTROL_TESTS.length,
  effectiveControls: CONTROL_TESTS.filter((c) => c.status === "Effective").length,
  exceptionsIdentified: CONTROL_TESTS.reduce((s, c) => s + c.exceptions, 0),
  highRiskFindings: FINDINGS.filter((f) => f.severity === "Critical" || f.severity === "High").length,
};

const DONUT_DATA = [
  { name: "Effective", value: CONTROL_TESTS.filter((c) => c.status === "Effective").length, color: "#16a34a" },
  { name: "Ineffective", value: CONTROL_TESTS.filter((c) => c.status === "Ineffective").length, color: "#dc2626" },
  { name: "Needs Review", value: CONTROL_TESTS.filter((c) => c.status === "Needs Review").length, color: "#d97706" },
];

const SEVERITY_COLORS = { Critical: "#b91c1c", High: "#ea580c", Medium: "#d97706", Low: "#16a34a" };

const BAR_DATA = SEVERITY_ORDER.map((s) => ({
  severity: s,
  count: FINDINGS.filter((f) => f.severity === s).length,
}));

const HEALTH_SCORE = {
  value: 87,
  delta: "+4.2%",
  deltaLabel: "from last assessment",
  factors: [
    { label: "Access Controls", status: "Needs Attention" },
    { label: "Data Quality", status: "Needs Attention" },
    { label: "Security Controls", status: "Monitored" },
    { label: "Compliance Testing", status: "On Track" },
  ],
};

// Likelihood (rows) x Impact (columns), scored 1 (low) - 4 (severe) for heat map shading
const RISK_HEAT_MAP = {
  impactLabels: ["Low", "Medium", "High"],
  rows: [
    { label: "Access Controls", cells: [1, 2, 4] },
    { label: "Data Quality", cells: [2, 3, 4] },
    { label: "Security Controls", cells: [1, 2, 3] },
    { label: "Compliance", cells: [1, 1, 2] },
  ],
};

const HEAT_CELL_TONE = {
  1: "bg-green-100 border-green-300 text-green-800",
  2: "bg-amber-100 border-amber-300 text-amber-800",
  3: "bg-orange-100 border-orange-300 text-orange-800",
  4: "bg-red-100 border-red-300 text-red-800",
};
const HEAT_CELL_LABEL = { 1: "Low", 2: "Moderate", 3: "Elevated", 4: "Severe" };

const AI_INSIGHTS = {
  headline: `I found ${KPI.exceptionsIdentified} access issues requiring review.`,
  recommendation: "Disable the 3 terminated-employee accounts that still have active administrative access.",
};

const AI_RESPONSES = {
  summarize:
    `This cycle: 1 critical, 2 high, 2 medium, and 1 low severity finding across ${KPI.controlsTested} controls tested. ` +
    "The critical finding involves 3 terminated employees who still hold active access, including one administrator account on the core banking system.",
  explain:
    "The top risk is unauthorized access: three former employees, including one system administrator, can still log into production systems months after leaving. " +
    "If exploited, this could allow fraudulent transactions or undetected changes to financial records that are difficult to trace back to an active employee.",
  management:
    "Technology controls testing this quarter found 6 exceptions across identity and access management. The most significant gap is delayed deprovisioning of " +
    "terminated employees, followed by missing MFA on 6 privileged accounts. Remediation of both is recommended before the next assessment cycle.",
  remediate: [
    "Disable the 3 terminated accounts with active access immediately, prioritizing the core banking administrator.",
    "Enforce MFA on the 6 privileged accounts currently authenticating with password only.",
    "Review and right-size the 11 excessive-privilege grants against the role-based access matrix.",
    "Reconcile the 4 duplicate or inconsistent identity records flagged during data profiling.",
  ],
};

/* ------------------------------------------------------------------ */
/* SHARED UI                                                          */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profiling", label: "Data Profiling", icon: Database },
  { id: "risk-controls", label: "Risk & Controls", icon: Shield },
  { id: "testing", label: "Control Testing", icon: ClipboardCheck },
  { id: "findings", label: "Findings", icon: AlertTriangle },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
];

const PAGE_META = {
  overview: { title: "Overview", subtitle: "Technology controls audit summary — FY2026 Q3" },
  profiling: { title: "Data Profiling", subtitle: "Import and assess the quality of source access data" },
  "risk-controls": { title: "Risk & Controls", subtitle: "Technology risk to control objective mapping" },
  testing: { title: "Control Testing", subtitle: "Automated testing of technology access controls" },
  findings: { title: "Findings", subtitle: "Control exceptions identified during audit fieldwork" },
  reports: { title: "Reports", subtitle: "Audit summary and management reporting" },
};

function statusTone(status) {
  switch (status) {
    case "Effective":
      return "bg-green-50 text-green-700 border-green-200";
    case "Ineffective":
      return "bg-red-50 text-red-700 border-red-200";
    case "Needs Review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Open":
      return "bg-red-50 text-red-700 border-red-200";
    case "Under Review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Closed":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function severityTone(severity) {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-300";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Low":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function Badge({ children, tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const icon =
    status === "Effective" ? (
      <CheckCircle2 size={12} />
    ) : status === "Ineffective" ? (
      <XCircle size={12} />
    ) : (
      <AlertCircle size={12} />
    );
  return (
    <Badge tone={statusTone(status)}>
      {icon}
      {status}
    </Badge>
  );
}

function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <div className={`rounded-md border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/* SIDEBAR + TOPBAR                                                   */
/* ------------------------------------------------------------------ */

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
      <div className="flex items-center gap-2.5 border-b border-slate-800 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
          <ShieldCheck size={18} className="text-slate-900" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">ControlLens</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Technology Risk &amp; Audit</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto text-slate-500" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <div className="flex items-center gap-2 rounded bg-slate-800/60 px-3 py-2.5">
          <Building2 size={15} className="text-slate-400" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-200">Enterprise Technology Audit</p>
            <p className="text-[10px] text-slate-500">Audit cycle FY2026-Q3</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ page }) {
  const meta = PAGE_META[page];
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{meta.title}</h1>
        <p className="text-xs text-slate-500">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-slate-500 md:flex">
          <Search size={13} />
          <span>Search findings, controls, systems…</span>
        </div>
        <button className="relative rounded border border-gray-200 p-2 text-slate-500 hover:bg-gray-50">
          <Bell size={15} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            AR
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-slate-800">Aria Reyes</p>
            <p className="text-[10px] text-slate-500">IT Audit Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* OVERVIEW PAGE                                                      */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <Eyebrow>{label}</Eyebrow>
        <div className={`flex h-7 w-7 items-center justify-center rounded ${tone}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm">
      <span className="font-medium text-slate-700">{d.name}: </span>
      <span className="text-slate-600">{d.value} control{d.value === 1 ? "" : "s"}</span>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm">
      <span className="font-medium text-slate-700">{label}: </span>
      <span className="text-slate-600">{payload[0].value} finding{payload[0].value === 1 ? "" : "s"}</span>
    </div>
  );
}

function HealthScoreRing({ value }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const ringColor = value >= 85 ? "#16a34a" : value >= 70 ? "#d97706" : "#dc2626";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold text-slate-900">{value}%</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">Health Score</span>
      </div>
    </div>
  );
}

function TechControlHealthCard() {
  return (
    <SectionCard className="xl:col-span-2">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <HealthScoreRing value={HEALTH_SCORE.value} />
        <div className="flex-1">
          <Eyebrow>Technology Control Health Score</Eyebrow>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <TrendingUp size={14} className="text-green-600" />
            <span className="font-medium text-green-600">{HEALTH_SCORE.delta}</span>
            <span className="text-slate-400">{HEALTH_SCORE.deltaLabel}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Composite score based on control testing results across the audit universe</p>
          <div className="mt-4 space-y-1.5">
            {HEALTH_SCORE.factors.map((f) => (
              <div key={f.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 size={12} className="text-slate-400" />
                  {f.label}
                </span>
                <Badge
                  tone={
                    f.status === "On Track"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : f.status === "Monitored"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                >
                  {f.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function RiskHeatMapCard() {
  return (
    <SectionCard
      title="Risk Heat Map"
      description="Likelihood of exploitation by potential impact, by risk category"
      className="xl:col-span-3"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th className="w-32" />
              <th colSpan={3} className="pb-1 text-center font-medium uppercase tracking-wide text-slate-400">
                Impact
              </th>
            </tr>
            <tr>
              <th className="text-left font-medium text-slate-400">Risk Category</th>
              {RISK_HEAT_MAP.impactLabels.map((l) => (
                <th key={l} className="w-20 pb-1 text-center font-medium text-slate-500">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RISK_HEAT_MAP.rows.map((row) => (
              <tr key={row.label}>
                <td className="pr-2 text-slate-600">{row.label}</td>
                {row.cells.map((score, i) => (
                  <td key={i}>
                    <div
                      className={`flex h-11 w-full items-center justify-center rounded border text-[10px] font-medium ${HEAT_CELL_TONE[score]}`}
                      title={`${row.label} — ${HEAT_CELL_LABEL[score]} risk`}
                    >
                      {HEAT_CELL_LABEL[score]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Likelihood increases left to right per category based on current exception volume; shading reflects combined likelihood × impact.
      </p>
    </SectionCard>
  );
}

function OverviewPage({ findings = FINDINGS, loading = false, error = "" }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <TechControlHealthCard />
        <RiskHeatMapCard />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Controls Tested" value={KPI.controlsTested} icon={ClipboardCheck} tone="bg-slate-100 text-slate-700" />
        <KpiCard label="Effective Controls" value={KPI.effectiveControls} icon={CheckCircle2} tone="bg-green-50 text-green-700" />
        <KpiCard label="Exceptions Identified" value={KPI.exceptionsIdentified} icon={FileWarning} tone="bg-amber-50 text-amber-700" />
        <KpiCard label="High-Risk Findings" value={KPI.highRiskFindings} icon={AlertTriangle} tone="bg-red-50 text-red-700" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <SectionCard title="Control Effectiveness" description="Distribution of tested control results" className="xl:col-span-2">
          <div className="flex items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DONUT_DATA} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {DONUT_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-3">
            {DONUT_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Risk Severity" description="Open findings by severity rating" className="xl:col-span-3">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} barSize={44}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="severity" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {BAR_DATA.map((d) => (
                    <Cell key={d.severity} fill={SEVERITY_COLORS[d.severity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Audit Findings" description="Most recently identified control exceptions">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2.5 pr-4 font-medium">Finding ID</th>
                <th className="pb-2.5 pr-4 font-medium">Risk</th>
                <th className="pb-2.5 pr-4 font-medium">Affected System</th>
                <th className="pb-2.5 pr-4 font-medium">Severity</th>
                <th className="pb-2.5 pr-4 font-medium">Control Status</th>
                <th className="pb-2.5 font-medium">Review Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-slate-800">{f.id}</td>
                  <td className="py-3 pr-4 text-slate-600">{f.risk}</td>
                  <td className="py-3 pr-4 text-slate-600">{f.system}</td>
                  <td className="py-3 pr-4"><Badge tone={severityTone(f.severity)}>{f.severity}</Badge></td>
                  <td className="py-3 pr-4"><StatusBadge status={f.controlStatus} /></td>
                  <td className="py-3"><Badge tone={statusTone(f.reviewStatus)}>{f.reviewStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {loading && <p className="text-xs text-slate-400">Refreshing dashboard data…</p>}
      {error && <p className="text-xs text-amber-700">Live dashboard unavailable: {error}. Showing the last available audit view.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DATA PROFILING PAGE                                                */
/* ------------------------------------------------------------------ */

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
  return { headers, rows };
}

function computeStats(headers, rows) {
  const total = rows.length;
  let missing = 0;
  rows.forEach((r) => headers.forEach((h) => { if (!r[h] || r[h].trim() === "") missing += 1; }));

  const seen = new Set();
  let duplicates = 0;
  rows.forEach((r) => {
    const key = JSON.stringify(r);
    if (seen.has(key)) duplicates += 1;
    else seen.add(key);
  });

  const checkCols = headers.filter((h) => /status|mfa/i.test(h));
  let inconsistent = 0;
  rows.forEach((r) => checkCols.forEach((h) => {
    const v = r[h];
    if (!v) return;
    const canonical = v.trim().charAt(0).toUpperCase() + v.trim().slice(1).toLowerCase();
    if (v !== canonical) inconsistent += 1;
  }));

  const denom = Math.max(total * 3, 1);
  const score = Math.max(0, Math.min(100, Math.round(((denom - missing - duplicates * 3 - inconsistent) / denom) * 100)));

  return { total, missing, duplicates, inconsistent, score };
}

function DataProfilingPage() {
  const [dataset, setDataset] = useState({ headers: CSV_HEADERS, rows: MOCK_ACCESS_DATA, fileName: "user_access_export_q3.csv" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const stats = useMemo(() => computeStats(dataset.headers, dataset.rows), [dataset]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const { headers, rows } = parseCSV(String(ev.target.result));
      if (headers.length) setDataset({ headers, rows, fileName: file.name });
      try { await api.uploadDataset(file); } catch (err) { setUploadError(err.message); } finally { setUploading(false); }
    };
    reader.readAsText(file);
  };

  const statCards = [
    { label: "Total Records", value: stats.total.toLocaleString(), icon: Users, tone: "bg-slate-100 text-slate-700" },
    { label: "Missing Values", value: stats.missing, icon: AlertCircle, tone: "bg-amber-50 text-amber-700" },
    { label: "Duplicate Records", value: stats.duplicates, icon: Copy, tone: "bg-amber-50 text-amber-700" },
    { label: "Inconsistent Formats", value: stats.inconsistent, icon: FileWarning, tone: "bg-amber-50 text-amber-700" },
    { label: "Data Quality Score", value: `${stats.score}%`, icon: CheckCircle2, tone: stats.score >= 90 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Import Access Data"
        description="Upload a CSV extract of user access, roles, and MFA status"
        action={
          <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-300 bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800">
            <UploadCloud size={14} />
            {uploading ? "Uploading…" : "Upload CSV"}
            <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
        }
      >
        <div className="flex items-center gap-2 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-slate-500">
          <FileText size={14} className="text-slate-400" />
          Currently loaded: <span className="font-medium text-slate-700">{dataset.fileName}</span>
          <span className="text-slate-400">·</span>
          {dataset.rows.length} records
        </div>
        {uploadError && <p className="mt-2 text-xs text-red-600">Upload failed: {uploadError}. The local preview is still available.</p>}
      </SectionCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      <SectionCard title="Data Quality Checks" description="Automated formatting and standardization checks">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs font-medium text-slate-700">Field completeness</p>
            <p className="mt-1 text-xs text-slate-500">Checks required fields (MFA status, department, access level) for blank values.</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs font-medium text-slate-700">Duplicate detection</p>
            <p className="mt-1 text-xs text-slate-500">Flags exact duplicate rows and near-matches on employee identity, e.g. "Elena Petrova" vs "E. Petrova".</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs font-medium text-slate-700">Value standardization</p>
            <p className="mt-1 text-xs text-slate-500">Checks Status and MFA fields against expected casing and value sets (Active / Terminated, Yes / No).</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Data Preview" description={`Showing ${Math.min(dataset.rows.length, 12)} of ${dataset.rows.length} records`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500">
                {dataset.headers.map((h) => (
                  <th key={h} className="whitespace-nowrap pb-2.5 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataset.rows.slice(0, 12).map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {dataset.headers.map((h) => {
                    const val = r[h];
                    const isFlag =
                      (/status/i.test(h) && /terminated/i.test(val)) ||
                      (/mfa/i.test(h) && /^no$/i.test(val || "")) ||
                      !val;
                    return (
                      <td key={h} className={`whitespace-nowrap py-2.5 pr-4 ${isFlag ? "font-medium text-red-600" : "text-slate-600"}`}>
                        {val || <span className="italic text-amber-600">missing</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RISK & CONTROLS PAGE                                               */
/* ------------------------------------------------------------------ */

function RiskControlsPage() {
  return (
    <div className="space-y-6">
      <SectionCard title="Risk & Control Matrix" description="Technology risks mapped to control objectives and testing procedures">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="w-1/5 pb-2.5 pr-4 font-medium">Technology Risk</th>
                <th className="w-1/4 pb-2.5 pr-4 font-medium">Control Objective</th>
                <th className="w-1/4 pb-2.5 pr-4 font-medium">Testing Procedure</th>
                <th className="pb-2.5 pr-4 font-medium">Frequency</th>
                <th className="pb-2.5 font-medium">Control Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RISK_CONTROL_MATRIX.map((r, i) => (
                <tr key={i} className="align-top hover:bg-gray-50">
                  <td className="py-3.5 pr-4 font-medium text-slate-800">{r.risk}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{r.control}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{r.procedure}</td>
                  <td className="py-3.5 pr-4"><Badge tone="bg-slate-100 text-slate-600 border-slate-200">{r.frequency}</Badge></td>
                  <td className="py-3.5 text-slate-600">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionCard title="In-Scope Systems">
          <ul className="space-y-2 text-sm text-slate-600">
            {["Core Banking System", "Oracle Financials", "SAP ERP", "Active Directory", "AWS Production", "Salesforce CRM", "Workday HR", "Murex Trading Platform"].map((s) => (
              <li key={s} className="flex items-center gap-2"><Lock size={13} className="text-slate-400" />{s}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Control Universe" className="md:col-span-2">
          <p className="text-sm leading-relaxed text-slate-600">
            The technology controls audit universe for FY2026-Q3 covers <span className="font-medium text-slate-800">6 control objectives</span> across
            identity and access management, spanning provisioning, deprovisioning, authentication, and data integrity. Each objective is tested
            monthly or quarterly depending on inherent risk rating, with results feeding directly into the findings register.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONTROL TESTING PAGE                                                */
/* ------------------------------------------------------------------ */

function TestCard({ test, isActive, onSelect, onRun, running }) {
  return (
    <button
      onClick={() => onSelect(test.id)}
      className={`w-full rounded-md border bg-white p-4 text-left shadow-sm transition-colors ${
        isActive ? "border-slate-400 ring-1 ring-slate-300" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{test.name}</p>
        <StatusBadge status={test.status} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{test.objective}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs">
        <div>
          <p className="text-slate-400">Records Tested</p>
          <p className="mt-0.5 font-medium text-slate-800">{test.recordsTested.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Exceptions</p>
          <p className={`mt-0.5 font-medium ${test.exceptions > 0 ? "text-red-600" : "text-green-600"}`}>{test.exceptions}</p>
        </div>
        <div>
          <p className="text-slate-400">Last Test</p>
          <p className="mt-0.5 font-medium text-slate-800">{test.lastTest}</p>
        </div>
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); onRun(test.id); }}
        role="button"
        className="mt-4 flex items-center justify-center gap-1.5 rounded border border-slate-300 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {running ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
        {running ? "Running Test…" : "Run Control Test"}
      </div>
    </button>
  );
}

function ControlTestingPage() {
  const [tests, setTests] = useState(CONTROL_TESTS);
  const [activeId, setActiveId] = useState(CONTROL_TESTS[0].id);
  const [runningId, setRunningId] = useState(null);

  const active = tests.find((t) => t.id === activeId);

  const runTest = (id) => {
    setRunningId(id);
    setTimeout(() => {
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, lastTest: "Today" } : t)));
      setRunningId(null);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tests.map((t) => (
          <TestCard key={t.id} test={t} isActive={activeId === t.id} onSelect={setActiveId} onRun={runTest} running={runningId === t.id} />
        ))}
      </div>

      {active && (
        <SectionCard
          title={`Test Results — ${active.name}`}
          description={`Control objective: ${active.objective}`}
          action={<StatusBadge status={active.status} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500">
                  {active.columns.map((c) => (
                    <th key={c} className="whitespace-nowrap pb-2.5 pr-4 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {active.results.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap py-2.5 pr-4 text-slate-600">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {active.note && <p className="mt-3 text-xs italic text-slate-400">{active.note}</p>}
        </SectionCard>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FINDINGS PAGE                                                      */
/* ------------------------------------------------------------------ */

function FindingsPage({ findings = FINDINGS }) {
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(findings[0]?.id);

  const filtered = filter === "All" ? findings : findings.filter((f) => f.severity === filter);
  const selected = findings.find((f) => f.id === selectedId) || filtered[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["All", ...SEVERITY_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded border px-3 py-1.5 text-xs font-medium ${
              filter === s ? "border-slate-800 bg-slate-900 text-white" : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            {s}
            {s !== "All" && <span className="ml-1.5 text-[10px] opacity-70">{findings.filter((f) => f.severity === s).length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        <SectionCard title="Control Exceptions" description={`${filtered.length} finding${filtered.length === 1 ? "" : "s"}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2.5 pr-4 font-medium">Finding</th>
                  <th className="pb-2.5 pr-4 font-medium">System</th>
                  <th className="pb-2.5 pr-4 font-medium">Severity</th>
                  <th className="pb-2.5 font-medium">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`cursor-pointer ${selected?.id === f.id ? "bg-slate-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{f.id}</p>
                      <p className="text-xs text-slate-500">{f.risk}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{f.system}</td>
                    <td className="py-3 pr-4"><Badge tone={severityTone(f.severity)}>{f.severity}</Badge></td>
                    <td className="py-3"><Badge tone={statusTone(f.reviewStatus)}>{f.reviewStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {selected && (
          <div className="h-fit rounded-md border border-gray-200 bg-white shadow-sm lg:sticky lg:top-20">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-medium text-slate-400">{selected.id}</p>
                <h3 className="mt-0.5 text-sm font-semibold text-slate-800">{selected.risk}</h3>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-300 hover:text-slate-500 lg:hidden">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge tone={severityTone(selected.severity)}>{selected.severity} severity</Badge>
                <StatusBadge status={selected.controlStatus} />
                <Badge tone={statusTone(selected.reviewStatus)}>{selected.reviewStatus}</Badge>
              </div>
              <div>
                <Eyebrow>Control Objective</Eyebrow>
                <p className="mt-1 text-slate-600">{selected.controlObjective}</p>
              </div>
              <div>
                <Eyebrow>Test Performed</Eyebrow>
                <p className="mt-1 text-slate-600">{selected.testPerformed}</p>
              </div>
              <div>
                <Eyebrow>Exception Identified</Eyebrow>
                <p className="mt-1 text-slate-600">{selected.exception}</p>
              </div>
              <div>
                <Eyebrow>Potential Impact</Eyebrow>
                <p className="mt-1 text-slate-600">{selected.impact}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Sparkles size={13} className="text-slate-500" />
                  AI-Generated Management Summary
                </div>
                <p className="mt-1.5 text-slate-600">{selected.aiSummary}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* REPORTS PAGE                                                       */
/* ------------------------------------------------------------------ */

function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1400);
  };

  const availableReports = [
    { name: "Q3 Technology Controls Audit Report", desc: "Full control testing results and findings register", date: "Jul 14, 2026" },
    { name: "Access Review Summary", desc: "Terminated and privileged user access exceptions", date: "Jul 12, 2026" },
    { name: "MFA Compliance Report", desc: "Multi-factor authentication coverage by system", date: "Jul 11, 2026" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Audit Summary"
        description="Audit cycle FY2026-Q3 · Enterprise Technology Controls"
        action={
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 rounded border border-slate-300 bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? "Generating…" : "Generate Management Report"}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Controls Tested</p>
            <p className="mt-1 text-xl font-semibold text-slate-800">{KPI.controlsTested}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Effective</p>
            <p className="mt-1 text-xl font-semibold text-green-700">{KPI.effectiveControls}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Exceptions</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">{KPI.exceptionsIdentified}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">High-Risk Findings</p>
            <p className="mt-1 text-xl font-semibold text-red-700">{KPI.highRiskFindings}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={13} />
          Reporting period: April 1, 2026 – June 30, 2026 · Prepared by IT Audit Team
        </div>
      </SectionCard>

      {generated && (
        <SectionCard title="Management Report Preview" description="Generated summary in management-friendly language">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              This quarter's technology controls audit tested five control objectives spanning access provisioning,
              deprovisioning, authentication, and identity data quality. Of the controls tested, one operated effectively,
              two were rated needs review, and two were rated ineffective, resulting in six findings for management action.
            </p>
            <p>
              The most significant issue relates to terminated employee access: three former employees, including one
              administrator on the core banking platform, retained active access well beyond their separation date.
              A related gap in multi-factor authentication coverage leaves six privileged accounts, including two with
              direct production access, protected by password only.
            </p>
            <p>
              Lower-severity issues concern data quality — duplicate and inconsistent identity records that reduce
              confidence in future access reviews — and a small number of users with access beyond their role
              requirements. One segregation-of-duties conflict identified during fieldwork has already been remediated
              and closed. Management has been asked to prioritize remediation of the terminated-access and MFA findings
              given their severity.
            </p>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Available Reports" description="Previously generated and scheduled audit reports">
        <div className="divide-y divide-gray-100">
          {availableReports.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-500">
                  <FileText size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.desc} · {r.date}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-gray-50">
                <Download size={13} />
                Download
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* APP SHELL                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* AI CONTROL ANALYST WIDGET                                          */
/* ------------------------------------------------------------------ */

const AI_ACTIONS = [
  { id: "summarize", label: "Summarize Findings", icon: ListChecks },
  { id: "explain", label: "Explain Top Risk", icon: AlertTriangle },
  { id: "management", label: "Management Summary", icon: FileText },
  { id: "remediate", label: "Recommend Remediation", icon: Wrench },
];

function AIAnalystWidget() {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAction = (id) => {
    setLoading(true);
    setActiveAction(id);
    setTimeout(() => setLoading(false), 500);
  };

  const reset = () => {
    setActiveAction(null);
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-900 py-2.5 pl-3.5 pr-4 text-sm font-medium text-white shadow-lg hover:bg-slate-800"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700">
          <Bot size={13} />
        </span>
        AI Control Analyst
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[340px] rounded-md border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between rounded-t-md border-b border-gray-100 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700">
            <Bot size={13} className="text-white" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">AI Control Analyst</p>
            <p className="text-[10px] text-slate-400">Read-only · reviews audit data</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
          <X size={15} />
        </button>
      </div>

      <div className="max-h-[360px] overflow-y-auto px-4 py-3.5">
        {!activeAction && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">{AI_INSIGHTS.headline}</p>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Sparkles size={12} />
                Top Recommendation
              </p>
              <p className="mt-1 text-xs text-slate-700">{AI_INSIGHTS.recommendation}</p>
            </div>
          </div>
        )}

        {activeAction && (
          <div className="space-y-2">
            <button onClick={reset} className="text-[11px] font-medium text-slate-400 hover:text-slate-600">
              ← Back
            </button>
            {loading ? (
              <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                <Loader2 size={13} className="animate-spin" />
                Analyzing audit data…
              </div>
            ) : activeAction === "remediate" ? (
              <ul className="space-y-2 text-xs text-slate-600">
                {AI_RESPONSES.remediate.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed text-slate-600">{AI_RESPONSES[activeAction]}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 border-t border-gray-100 p-2.5">
        {AI_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              className={`flex items-center gap-1.5 rounded border px-2 py-1.5 text-left text-[11px] font-medium ${
                activeAction === a.id ? "border-slate-400 bg-slate-50 text-slate-800" : "border-gray-200 text-slate-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={12} />
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("overview");
  const [liveFindings, setLiveFindings] = useState(null);
  const [apiStatus, setApiStatus] = useState({ loading: true, error: "" });
  useEffect(() => {
    api.findings().then((items) => {
      if (items.length) setLiveFindings(items.map((f) => ({
        id: `F-${String(f.id).padStart(6, "0")}`, risk: f.rule_name, system: "Uploaded dataset", severity: f.severity,
        controlStatus: f.affected_rows ? "Ineffective" : "Effective", reviewStatus: f.status, controlObjective: f.rule_name,
        testPerformed: "Automated audit engine analysis", exception: f.description, impact: `${f.affected_rows} record(s) affected.`, aiSummary: f.recommendation,
      })));
      setApiStatus({ loading: false, error: "" });
    }).catch((err) => setApiStatus({ loading: false, error: err.message }));
  }, []);
  const displayFindings = liveFindings || FINDINGS;

  const renderPage = () => {
    switch (page) {
      case "overview":
        return <OverviewPage findings={displayFindings} {...apiStatus} />;
      case "profiling":
        return <DataProfilingPage />;
      case "risk-controls":
        return <RiskControlsPage />;
      case "testing":
        return <ControlTestingPage />;
      case "findings":
        return <FindingsPage findings={displayFindings} />;
      case "reports":
        return <ReportsPage />;
      default:
        return <OverviewPage findings={displayFindings} {...apiStatus} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <Sidebar active={page} onNavigate={setPage} />

      <div className="flex flex-col lg:pl-64">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3 lg:hidden">
          <ShieldCheck size={18} className="text-white" />
          <span className="text-sm font-semibold text-white">ControlLens</span>
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="ml-auto rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
          >
            {NAV_ITEMS.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>

        <Topbar page={page} />

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6">{renderPage()}</main>
      </div>

      <AIAnalystWidget />
    </div>
  );
}
