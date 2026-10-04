import type { ApiEnvelope, CompanyBranch, CompanyDashboard, DcrExtended, Doctor, DoctorCoverageRow, Employee, Product, TourPlan } from "@zivira/types";

// Re-exported so other modules (e.g. manager-sfc-updation.tsx) can import
// Employee straight from "@/lib/api-client" instead of reaching into
// "@zivira/types" directly — plain `import type { X } from "pkg"` does NOT
// re-export X to this file's own consumers, which is what broke the
// "declares 'Employee' locally, but it is not exported" Vercel build.
export type { Employee, Product };

export type ProductCategory = {
  id: string;
  shortName?: string | null;
  categoryName: string;
  noOfProducts: number;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
  description?: string | null;
};

export type ProductBrand = {
  id: string;
  shortName?: string | null;
  brandName: string;
  noOfProducts: number;
  noOfSlides?: number | null;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
  molecule?: string | null;
  therapy?: string | null;
  division?: string | null;
};

export type ProductCatalogItem = {
  id: string;
  productCode?: string | null;
  productName: string;
  description?: string | null;
  brandName?: string | null;
  molecule?: string | null;
  therapy?: string | null;
  saleUnit?: string | null;
  noOfSlides?: number | null;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
  strength?: string | null;
  pack?: string | null;
  sku?: string | null;
  division?: string | null;
  uom?: string | null;
};

export type DoctorCategory = {
  id: string;
  shortName?: string | null;
  categoryName: string;
  noOfDoctors: number;
  noOfVisit?: number | null;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
  qualification?: string | null;
  specialty?: string | null;
  registrationNumber?: string | null;
};

export type DoctorSpeciality = {
  id: string;
  shortName?: string | null;
  specialityName: string;
  noOfDoctors: number;
  noOfSlides?: number | null;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
};

export type DoctorQualification = {
  id: string;
  qualificationName: string;
  noOfDoctors: number;
  sortOrder?: number | null;
  status: "ACTIVE" | "INACTIVE";
};

export type Subdivision = {
  id: string;
  tenantSlug: string;
  division: string;
  subdivisionName: string;
  productwiseCount: number;
  fieldforcewiseCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
};

export type ProductGroup = {
  id: string;
  moleculeName: string;
  therapyName?: string | null;
  status: "ACTIVE" | "INACTIVE";
  description?: string | null;
};

export type Dealer = {
  id: string;
  sourceSNo?: number | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  patchName?: string | null;
  dealerName: string;
  contactPersonName?: string | null;
  dealerPhone?: string | null;
  dealerEmail?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  location?: string | null;
  pincode?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type Holiday = {
  id: string;
  sourceSNo?: number | null;
  stateName: string;
  weekendHoliday?: string | null;
  otherHolidayDate?: string | null;
  otherHolidayDescription?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type Sfc = {
  id: string;
  sourceSNo?: number | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  hq?: string | null;
  patchName?: string | null;
  typeRaw?: string | null;
  oneWayKms?: number | null;
  region?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type Expense = {
  id: string;
  role: string;
  listOfExpenseTypes?: string | null;
  station?: string | null;
  metroType?: string | null;
  amountNC?: number | null;
  dailyWork?: string | null;
  frequency?: string | null;
  remarks?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type Hospital = {
  id: string;
  hospitalCode: string;
  hospitalName: string;
  type: "Private" | "Government" | "Trust" | "Other";
  city?: string | null;
  medicalRepresentative?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type UnlistedDoctor = {
  id: string;
  tempCode: string;
  name: string;
  specialty?: string | null;
  city?: string | null;
  mr?: string | null;
  clinicName?: string | null;
  address?: string | null;
  area?: string | null;
  state?: string | null;
  pinCode?: string | null;
  patch?: string | null;
  hq?: string | null;
  mobile?: string | null;
  email?: string | null;
  visitFrequency?: string | null;
  potential?: string | null;
  remarks?: string | null;
  approvedBy?: string | null;
  dob?: string | null;
  anniversaryDate?: string | null;
  status: "Pending" | "Approved" | "Rejected";
};

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "NEXT_PUBLIC_API_URL is not set. Set it to the backend API URL (e.g. in .env.local) — there is no fallback backend."
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "zivira.company.token";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

// Round 39 item 1 -- every API call now has a hard timeout and a readable
// error, so a cold/unreachable backend can never leave a button spinning
// forever (previously: no timeout at all, and a non-JSON 502 from the
// host's proxy threw a cryptic "Unexpected token <").
const REQUEST_TIMEOUT_MS = 30000;
async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs: number = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: init.signal ?? controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The server is taking too long to respond (it may be waking up). Please try again in a moment.");
    }
    throw new Error("Cannot reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}
async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new Error(`The server returned an unexpected response (${response.status}). It may be restarting -- please retry.`);
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "API request failed");
  }

  return payload as ApiEnvelope<T>;
}

export type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };

async function requestPaginated<T>(path: string, init: RequestInit = {}): Promise<{ data: T[]; pagination: PaginationInfo }> {
  const token = getToken();
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "API request failed");
  }

  return payload as { data: T[]; pagination: PaginationInfo };
}

export type DcrRecord = Omit<DcrExtended, "doctorId" | "samplesGiven" | "inputsGiven" | "jointWork"> & {
  doctorId?: Doctor;
  managerId?: { displayName?: string };
  visitOutcome?: string;
  outcomeNotes?: string;
  nextFollowUpDate?: string;
  isAutoApproved?: boolean;
  samplesGiven?: { product?: string; productName?: string; qty: number }[];
  inputsGiven?: { inputType?: string; inputName?: string; qty: number }[];
  jointWork?: DcrExtended["jointWork"] & { wasJoint?: boolean; managerName?: string };
  // Item A (post-launch robustness round) -- real fields GET /company/dcrs
  // already returns that the type didn't carry yet, needed to replace the
  // Activities dashboard's fake Telemetry table/Geofence panel with real data.
  employeeName?: string;
  hospitalClinic?: string | null;
  checkInTime?: string | null;
  visitDateOnly?: string;
  gpsLocation?: { latitude: number | null; longitude: number | null; label?: string | null };
};

// Item A (post-launch robustness round) -- real download-count metrics
// backing the Activities dashboard's "E-Detailing VA Session Metrics"
// panel (GET /company/edetailing-summary). Deliberately has no
// duration/engagement field -- none is ever recorded.
export type ChemistCallToday = {
  id: string;
  employeeCode: string;
  employeeName: string;
  chemistName: string;
  visitDate: string;
  pob: { productName: string; qty: number }[];
};

export type DispatchToday = {
  id: string;
  employeeCode: string;
  employeeName: string;
  type: "INPUT" | "SAMPLE";
  dispatchDate: string;
  status: "Pending" | "Received";
  itemCount: number;
  totalQty: number;
};

// Activity Reports rebuild round -- Territory >> View / Status, matching
// sanpharma.info's own screens exactly (see company.routes.ts for the
// field-derivation notes and disclosed scoping decisions).
export type TerritoryViewDoctorRow = {
  name: string;
  specialty: string;
  category: string;
  qual: string;
  class: string;
};
export type TerritoryViewGroup = { territoryName: string; rows: TerritoryViewDoctorRow[] };
export type TerritoryView = {
  fieldForceName: string;
  designation: string;
  hq: string;
  territories: TerritoryViewGroup[];
};
export type TerritoryStatusRow = {
  fieldForce: string;
  hq: string;
  totalDrs: number;
  noOfPlans: number;
  allocatedDrs: number;
  notAllocatedDrs: number;
};

// Activity Reports rebuild round -- Survey module, matching
// sanpharma.info's Create - Question / Create - Survey / Update - Survey
// screens exactly.
export type SurveyQuestionControlType = "Enterable - Text" | "Enterable - Numeric" | "Selectable - Single" | "Selectable- Multiple";
export type SurveyQuestion = {
  id: string;
  questionText: string;
  controlType: SurveyQuestionControlType;
  maxLength?: number | null;
  options?: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};
export type SurveyQuestionRef = {
  questionId: string;
  drs: boolean;
  chm: boolean;
  hos: boolean;
  stk: boolean;
  prd: boolean;
};
export type Survey = {
  id: string;
  title: string;
  processFromDate: string;
  processToDate: string;
  questions: SurveyQuestionRef[];
  questionCount: number;
  status: "ACTIVE" | "INACTIVE";
  processed: boolean;
  processedAt: string | null;
  closed: boolean;
  closedAt: string | null;
  createdAt: string;
};
export type SurveyDetail = Omit<Survey, "questions"> & {
  questions: (SurveyQuestionRef & { question: SurveyQuestion | null })[];
};

export type SurveyViewRow = {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  hq: string;
  doj: string | null;
};
export type SurveyViewCounts = { drs: number; chm: number; stk: number; hos: number; prd: number };
export type SurveyViewResult = {
  surveyTitle: string;
  mode?: "Question Wise" | "Answer Wise";
  rows: (SurveyViewRow & { counts?: SurveyViewCounts })[];
};

// Round 34 -- Activity Reports > TP / DCR, real legacy-parity report
// screens. See company.routes.ts for the honest schema-reality
// disclosures (pobIsApproximated / nonListedUnsupported /
// stockistUnsupported / unsupportedCodes) that these types surface as-is
// rather than hiding.
export type TpDayStatus = { day: number; kind: string; label: string };
export type TpConsolidatedColumn = {
  employeeCode: string;
  name: string;
  designation: string;
  hq: string;
  days: TpDayStatus[];
};
export type TpConsolidatedView = {
  fieldForceName: string;
  month: string;
  columns: TpConsolidatedColumn[];
};

export type TpViewDay = {
  day: number;
  date: string;
  workType: string;
  territory: string;
  type: string;
  jointWork: string;
  objective: string;
  managerJfw: string;
};
export type TpViewResult = {
  employee: { name: string; designation: string; hq: string };
  status: string;
  completedAt: string | null;
  confirmedAt: string | null;
  summary: { hqDays: number; exDays: number; osDays: number; holidaySunday: number; others: number };
  days: TpViewDay[];
};

export type R41Settings = { dcrDelayDays: number; categoryNorms: { NIL: number; CORE: number; "N CORE": number; "S CORE": number }; companyTimezone: string };
export type TpStatusStateGroup = { state: string; total: number; submitted: number; approved: number; notSubmitted: number; rows: TpStatusRow[] };
export type TpStatusRow = {
  employeeCode: string;
  name: string;
  designation: string;
  hq: string;
  status: string;
  entryDate: string | null;
  approvedDate: string | null;
};

export type TpDatewiseRow = {
  employeeCode: string;
  name: string;
  designation: string;
  hq: string;
  state: string;
  joinDate: string | null;
  perDay: Record<number, { kind: string; label: string }>;
};
export type TpDatewiseResult = {
  fieldForceName: string;
  month: string;
  days: number[];
  rows: TpDatewiseRow[];
};

export type DcrViewMode =
  | "all-doctors" | "dcr-dates" | "all-remarks" | "detailed"
  | "listed-doctor-remarks" | "not-approved-dates" | "tp-my-day-plan"
  | "rcpa-view" | "reminder-calls";

export type DcrViewDatePickerRow = {
  employeeCode: string;
  doctorName: string;
  visitDate: string;
  callSession: string;
  status: string;
  notes: string;
};
export type DcrViewRcpaRow = { employeeCode: string; fieldForceName: string; doctorName: string; chemistName: string; ourProduct: string; ourQty: number; competitorProduct: string; competitorQty: number; visitDate: string };
export type DcrViewReminderRow = { employeeCode: string; fieldForceName: string; doctorName: string; visitDate: string; followUpDate: string; callSession: string; status: string; notes: string };
export type DcrViewRemarkRow = { date: string; remarks: string };
export type DcrViewDetailedDay = {
  date: string;
  submitted: boolean;
  territory?: string;
  startTime?: string;
  endTime?: string;
  workType?: string;
  listedDrMet?: number;
  listedDrPob?: number;
  chemistMet?: number;
  chemistPob?: number;
  stockistMet?: number;
  nonListedDrMet?: number;
};
export type DcrViewDoctorRow = { employeeCode: string; doctorName: string; count: number };
export type DcrViewResult = {
  mode: DcrViewMode;
  needsDate?: boolean;
  rows?: (DcrViewDatePickerRow | DcrViewRemarkRow | DcrViewDoctorRow | DcrViewRcpaRow | DcrViewReminderRow)[];
  days?: DcrViewDetailedDay[];
  employee?: { name: string; designation: string; hq: string } | null;
  pobIsApproximated?: boolean;
  nonListedUnsupported?: boolean;
  stockistUnsupported?: boolean;
  totals?: { submittedDays: number; listedDrMet: number; chemistMet: number; avgListedDrMetPerSubmittedDay: number };
};

export type DcrStatusDay = { day: number; code: string; sd?: number | null; drs?: number | null };
export type DcrStatusRow = {
  employeeCode: string;
  name: string;
  designation: string;
  hq: string;
  joinDate: string | null;
  perDay: DcrStatusDay[];
  noOfDaysPresent: number;
};
export type DcrStatusResult = {
  rows: DcrStatusRow[];
  days: number[];
  detailed: boolean;
  periodwise: boolean;
  rangeStart: string;
  rangeEnd: string;
  unsupportedCodes: string[];
  legend?: { code: string; name: string; category?: string }[];
};

// Round 35 -- 7 more DCR legacy-parity reports + the Customized Report
// builder. See company.routes.ts for the honest schema-reality
// disclosures these types surface as-is.
export type DcrNotApprovedRow = { fieldForceName: string; region: string; pendingDates: string; approvalBy: string };

export type DcrNotSubmittedRow = { day: number; expected: string };

export type DcrCountModewiseChannel = { date: string; count: number };
export type DcrCountModewiseRow = {
  employeeCode: string; name: string; hq: string; designation: string;
  desktop: DcrCountModewiseChannel; mobile: DcrCountModewiseChannel; apps: DcrCountModewiseChannel;
  edetailing: DcrCountModewiseChannel; others: DcrCountModewiseChannel; iosEdet: DcrCountModewiseChannel;
};

export type DcrRejectApproveRow = {
  fieldForceName: string; hq: string; designation: string; mode: "Approve" | "Reject";
  actionDate: string | null; workType: string; reason: string; actedAt: string | null;
};

export type DcrTimeStatusDay = {
  day: number; workType: string; startTime: string; closeTime: string; duration: string;
  drCall: string; chemistCall: string; filledDate: string;
};
export type DcrTimeStatusRow = {
  employeeCode: string; name: string; designation: string; hq: string; joinDate: string | null;
  perDay: DcrTimeStatusDay[];
};

export type DcrCheckinCheckoutRow = { date: string; name: string; checkIn: string; checkOut: string; lat?: number; lng?: number };

// Customized Report builder
export type CustomReportSummary = { id: string; name: string; defaultParams: string[]; parameterCount: number };
export type CustomReportMetricCategory = { category: string; metrics: { key: string; label: string }[] };
export type CustomReportMetadata = {
  categories: CustomReportMetricCategory[];
  specialties: string[];
  campaigns: string[];
  campaignsUnsupported: boolean;
  products: string[]; // Round 37 Item 2
  brands: string[];
};
export type CustomReportDetail = { id: string; name: string; defaultParams: string[]; metrics: string[] };
export type CustomReportOutputMetric = { key: string; label: string; computed: boolean; value: number | string | null };
export type CustomReportOutput = { reportName: string; employeeCode?: string; month?: string; metrics: CustomReportOutputMetric[] };

export type EdetailingSummary = {
  downloadsToday: number;
  downloadsThisWeek: number;
  distinctRepsThisWeek: number;
  topSlides: { fileName: string; brand: string; count: number }[];
  topReps: { employeeCode: string; employeeName: string; count: number }[];
};

export type DcrFilters = {
  visitOutcome?: string;
  callSession?: string;
  employeeCode?: string;
};

export type ManagerActivityRecord = {
  manager: Pick<Employee, "id" | "name" | "role">;
  approved: number;
  rejected: number;
  autoApproved: number;
  pending: number;
  autoApproveRate: number;
  flagged: boolean;
};

function toQueryString(filters?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export type MasterField = {
  key: string;
  label: string;
  type?: "string" | "number" | "date";
  options?: string[];
  sourceMaster?: string;
  sourceField?: string;
  computed?: { fromField: string; sourceMaster: string; lookupField: string; displayField: string };
  detailOnly?: boolean;
};
export type MasterSchema = { key: string; title: string; fields: MasterField[]; keyFields: string[]; uiKind?: "table" | "approvalQueue" | "reportFilter" | "changePassword" | "vacantMrLogin" | "vacantMrPermission" | "loginAsEmployee" | "notificationSend" | "upload" | "mailBox" | "quizAuthoring" | "dashboardBuilder" | "doctorCampaignFilter" | "tpDelete" | "dcrEdit" | "mailDelete" | "leaveCancellation" | "deviceIdDeletion" | "drUniqueNoGeneration" | "chemistReleaseLockMonthwise" | "autoMailSetup" | "screenAccessSetup" | "baseLevelSetup" | "managerSetup"; approvalActionColumnLabel?: string; approvalLinkText?: string; approvalLinkDateSuffix?: boolean; atAGlance?: boolean };
export type MasterRecord = { id: string; tenantSlug?: string; createdAt?: string; updatedAt?: string } & Record<string, unknown>;

export type MailRecord = {
  id: string;
  tenantSlug?: string;
  fromEmployeeCode?: string;
  fromName?: string | null;
  toEmployeeCode?: string;
  toName?: string | null;
  subject: string;
  body?: string;
  folder: string;
  sentAt?: string;
  readAt?: string | null;
  status?: "Read" | "Unread";
  createdAt?: string;
  updatedAt?: string;
};

// Real quiz authoring + scoring — GET/POST/PUT/DELETE /company/quiz and its
// :id/attempts sub-resource (see quiz.routes.ts on the backend). A question
// always carries correctOptionIndex in the admin view returned here; the
// backend keeps a separate rep-facing shape (without it) ready for reuse
// once a field-rep-facing "take the quiz" screen exists.
export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
};

export type QuizRecord = {
  id: string;
  tenantSlug?: string;
  title: string;
  description?: string;
  isActive: boolean;
  questions: QuizQuestion[];
  category?: string | null;
  effectiveDate?: string | null;
  month?: string | null;
  year?: string | null;
  processFromDate?: string | null;
  processToDate?: string | null;
  uploadedFileName?: string | null;
  uploadedMimeType?: string | null;
  processed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Real dashboard-builder — /company/dashboards (see dashboard.routes.ts /
// dashboard.model.ts). Backs the "Options > Dashboard" screen.
export type DashboardModule = "Master KPI" | "Marketing KPI" | "Sales KPI";
export type DashboardChartType = "pie" | "donut" | "bar" | "line" | "area" | "funnel" | "table";

export type DashboardWidget = {
  widgetName: string;
  category: string;
  dimension: string;
  splitBy?: string;
  chartType: DashboardChartType;
};

export type DashboardRecord = {
  id: string;
  tenantSlug?: string;
  name: string;
  module: DashboardModule;
  widgets: DashboardWidget[];
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardWidgetTreeNode = { category: string; dimensions: string[] };

export type DashboardWidgetData = { labels: string[]; values: number[]; total: number; note?: string; fieldForceSupported?: boolean };

export type QuizAttemptRecord = {
  id: string;
  tenantSlug?: string;
  quizId: string;
  employeeCode: string;
  answers: { questionIndex: number; selectedOptionIndex: number }[];
  score: number;
  totalPossible: number;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Round 9 item 1 — shared employee-list cache backing apiClient.employees()
// (see its definition below for why). 30s is long enough that navigating
// between screens/dropdowns in normal use feels instant, short enough that
// a genuinely new employee shows up on the next natural page load.
const EMPLOYEES_CACHE_TTL_MS = 30_000;
let employeesCache: { promise: Promise<ApiEnvelope<Employee[]>>; at: number } | null = null;
export function invalidateEmployeesCache() {
  employeesCache = null;
}

export type AuditLogEntry = {
  id: string;
  module: string;
  entityName: string;
  entityType: string;
  changeType: string;
  action: string;
  updatedBy: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
};

export type ActivitiesSummary = {
  date: string;
  totalCallsLoggedToday: number;
  totalCallsLoggedYesterday: number;
  callsDeltaPct: number | null;
  doctorDetailingVisitsToday: number;
  gpsNotCapturedToday: number;
  gpsNotCapturedDetailingToday: number;
  chemistStockistOrdersToday: number;
  chemistStockistOrderQtyToday: number;
  chemistStockistOrderValueToday: number;
  chemistStockistOrderValuePartial: boolean;
  pendingApprovals: { leave: number; expense: number; tourPlan: number; deviation: number; total: number };
};

// Round 37 Items 3/4/5 -- Manager Analysis types.
export type ManagerAnalysisManager = { employeeCode: string; name: string; designation: string; territory: string; joinDate: string | null };
export type DayCallsSummary = {
  calendarDays: number; sundaysHolidays: number; workingDaysExclHolSun: number; fieldworkDays: number; noFieldworkDays: number;
  leave: number; tpDeviationDays: number; listedDrsMet: number; listedDrsSeen: number; callAverage: number;
  morningCalls: number; eveningCalls: number; bothCalls: number; nilDrsMet: number; coreDrsMet: number; nCoreDrsMet: number; sCoreDrsMet: number;
};
export type HqExOsRow = {
  hqName: string; repName: string; employeeCode: string;
  perMonth: Record<string, { daysWorked: { hq: number; ex: number; os: number; total: number }; totalDoctorCalls: { hq: number; ex: number; os: number; total: number } }>;
  totals: { daysWorked: { hq: number; ex: number; os: number; total: number }; totalDoctorCalls: { hq: number; ex: number; os: number; total: number } };
};
export type DetailRow = {
  employeeCode: string; name: string; designation: string; hq: string; doj: string | null;
  startDcrDate: string | null; lastDcrDate: string | null;
  perMonth: Record<string, { fwDays: number; nfwDays: number; v1: number; v2: number; missed: number; morningCalls: number; eveningCalls: number; bothCalls: number; met: number; totalCalls: number; avgCalls: number }>;
};
export type HqCoverageResult = {
  mode: string; fieldForceName?: string; designation?: string; hq?: string; doj?: string | null; months: string[];
  summaryPerMonth?: Record<string, DayCallsSummary>; summaryTotal?: DayCallsSummary;
  noRecordsFound?: boolean;
  hqRows?: HqExOsRow[];
  detailRows?: DetailRow[];
};
export type CoverageAnalysis1Result = {
  fieldForceName: string; designation: string; hq: string; month: string;
  callDetails: { masterListDoctors: number; doctorsMet: number; coveragePct: number; listedDrsMissed: number; unlistedDrsMet: number };
  attendance: { daysWorked: number; daysField: number; daysNonField: number; daysOnLeave: number };
  summary: { doctorsCallsSeen: number; doctorsCallAverage: number; chemistCallsSeen: number; chemistCallAverage: number };
  jointWork: { days: number; callsMet: number; callsSeen: number; callAverage: number };
  repeatedCalls: { met: number; coveragePct: number };
};
export type JointWorkEntry = { days: number; dates: string[]; calls: number } | null;
export type JointWorkChainRow = { employeeCode: string; name: string; hq: string; designation: string; joinDate: string | null; perMonth: Record<string, JointWorkEntry> };
export type JointWorkRepRow = { employeeCode: string; name: string; hq: string; designation: string; joinDate: string | null; perMonth: Record<string, JointWorkEntry>; chain: JointWorkChainRow[] };
export type JointWorkResult = {
  mode: string; months: string[];
  managerRow?: { employeeCode: string; name: string; hq: string; designation: string; joinDate: string | null; perMonth: Record<string, JointWorkEntry> };
  repRows?: JointWorkRepRow[];
};

// Round 38 Items 1/2/3 -- Manager Analysis continued, types.
export type FieldworkManagerAnalysisRow = {
  employeeCode: string; name: string; designation: string; hq: string; joinDate: string | null; firstLevelManager: string | null;
  perMonth: Record<string, Record<string, number>>;
};
export type FieldworkManagerAnalysisResult = {
  fieldForceName: string; designation: string; hq: string; months: string[]; rows: FieldworkManagerAnalysisRow[];
};
export type ManagerWiseCoverageRow = {
  employeeCode: string; name: string; designation: string; hq: string;
  callDetails: { masterListDoctors: number; doctorsMet: number; coveragePct: number; listedDrsMissed: number; unlistedDrsMet: number };
  attendance: { daysWorked: number; daysField: number; daysNonField: number; daysOnLeave: number };
  summary: { doctorsCallsSeen: number; doctorsCallAverage: number; chemistCallsSeen: number; chemistCallAverage: number };
  jointWork: { days: number; callsMet: number; callsSeen: number; callAverage: number };
  repeatedCalls: { met: number; coveragePct: number };
};
export type ManagerWiseCoverageResult = {
  fieldForceName: string; designation: string; hq: string; months: string[]; rows: ManagerWiseCoverageRow[]; resultShapeIsInference: boolean;
};
export type VisitFrequencyBucket = { v1: number; v2: number; v3: number; vMore: number };
export type SpecialityCategoryVisitResult = {
  mode: "Specialitywise Visit" | "Categorywise Visit"; fieldForceName: string; months: string[];
  specialties?: string[]; categories?: string[];
  perMonth: Record<string, Record<string, VisitFrequencyBucket>>;
};

// Round 39 -- MIS Reports > Analysis (DCR / Visit Analysis / Sales Details /
// POB Wise / POB Wise - Periodically). Mirrors src/utils/mis-reports-compute.ts.
export type MisTeamMember = { employeeCode: string; name: string; designation: string; territory: string };
export type DcrAnalysisRow = {
  date: string; submittedDate: string | null; workType: string; workedWith: string; jointCalls: number; asPerTp: number;
  worked: number; dev: number; listedDrMet: number; listedDrUnique: number; drsPob: number; unlistDrMet: number;
  chemistMet: number; chemistPob: number; stockistMet: number; startTime: string; endTime: string;
};
export type DcrAnalysisReportData = {
  employee: { employeeCode: string; name: string; designation: string; hq: string };
  month: string;
  rows: DcrAnalysisRow[];
  totals: { jointCalls: number; asPerTp: number; worked: number; dev: number; listedDrMet: number; listedDrUnique: number; drsPob: number; unlistDrMet: number; chemistMet: number; chemistPob: number; stockistMet: number };
  delayed: { lockedDate: string | null; releasedDate: string | null; locks?: { date: string; lockedAt: string | null; releasedAt: string | null; releasedBy: string | null; reason: string }[] };
  workTypeDays: { label: string; days: number }[];
  callsDetails: {
    totalDoctors: number; doctorsMet: number; totalCallsSeen: number; nlDrsMet: number; coveragePct: number; callAverage: number;
    tpDeviation: number; jointWorkDays: number; jointWorkCallAvg: number; chemistPobValue: number; chemistMet: number; chemistSeen: number; chemistCallAvg: number;
  };
  jointWorkDetails: { rows: { name: string; dates: number; calls: number }[]; total: { dates: number; calls: number } };
};
export type DcrAnalysisResult = { month: string; reports: DcrAnalysisReportData[]; truncated: boolean };
export type VisitBlock = { list: number; met: number; seen: number };
export type VisitAnalysisRow = {
  employeeCode: string; name: string; designation: string; hq: string; doj: string | null; lastDcr: string | null; month: string; group: string;
  total: VisitBlock; v1: VisitBlock; v2: VisitBlock; morning: number; evening: number; both: number; callAvg: number;
  met1: number; met2: number; metAbove2: number; missed: number;
  daywise: { avail: number; fieldWork: number; leave: number; other: number };
  territory: { hq: number; ex: number; os: number };
};
export type VisitAnalysisResult = {
  type: "Category" | "Speciality" | "Class" | "Campaign"; groups: string[]; rows: VisitAnalysisRow[]; campaignsAvailable: boolean;
  level: string; months: string[]; fieldForceName: string; designation: string; hq: string; memberCount: number;
};
export type SalesTriple = { total: number; visited: number; productive: number; missed: number; missedPct: number };
export type SalesEmployeeRow = { employeeCode: string; name: string; designation: string; hq: string; listed: SalesTriple; unlisted: SalesTriple; chemist: SalesTriple; isSelf?: boolean };
export type SalesCell = { till: number; today: number; total: number };
export type SalesStateRow = { state: string; listed: SalesCell; unlisted: SalesCell; chemist: SalesCell; totalSalesValue: number };
export type SalesDetailsResult = {
  mode: string; month: string; states?: SalesStateRow[]; state?: string; rows?: SalesEmployeeRow[];
  fieldForceName?: string; designation?: string; hq?: string;
};
export type PobCell = { drs: number; chem: number; products: Record<string, number> };
export type PobWiseRow = { employeeCode: string; name: string; designation: string; hq: string; joinDate: string | null; perMonth: Record<string, PobCell>; total: PobCell };
export type PobWiseResult = {
  months: string[]; products: string[]; rows: PobWiseRow[]; grandTotal: { perMonth: Record<string, PobCell>; total: PobCell };
  mode: string; fieldForceName: string; designation: string; hq: string;
};
export type PobPeriodicRow = {
  employeeCode: string; name: string; designation: string; hq: string; joinDate: string | null;
  fwd: number; morning: number; evening: number; drsSeen: number; callAvg: number; drsPob: number; chemPob: number; products: Record<string, number>;
};
export type PobPeriodicResult = {
  rows: PobPeriodicRow[];
  totals: { fwd: number; morning: number; evening: number; drsSeen: number; callAvg: number; drsPob: number; chemPob: number; products: Record<string, number> };
  products: string[]; from: string; to: string; fieldForceName: string; designation: string; hq: string;
};

// Round 40 -- MIS Reports: Work Hygiene, Class Wise View, Missed Call, Single
// Doctor, Rep Vs Manager, Review Report, Assessment Report (DCR dump is a
// file download). Mirrors src/utils/mis-reports-2-compute.ts.
export type WorkHygieneRow = {
  employeeCode: string; name: string; designation: string; hq: string; doj: string | null; firstLevelManager: string | null; secondLevelManager: string | null;
  lastDcrDate: string | null; fwd: number; leave: number; listedVisits: number; listedCallAvg: number; unlistedVisits: number; unlistedCallAvg: number;
  cumulativeCallAvg: number; dcrSubmittedDays: number; approvalPendingDates: number; delayReportingDates: number; totalDelayReporting: number;
  joint: Record<string, number>; isSelected: boolean;
};
export type WorkHygieneResult = { month: string; designations: string[]; rows: WorkHygieneRow[]; fieldForceName: string; designation: string; hq: string };
export type ClassWiseRow = { doctorName: string; speciality: string; category: string; className: string; territory: string; perMonth: Record<string, { amount: number; className: string }>; total: number };
export type ClassWiseResult = { months: string[]; rows: ClassWiseRow[]; grandTotal: number; fieldForceName: string; designation: string; hq: string };
export type MissedListedRow = { employeeCode: string; name: string; designation: string; hq: string; depth: number; isManager: boolean; perMonth: Record<string, { list: number; met: number; missed: number }> };
export type MissedCallResult = {
  mode: string; fieldForceName?: string; months?: string[]; rows?: MissedListedRow[];
  employee?: { employeeCode: string; name: string; designation: string; hq: string }; month?: string;
  missedDoctors?: { name: string; category: string }[];
  summary?: { listedDrsInList: number; callsMet: number; callsSeen: number; listedDrsMissed: number; byCategory: Record<string, { total: number; met: number; missed: number }> };
  visitDetails?: { one: number; two: number; three: number; moreThanThree: number };
};
export type ForceDoctor = { id: string; name: string };
export type SingleDoctorMonth = {
  visits: { date: string; time: string; session: string; workedWith: string }[];
  detailed: { name: string; count: number }[]; sampled: { name: string; qty: number }[]; inputs: { name: string; qty: number }[];
  remarks: string[]; business: number;
  rx: { name: string; qty: number }[];
  rcpa: { date: string; chemist: string; ourProduct: string; ourQty: number; competitorProduct: string; competitorQty: number }[];
  crm: { date: string; type: string; amountRs: number; status: string; approvedBy: string }[];
};
export type SingleDoctorResult = {
  employee: { employeeCode: string; name: string; designation: string; hq: string }; months: string[];
  profile: { doctorName: string; address: string; mobile: string; email: string; hospitalAddress: string; category: string; speciality: string; className: string; qualification: string; campaignName: string; drUniqueCode: string; supportiveChemists: string[] };
  perMonth: Record<string, SingleDoctorMonth>;
};
export type RepVsManagerMetrics = { fwDays: number; doctorsMet: number; coveragePct: number; callAverage: number; chemistsMet: number; jointWorkDays: number };
export type RepVsManagerResult = {
  month: string;
  manager: { employeeCode: string; name: string; designation: string; hq: string; metrics: RepVsManagerMetrics };
  rows: { employeeCode: string; name: string; designation: string; hq: string; rep: RepVsManagerMetrics; withThisManager: { jointDays: number; jointCalls: number } }[];
};
export type ReviewReportResult = {
  month: string;
  employee: { name: string; employeeCode: string; designation: string; hq: string; state: string; division: string; isManager: boolean };
  metrics: Record<string, number | string>; top5: { name: string; count: number }[]; inputSpent: number;
  secondaryRows: { product: string; qty: number; value: number }[];
  delayedDates: { date: string; days: number; kind: "late-submitted" | "locked-outstanding" }[];
};
export type AssessmentResult = { months: string[]; employee: { employeeCode: string; name: string; designation: string; hq: string }; cols: Record<string, Record<string, string>> };

// ── Round 42 -- POB/Rx screens and Heat Analysis ───────────────────────
export type PobRxEmployee = { employeeCode: string; name: string; designation: string; hq: string; doj: string | null } | null;
export type PobRxProductWiseResult = {
  mode: "Doctors" | "Chemists"; months: string[]; employee: PobRxEmployee;
  products: { sno: number; name: string; pack: string; perMonth: Record<string, { qty: number; rate: number | null; value: number }>; total: { qty: number; value: number } }[];
  totals: { perMonth: Record<string, { qty: number; value: number }>; total: { qty: number; value: number } };
};
export type PobRxFieldforceWiseResult = {
  mode: "Doctors" | "Chemists"; months: string[]; employee: PobRxEmployee;
  rows: { employeeCode: string; name: string; hq: string; designation: string; isManager: boolean; perMonth: Record<string, { qty: number; value: number }>; total: { qty: number; value: number } }[];
};
export type PobRxDayCell = { drs: number; che: number; qty: number; value: number };
export type PobRxDayWiseResult = {
  mode: "Datewise" | "Productwise"; month: string; days: number; employee: PobRxEmployee;
  rows: { employeeCode: string; name: string; hq: string; designation: string; isManager: boolean; product?: string; perDay: PobRxDayCell[]; total: PobRxDayCell }[];
};
export type HeatKind = "drs" | "products";
export type HeatResult = {
  kind: HeatKind; months: number; from: string; to: string;
  employee: { employeeCode: string; name: string; designation: string; hq: string };
  rows: { sno: number; employeeCode: string; name: string; designation: string; hq: string; cnt: number; isSelected: boolean }[];
};

// Round 44 -- MIS Reports > Visit Details
export type VisitMode = "Category" | "Speciality" | "Class" | "Listed Doctor" | "Campaign" | "Doctor Type";
export type VisitDetailOptions = { specialities: string[]; campaigns: string[]; doctorTypes: string[]; categories: string[]; classes: string[] };
export type VisitCell = { list: number; met: number; seen: number; missed: number };
export type CatClsVisitResult = {
  mode: VisitMode; months: string[]; values: string[]; grouped: boolean; withVacants: boolean;
  employee: { employeeCode: string; name: string; designation: string; hq: string };
  rows: { sno: number; employeeCode: string; name: string; designation: string; hq: string; subDivision: string; isManager: boolean; isVacant: boolean;
    perMonth: Record<string, { total: VisitCell; groups: Record<string, VisitCell> }> }[];
};
export type DateWiseDoctor = { name: string; territory: string; qualification: string; category: string; specialty: string; cls: string };
export type DateWiseResult = {
  month: string; numDays: number; employee: { employeeCode: string; name: string; designation: string; hq: string };
  weeks: { week: number; from: number; to: number; label: string }[];
} & (
  | { matrix: false; rows: (DateWiseDoctor & { sno: number; days: Record<string, number>; total: number })[] }
  | { matrix: true; week: { week: number; from: number; to: number; label: string };
      days: { day: number; weekday: string; status: string; calls: (DateWiseDoctor & { time: string; products: string })[] }[] }
);

// Round 45 -- Quiz Test Result, Summary dumps, Digital Detailing, Slide Analysis, Drs Analyis
export type QuizResultResult = {
  month: string; scope: "Team" | "Individual"; days: { day: number; label: string }[];
  employee: { employeeCode: string; name: string; designation: string; hq: string };
  rows: { sno: number; employeeCode: string; doj: string; name: string; designation: string; hq: string; firstManager: string; secondManager: string; perDay: Record<string, { total: number; correct: number; pct: number }> }[];
};
export type DetailingOptions = { brands: string[]; products: string[] };
export type DetailingBase = { employeeCode: string; name: string; designation: string; hq: string };
export type DetailingVisitResult = {
  month: string; mode: "Brand" | "Product"; names: string[]; employee: DetailingBase;
  rows: { sno: number; label: string; employeeCode: string; name: string; hq: string; designation: string; groups: Record<string, { drs: number; one: number; two: number; more: number }> }[];
};
export type StarRatingResult = {
  month: string; brands: string[]; employee: DetailingBase;
  rows: { sno: number; label: string; employeeCode: string; name: string; hq: string; designation: string; groups: Record<string, { stars: number[]; nil: number }> }[];
};
export type SlideFilterKind = "ALL" | "Doctor Speciality" | "Doctor Category" | "Doctor Qualification" | "Doctor Class" | "Doctor Territory" | "Product / Brand";
export type SlideAnalysisOptions = Record<Exclude<SlideFilterKind, "ALL">, string[]>;
export type SlideAnalysisResult = {
  months: string[]; basedOn: "Product" | "Brand"; filterKind: SlideFilterKind; filterValue: string; columns: string[]; employee: DetailingBase;
  rows: { sno: number; employeeCode: string; employeeName: string; doctor: string; speciality: string; category: string; cls: string; territory: string; qualification: string;
    cells: Record<string, { views: number; seconds: number }>; totalViews: number; totalSeconds: number }[];
};
export type DrsAnalysisResult = {
  months: string[]; employee: DetailingBase;
  rows: { sno: number; employeeCode: string; name: string; designation: string; hq: string; perMonth: Record<string, { total: number; met: number; edet: number; pct: number }> }[];
};

export type HqVisitColor = "green" | "red" | "yellow";
export type HqVisitResult = {
  months: number; from: string; to: string; designations: string[];
  employee: { employeeCode: string; name: string; designation: string; hq: string };
  rows: { sno: number; employeeCode: string; name: string; designation: string; hq: string; cells: Record<string, HqVisitColor> }[];
};

export const apiClient = {
  // Round 39 item 1 -- fired when a login page opens so a sleeping backend
  // starts waking while the user types credentials.
  warmUp() { return fetch(`${API_BASE_URL}/health`, { cache: "no-store" }).catch(() => undefined); },
  login(username: string, password: string) {
    return request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, portal: "COMPANY_ADMIN" })
    });
  },

  dashboard() {
    return request<CompanyDashboard>("/company/dashboard");
  },

  // Round F item 1 — real live numbers for the Activities landing page's 4
  // stat cards (previously 100% hardcoded).
  activitiesSummary() {
    return request<ActivitiesSummary>("/company/activities/summary");
  },

  // Item A (post-launch robustness round)
  edetailingSummary() {
    return request<EdetailingSummary>("/company/edetailing-summary");
  },

  // Item 4 (post-launch robustness round) -- real backing for the
  // Activities dashboard's "Chemist Orders & POB" / "Sample / Promo
  // Dispatches" tabs.
  chemistCallsToday() {
    return request<ChemistCallToday[]>("/company/chemist-calls-today");
  },
  dispatchesToday() {
    return request<DispatchToday[]>("/company/dispatches-today");
  },

  // Activity Reports rebuild round -- Territory >> View / Status.
  territoryView(employeeCode: string) {
    return request<TerritoryView | null>(`/company/reports/territory-view?employeeCode=${encodeURIComponent(employeeCode)}`);
  },
  territoryStatus(employeeCode?: string) {
    const qs = employeeCode ? `?employeeCode=${encodeURIComponent(employeeCode)}` : "";
    return request<TerritoryStatusRow[]>(`/company/reports/territory-status${qs}`);
  },

  // Activity Reports rebuild round -- Survey module.
  surveyQuestions() {
    return request<SurveyQuestion[]>("/company/survey-questions");
  },
  createSurveyQuestion(body: { questionText: string; controlType: SurveyQuestionControlType; maxLength?: number | null; options?: string[] }) {
    return request<SurveyQuestion>("/company/survey-questions", { method: "POST", body: JSON.stringify(body) });
  },
  deactivateSurveyQuestion(id: string) {
    return request<SurveyQuestion>(`/company/survey-questions/${id}/deactivate`, { method: "PATCH" });
  },
  surveys() {
    return request<Survey[]>("/company/surveys");
  },
  survey(id: string) {
    return request<SurveyDetail>(`/company/surveys/${id}`);
  },
  createSurvey(body: { title: string; processFromDate: string; processToDate: string; questions: SurveyQuestionRef[] }) {
    return request<Survey>("/company/surveys", { method: "POST", body: JSON.stringify(body) });
  },
  updateSurvey(id: string, body: { title?: string; processFromDate?: string; processToDate?: string; questions?: SurveyQuestionRef[] }) {
    return request<Survey>(`/company/surveys/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  deactivateSurvey(id: string) {
    return request<Survey>(`/company/surveys/${id}/deactivate`, { method: "PATCH" });
  },
  processSurvey(id: string) {
    return request<Survey>(`/company/surveys/${id}/process`, { method: "PATCH" });
  },
  closeSurvey(id: string) {
    return request<Survey>(`/company/surveys/${id}/close`, { method: "PATCH" });
  },
  surveyView(surveyId: string, employeeCode: string, mode?: "Question Wise" | "Answer Wise") {
    const modeParam = mode ? `&mode=${encodeURIComponent(mode)}` : "";
    return request<SurveyViewResult>(`/company/surveys/${surveyId}/view?employeeCode=${encodeURIComponent(employeeCode)}${modeParam}`);
  },

  // Round 34 -- Activity Reports > TP / DCR real report endpoints.
  tpConsolidatedView(params: { employeeCode: string; month: string; allBaseLevel: boolean }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, allBaseLevel: String(params.allBaseLevel) });
    return request<TpConsolidatedView | null>(`/company/reports/tp-consolidated-view?${qs.toString()}`);
  },
  tpView(params: { employeeCode: string; month: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month });
    return request<TpViewResult | null>(`/company/reports/tp-view?${qs.toString()}`);
  },
  tpStatus(params: { employeeCode: string; month: string; withVacants: boolean }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, withVacants: String(params.withVacants) });
    return request<TpStatusRow[]>(`/company/reports/tp-status?${qs.toString()}`);
  },
  tpStatusStatewise(params: { employeeCode?: string; month: string; withVacants: boolean }) {
    const qs = new URLSearchParams({ month: params.month, withVacants: String(params.withVacants), statewise: "true", ...(params.employeeCode ? { employeeCode: params.employeeCode } : {}) });
    return request<{ states: TpStatusStateGroup[] }>(`/company/reports/tp-status?${qs.toString()}`);
  },
  tpDatewise(params: { employeeCode: string; month: string; days: number[] }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, days: params.days.join(",") });
    return request<TpDatewiseResult | null>(`/company/reports/tp-datewise?${qs.toString()}`);
  },
  dcrView(params: { employeeCode: string; month?: string; mode: DcrViewMode; date?: string; onlyVacantManagers?: boolean }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, mode: params.mode });
    if (params.month) qs.set("month", params.month);
    if (params.date) qs.set("date", params.date);
    if (params.onlyVacantManagers) qs.set("onlyVacantManagers", "true");
    return request<DcrViewResult | null>(`/company/reports/dcr-view?${qs.toString()}`);
  },
  dcrStatus(params: { employeeCode: string; month?: string; fromDate?: string; toDate?: string; periodwise?: boolean; detailed?: boolean; withVacants?: boolean; onlyManagers?: boolean }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode });
    if (params.month) qs.set("month", params.month);
    if (params.fromDate) qs.set("fromDate", params.fromDate);
    if (params.toDate) qs.set("toDate", params.toDate);
    if (params.periodwise) qs.set("periodwise", "true");
    if (params.detailed) qs.set("detailed", "true");
    if (params.withVacants) qs.set("withVacants", "true");
    if (params.onlyManagers) qs.set("onlyManagers", "true");
    return request<DcrStatusResult | null>(`/company/reports/dcr-status?${qs.toString()}`);
  },

  // Round 35 -- 7 more DCR legacy-parity reports.
  dcrNotApproved(params: { month: string }) {
    const qs = new URLSearchParams({ month: params.month });
    return request<DcrNotApprovedRow[]>(`/company/reports/dcr-not-approved?${qs.toString()}`);
  },
  dcrNotSubmitted(params: { employeeCode: string; month: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month });
    return request<DcrNotSubmittedRow[]>(`/company/reports/dcr-not-submitted?${qs.toString()}`);
  },
  dcrCountModewise(params: { employeeCode: string; month: string; mode: "countwise" | "datewise" }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, mode: params.mode });
    return request<{ mode: string; rows: DcrCountModewiseRow[]; channelDataUnsupported?: boolean }>(`/company/reports/dcr-count-modewise?${qs.toString()}`);
  },
  dcrRejectApprove(params: { month: string }) {
    const qs = new URLSearchParams({ month: params.month });
    return request<DcrRejectApproveRow[]>(`/company/reports/dcr-reject-approve?${qs.toString()}`);
  },
  dcrTimeStatus(params: { employeeCode: string; month: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month });
    return request<DcrTimeStatusRow[]>(`/company/reports/dcr-time-status?${qs.toString()}`);
  },
  dcrCheckinCheckout(params: { employeeCode: string; month: string; mode: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, mode: params.mode });
    return request<{ mode: string; rows: DcrCheckinCheckoutRow[]; unsupported?: boolean; reason?: string }>(`/company/reports/dcr-checkin-checkout?${qs.toString()}`);
  },

  // Round 35 -- Customized Report builder.
  customReports() {
    return request<CustomReportSummary[]>("/company/custom-reports");
  },
  createCustomReport(body: { name: string; defaultParams: string[] }) {
    return request<CustomReportSummary>("/company/custom-reports", { method: "POST", body: JSON.stringify(body) });
  },
  customReport(id: string) {
    return request<CustomReportDetail>(`/company/custom-reports/${id}`);
  },
  saveCustomReportMetrics(id: string, metrics: string[]) {
    return request<{ id: string; name: string; parameterCount: number }>(`/company/custom-reports/${id}/metrics`, { method: "PATCH", body: JSON.stringify({ metrics }) });
  },
  deleteCustomReport(id: string) {
    return request<{ id: string }>(`/company/custom-reports/${id}`, { method: "DELETE" });
  },
  customReportMetadata() {
    return request<CustomReportMetadata>("/company/custom-reports/metadata");
  },
  customReportOutput(id: string, params: { employeeCode: string; month: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month });
    return request<CustomReportOutput>(`/company/custom-reports/${id}/output?${qs.toString()}`);
  },

  // Round 9 item 1 — every FieldForce/employee-name dropdown across the app
  // (16+ separate components) called this directly with zero caching, so
  // opening ANY dropdown re-fetched and re-hydrated the entire employee list
  // from Mongo every single time, even seconds after the same list was just
  // fetched elsewhere on the same page. This module-level cache (with
  // in-flight request de-duplication, so two dropdowns opened at once don't
  // fire two requests) makes every dropdown after the first one instant,
  // with no call-site changes needed anywhere. `invalidateEmployeesCache()`
  // is called after any write that changes the employee list so a stale
  // list is never shown after an edit.
  employees() {
    const now = Date.now();
    if (employeesCache && now - employeesCache.at < EMPLOYEES_CACHE_TTL_MS) {
      return employeesCache.promise;
    }
    const promise = request<Employee[]>("/company/employees").catch((err) => {
      // Don't cache a failed fetch — let the next caller retry for real.
      employeesCache = null;
      throw err;
    });
    employeesCache = { promise, at: now };
    return promise;
  },

  createEmployee(input: Omit<Employee, "id" | "tenantSlug" | "createdAt" | "updatedAt">) {
    return request<Employee>("/company/employees", {
      method: "POST",
      body: JSON.stringify(input)
    }).then((res) => {
      invalidateEmployeesCache();
      return res;
    });
  },

  doctors(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return requestPaginated<Doctor>(`/company/doctors${qs ? `?${qs}` : ""}`);
  },

  clinicNames(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return requestPaginated<string>(`/company/doctors/clinics${qs ? `?${qs}` : ""}`);
  },

  // Round 45 -- real persistence for the Listed Doctor edit form.
  updateDoctor(id: string, input: Partial<{ name: string; specialty: string; category: "A" | "B" | "C"; state: string; city: string; territory: string; status: "ACTIVE" | "INACTIVE"; qualification: string | null; phone: string | null; doctorTypes: string[]; campaign: string | null; promotedBrands: string[] }>) {
    return request<Doctor>(`/company/doctors/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  setDoctorTier(id: string, doctorCategory: "NIL" | "CORE" | "N CORE" | "S CORE") {
    return request<Doctor>(`/company/doctors/${id}/category-tier`, { method: "PUT", body: JSON.stringify({ doctorCategory }) });
  },
  setSupportiveChemists(id: string, dealerIds: string[]) {
    return request<Doctor>(`/company/doctors/${id}/supportive-chemists`, { method: "PUT", body: JSON.stringify({ dealerIds }) });
  },
  createDoctor(input: Omit<Doctor, "id" | "tenantSlug" | "createdAt" | "updatedAt">) {
    return request<Doctor>("/company/doctors", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  doctorCelebrations(month: number) {
    return request<Doctor[]>(`/company/doctors/celebrations?month=${month}`);
  },

  products() {
    return request<Product[]>("/company/products");
  },

  dcrs(filters?: DcrFilters) {
    return request<DcrRecord[]>(`/company/dcrs${toQueryString(filters)}`);
  },

  dcrDetail(id: string) {
    return request<DcrRecord>(`/company/dcrs/${id}`);
  },

  approveDcr(id: string) {
    return request<DcrExtended>(`/company/dcrs/${id}/approve`, { method: "POST" });
  },

  managerActivity() {
    return request<ManagerActivityRecord[]>("/company/manager-activity");
  },

  subdivisions() {
    return request<Subdivision[]>("/company/subdivisions");
  },

  createSubdivision(input: { division: string; subdivisionName: string; productwiseCount?: number; fieldforcewiseCount?: number }) {
    return request<Subdivision>("/company/subdivisions", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateSubdivision(id: string, input: Partial<{ division: string; subdivisionName: string; productwiseCount: number; fieldforcewiseCount: number }>) {
    return request<Subdivision>(`/company/subdivisions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateSubdivision(id: string) {
    return request<Subdivision>(`/company/subdivisions/${id}/deactivate`, { method: "POST" });
  },

  productCatalogByDivision(division: string) {
    return request<ProductCatalogItem[]>(`/company/product-catalog?division=${encodeURIComponent(division)}`);
  },

  employeesByDivision(division: string) {
    return request<Employee[]>(`/company/employees?division=${encodeURIComponent(division)}`);
  },

  productCategories() {
    return request<ProductCategory[]>("/company/product-categories");
  },

  createProductCategory(input: { shortName?: string | null; categoryName: string }) {
    return request<ProductCategory>("/company/product-categories", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateProductCategory(id: string, input: Partial<{ shortName: string | null; categoryName: string; sortOrder: number | null }>) {
    return request<ProductCategory>(`/company/product-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateProductCategory(id: string) {
    return request<ProductCategory>(`/company/product-categories/${id}/deactivate`, { method: "POST" });
  },

  reactivateProductCategory(id: string) {
    return request<ProductCategory>(`/company/product-categories/${id}/reactivate`, { method: "POST" });
  },

  productBrands() {
    return request<ProductBrand[]>("/company/product-brands");
  },

  createProductBrand(input: { shortName?: string | null; brandName: string }) {
    return request<ProductBrand>("/company/product-brands", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateProductBrand(id: string, input: Partial<{ shortName: string | null; brandName: string; sortOrder: number | null }>) {
    return request<ProductBrand>(`/company/product-brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateProductBrand(id: string) {
    return request<ProductBrand>(`/company/product-brands/${id}/deactivate`, { method: "POST" });
  },

  reactivateProductBrand(id: string) {
    return request<ProductBrand>(`/company/product-brands/${id}/reactivate`, { method: "POST" });
  },

  productCatalog() {
    return request<ProductCatalogItem[]>("/company/product-catalog");
  },

  createProductCatalogItem(input: { productCode?: string | null; productName: string; description?: string | null; saleUnit?: string | null }) {
    return request<ProductCatalogItem>("/company/product-catalog", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateProductCatalogItem(id: string, input: Partial<{ productCode: string | null; productName: string; description: string | null; saleUnit: string | null; sortOrder: number | null }>) {
    return request<ProductCatalogItem>(`/company/product-catalog/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateProductCatalogItem(id: string) {
    return request<ProductCatalogItem>(`/company/product-catalog/${id}/deactivate`, { method: "POST" });
  },

  reactivateProductCatalogItem(id: string) {
    return request<ProductCatalogItem>(`/company/product-catalog/${id}/reactivate`, { method: "POST" });
  },

  doctorCategories() {
    return request<DoctorCategory[]>("/company/doctor-categories");
  },

  createDoctorCategory(input: { shortName?: string | null; categoryName: string }) {
    return request<DoctorCategory>("/company/doctor-categories", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateDoctorCategory(id: string, input: Partial<{ shortName: string | null; categoryName: string; sortOrder: number | null }>) {
    return request<DoctorCategory>(`/company/doctor-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateDoctorCategory(id: string) {
    return request<DoctorCategory>(`/company/doctor-categories/${id}/deactivate`, { method: "POST" });
  },

  reactivateDoctorCategory(id: string) {
    return request<DoctorCategory>(`/company/doctor-categories/${id}/reactivate`, { method: "POST" });
  },

  doctorSpecialities() {
    return request<DoctorSpeciality[]>("/company/doctor-specialities");
  },

  createDoctorSpeciality(input: { shortName?: string | null; specialityName: string }) {
    return request<DoctorSpeciality>("/company/doctor-specialities", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateDoctorSpeciality(id: string, input: Partial<{ shortName: string | null; specialityName: string; sortOrder: number | null }>) {
    return request<DoctorSpeciality>(`/company/doctor-specialities/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateDoctorSpeciality(id: string) {
    return request<DoctorSpeciality>(`/company/doctor-specialities/${id}/deactivate`, { method: "POST" });
  },

  reactivateDoctorSpeciality(id: string) {
    return request<DoctorSpeciality>(`/company/doctor-specialities/${id}/reactivate`, { method: "POST" });
  },

  doctorQualifications() {
    return request<DoctorQualification[]>("/company/doctor-qualifications");
  },

  createDoctorQualification(input: { qualificationName: string }) {
    return request<DoctorQualification>("/company/doctor-qualifications", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateDoctorQualification(id: string, input: Partial<{ qualificationName: string; sortOrder: number | null }>) {
    return request<DoctorQualification>(`/company/doctor-qualifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateDoctorQualification(id: string) {
    return request<DoctorQualification>(`/company/doctor-qualifications/${id}/deactivate`, { method: "POST" });
  },

  reactivateDoctorQualification(id: string) {
    return request<DoctorQualification>(`/company/doctor-qualifications/${id}/reactivate`, { method: "POST" });
  },

  productGroups() {
    return request<ProductGroup[]>("/company/product-groups");
  },

  dealers() {
    return request<Dealer[]>("/company/dealers");
  },

  createDealer(input: Omit<Dealer, "id"> & { sourceSNo?: string | number }) {
    return request<Dealer>("/company/dealers", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateDealer(id: string, input: Partial<Dealer> & { sourceSNo?: string | number }) {
    return request<Dealer>(`/company/dealers/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  holidays() {
    return request<Holiday[]>("/company/holidays");
  },

  sfc() {
    return request<Sfc[]>("/company/sfc");
  },

  expenses() {
    return request<Expense[]>("/company/expenses");
  },

  hospitals() {
    return request<Hospital[]>("/company/hospitals");
  },

  createHospital(input: Omit<Hospital, "id" | "tenantSlug" | "createdAt" | "updatedAt">) {
    return request<Hospital>("/company/hospitals", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateHospital(id: string, input: Partial<Hospital>) {
    return request<Hospital>(`/company/hospitals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  unlistedDoctors() {
    return request<UnlistedDoctor[]>("/company/unlisted-doctors");
  },

  createUnlistedDoctor(input: Omit<UnlistedDoctor, "id" | "tenantSlug" | "createdAt" | "updatedAt">) {
    return request<UnlistedDoctor>("/company/unlisted-doctors", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateUnlistedDoctor(id: string, input: Partial<UnlistedDoctor>) {
    return request<UnlistedDoctor>(`/company/unlisted-doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  territoryDoctorCounts() {
    return request<{ patch: string; hq: string; division: string; totalDoctors: number; activeDoctors: number }[]>("/company/territory/doctor-counts");
  },

  bulkDeactivateTerritory(patch: string) {
    return request<{ success: boolean; modifiedCount: number }>("/company/territory/bulk-deactivate", {
      method: "POST",
      body: JSON.stringify({ patch })
    });
  },

  // ── Generic "document masters" API — one consistent CRUD surface for all
  // 38 masters defined in the Technical Report (Division, Region/Zone,
  // Territory/HQ, Therapy, Doctor sub-tabs, Stockist sub-tabs, etc.) ──

  masterList() {
    return request<MasterSchema[]>("/company/masters");
  },

  masterSchema(key: string) {
    return request<MasterSchema>(`/company/masters/${key}/schema`);
  },

  masterRecords(key: string) {
    return request<MasterRecord[]>(`/company/masters/${key}`);
  },

  createMasterRecord(key: string, input: Record<string, unknown>) {
    return request<MasterRecord>(`/company/masters/${key}`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateMasterRecord(key: string, id: string, input: Record<string, unknown>) {
    return request<MasterRecord>(`/company/masters/${key}/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deactivateMasterRecord(key: string, id: string) {
    return request<MasterRecord>(`/company/masters/${key}/${id}/deactivate`, { method: "POST" });
  },

  // Real hard delete — restricted server-side to Mobile App - Device Id
  // Deletion and Mail Delete, the two sanpharma screens whose own UI is a
  // literal "Delete", not a deactivate.
  deleteMasterRecord(key: string, id: string) {
    return request<{ success: boolean; id: string }>(`/company/masters/${key}/${id}`, { method: "DELETE" });
  },

  reactivateMasterRecord(key: string, id: string) {
    return request<MasterRecord>(`/company/masters/${key}/${id}/reactivate`, { method: "POST" });
  },

  // ── DCR Bulk Approval — additional view over the same `approvalDcr`
  // master rows the single-row ApprovalQueueTable already reads/writes,
  // grouped by field rep + month (sanpharma.info's DCR_Bulk_Approval.aspx
  // shape). See components/dcr-bulk-approval.tsx.
  masterBulkRecords(key: string, params: { sfName: string; month: string }) {
    const qs = toQueryString(params);
    return request<MasterRecord[]>(`/company/masters/${key}/bulk${qs}`);
  },

  masterBulkAction(key: string, input: { ids: string[]; status: "Approved" | "Rejected"; reason?: string }) {
    return request<{ results: { id: string; ok: boolean; error?: string }[]; updatedCount: number }>(
      `/company/masters/${key}/bulk-action`,
      { method: "POST", body: JSON.stringify(input) }
    );
  },

  // ── Options screens with real custom behavior (not generic CRUD) ──────

  resetFieldForcePassword(input: { employeeCode?: string; fieldForceName?: string; oldPassword: string; newPassword: string }) {
    return request<{ success: boolean; employeeCode: string; accountsUpdated: number }>("/company/masters/optionsChangePassword/action/reset", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  vacantMrLogin(input: { employeeCode: string; password: string; requestedByUserName?: string }) {
    return request<{ success: boolean; token: string; portalType: "manager" | "field"; employee: { employeeCode: string; name: string; designation: string; role: string; portal: string } }>(
      "/company/masters/vacantMrLoginAccess/action/login",
      { method: "POST", body: JSON.stringify(input) }
    );
  },

  // ── Update/Delete > TP Delete & DCR Edit — real TourPlan/Dcr documents,
  // the exact same collections the field-force MR's own screens and the
  // manager's approval queues read from, not a generic-masters mirror. ──

  companyTourPlans(params: { employeeCode?: string; month?: string; status?: string } = {}) {
    const qs = toQueryString(params);
    return request<Record<string, unknown>[]>(`/company/tour-plans${qs}`);
  },

  deleteTourPlan(tpId: string) {
    return request<{ deleted: boolean; tpId: string }>(`/company/tour-plans/${encodeURIComponent(tpId)}`, {
      method: "DELETE"
    });
  },

  companyDcrs(params: { employeeCode?: string; month?: string } = {}) {
    const qs = toQueryString(params);
    return request<Record<string, unknown>[]>(`/company/dcrs${qs}`);
  },

  updateDcrWorkType(id: string, workType: string) {
    return request<Record<string, unknown>>(`/company/dcrs/${id}/work-type`, {
      method: "PATCH",
      body: JSON.stringify({ workType })
    });
  },

  // Full-row DCR edit — every editable field the Admin DCR Edit screen's
  // Edit button opens, not just Work Type (see company.routes.ts's
  // PATCH /company/dcrs/:id).
  updateDcr(id: string, input: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/company/dcrs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  // ── Update/Delete > Drs UNI No - Generation — real DoctorModel writes,
  // matching sanpharma.info's Unique_Doc_Slno.aspx exactly. ──
  drUniqueNoSummary() {
    return request<{ total: number; allocated: number; notAllocated: number }>(
      "/company/masters/drUniqueNoGeneration/action/summary"
    );
  },

  drUniqueNoList() {
    return request<Record<string, unknown>[]>("/company/masters/drUniqueNoGeneration/action/list");
  },

  drUniqueNoAllocate(mode: string) {
    return request<{ success: boolean; mode: string; total: number; allocated: number; notAllocated: number }>(
      "/company/masters/drUniqueNoGeneration/action/allocate",
      { method: "POST", body: JSON.stringify({ mode }) }
    );
  },

  drUniqueNoReset() {
    return request<{ success: boolean; total: number; allocated: number; notAllocated: number }>(
      "/company/masters/drUniqueNoGeneration/action/reset",
      { method: "POST", body: JSON.stringify({}) }
    );
  },

  sendNotificationMessage(input: { id?: string; filterBy?: string; filterValue?: string; filterValues?: string[]; message?: string; effectiveFrom?: string; effectiveTo?: string }) {
    return request<{ success: boolean; matched: number; notified: number }>("/company/masters/notificationMessage/action/send", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Admin Settings — Base Level Setup / Manager Setup / Auto Mail Setup
  // (Admin tab) single-document-per-tenant config blobs. ──
  getAdminSetting<T = unknown>(kind: "baseLevelSetup" | "managerSetup" | "autoMailSetupAdmin" | "approvalMandatorySetup" | "otherSetup" | "homepageDashboardDisplay" | "leaveTypeSetup" | "orderBookingCommon" | "flashNews" | "noticeBoard" | "quoteOfTheWeek" | "talkToUs") {
    return request<T | null>(`/company/masters/admin-settings/${kind}`);
  },

  saveAdminSetting<T = unknown>(kind: "baseLevelSetup" | "managerSetup" | "autoMailSetupAdmin" | "approvalMandatorySetup" | "otherSetup" | "homepageDashboardDisplay" | "leaveTypeSetup" | "orderBookingCommon" | "flashNews" | "noticeBoard" | "quoteOfTheWeek" | "talkToUs", value: T) {
    return request<T>(`/company/masters/admin-settings/${kind}`, {
      method: "PUT",
      body: JSON.stringify({ value })
    });
  },

  // ── Auto Mail Setup — Fieldforce tab mail rules (a real, growable list,
  // unlike the fixed 12-report Admin tab above). ──
  listMailAutoRules() {
    return request<Record<string, unknown>[]>("/company/masters/mail-auto-rules");
  },

  createMailAutoRule(input: Record<string, unknown>) {
    return request<Record<string, unknown>>("/company/masters/mail-auto-rules", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateMailAutoRule(id: string, input: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/company/masters/mail-auto-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  deleteMailAutoRule(id: string) {
    return request<{ success: boolean; id: string }>(`/company/masters/mail-auto-rules/${id}`, { method: "DELETE" });
  },

  // Real internal Mail Box — POST/GET /company/mail and its :id actions
  // (see mail.routes.ts). Folder is free text, validated server-side
  // against the fixed system folders plus active mailFolderCreation rows.

  listMail(params?: { folder?: string; search?: string; month?: string; year?: string; toEmployeeCode?: string }) {
    const query = new URLSearchParams();
    if (params?.folder) query.set("folder", params.folder);
    if (params?.search) query.set("search", params.search);
    if (params?.month) query.set("month", params.month);
    if (params?.year) query.set("year", params.year);
    if (params?.toEmployeeCode) query.set("toEmployeeCode", params.toEmployeeCode);
    const qs = query.toString();
    return request<MailRecord[]>(`/company/mail${qs ? `?${qs}` : ""}`);
  },

  sendMail(input: { toEmployeeCode: string; subject: string; body?: string; folder?: string }) {
    return request<MailRecord>("/company/mail", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  markMailRead(id: string) {
    return request<MailRecord>(`/company/mail/${id}/read`, { method: "PATCH" });
  },

  moveMail(id: string, folder: string) {
    return request<MailRecord>(`/company/mail/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ folder })
    });
  },

  deleteMail(id: string) {
    return request<{ success: boolean }>(`/company/mail/${id}`, { method: "DELETE" });
  },

  // Mail Folder Creation's "Transfer Mail Folder" flow (mail.routes.ts).
  mailTransferPreview(from: string) {
    return request<{ count: number }>(`/company/mail/transfer-preview?from=${encodeURIComponent(from)}`);
  },

  mailTransfer(input: { from: string; to: string; deleteAfterTransfer?: boolean }) {
    return request<{ moved: number }>("/company/mail/transfer", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // Real quiz authoring + scoring — /company/quiz (see quiz.routes.ts).
  listQuizzes() {
    return request<QuizRecord[]>("/company/quiz");
  },

  getQuiz(id: string) {
    return request<QuizRecord>(`/company/quiz/${id}`);
  },

  createQuiz(input: { title: string; description?: string; isActive?: boolean; questions: QuizQuestion[] }) {
    return request<QuizRecord>("/company/quiz", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateQuiz(
    id: string,
    input: {
      title?: string;
      description?: string;
      isActive?: boolean;
      questions?: QuizQuestion[];
      category?: string | null;
      effectiveDate?: string | null;
      month?: string | null;
      year?: string | null;
      processFromDate?: string | null;
      processToDate?: string | null;
      processed?: boolean;
    }
  ) {
    return request<QuizRecord>(`/company/quiz/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },

  deleteQuiz(id: string) {
    return request<{ success: boolean }>(`/company/quiz/${id}`, { method: "DELETE" });
  },

  // sanpharma's "Online Quiz - Title Creation": Quiz Title + Category +
  // Effective Date + Month + Year, plus an optional questions workbook.
  // Multipart so the file (when chosen) rides along with the metadata in
  // one Save, same shape as uploadMasterFile.
  async createQuizTitle(input: { title: string; category?: string; effectiveDate?: string; month?: string; year?: string }, file?: File | null) {
    const token = getToken();
    const form = new FormData();
    form.append("title", input.title);
    if (input.category) form.append("category", input.category);
    if (input.effectiveDate) form.append("effectiveDate", input.effectiveDate);
    if (input.month) form.append("month", input.month);
    if (input.year) form.append("year", input.year);
    if (file) form.append("file", file);
    const response = await fetch(`${getApiBaseUrl()}/company/quiz`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form
    });
    const payload = await readJson(response);
    if (!response.ok) throw new Error(payload?.error?.message ?? "Could not save the quiz");
    return payload as ApiEnvelope<QuizRecord>;
  },

  // sanpharma's per-row "Upload Questions" — replaces this quiz's real
  // question set from an uploaded workbook.
  async uploadQuizQuestions(id: string, file: File) {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${getApiBaseUrl()}/company/quiz/${id}/questions/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form
    });
    const payload = await readJson(response);
    if (!response.ok) throw new Error(payload?.error?.message ?? "Could not upload questions");
    return payload as ApiEnvelope<QuizRecord>;
  },

  async downloadQuizFile(id: string, fileName: string) {
    const token = getToken();
    const response = await fetch(`${getApiBaseUrl()}/company/quiz/${id}/download`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  submitQuizAttempt(id: string, input: { employeeCode: string; answers: { questionIndex: number; selectedOptionIndex: number }[] }) {
    return request<QuizAttemptRecord>(`/company/quiz/${id}/attempts`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  listQuizAttempts(id: string) {
    return request<QuizAttemptRecord[]>(`/company/quiz/${id}/attempts`);
  },

  // Real dashboard-builder — /company/dashboards (see dashboard.routes.ts).
  listDashboards(module?: DashboardModule) {
    const qs = module ? `?module=${encodeURIComponent(module)}` : "";
    return request<DashboardRecord[]>(`/company/dashboards${qs}`);
  },

  getDashboard(id: string) {
    return request<DashboardRecord>(`/company/dashboards/${id}`);
  },

  createDashboard(input: { name: string; module: DashboardModule }) {
    return request<DashboardRecord>("/company/dashboards", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  deleteDashboard(id: string) {
    return request<{ success: boolean }>(`/company/dashboards/${id}`, { method: "DELETE" });
  },

  dashboardWidgetTree() {
    return request<DashboardWidgetTreeNode[]>("/company/dashboards/widget-tree");
  },

  dashboardWidgetData(params: { category: string; dimension: string; fieldForce?: string }) {
    const query = new URLSearchParams({ category: params.category, dimension: params.dimension });
    if (params.fieldForce) query.set("fieldForce", params.fieldForce);
    return request<DashboardWidgetData>(`/company/dashboards/widget-data?${query.toString()}`);
  },

  addDashboardWidget(id: string, input: { widgetName: string; category: string; dimension: string; splitBy?: string; chartType: DashboardChartType }) {
    return request<DashboardRecord>(`/company/dashboards/${id}/widgets`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  removeDashboardWidget(id: string, widgetIndex: number) {
    return request<DashboardRecord>(`/company/dashboards/${id}/widgets/${widgetIndex}`, { method: "DELETE" });
  },

  updateDashboardWidget(id: string, widgetIndex: number, input: { chartType?: DashboardChartType; widgetName?: string }) {
    return request<DashboardRecord>(`/company/dashboards/${id}/widgets/${widgetIndex}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  // Multipart upload for any "Upload Tool" Options screen — extraFields are
  // any other columns that master's schema declares (month/year/division/
  // etc.), sent as regular form fields alongside the file.
  async uploadMasterFile(key: string, file: File, extraFields?: Record<string, string>) {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(extraFields ?? {})) {
      if (v) form.append(k, v);
    }
    const response = await fetch(`${getApiBaseUrl()}/company/masters/${key}/action/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form
    });
    const payload = await readJson(response);
    if (!response.ok) {
      throw new Error(payload?.error?.message ?? payload?.data?.error ?? "Upload failed");
    }
    return payload as ApiEnvelope<{ success: boolean; recordsProcessed: number; recordsFailed: number; errors: string[]; logOnly: boolean }>;
  },

  // Round F item 4 — real audit trail for the Masters page's "Recent
  // Master Modifications & Audit Trail" section.
  async auditLog(params: { search?: string; module?: string; page?: number; pageSize?: number }) {
    const qs = toQueryString({
      search: params.search || undefined,
      module: params.module && params.module !== "All Modules" ? params.module : undefined,
      page: params.page !== undefined ? String(params.page) : undefined,
      pageSize: params.pageSize !== undefined ? String(params.pageSize) : undefined
    });
    const token = getToken();
    const response = await fetch(`${getApiBaseUrl()}/company/audit-log${qs}`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    // Round G item 1 — surface the real status/body instead of a generic
    // message: a plain fetch failure, a non-JSON 404/502 (e.g. this route
    // not yet live on the deployed backend), and a real JSON error from
    // the route itself all need to be distinguishable from the UI, not
    // collapsed into one unhelpful string.
    const rawText = await response.text();
    let payload: { data?: AuditLogEntry[]; total?: number; page?: number; pageSize?: number; error?: { message?: string } } | null = null;
    try { payload = rawText ? JSON.parse(rawText) : null; } catch { /* non-JSON body, handled below */ }
    if (!response.ok) {
      const detail = payload?.error?.message ?? (rawText ? rawText.slice(0, 200) : response.statusText);
      throw new Error(`Unable to load audit log (HTTP ${response.status}): ${detail}`);
    }
    if (!payload) throw new Error("Unable to load audit log: empty response body");
    return payload as { data: AuditLogEntry[]; total: number; page: number; pageSize: number };
  },

  auditLogModules() {
    return request<string[]>("/company/audit-log/modules");
  },

  async auditLogExportBlob(params: { search?: string; module?: string }) {
    const token = getToken();
    const qs = toQueryString({
      search: params.search || undefined,
      module: params.module && params.module !== "All Modules" ? params.module : undefined
    });
    const response = await fetch(`${getApiBaseUrl()}/company/audit-log/export${qs}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) {
      // Round G item 1 — "Export failed" alone gave no way to tell a
      // genuine server error apart from this route not yet being live on
      // the deployed backend (a 404). Read the real body so the error
      // banner shows exactly what happened.
      const text = await response.text().catch(() => "");
      throw new Error(`Export failed (HTTP ${response.status}): ${text.slice(0, 200) || response.statusText}`);
    }
    return response.blob();
  },

  // Downloads the exact original file for the upload-log masters that keep
  // one (File Upload (Designation-wise), User Manual Upload) — auth is a
  // Bearer header, not a cookie, so a plain <a href> can't be used; fetch
  // the bytes ourselves and trigger a save via an object URL.
  async downloadMasterFile(key: string, id: string, fileName: string) {
    const token = getToken();
    const response = await fetch(`${getApiBaseUrl()}/company/masters/${key}/${id}/download`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // ── Slide Upload - E-Detailing > Priority tab ──────────────────────────
  slidePriorityList(type: "Brand" | "Product" | "Speciality" | "Therapy", subDivision: string) {
    const qs = toQueryString({ type, subDivision });
    return request<{ item: string; priority: number }[]>(`/company/masters/slideUploadEDetailing/action/priority-list${qs}`);
  },

  saveSlidePriority(input: { type: "Brand" | "Product" | "Speciality" | "Therapy"; subDivision: string; item: string; priority: number }) {
    return request<{ success: boolean }>("/company/masters/slideUploadEDetailing/action/priority", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Transfer Master Details ─────────────────────────────────────────────
  transferTerritories(entityType: "Listed Doctor" | "Chemist", employeeCode: string) {
    const qs = toQueryString({ entityType, employeeCode });
    return request<string[]>(`/company/masters/transferMasterDetails/action/territories${qs}`);
  },

  transferCandidates(entityType: "Listed Doctor" | "Chemist", employeeCode: string, territory: string) {
    const qs = toQueryString({ entityType, employeeCode, territory });
    return request<Record<string, unknown>[]>(`/company/masters/transferMasterDetails/action/candidates${qs}`);
  },

  transferMasterRecords(input: {
    entityType: "Listed Doctor" | "Chemist";
    ids: string[];
    fromEmployeeName: string;
    fromTerritory: string;
    toEmployeeCode: string;
    toEmployeeName: string;
    toTerritory: string;
  }) {
    return request<{ success: boolean; movedCount: number }>("/company/masters/transferMasterDetails/action/transfer", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Unlisted Drs Convert To Listed Drs ─────────────────────────────────
  unlistedConversionCandidates(fieldForceName: string) {
    const qs = toQueryString({ fieldForceName });
    return request<Record<string, unknown>[]>(`/company/masters/unlistedToListedDrConversion/action/list${qs}`);
  },

  convertUnlistedDoctors(ids: string[]) {
    return request<{ success: boolean; converted: number }>("/company/masters/unlistedToListedDrConversion/action/convert", {
      method: "POST",
      body: JSON.stringify({ ids })
    });
  },

  // ── Round 41 settings / locks / work type codes ───────────────────────
  r41Settings() { return request<R41Settings>("/company/settings/r41"); },
  saveR41Settings(input: Partial<R41Settings>) {
    return request<R41Settings>("/company/settings/r41", { method: "PUT", body: JSON.stringify(input) });
  },
  workTypeCodes() { return request<{ code: string; name: string; category: string }[]>("/company/work-type-codes"); },
  saveWorkTypeCode(input: { code: string; name: string; category?: string }) {
    return request<{ code: string; name: string; category: string }>("/company/work-type-codes", { method: "POST", body: JSON.stringify(input) });
  },
  crmEntries(params: { month?: string; status?: string }) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return request<Record<string, unknown>[]>(`/company/crm?${qs}`);
  },
  crmAction(id: string, action: "approve" | "reject") {
    return request<Record<string, unknown>>(`/company/crm/${id}/${action}`, { method: "POST", body: "{}" });
  },

  // ── Delayed Release ──────────────────────────────────────────────────────
  delayedReleaseList(params: { month?: string; fieldForceName?: string }) {
    const qs = toQueryString(params);
    return request<Record<string, unknown>[]>(`/company/masters/delayedRelease/action/list${qs}`);
  },

  releaseDelayed(input: { employeeCodes: string[]; month?: string }) {
    return request<{ success: boolean; releasedCount: number }>("/company/masters/delayedRelease/action/release", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Leave Status ──────────────────────────────────────────────────────
  leaveStatusList(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    const qs = toQueryString(params);
    return request<Record<string, unknown>[]>(`/company/masters/leaveStatusReport/action/list${qs}`);
  },

  // ── Coverage Analysis 2 (Round 8 items 1 & 2) ──────────────────────────
  coverageAnalysis2(params: { month?: number; year?: number }) {
    const qs = toQueryString({
      month: params.month !== undefined ? String(params.month) : undefined,
      year: params.year !== undefined ? String(params.year) : undefined
    });
    return request<Record<string, unknown>[]>(`/company/masters/coverageAnalysis2/action/list${qs}`);
  },

  // ── Round 8 item 8 — Leave Entitlement Entry ───────────────────────────
  leaveEntitlementGrid(year: string) {
    return request<Record<string, unknown>[]>(`/company/masters/leaveEntitlementEntry/action/grid${toQueryString({ year })}`);
  },
  leaveEntitlementSubmit(input: { year: string; rows: { employeeCode: string; cl: number; pl: number; sl: number; lop: number }[] }) {
    return request<{ success: boolean; saved: number }>("/company/masters/leaveEntitlementEntry/action/submit", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Round 8 item 9 — Leave Status / Entitlement View ───────────────────
  leaveEntitlementView(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/leaveEntitlementView/action/list${toQueryString(params)}`);
  },

  // ── Round 8 items 3-6 — Sample / Input Despatch View & Status ──────────
  sampleDispatchView(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/sampleDispatchView/action/list${toQueryString(params)}`);
  },
  sampleDispatchStatus(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/sampleDispatchStatus/action/list${toQueryString(params)}`);
  },
  inputDispatchView(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/inputDispatchView/action/list${toQueryString(params)}`);
  },
  inputDispatchStatus(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/inputDispatchStatus/action/list${toQueryString(params)}`);
  },

  // ── Round 8 item 7 — MSIS View ──────────────────────────────────────────
  msisView(params: { fieldForceName?: string; fromMonth?: string; fromYear?: string; mode?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/msisView/action/list${toQueryString(params)}`);
  },

  // ── Round 8 item 10 — Login Details ────────────────────────────────────
  loginDetails(params: { fieldForceName?: string; from?: string; to?: string; withoutVacant?: string; notLoginDays?: string; mode?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/loginDetails/action/list${toQueryString(params)}`);
  },

  // ── Round 8 items 11-12 — Activity Master + Parameters ─────────────────
  activityList() {
    return request<Record<string, unknown>[]>("/company/masters/activityMaster/action/list");
  },
  createActivity(input: { shortName: string; name: string; mode: string; activityFor: string[] }) {
    return request<Record<string, unknown>>("/company/masters/activityMaster/action/create", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  updateActivity(id: string, input: Partial<{ shortName: string; name: string; mode: string; activityFor: string[] }>) {
    return request<Record<string, unknown>>(`/company/masters/activityMaster/action/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },
  deactivateActivity(id: string) {
    return request<Record<string, unknown>>(`/company/masters/activityMaster/action/${id}/deactivate`, { method: "POST" });
  },
  activityParameterList(activityId?: string) {
    const qs = activityId ? toQueryString({ activityId }) : "";
    return request<Record<string, unknown>[]>(`/company/masters/activityParameter/action/list${qs}`);
  },
  createActivityParameter(input: Record<string, unknown>) {
    return request<Record<string, unknown>>("/company/masters/activityParameter/action/create", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  updateActivityParameter(id: string, input: Record<string, unknown>) {
    return request<Record<string, unknown>>(`/company/masters/activityParameter/action/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },
  deactivateActivityParameter(id: string) {
    return request<Record<string, unknown>>(`/company/masters/activityParameter/action/${id}/deactivate`, { method: "POST" });
  },
  reorderActivityParameters(orders: { id: string; existingOrder: number }[]) {
    return request<{ success: boolean }>("/company/masters/activityParameter/action/reorder", {
      method: "POST",
      body: JSON.stringify({ orders })
    });
  },

  // ── Round 9 item 2 tab 3 — Customized Master ───────────────────────────
  customizedMasterList() {
    return request<{ id: string; name: string; rows: { id: string; shortName: string; name: string; active: boolean }[] }[]>(
      "/company/masters/customizedMaster/action/list"
    );
  },
  createCustomizedMaster(name: string) {
    return request<{ id: string; name: string; rows: unknown[] }>("/company/masters/customizedMaster/action/create", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  },
  saveCustomizedMasterRows(id: string, rows: { id?: string; shortName: string; name: string; active: boolean }[]) {
    return request<{ id: string; name: string; rows: unknown[] }>(`/company/masters/customizedMaster/action/${id}/rows`, {
      method: "PUT",
      body: JSON.stringify({ rows })
    });
  },
  deactivateCustomizedMasterRow(id: string, rowId: string) {
    return request<{ id: string; name: string; rows: unknown[] }>(`/company/masters/customizedMaster/action/${id}/rows/${rowId}/deactivate`, {
      method: "POST"
    });
  },

  // ── Round 9 item 3 — Activity Status ────────────────────────────────────
  activityStatusList(params: { activityId?: string; fieldForceName?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/activityStatus/action/list${toQueryString(params)}`);
  },

  // ── Round 9 item 4 — Manager Missed Call View ──────────────────────────
  managerMissedCallView(params: { fieldForceName?: string; month?: string; year?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/managerMissedCallView/action/list${toQueryString(params)}`);
  },

  // ── Round 11 item 1 — Expense Consolidated View ────────────────────────
  expenseConsolidatedView(params: { month?: string; year?: string; employeeCode?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/expenseConsolidatedView/action/list${toQueryString(params)}`);
  },
  expenseConsolidatedViewAtAGlance(params: { fromMonth?: string; fromYear?: string; toMonth?: string; toYear?: string; employeeCode?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/expenseConsolidatedView/action/atAGlance${toQueryString(params)}`);
  },

  // ── Round 11 item 5 — Task Management System ───────────────────────────
  taskList(params: { assignedToEmployeeCode?: string; assignedByMe?: string; priority?: string; modeOfTask?: string; month?: string; year?: string }) {
    return request<Record<string, unknown>[]>(`/company/masters/task/action/list${toQueryString(params)}`);
  },
  createTask(input: { modeOfTask: string; priority: string; assignedToEmployeeCode: string; deadlineFrom?: string | null; deadlineTo?: string | null; description: string }) {
    return request<Record<string, unknown>>("/company/masters/task/action/create", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  // ── Round 12 item 9 — Task Mode Creation (backs the Mode of Task dropdown) ──
  taskModeList() {
    return request<Record<string, unknown>[]>(`/company/masters/taskMode/action/list`);
  },
  createTaskMode(input: { shortName: string; taskName: string }) {
    return request<Record<string, unknown>>("/company/masters/taskMode/action/create", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  updateTaskMode(id: string, input: { shortName: string; taskName: string }) {
    return request<Record<string, unknown>>(`/company/masters/taskMode/action/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  // ── PRD 12.5 — GST Multi-Branch: Admin "Branches & GST" tab ────────────
  branches() {
    return request<CompanyBranch[]>("/company/branches");
  },

  createBranch(input: { branchName: string; gstNumber: string; address: string; city: string; state: string; pincode: string; isHeadquarters?: boolean }) {
    return request<CompanyBranch>("/company/branches", { method: "POST", body: JSON.stringify(input) });
  },

  updateBranch(id: string, input: Partial<{ branchName: string; gstNumber: string; address: string; city: string; state: string; pincode: string; isHeadquarters: boolean; status: "ACTIVE" | "INACTIVE" }>) {
    return request<CompanyBranch>(`/company/branches/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },

  branchLookup(gst: string) {
    return request<CompanyBranch>(`/company/branches/lookup?gst=${encodeURIComponent(gst)}`);
  },

  // ── PRD 12.1 — Tour Plan (admin read-only, all managers) ───────────────
  adminTourPlans(params?: { month?: string; status?: string }) {
    const qs = toQueryString(params);
    return request<TourPlan[]>(`/company/tour-plans${qs}`);
  },

  // ── PRD 12.2/12.3 — Doctor Coverage MIS: Total Visits, Samples, Gifts ──
  doctorCoverage(month?: string) {
    return request<DoctorCoverageRow[]>(`/company/doctor-coverage${month ? `?month=${month}` : ""}`);
  },

  visitSummaryAdmin(month?: string) {
    return request<{ doctorId: string; doctorName: string; mappedEmployeeCode?: string; visitCount: number; lastVisitDate: string | null; overVisitFlag: boolean }[]>(`/company/visit-summary${month ? `?month=${month}` : ""}`);
  },

  giftValueThreshold() {
    return request<{ GIFT_VALUE_THRESHOLD_RS: number }>("/company/config");
  },

  setGiftValueThreshold(value: number) {
    return request<{ key: string; value: number }>("/company/config/GIFT_VALUE_THRESHOLD_RS", { method: "PATCH", body: JSON.stringify({ value }) });
  },

  // ── Generic company-config store — GET /company/config returns every
  // stored key merged with the server's DEFAULT_CONFIG as one object, so
  // this same read also picks up any custom key (e.g. Work Type Wise -
  // Allowance Fix's per-level grids below), not just the gift threshold.
  // The PATCH route's Zod validator only accepts number/string/boolean
  // values, so a value that isn't one of those must be JSON.stringify'd by
  // the caller before calling setCompanyConfig, and JSON.parse'd back after
  // companyConfig() returns it.
  companyConfig() {
    return request<Record<string, unknown>>("/company/config");
  },

  setCompanyConfig(key: string, value: string | number | boolean) {
    return request<{ key: string; value: string | number | boolean }>(`/company/config/${encodeURIComponent(key)}`, {
      method: "PATCH",
      body: JSON.stringify({ value })
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // Zivira_Project_Basic.docx — SFA/CRM Analytics + BI Platform
  // The backend for every module below already exists (routes/company.
  // routes.ts /analytics/*); these are purely new, additive read/write
  // wrappers — nothing above this line is touched.
  // ══════════════════════════════════════════════════════════════════════

  // Topic 2 — Attendance & Compliance Analytics / Topic 4 — Chronic Defaulter Detection
  complianceAnalytics(month?: string) {
    return fetchRaw<{ data: ComplianceRow[]; month: string; summary: { submittedToday: number; pendingDCR: number; missedYesterday: number; chronicDefaulters: number; avgCompliancePercent: number } }>(`/company/analytics/compliance${month ? `?month=${month}` : ""}`);
  },

  // Topic 3 — Salary Integration Engine (payroll hold workflow)
  payrollAnalytics(month?: string) {
    return fetchRaw<{ data: PayrollStatusRow[]; month: string; summary: { onHold: number; pendingApproval: number; released: number } }>(`/company/analytics/payroll${month ? `?month=${month}` : ""}`);
  },

  releasePayroll(id: string) {
    return request<PayrollStatusRow>(`/company/analytics/payroll/${id}/release`, { method: "PATCH" });
  },

  // Topic 5 — Representative vs Manager Analysis / Topic 6 — Joint Field Work Analysis
  repManagerAnalysis(month?: string) {
    return fetchRaw<{ data: RepAnalysisRow[]; managers: ManagerJointWorkRow[]; month: string }>(`/company/analytics/rep-manager${month ? `?month=${month}` : ""}`);
  },

  // Topic 7 — Territory Coverage Analytics / Topic 8 — Doctor Exception Management
  // (both riding on the existing /company/doctor-coverage aggregate, which
  // already includes alertBucket / daysSinceLastVisit / exceptionReason)
  territoryCoverage(month?: string) {
    return request<TerritoryCoverageRow[]>(`/company/doctor-coverage${month ? `?month=${month}` : ""}`);
  },

  // Topic 9 — Product Exposure Analytics / Topic 10 — Product-wise Performance Dashboard
  productExposure(month?: string) {
    return request<ProductExposureRow[]>(`/company/analytics/product-exposure${month ? `?month=${month}` : ""}`);
  },

  // Topic 11 — Sample Distribution Analytics
  sampleAllocations(month?: string) {
    return request<SampleAllocationRow[]>(`/company/sample-allocations${month ? `?month=${month}` : ""}`);
  },

  issueSampleAllocation(input: { employeeCode: string; productCode: string; productName: string; batchNumber?: string; qtyIssued: number; month?: string; notes?: string }) {
    return request<SampleAllocationRow>("/company/sample-allocations", { method: "POST", body: JSON.stringify(input) });
  },

  // Topic 11/12 — Sample Distribution + Sample vs Doctor Input Analysis.
  // Backend shape is NOT the standard {data: T[]} envelope — it spreads
  // computeSampleDistribution()'s own {byRep, byProduct, byDoctor, totals}
  // straight onto the response, so this is typed to match exactly.
  sampleDistribution(month?: string) {
    return fetchRaw<SampleDistributionReport>(`/company/analytics/sample-distribution${month ? `?month=${month}` : ""}`);
  },

  // Topic 14 — KPI Engine
  kpiEngine(month?: string) {
    return fetchRaw<{ reps: RepKpi[]; managers: ManagerKpi[]; month: string }>(`/company/analytics/kpi${month ? `?month=${month}` : ""}`);
  },

  // Topic 15 — Alert & Notification Engine
  alertsEngine(month?: string) {
    return fetchRaw<{ data: AlertRow[]; month: string; summary: { high: number; medium: number; low: number } }>(`/company/analytics/alerts${month ? `?month=${month}` : ""}`);
  },

  // Round 37 Items 3/4/5 -- Manager Analysis
  managerAnalysisManagers() {
    return request<ManagerAnalysisManager[]>("/company/manager-analysis/managers");
  },
  hqCoverageAnalysis(params: { employeeCode: string; fromMonth: string; toMonth: string; mode: string }) {
    const qs = new URLSearchParams(params);
    return request<HqCoverageResult>(`/company/manager-analysis/hq-coverage?${qs.toString()}`);
  },
  coverageAnalysis1(employeeCode: string, month: string) {
    const qs = new URLSearchParams({ employeeCode, month });
    return request<CoverageAnalysis1Result>(`/company/manager-analysis/coverage-analysis-1?${qs.toString()}`);
  },
  jointWorkAnalysis(params: { employeeCode: string; fromMonth: string; toMonth: string; mode: string }) {
    const qs = new URLSearchParams(params);
    return request<JointWorkResult>(`/company/manager-analysis/joint-work?${qs.toString()}`);
  },

  // Round 38 Items 1/2/3 -- Manager Analysis continued
  workHygiene(params: { employeeCode: string; month: string }) {
    return request<WorkHygieneResult>(`/company/mis/work-hygiene?${new URLSearchParams(params).toString()}`);
  },
  classWise(params: { employeeCode: string; fromMonth: string; toMonth: string }) {
    return request<ClassWiseResult>(`/company/mis/class-wise?${new URLSearchParams(params).toString()}`);
  },
  missedCall(params: { mode: string; employeeCode: string; fromMonth: string; toMonth: string }) {
    return request<MissedCallResult>(`/company/mis/missed-call?${new URLSearchParams(params).toString()}`);
  },
  forceDoctors(employeeCode: string) {
    return request<ForceDoctor[]>(`/company/mis/force-doctors?employeeCode=${encodeURIComponent(employeeCode)}`);
  },
  singleDoctor(params: { employeeCode: string; doctorId: string; fromMonth: string; toMonth: string }) {
    return request<SingleDoctorResult>(`/company/mis/single-doctor?${new URLSearchParams(params).toString()}`);
  },
  repVsManager(params: { employeeCode: string; month: string }) {
    return request<RepVsManagerResult>(`/company/mis/rep-vs-manager?${new URLSearchParams(params).toString()}`);
  },
  reviewReport(params: { employeeCode: string; month: string }) {
    return request<ReviewReportResult>(`/company/mis/review-report?${new URLSearchParams(params).toString()}`);
  },
  assessmentReport(params: { employeeCode: string; fromMonth: string; toMonth: string }) {
    return request<AssessmentResult>(`/company/mis/assessment?${new URLSearchParams(params).toString()}`);
  },
  pobrxProductWise(p: { employeeCode: string; fromMonth: string; toMonth: string; mode: string }) {
    return request<PobRxProductWiseResult>(`/company/mis/pobrx/product-wise?${new URLSearchParams(p).toString()}`);
  },
  pobrxFieldforceWise(p: { employeeCode: string; fromMonth: string; toMonth: string; mode: string }) {
    return request<PobRxFieldforceWiseResult>(`/company/mis/pobrx/fieldforce-wise?${new URLSearchParams(p).toString()}`);
  },
  pobrxDayWise(p: { employeeCode: string; month: string; withoutVacant: boolean; mode: string; products: string[] }) {
    return request<PobRxDayWiseResult>(`/company/mis/pobrx/day-wise?${new URLSearchParams({ employeeCode: p.employeeCode, month: p.month, withoutVacant: String(p.withoutVacant), mode: p.mode, products: p.products.join("||") }).toString()}`);
  },
  heatReport(kind: HeatKind, p: { employeeCode: string; months: number }) {
    return request<HeatResult>(`/company/mis/heat/${kind}?${new URLSearchParams({ employeeCode: p.employeeCode, months: String(p.months) }).toString()}`);
  },
  visitDetailOptions() { return request<VisitDetailOptions>("/company/mis/visit-details/options"); },
  catClsVisit(p: { employeeCode: string; mode: VisitMode; fromMonth: string; toMonth: string; values: string[]; withVacants: boolean }) {
    const qs = new URLSearchParams({ employeeCode: p.employeeCode, mode: p.mode, fromMonth: p.fromMonth, toMonth: p.toMonth, values: p.values.join("||"), withVacants: String(p.withVacants) });
    return request<CatClsVisitResult>(`/company/mis/visit-details/cat-cls?${qs.toString()}`);
  },
  visitDateWise(p: { employeeCode: string; month: string; week?: number }) {
    const qs = new URLSearchParams({ employeeCode: p.employeeCode, month: p.month });
    if (p.week) qs.set("week", String(p.week));
    return request<DateWiseResult>(`/company/mis/visit-details/datewise?${qs.toString()}`);
  },
  // Round 45
  quizResult(p: { employeeCode: string; scope: "Team" | "Individual"; month: string }) {
    return request<QuizResultResult>(`/company/mis/quiz-result?${new URLSearchParams(p).toString()}`);
  },
  detailingOptions() { return request<DetailingOptions>("/company/mis/detailing/options"); },
  detailingVisitWise(p: { employeeCode: string; month: string; mode: "Brand" | "Product"; names: string[] }) {
    return request<DetailingVisitResult>(`/company/mis/detailing/visit-wise?${new URLSearchParams({ employeeCode: p.employeeCode, month: p.month, mode: p.mode, names: p.names.join("||") }).toString()}`);
  },
  brandStarRating(p: { employeeCode: string; month: string; names: string[] }) {
    return request<StarRatingResult>(`/company/mis/detailing/star-rating?${new URLSearchParams({ employeeCode: p.employeeCode, month: p.month, names: p.names.join("||") }).toString()}`);
  },
  slideAnalysisOptions() { return request<SlideAnalysisOptions>("/company/mis/slide-analysis/options"); },
  slideAnalysis(p: { employeeCode: string; fromMonth: string; toMonth: string; basedOn: "Product" | "Brand"; filterKind: SlideFilterKind; filterValue: string }) {
    return request<SlideAnalysisResult>(`/company/mis/slide-analysis?${new URLSearchParams(p).toString()}`);
  },
  drsAnalysis(p: { employeeCode: string; fromMonth: string; toMonth: string }) {
    return request<DrsAnalysisResult>(`/company/mis/drs-analysis?${new URLSearchParams(p).toString()}`);
  },
  // Generic authed file download (the response IS the file): Day Wise / Call Report dumps.
  async downloadMisFile(path: string, query: Record<string, string>, fileName: string) {
    const token = getToken();
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}?${new URLSearchParams(query).toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, 180000);
    if (!response.ok) {
      let message = "Download failed";
      try { message = (await response.json())?.error?.message ?? message; } catch { /* non-JSON error body */ }
      throw new Error(message);
    }
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  hqVisitReport(p: { employeeCode: string; months: number }) {
    return request<HqVisitResult>(`/company/mis/heat/hqs?${new URLSearchParams({ employeeCode: p.employeeCode, months: String(p.months) }).toString()}`);
  },
  // Listed Dr/Chem Dump: the response IS the .xlsx file.
  async downloadPobrxDump(p: { employeeCode: string; month: string; mode: string; products: string[]; checkVacant: boolean; option: string }) {
    const token = getToken();
    const qs = new URLSearchParams({ employeeCode: p.employeeCode, month: p.month, mode: p.mode, products: p.products.join("||"), checkVacant: String(p.checkVacant), option: p.option });
    const response = await fetchWithTimeout(`${API_BASE_URL}/company/mis/pobrx/dump?${qs.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, 180000);
    if (!response.ok) {
      let message = "Download failed";
      try { message = (await response.json())?.error?.message ?? message; } catch { /* non-JSON error body */ }
      throw new Error(message);
    }
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Dr_Che_POB_${p.month}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  // DCR Analysis Dump: the file IS the output (CSV or real .xlsx), streamed
  // from the backend with the Bearer token and saved via a blob link.
  async downloadDcrDump(params: { employeeCode: string; month: string; days: number[]; vacant: boolean; format: "csv" | "xlsx" }) {
    const token = getToken();
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, days: params.days.join(","), vacant: String(params.vacant), format: params.format });
    const response = await fetchWithTimeout(`${API_BASE_URL}/company/mis/dcr-dump?${qs.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, 180000);
    if (!response.ok) {
      let message = "Download failed";
      try { message = (await response.json())?.error?.message ?? message; } catch { /* non-JSON error body */ }
      throw new Error(message);
    }
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DCR_Analysis_Dump_${params.month}.${params.format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  },
  misTeam(employeeCode: string) {
    return request<MisTeamMember[]>(`/company/mis/team?employeeCode=${encodeURIComponent(employeeCode)}`);
  },
  dcrAnalysis(params: { employeeCode: string; month: string; individual: boolean; baseLevel: string }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, month: params.month, individual: String(params.individual), baseLevel: params.baseLevel });
    return request<DcrAnalysisResult>(`/company/mis/dcr-analysis?${qs.toString()}`);
  },
  visitAnalysis(params: { employeeCode: string; level: string; fromMonth: string; toMonth: string; type: string }) {
    return request<VisitAnalysisResult>(`/company/mis/visit-analysis?${new URLSearchParams(params).toString()}`);
  },
  salesDetails(params: { mode: string; month: string; employeeCode?: string; state?: string }) {
    const qs = new URLSearchParams({ mode: params.mode, month: params.month });
    if (params.employeeCode) qs.set("employeeCode", params.employeeCode);
    if (params.state) qs.set("state", params.state);
    return request<SalesDetailsResult>(`/company/mis/sales-details?${qs.toString()}`);
  },
  pobProducts() {
    return request<string[]>("/company/mis/pob-products");
  },
  pobWise(params: { employeeCode: string; fromMonth: string; toMonth: string; mode: string; products: string[] }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, fromMonth: params.fromMonth, toMonth: params.toMonth, mode: params.mode, products: params.products.join("||") });
    return request<PobWiseResult>(`/company/mis/pob-wise?${qs.toString()}`);
  },
  pobPeriodic(params: { employeeCode: string; from: string; to: string; products: string[] }) {
    const qs = new URLSearchParams({ employeeCode: params.employeeCode, from: params.from, to: params.to, products: params.products.join("||") });
    return request<PobPeriodicResult>(`/company/mis/pob-periodic?${qs.toString()}`);
  },
  fieldworkManagerAnalysis(params: { employeeCode: string; fromMonth: string; toMonth: string }) {
    const qs = new URLSearchParams(params);
    return request<FieldworkManagerAnalysisResult>(`/company/manager-analysis/fieldwork-manager-analysis?${qs.toString()}`);
  },
  managerWiseCoverage(params: { employeeCode: string; fromMonth: string; toMonth: string }) {
    const qs = new URLSearchParams(params);
    return request<ManagerWiseCoverageResult>(`/company/manager-analysis/manager-wise-coverage?${qs.toString()}`);
  },
  specialityCategoryVisit(params: { employeeCode: string; fromMonth: string; toMonth: string; mode: string }) {
    const qs = new URLSearchParams(params);
    return request<SpecialityCategoryVisitResult>(`/company/manager-analysis/speciality-category-visit?${qs.toString()}`);
  }
};

// ── Response shapes for the analytics endpoints above. Field names below
// are copied verbatim from the backend's own row types (src/utils/
// compliance.ts, rep-manager-analysis.ts, product-analytics.ts, sample-
// distribution.ts, kpi-engine.ts, alerts-engine.ts) — not guessed — so the
// UI renders exactly what the server computes. Defined locally (rather
// than in @zivira/types, which is shared across every portal) so this
// purely-additive BI layer can never affect any other app's build. ──
export type ComplianceRow = {
  employeeCode: string; employeeName?: string; role?: string;
  submittedToday: boolean; pendingDCR: boolean; missedYesterday: boolean;
  missedThisWeek: number; missedThisMonth: number; expectedThisMonth: number; submittedThisMonth: number;
  compliancePercent: number; missedLast30Days: number; chronicDefaulter: boolean;
  warningLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH"; salaryHold: boolean;
};
export type PayrollStatusRow = {
  id: string; employeeCode: string; employeeName?: string; role?: string; month: string;
  status: "RELEASED" | "HOLD" | "EXPLANATION_SUBMITTED";
  holdReason?: string | null; missedDaysSnapshot?: number;
  employeeExplanation?: string | null; managerApprovedByName?: string | null; releasedAt?: string | null;
};
export type RepAnalysisRow = {
  employeeCode: string; employeeName?: string; reportingManager?: string | null; reportingManagerName?: string;
  doctorsVisited: number; totalVisits: number; jointVisits: number; jointVisitPercent: number;
};
export type ManagerJointWorkRow = {
  managerCode: string; managerName?: string; teamSize: number; totalTeamVisits: number;
  totalJointCalls: number; avgJointCallsPerRep: number; jointCallPercent: number; rank: number;
};
export type TerritoryCoverageRow = DoctorCoverageRow & {
  assignedMRName?: string | null;
  lastVisitDateEver: string | null;
  daysSinceLastVisit: number | null;
  alertBucket: "NEVER_VISITED" | "180" | "90" | "60" | "30" | null;
  exceptionReason?: string | null;
  exceptionNotes?: string | null;
  exceptionMonth?: string | null;
};
export type ProductExposureRow = {
  productCode: string; productName: string; totalSamplesGiven: number; visitsPromoted: number;
  distinctDoctors: number; distinctReps: number; visualAidUsedCount: number;
  topRepCode?: string; topRepName?: string; topRepQty?: number;
  topTerritory?: string; topTerritoryQty?: number;
  topManagerCode?: string; topManagerName?: string; topManagerQty?: number;
  prescriptionInterestHigh: number; prescriptionInterestMedium: number;
  prescriptionInterestLow: number; prescriptionInterestNone: number;
};
export type SampleAllocationRow = {
  id: string; allocationId: string; employeeCode: string; employeeName?: string;
  productCode: string; productName: string; batchNumber?: string | null; qtyIssued: number; month: string;
  issuedBy?: string | null; notes?: string | null; createdAt?: string;
};
export type RepSampleBalanceRow = { employeeCode: string; employeeName?: string; totalIssued: number; totalDistributed: number; totalRemaining: number };
export type DoctorSampleRow = { doctorId: string; doctorName: string; totalSamplesReceived: number };
export type ProductSampleRow = { productCode: string; productName: string; totalIssued: number; totalDistributed: number; totalRemaining: number };
export type SampleDistributionReport = {
  byRep: RepSampleBalanceRow[]; byProduct: ProductSampleRow[]; byDoctor: DoctorSampleRow[];
  totals: { totalIssued: number; totalDistributed: number; totalRemaining: number };
  month: string;
};
export type RepKpi = {
  employeeCode: string; employeeName?: string; doctorsVisited: number; dcrSubmitted: number;
  productsPromoted: number; samplesDistributed: number; conversionRatePercent: number; compliancePercent: number;
};
export type ManagerKpi = {
  managerCode: string; managerName?: string; teamSize: number; jointCallPercent: number;
  teamCompliancePercent: number; doctorCoveragePercent: number; managerEffectivenessScore: number;
};
export type AlertRow = {
  type: "DCR_NOT_SUBMITTED" | "DOCTOR_NOT_VISITED_90_DAYS" | "PRODUCT_NOT_PROMOTED" | "LOW_COVERAGE" | "SAMPLE_STOCK_LOW" | "SALARY_HOLD" | "TERRITORY_INACTIVE";
  severity: "HIGH" | "MEDIUM" | "LOW"; message: string; subjectCode?: string; subjectLabel?: string;
};

async function fetchRaw<T>(path: string): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  const payload = await readJson(response);
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "API request failed");
  }
  return payload as T;
}
