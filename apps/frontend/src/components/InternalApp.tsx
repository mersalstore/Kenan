import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  Camera,
  CheckCircle2,
  ClipboardList,
  Truck,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe,
  HardHat,
  ImagePlus,
  Images,
  Layers3,
  Link2,
  LockKeyhole,
  LogOut,
  OctagonAlert,
  PackageCheck,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Stamp,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
  WalletCards,
  Warehouse,
  Wrench,
  X,
  MIcon,
  Edit,
  Save,
} from "./icons";
import { exportHtmlElementToWord } from "../lib/wordGenerator";
import { ChangeEvent, FormEvent, useMemo, useState, useEffect, useRef, type ReactNode, ComponentType } from "react";
import {
  engineers,
  projectTypes,
  seedClients,
  seedContracts,
  seedExpenses,
  seedInventory,
  seedInvoices,
  seedProjects,
  seedShowcase,
  seedSite,
  seedStaff,
  seedStages,
  seedWorkers,
  staffRoles,
  seedContractors,
  seedQuotations,
  makeProjectDetail,
  supplyInstallSystems,
  certificateTypes,
  seedDeficiencies,
  seedMaintenanceContracts,
  seedMaintenanceVisits,
  seedAttendance,
  seedLeaves,
  seedPayroll,
  seedSystems,
  seedComponents,
  componentTypesBySystem,
  seedTeams,
  seedAssignments,
} from "./data";
import type {
  Section, Client, Contractor, ProjectStage, Project, Worker, InventoryItem,
  Invoice, Expense, PaymentTerm, Contract, SiteStat, SiteSettings, StaffAccount,
  ShowcaseItem, QuotationItem, Quotation, ProjectWorkflow, SiteDeficiency,
  MaintenanceContract, MaintenanceVisit, ProjectSystem, SystemComponent, WorkTeam,
  ProjectAssignment, AttendanceRecord, Leave, PayrollRun, AppAlert,
  DailySiteReport, DailyReportSystemType, SupplyOrder, SupplyOrderItem, SupplyOrderStatus,
  SystemType,
} from "./types";
import { apiFetch } from "../lib/api";
import { zatcaQrPayload } from "../lib/zatca-qr";
import { generateClientQuotationPdf, generateClientProjectReportPdf } from "../lib/pdfGenerator";

function DispatchVoucher({
  voucher,
  stamp,
  signature,
  site,
}: {
  voucher: { items: { name: string; unit: string; quantity: number; purchasePrice: number }[]; project: Project | null; date: string; ref: string };
  stamp: string;
  signature: string;
  site: SiteSettings;
}) {
  const total = voucher.items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.purchasePrice) || 0), 0);
  return (
    <div className="dispatch-voucher" style={{ position: "relative", overflow: "hidden" }}>
      <PageWatermark />
      <DocumentHeader documentTitle="أمر صرف خامات" site={site} />

      <h2 className="dispatch-voucher-title">أمر صرف خامات</h2>
      <p className="dispatch-voucher-subtitle">رقم الأمر: {voucher.ref}</p>

      <div className="dispatch-meta-grid">
        <div><strong>التاريخ:</strong> {voucher.date}م</div>
        <div><strong>الموقع / المشروع:</strong> {voucher.project?.name ?? "—"}</div>
        <div><strong>عنوان الموقع:</strong> {voucher.project?.address ?? "—"}</div>
        <div><strong>مدير المشروع:</strong> {voucher.project?.engineer ?? "—"}</div>
      </div>

      <table className="dispatch-table">
        <thead>
          <tr>
            <th style={{ width: "6%" }}>#</th>
            <th style={{ width: "44%" }}>اسم الصنف / المادة</th>
            <th style={{ width: "12%" }}>الكمية</th>
            <th style={{ width: "10%" }}>الوحدة</th>
            <th style={{ width: "14%" }}>سعر الوحدة</th>
            <th style={{ width: "14%" }}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {voucher.items.length === 0 ? (
            <tr><td colSpan={6} className="dispatch-empty">لا توجد بنود في هذا الأمر</td></tr>
          ) : (
            voucher.items.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td className="name">{it.name}</td>
                <td>{Number(it.quantity).toLocaleString("ar-EG")}</td>
                <td>{it.unit}</td>
                <td>{Number(it.purchasePrice || 0).toLocaleString("ar-EG")}</td>
                <td>{((Number(it.quantity) || 0) * (Number(it.purchasePrice) || 0)).toLocaleString("ar-EG")}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} style={{ textAlign: "left", padding: "8px", fontWeight: 800, border: "1px solid #cbd5e1", background: "#f8fafc" }}>الإجمالي:</td>
            <td style={{ padding: "8px", fontWeight: 800, border: "1px solid #cbd5e1", background: "#f8fafc", color: "var(--brand)" }}>{total.toLocaleString("ar-EG")} ر.س</td>
          </tr>
        </tfoot>
      </table>

      <div className="dispatch-signatures">
        <div className="sign-cell">
          <strong>أمين المخزن</strong>
          <span>التوقيع: ............................</span>
        </div>
        <div className="sign-cell">
          <strong>مهندس الموقع</strong>
          <span>{voucher.project?.engineer ?? ""}</span>
          <span>التوقيع: ............................</span>
        </div>
        <div className="sign-cell">
          <strong>اعتماد المؤسسة</strong>
          {stamp && <img src={stamp} alt="ختم الشركة" style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain", marginTop: 4 }} />}
          {signature && <img src={signature} alt="توقيع الشركة" style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain", marginTop: 4 }} />}
          <span>التوقيع والختم: ............................</span>
        </div>
      </div>

      <div className="dispatch-footer">
        <span>{site.companyNameAr || "مؤسسة كنان لأنظمة الأمن والسلامة"} — {site.contactAddress || "الرياض"}</span>
        <span>صفحة مطبوعة من نظام KENAN</span>
      </div>
    </div>
  );
}

function InventoryView({
  inventory, projects, addInventoryItem, deleteInventoryItem, updateInventoryItem, issueInventory, stamp, signature, onCsvImport, onExportExcel, site,
}: { inventory: InventoryItem[]; projects: Project[]; addInventoryItem: (e: FormEvent<HTMLFormElement>) => void; deleteInventoryItem: (id: number | string) => void; updateInventoryItem: (u: InventoryItem) => void; issueInventory: (e: FormEvent<HTMLFormElement>) => void; stamp: string; signature: string; onCsvImport: (t: string) => void; onExportExcel: () => void; site: SiteSettings; }) {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editSupplier, setEditSupplier] = useState("");
  const [editMinQty, setEditMinQty] = useState(0);
  const [editBrand, setEditBrand] = useState("");
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [dispatchVoucher, setDispatchVoucher] = useState<{ items: { name: string; unit: string; quantity: number; purchasePrice: number }[]; project: Project | null; date: string; ref: string } | null>(null);

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id); setEditName(item.name); setEditQuantity(item.quantity); setEditUnit(item.unit);
    setEditPrice(item.purchasePrice); setEditSalePrice(item.salePrice || 0); setEditSupplier(item.supplier); setEditMinQty(item.minQuantity);
    setEditBrand(item.brand || "");
  };
  const saveEdit = (item: InventoryItem) => {
    if (!editName.trim()) return;
    updateInventoryItem({ ...item, name: editName.trim(), quantity: editQuantity, unit: editUnit, purchasePrice: editPrice, salePrice: editSalePrice, supplier: editSupplier, minQuantity: editMinQty, brand: editBrand.trim() });
    setEditingId(null);
  };
  const toggleSelectAll = () => { setSelectedIds(selectedIds.length === inventory.length ? [] : inventory.map((i) => i.id)); };
  const toggleSelect = (id: number | string) => { setSelectedIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])); };
  const deleteSelected = () => { triggerConfirm(`هل أنت متأكد من حذف ${selectedIds.length} أصناف من المخزن؟`, () => { selectedIds.forEach((id) => deleteInventoryItem(id)); setSelectedIds([]); }); };
  const exportSelected = () => {
    const list = inventory.filter((i) => selectedIds.includes(i.id));
    const target = list.length ? list : inventory;
    downloadCsv("inventory.csv", target.map((i) => ({ "رقم الصنف": i.id, "الاسم": i.name, "الماركة": i.brand || "", "الكمية": i.quantity, "الوحدة": i.unit, "سعر الشراء": i.purchasePrice, "سعر البيع": i.salePrice || 0, "المورد": i.supplier, "الحد الأدنى": i.minQuantity })));
  };

  return (
    <section className="content-grid content-grid--stack">
      <div className="forms-duo">
        <form className="form-panel" onSubmit={addInventoryItem}>
          <SectionTitle icon={Plus} title="إضافة منتج / خامة جديدة" />
          <Field label="اسم الصنف/المنتج" name="name" required />
          <Field label="العلامة التجارية (مثل: TOSY، ALMONIF)" name="brand" />
          <div className="two-fields">
            <Field label="الكمية الافتتاحية" name="quantity" type="number" required />
            <Field label="الوحدة (لفة، قطعة...)" name="unit" required />
          </div>
          <div className="two-fields">
            <Field label="سعر الشراء (ريال)" name="purchasePrice" type="number" />
            <Field label="سعر البيع (ريال)" name="salePrice" type="number" required />
          </div>
          <Field label="المورد" name="supplier" />
          <Field label="الحد الأدنى للتنبيه" name="minQuantity" type="number" />
          <button className="primary-button"><Plus size={18} />إضافة للمخزن</button>
        </form>

        <form
          className="form-panel"
          onSubmit={(event) => {
            issueInventory(event);
            const data = new FormData(event.currentTarget);
            const itemId = Number(data.get("itemId"));
            const projectId = Number(data.get("projectId"));
            const quantity = Number(data.get("quantity"));
            if (!itemId || !projectId || quantity <= 0) return;
            const item = inventory.find((x) => x.id === itemId);
            const project = projects.find((x) => x.id === projectId);
            if (!item || !project) return;
            setDispatchVoucher({
              items: [{ name: item.name, unit: item.unit, quantity, purchasePrice: item.purchasePrice }],
              project, date: new Date().toISOString().slice(0, 10), ref: `DISP-${Date.now()}`,
            });
          }}
        >
          <SectionTitle icon={PackageCheck} title="صرف خامات لموقع" />
          <label>الصنف<select name="itemId">{inventory.map((item) => (<option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>))}</select></label>
          <label>الموقع / المشروع<select name="projectId">{projects.map((project) => (<option key={project.id} value={project.id}>{project.name}</option>))}</select></label>
          <Field label="الكمية المنصرفة" name="quantity" type="number" required />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="primary-button" style={{ background: "#0f172a", flex: 1 }}>
              <PackageCheck size={18} />صرف للموقع
            </button>
            <button type="button" className="secondary-button" style={{ flex: 1 }}
              onClick={() => setDispatchVoucher({
                items: inventory.map((it) => ({ name: it.name, unit: it.unit, quantity: it.quantity, purchasePrice: it.purchasePrice })),
                project: projects[0] ?? null, date: new Date().toISOString().slice(0, 10), ref: `DISP-${Date.now()}`,
              })}
              disabled={inventory.length === 0 || projects.length === 0}
              title="طباعة كشف بكل المخزن لموقع (يصلح للعروض الكبيرة)"
            >
              <Printer size={17} />طباعة كشف كامل
            </button>
          </div>
        </form>
      </div>

      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          <SectionTitle icon={Warehouse} title="إدارة وجرد المخزن" />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {selectedIds.length > 0 && (
              <>
                <button type="button" className="secondary-button icon-danger text-danger" onClick={deleteSelected} style={{ color: "#ef4444" }}>
                  <Trash2 size={16} />حذف المحدد ({selectedIds.length})
                </button>
                <button type="button" className="secondary-button" onClick={exportSelected}><Download size={16} />تصدير المحدد</button>
              </>
            )}
            {selectedIds.length === 0 && (
              <button type="button" className="secondary-button" onClick={exportSelected}><Download size={16} />تصدير الكل (CSV)</button>
            )}
            <button type="button" className="secondary-button" style={{ background: "#10b981", color: "#fff", border: "none" }} onClick={onExportExcel}><Download size={16} />تصدير Excel</button>
            <label className="secondary-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", margin: 0 }}>
              <Download size={16} style={{ transform: "rotate(180deg)" }} />
              <span>استيراد CSV</span>
              <input type="file" accept=".csv" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { const reader = new FileReader(); reader.onload = (evt) => { onCsvImport(evt.target?.result as string); }; reader.readAsText(file, "UTF-8"); }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "45px", textAlign: "center" }}><input type="checkbox" checked={inventory.length > 0 && selectedIds.length === inventory.length} onChange={toggleSelectAll} /></th>
                <th>اسم المنتج/الخامة</th>
                <th>الوصف / الماركة</th>
                <th>الكمية المتوفرة</th>
                <th>سعر الشراء</th>
                <th>سعر البيع</th>
                <th>المورد</th>
                <th>الحد الأدنى</th>
                <th style={{ width: "130px" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isEditing = editingId === item.id;
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? "rgba(225, 29, 72, 0.04)" : isLow ? "rgba(239, 68, 68, 0.02)" : undefined }}>
                    <td style={{ textAlign: "center" }}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                    <td>{isEditing ? (<input style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "100%" }} value={editName} onChange={(e) => setEditName(e.target.value)} />) : (<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><strong>{item.name}</strong>{isLow && <Badge value="نقص مخزون" />}</div>)}</td>
                    <td>{isEditing ? (<input style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "100%" }} value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />) : (item.brand || "—")}</td>
                    <td>{isEditing ? (<div style={{ display: "flex", gap: "4px" }}><input type="number" style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "70px" }} value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} /><input style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "50px" }} value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="وحدة" /></div>) : (<strong>{numberFormat.format(item.quantity)} {item.unit}</strong>)}</td>
                    <td>{isEditing ? (<input type="number" style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "90px" }} value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} />) : (currency.format(item.purchasePrice))}</td>
                    <td>{isEditing ? (<input type="number" style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "90px" }} value={editSalePrice} onChange={(e) => setEditSalePrice(Number(e.target.value))} />) : (currency.format(item.salePrice || 0))}</td>
                    <td>{isEditing ? (<input style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "100%" }} value={editSupplier} onChange={(e) => setEditSupplier(e.target.value)} />) : (item.supplier || "—")}</td>
                    <td>{isEditing ? (<input type="number" style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "70px" }} value={editMinQty} onChange={(e) => setEditMinQty(Number(e.target.value))} />) : (item.minQuantity)}</td>
                    <td><div style={{ display: "flex", gap: "6px", alignItems: "center" }}>{isEditing ? (<><button type="button" className="primary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => saveEdit(item)}>حفظ</button><button type="button" className="secondary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingId(null)}>إلغاء</button></>) : (<><button type="button" className="secondary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => startEdit(item)}>تعديل</button><button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => triggerConfirm("هل أنت متأكد من حذف هذا الصنف من المخزن؟", () => deleteInventoryItem(item.id))} title="حذف"><Trash2 size={16} /></button></>)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dispatchVoucher && (
        <div className="dispatch-modal" role="dialog" aria-modal="true" onClick={() => setDispatchVoucher(null)}>
          <div className="dispatch-modal-inner contract-modal-inner" onClick={(event) => event.stopPropagation()}>
            <div className="contract-modal-toolbar">
              <button className="primary-button" onClick={() => window.print()}><Printer size={17} />طباعة أمر الصرف</button>
              <button className="contract-modal-close" onClick={() => setDispatchVoucher(null)} aria-label="إغلاق"><X size={20} /></button>
            </div>
            <DispatchVoucher voucher={dispatchVoucher} stamp={stamp} signature={signature} site={site} />
          </div>
        </div>
      )}
    </section>
  );
}

function FinanceView({
  invoices,
  expenses,
  projects,
  clients,
  totals,
  addInvoice,
  deleteInvoice,
  addExpense,
  deleteExpense,
  onPrintInvoice,
}: {
  invoices: Invoice[];
  expenses: Expense[];
  projects: Project[];
  clients: Client[];
  totals: { revenue: number; expenseTotal: number; profit: number };
  addInvoice: (projectId: string | number, number: string, amount: number, status: string, dueDate?: string) => Promise<void>;
  deleteInvoice: (id: string | number) => Promise<void>;
  addExpense: (projectId: string | number | null, type: string, amount: number, description: string, date: string) => Promise<void>;
  deleteExpense: (id: string | number) => Promise<void>;
  onPrintInvoice: (invoice: Invoice) => void;
}) {
  type FinanceRow = {
    kind: "invoice" | "expense";
    id: number | string;
    label: string;
    projectId: number | string;
    amount: number;
    status: string;
    date: string;
    description: string;
  };

  const rows: FinanceRow[] = [
    ...invoices.map((inv) => ({ kind: "invoice" as const, id: inv.id, label: inv.number, projectId: inv.projectId, amount: inv.amount, status: inv.status, date: inv.date, description: "" })),
    ...expenses.map((exp) => ({ kind: "expense" as const, id: exp.id, label: exp.type, projectId: exp.projectId || "", amount: exp.amount, status: exp.type, date: exp.date, description: exp.description })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const [active, setActive] = useState<{ kind: "invoice" | "expense"; id: number | string } | null>(null);
  const activeRow = active ? rows.find((r) => r.kind === active.kind && r.id === active.id) ?? null : null;
  
  const projectName = (id: number | string) => projects.find((p) => String(p.id) === String(id))?.name ?? "—";
  const clientName = (projectId: number | string) => {
    const p = projects.find((x) => String(x.id) === String(projectId));
    return p ? clients.find((c) => String(c.id) === String(p.clientId))?.name ?? "—" : "—";
  };

  // local form states
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const handleAddInvoiceSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const projId = String(f.get("projectId") || "");
    const number = String(f.get("number") || "").trim();
    const amount = Number(f.get("amount")) || 0;
    const status = String(f.get("status") || "جزئية");
    const dueDate = f.get("dueDate") ? String(f.get("dueDate")) : undefined;
    
    if (!projId) {
      triggerAlert("يرجى اختيار المشروع أولاً");
      return;
    }
    if (!number) {
      triggerAlert("يرجى إدخال رقم الفاتورة");
      return;
    }
    if (!amount || amount <= 0) {
      triggerAlert("يرجى إدخال مبلغ صحيح للفاتورة");
      return;
    }
    await addInvoice(projId, number, amount, status, dueDate);
    e.currentTarget.reset();
    setShowAddInvoice(false);
  };

  const handleAddExpenseSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const projVal = f.get("projectId") ? String(f.get("projectId")) : "";
    const projectId = projVal ? projVal : null;
    const type = String(f.get("type") || "").trim();
    const amount = Number(f.get("amount")) || 0;
    const description = String(f.get("description") || "").trim();
    const date = String(f.get("date") || new Date().toISOString().slice(0, 10));

    if (!type) {
      triggerAlert("يرجى إدخال نوع المصروف");
      return;
    }
    if (!amount || amount <= 0) {
      triggerAlert("يرجى إدخال مبلغ المصروف");
      return;
    }
    if (!description) {
      triggerAlert("يرجى إدخال بيان المصروف");
      return;
    }
    await addExpense(projectId, type, amount, description, date);
    e.currentTarget.reset();
    setShowAddExpense(false);
  };

  const handleDeleteRow = async (kind: "invoice" | "expense", id: number | string) => {
    if (confirm("هل أنت متأكد من حذف هذه الحركة؟")) {
      if (kind === "invoice") {
        await deleteInvoice(id);
      } else {
        await deleteExpense(id);
      }
      setActive(null);
    }
  };

  return (
    <section className="section-stack">
      <div className="dashboard-grid three">
        <MiniStat title="إجمالي الإيرادات" value={currency.format(totals.revenue)} icon={ReceiptText} />
        <MiniStat title="إجمالي المصروفات" value={currency.format(totals.expenseTotal)} icon={WalletCards} />
        <MiniStat title="صافي الربح" value={currency.format(totals.profit)} icon={Gauge} />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button type="button" className="main-button" onClick={() => { setShowAddInvoice(!showAddInvoice); setShowAddExpense(false); }}>
          <MIcon name="add_circle" /> إضافة فاتورة
        </button>
        <button type="button" className="main-button" style={{ background: "var(--brand-dark, #8b1518)" }} onClick={() => { setShowAddExpense(!showAddExpense); setShowAddInvoice(false); }}>
          <MIcon name="add_circle" /> إضافة مصروف
        </button>
      </div>

      {showAddInvoice && (
        <div className="panel animate-fade-in">
          <SectionTitle icon={ReceiptText} title="إضافة فاتورة جديدة" />
          <form onSubmit={handleAddInvoiceSubmit} className="grid-form">
            <div>
              <label>المشروع</label>
              <select name="projectId" required className="form-select">
                <option value="">اختر المشروع...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>رقم الفاتورة</label>
              <input type="text" name="number" required placeholder="INV-2026-001" className="form-input" />
            </div>
            <div>
              <label>المبلغ</label>
              <input type="number" name="amount" required min="0.01" step="any" placeholder="0.00" className="form-input" />
            </div>
            <div>
              <label>الحالة</label>
              <select name="status" defaultValue="جزئية" className="form-select">
                <option value="مدفوعة">مدفوعة</option>
                <option value="جزئية">جزئية</option>
                <option value="متأخرة">متأخرة</option>
              </select>
            </div>
            <div>
              <label>تاريخ الاستحقاق</label>
              <input type="date" name="dueDate" className="form-input" />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="secondary-button" onClick={() => setShowAddInvoice(false)}>إلغاء</button>
              <button type="submit" className="main-button">حفظ</button>
            </div>
          </form>
        </div>
      )}

      {showAddExpense && (
        <div className="panel animate-fade-in">
          <SectionTitle icon={WalletCards} title="إضافة مصروف جديد" />
          <form onSubmit={handleAddExpenseSubmit} className="grid-form">
            <div>
              <label>المشروع المرتبط (اختياري)</label>
              <select name="projectId" className="form-select">
                <option value="">غير مرتبط بمشروع محدد</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>نوع المصروف</label>
              <input type="text" name="type" required placeholder="رواتب، خامات، نقل..." className="form-input" />
            </div>
            <div>
              <label>المبلغ</label>
              <input type="number" name="amount" required min="0.01" step="any" placeholder="0.00" className="form-input" />
            </div>
            <div>
              <label>التاريخ</label>
              <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="form-input" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label>وصف المصروف</label>
              <textarea name="description" required placeholder="تفاصيل المصروف..." className="form-input" rows={2} />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" className="secondary-button" onClick={() => setShowAddExpense(false)}>إلغاء</button>
              <button type="submit" className="main-button">حفظ</button>
            </div>
          </form>
        </div>
      )}

      {activeRow && (
        <div className="panel animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <SectionTitle icon={activeRow.kind === "invoice" ? ReceiptText : WalletCards} title={activeRow.kind === "invoice" ? "تفاصيل الفاتورة" : "تفاصيل المصروف"} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="danger-button" style={{ background: "var(--brand)", color: "white" }} onClick={() => handleDeleteRow(activeRow.kind, activeRow.id)}>
                <MIcon name="delete" /> حذف
              </button>
              <button type="button" className="secondary-button" onClick={() => setActive(null)}><X size={15} /> إغلاق</button>
            </div>
          </div>
          <dl className="details-list" style={{ marginBottom: 0 }}>
            <div><dt>{activeRow.kind === "invoice" ? "رقم الفاتورة" : "نوع المصروف"}</dt><dd>{activeRow.label}</dd></div>
            <div><dt>المشروع</dt><dd>{projectName(activeRow.projectId)}</dd></div>
            <div><dt>العميل</dt><dd>{clientName(activeRow.projectId)}</dd></div>
            <div><dt>المبلغ</dt><dd style={{ fontWeight: 700, color: activeRow.kind === "invoice" ? "#16a34a" : "var(--brand)" }}>{currency.format(activeRow.amount)}</dd></div>
            <div><dt>{activeRow.kind === "invoice" ? "الحالة" : "التصنيف"}</dt><dd><Badge value={activeRow.status} /></dd></div>
            <div><dt>التاريخ</dt><dd>{formatDate(activeRow.date)}</dd></div>
            {activeRow.description && (
              <div style={{ gridColumn: "1 / -1" }}><dt>الوصف</dt><dd>{activeRow.description}</dd></div>
            )}
          </dl>
        </div>
      )}

      <div className="panel">
        <SectionTitle icon={WalletCards} title="كل الحركات المالية" />
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: "-6px 0 12px" }}>اضغط على أي حركة لعرض تفاصيلها الكاملة.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>النوع</th>
                <th>البيان</th>
                <th>المشروع</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.kind}-${r.id}`}
                  onClick={() => setActive({ kind: r.kind, id: r.id })}
                  style={{ cursor: "pointer", background: active?.kind === r.kind && active?.id === r.id ? "rgba(225,29,72,0.05)" : undefined }}
                >
                  <td><span className={`badge ${r.kind === "invoice" ? "success" : "danger"}`}>{r.kind === "invoice" ? "فاتورة" : "مصروف"}</span></td>
                  <td>{r.label}</td>
                  <td>{projectName(r.projectId)}</td>
                  <td style={{ fontWeight: 700, color: r.kind === "invoice" ? "#16a34a" : "var(--brand)" }}>{currency.format(r.amount)}</td>
                  <td><Badge value={r.status} /></td>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    {r.kind === "invoice" && (
                      <button
                        type="button"
                        className="secondary-button"
                        title="عرض الفاتورة الضريبية وطباعتها"
                        style={{ minWidth: "auto", padding: "4px 10px", height: "32px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={(event) => {
                          event.stopPropagation();
                          const inv = invoices.find((i) => String(i.id) === String(r.id));
                          if (inv) onPrintInvoice(inv);
                        }}
                      >
                        <Printer size={14} />
                        فاتورة
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const defaultSpecs = [
  "المواصفات: يقوم الطرف الأول بتوريد وتركيب المواد الخاصة اللازمة لنظام الأطفاء العادي والرش الآلي وصناديق الحريق وذلك وفقاً لشروط ومتطلبات الدفاع المدني وحسب جدول الكميات المقدم من الطرف الأول والمعتمد من الطرف الثاني والموضح تفاصيله أدناه:",
  "نوع مواسير الحريق الجزيرة SCH 40 عماني.",
  "نوع المواسير المدفونة (تحت الأرض): البولي إيثيلين عالي الكثافة (HDPE) المنيف.",
  "نوع صناديق الحريق: داخل الجدار (السابح) استانلس ستيل.",
  "نوع الوصلات المستخدمة (سنة): معتمدة من الدفاع المدني أو شركة هيتان BIS.",
  "نوع الوصلات المستخدمة (جروف): معتمدة من الدفاع المدني شركة JUNT كندي.",
  "نوع الرشاشات: معتمد UL - FM من شركة Reliable-Tyco أمريكي.",
  "نوع صمامات الإطفاء: معتمد UL LISTED شركة DUKO OR LEDE.",
  "نوع نظام الإطفاء بالغازات النظيفة: AMERICAN FIRE.",
  "نوع أجهزة الإنذار المعنون: DETNOV إسباني.",
  "نوع أجهزة أول أكسيد الكربون (CO): DETNOV إسباني.",
  "العلامات الإرشادية وإنارة الطوارئ والبطاريات: معتمد UL من شركة KHIND ماليزي.",
  "مضخة الحريق: معتمدة من الدفاع المدني من شركة RKO أو TOSY."
];

function ContractsView({
  contracts,
  projects,
  clients,
  defaultPayments,
  stamp,
  signature,
  setContractPayments,
  addContract,
  deleteContract,
  updateContract,
  onCsvImport,
  site,
  onSelectClaim,
}: {
  contracts: Contract[];
  projects: Project[];
  clients: Client[];
  defaultPayments: PaymentTerm[];
  stamp: string;
  signature: string;
  setContractPayments: (contractId: number, payments: PaymentTerm[]) => void;
  addContract: (event: FormEvent<HTMLFormElement>) => void;
  deleteContract: (id: number) => void;
  updateContract: (updated: Contract) => void;
  onCsvImport: (text: string) => void;
  site: SiteSettings;
  onSelectClaim: (term: PaymentTerm, contract: Contract) => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isEditingContractText, setIsEditingContractText] = useState(false);
  const activeContract = contracts.find((item) => item.id === activeId) ?? null;
  const activeProject = activeContract ? projects.find((item) => item.id === activeContract.projectId) : undefined;
  const activeClient = activeProject ? clients.find((item) => item.id === activeProject.clientId) : undefined;
  const usingCustom = Boolean(activeContract?.payments && activeContract.payments.length > 0);
  const resolvedPayments = usingCustom ? activeContract!.payments! : defaultPayments;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editWarranty, setEditWarranty] = useState("");
  const [editClauses, setEditClauses] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const [editSecondPartyName, setEditSecondPartyName] = useState("");
  const [editSecondPartyRegister, setEditSecondPartyRegister] = useState("");
  const [editSecondPartyRepresentative, setEditSecondPartyRepresentative] = useState("");
  const [editSecondPartyRole, setEditSecondPartyRole] = useState("");
  const [editLocationCity, setEditLocationCity] = useState("");
  const [editLocationDistrict, setEditLocationDistrict] = useState("");
  const [editLocationPlot, setEditLocationPlot] = useState("");
  const [editLocationPlan, setEditLocationPlan] = useState("");
  const [editQuotationNumber, setEditQuotationNumber] = useState("");
  const [editQuotationValue, setEditQuotationValue] = useState(0);
  const [editSpecs, setEditSpecs] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const startEdit = (c: Contract) => {
    setEditingId(c.id);
    setEditValue(c.value);
    setEditWarranty(c.warranty);
    setEditClauses(c.clauses);
    setEditStart(c.startDate);
    setEditEnd(c.endDate);

    setEditSecondPartyName(c.secondPartyName || "");
    setEditSecondPartyRegister(c.secondPartyRegister || "");
    setEditSecondPartyRepresentative(c.secondPartyRepresentative || "");
    setEditSecondPartyRole(c.secondPartyRole || "");
    setEditLocationCity(c.locationCity || "");
    setEditLocationDistrict(c.locationDistrict || "");
    setEditLocationPlot(c.locationPlot || "");
    setEditLocationPlan(c.locationPlan || "");
    setEditQuotationNumber(c.quotationNumber || "");
    setEditQuotationValue(c.quotationValue || 0);
    setEditSpecs(c.specs && c.specs.length > 0 ? c.specs : [...defaultSpecs]);
  };

  const saveEdit = (c: Contract) => {
    updateContract({
      ...c,
      value: editValue,
      warranty: editWarranty,
      clauses: editClauses,
      startDate: editStart,
      endDate: editEnd,
      secondPartyName: editSecondPartyName,
      secondPartyRegister: editSecondPartyRegister,
      secondPartyRepresentative: editSecondPartyRepresentative,
      secondPartyRole: editSecondPartyRole,
      locationCity: editLocationCity,
      locationDistrict: editLocationDistrict,
      locationPlot: editLocationPlot,
      locationPlan: editLocationPlan,
      quotationNumber: editQuotationNumber,
      quotationValue: editQuotationValue,
      specs: editSpecs,
    });
    setEditingId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contracts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contracts.map((c) => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const exportSelected = () => {
    const list = contracts.filter((c) => selectedIds.includes(c.id));
    const target = list.length ? list : contracts;
    downloadCsv(
      "contracts.csv",
      target.map((c) => {
        const p = projects.find((x) => x.id === c.projectId);
        return {
          "رقم العقد": c.id,
          "اسم الموقع": p?.name ?? "",
          "العميل": clients.find((cl) => cl.id === p?.clientId)?.name ?? "",
          "القيمة": c.value,
          "تاريخ البدء": c.startDate,
          "تاريخ النهاية": c.endDate,
          "الضمان": c.warranty,
          "الشروط": c.clauses,
          "اسم الطرف الثاني": c.secondPartyName || "",
          "سجل الطرف الثاني": c.secondPartyRegister || "",
          "ممثل الطرف الثاني": c.secondPartyRepresentative || "",
          "صفة الطرف الثاني": c.secondPartyRole || "",
          "المدينة": c.locationCity || "",
          "الحي": c.locationDistrict || "",
          "رقم القطعة": c.locationPlot || "",
          "رقم المخطط": c.locationPlan || "",
          "رقم عرض السعر": c.quotationNumber || "",
          "قيمة عرض السعر": c.quotationValue || 0,
        };
      }),
    );
  };

  const deleteSelected = () => {
    triggerConfirm(`هل أنت متأكد من حذف ${selectedIds.length} عقود؟`, () => {
      selectedIds.forEach((id) => deleteContract(id));
      setSelectedIds([]);
    });
  };

  const editContractPayment = (id: number, field: "label" | "percent", next: string) => {
    if (!activeContract) return;
    const base = activeContract.payments && activeContract.payments.length > 0 ? activeContract.payments : defaultPayments;
    setContractPayments(
      activeContract.id,
      base.map((term) => (term.id === id ? { ...term, [field]: next } : term)),
    );
  };

  const addContractPayment = () => {
    if (!activeContract) return;
    const base = activeContract.payments && activeContract.payments.length > 0 ? activeContract.payments : defaultPayments;
    setContractPayments(activeContract.id, [...base, { id: nextId(base), label: "دفعة جديدة", percent: "0" }]);
  };

  const removeContractPayment = (id: number) => {
    if (!activeContract) return;
    const base = activeContract.payments && activeContract.payments.length > 0 ? activeContract.payments : defaultPayments;
    setContractPayments(
      activeContract.id,
      base.filter((term) => term.id !== id),
    );
  };

  const resetToDefault = () => {
    if (activeContract) setContractPayments(activeContract.id, []);
  };

  return (
    <section className="content-grid">
      <form className="form-panel" onSubmit={addContract} style={{ gap: "14px" }}>
        <SectionTitle icon={Plus} title="إنشاء عقد جديد" />
        
        <div style={{ borderBottom: "1px dashed var(--line)", paddingBottom: "6px", marginBottom: "4px" }}>
          <strong style={{ fontSize: "0.86rem", color: "var(--brand)" }}>البيانات الأساسية للمشروع:</strong>
        </div>
        <label>
          المشروع / الموقع *
          <select name="projectId" required>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="two-fields">
          <Field label="قيمة العقد *" name="value" type="number" required />
          <label>
            العملة
            <select name="currency" defaultValue="SAR">
              {currencyOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="two-fields">
          <Field label="تاريخ البداية" name="startDate" type="date" />
          <Field label="تاريخ النهاية" name="endDate" type="date" />
        </div>
        <Field label="الضمان (شهور أو سنوات)" name="warranty" defaultValue="سنتين" placeholder="مثال: سنتين" />

        <div style={{ borderBottom: "1px dashed var(--line)", paddingBottom: "6px", marginTop: "8px" }}>
          <strong style={{ fontSize: "0.86rem", color: "var(--brand)" }}>بيانات الطرف الثاني (المالك):</strong>
        </div>
        <div className="two-fields">
          <Field label="اسم المنشأة/العميل" name="secondPartyName" placeholder="الاسم الرسمي للطرف الثاني" />
          <Field label="السجل التجاري/الهوية" name="secondPartyRegister" placeholder="السجل التجاري أو الهوية" />
        </div>
        <div className="two-fields">
          <Field label="يمثلها في التوقيع" name="secondPartyRepresentative" placeholder="اسم ممثل التوقيع" />
          <Field label="الصفة" name="secondPartyRole" defaultValue="المالك" placeholder="المالك / المفوض" />
        </div>

        <div style={{ borderBottom: "1px dashed var(--line)", paddingBottom: "6px", marginTop: "8px" }}>
          <strong style={{ fontSize: "0.86rem", color: "var(--brand)" }}>بيانات موقع العمل وعرض السعر المرفق:</strong>
        </div>
        <div className="two-fields">
          <Field label="المدينة" name="locationCity" defaultValue="الرياض" />
          <Field label="الحي" name="locationDistrict" placeholder="اسم الحي" />
        </div>
        <div className="two-fields">
          <Field label="رقم القطعة" name="locationPlot" placeholder="رقم قطعة الأرض" />
          <Field label="رقم المخطط" name="locationPlan" placeholder="رقم المخطط التنظيمي" />
        </div>
        <div className="two-fields">
          <Field label="رقم عرض السعر" name="quotationNumber" placeholder="رقم عرض السعر المرفق" />
          <Field label="قيمة عرض السعر" name="quotationValue" type="number" placeholder="قيمة عرض السعر" />
        </div>

        <label>
          بنود وشروط إضافية للعقد
          <textarea name="clauses" rows={3} placeholder="شروط عامة أو شروط خاصة إضافية..." />
        </label>

        <div style={{ borderBottom: "1px dashed var(--line)", paddingBottom: "6px", marginTop: "8px" }}>
          <strong style={{ fontSize: "0.86rem", color: "var(--brand)" }}>المواصفات الفنية للأنظمة (13 بنداً):</strong>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto", padding: "8px", border: "1px solid var(--line)", borderRadius: "8px", background: "var(--canvas)" }}>
          {defaultSpecs.map((spec, index) => (
            <Field key={index} label={`المواصفة رقم ${index + 1}`} name={`spec_${index}`} defaultValue={spec} />
          ))}
        </div>

        <button className="primary-button">
          <Plus size={18} />
          إنشاء العقد
        </button>
      </form>

      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          <SectionTitle icon={FileText} title="العقود والضمانات المعتمدة" />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button type="button" className="secondary-button" onClick={toggleSelectAll}>
              {selectedIds.length === contracts.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
            {selectedIds.length > 0 && (
              <>
                <button type="button" className="secondary-button icon-danger text-danger" onClick={deleteSelected} style={{ color: "#ef4444" }}>
                  <Trash2 size={16} />
                  حذف المحدد ({selectedIds.length})
                </button>
                <button type="button" className="secondary-button" onClick={exportSelected}>
                  <Download size={16} />
                  تصدير المحدد
                </button>
              </>
            )}
            {selectedIds.length === 0 && (
              <button type="button" className="secondary-button" onClick={exportSelected}>
                <Download size={16} />
                تصدير الكل (CSV)
              </button>
            )}
            <label className="secondary-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", margin: 0 }}>
              <Download size={16} style={{ transform: "rotate(180deg)" }} />
              <span>استيراد CSV</span>
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const text = evt.target?.result as string;
                      onCsvImport(text);
                    };
                    reader.readAsText(file, "UTF-8");
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="contract-grid">
          {contracts.map((contract) => {
            const project = projects.find((item) => item.id === contract.projectId);
            const client = clients.find((item) => item.id === project?.clientId);
            const isEditing = editingId === contract.id;
            const isSelected = selectedIds.includes(contract.id);
            return (
              <article key={contract.id} className="contract-card" style={{ border: isSelected ? "1.5px solid var(--brand)" : undefined, background: isSelected ? "rgba(225, 29, 72, 0.01)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(contract.id)} />
                    <div>
                      <h3>{project?.name || "—"}</h3>
                      <p>{client?.name || "—"}</p>
                    </div>
                  </div>
                  <button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => triggerConfirm("هل أنت متأكد من حذف هذا العقد؟", () => deleteContract(contract.id))} title="حذف">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBlock: "10px", maxHeight: "350px", overflowY: "auto", paddingInlineEnd: "4px" }}>
                    <label style={{ display: "flex", flexDirection: "column", fontSize: "0.78rem" }}>
                      القيمة
                      <input type="number" style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} />
                    </label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.74rem", flex: 1 }}>
                        البدء
                        <input type="date" style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.74rem", flex: 1 }}>
                        النهاية
                        <input type="date" style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                      </label>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", fontSize: "0.78rem" }}>
                      الضمان
                      <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editWarranty} onChange={(e) => setEditWarranty(e.target.value)} />
                    </label>
                    
                    <strong style={{ fontSize: "0.75rem", color: "var(--brand)", marginTop: "4px" }}>الطرف الثاني (المالك):</strong>
                    <label style={{ display: "flex", flexDirection: "column", fontSize: "0.76rem" }}>
                      اسم المنشأة/العميل
                      <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editSecondPartyName} onChange={(e) => setEditSecondPartyName(e.target.value)} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", fontSize: "0.76rem" }}>
                      السجل التجاري/الهوية
                      <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editSecondPartyRegister} onChange={(e) => setEditSecondPartyRegister(e.target.value)} />
                    </label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        يمثل التوقيع
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editSecondPartyRepresentative} onChange={(e) => setEditSecondPartyRepresentative(e.target.value)} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        الصفة
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editSecondPartyRole} onChange={(e) => setEditSecondPartyRole(e.target.value)} />
                      </label>
                    </div>

                    <strong style={{ fontSize: "0.75rem", color: "var(--brand)", marginTop: "4px" }}>موقع العمل وعرض السعر:</strong>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        المدينة
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editLocationCity} onChange={(e) => setEditLocationCity(e.target.value)} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        الحي
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editLocationDistrict} onChange={(e) => setEditLocationDistrict(e.target.value)} />
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        رقم القطعة
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editLocationPlot} onChange={(e) => setEditLocationPlot(e.target.value)} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        رقم المخطط
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editLocationPlan} onChange={(e) => setEditLocationPlan(e.target.value)} />
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        رقم عرض السعر
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editQuotationNumber} onChange={(e) => setEditQuotationNumber(e.target.value)} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", fontSize: "0.72rem", flex: 1 }}>
                        قيمة عرض السعر
                        <input type="number" style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editQuotationValue} onChange={(e) => setEditQuotationValue(Number(e.target.value))} />
                      </label>
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", fontSize: "0.78rem" }}>
                      شروط عامة إضافية
                      <textarea style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={editClauses} onChange={(e) => setEditClauses(e.target.value)} rows={2} />
                    </label>

                    <strong style={{ fontSize: "0.75rem", color: "var(--brand)", marginTop: "4px" }}>المواصفات الفنية الـ 13:</strong>
                    {editSpecs.map((spec, index) => (
                      <label key={index} style={{ display: "flex", flexDirection: "column", fontSize: "0.7rem" }}>
                        البند {index + 1}
                        <input style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} value={spec} onChange={(e) => {
                          const next = [...editSpecs];
                          next[index] = e.target.value;
                          setEditSpecs(next);
                        }} />
                      </label>
                    ))}
                  </div>

                ) : (
                  <>
                    <strong>{formatMoney(contract.value, contract.currency)}</strong>
                    <dl className="details-list">
                      <div>
                        <dt>البداية</dt>
                        <dd>{formatDate(contract.startDate)}</dd>
                      </div>
                      <div>
                        <dt>النهاية</dt>
                        <dd>{formatDate(contract.endDate)}</dd>
                      </div>
                      <div>
                        <dt>الضمان</dt>
                        <dd>{contract.warranty}</dd>
                      </div>
                    </dl>
                    <p style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "0.85rem", color: "#64748b" }}>{contract.clauses || "لا توجد شروط مخصصة"}</p>
                  </>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  {isEditing ? (
                    <>
                      <button type="button" className="primary-button" style={{ flex: 1, minHeight: "32px", fontSize: "0.78rem" }} onClick={() => saveEdit(contract)}>حفظ</button>
                      <button type="button" className="secondary-button" style={{ flex: 1, minHeight: "32px", fontSize: "0.78rem" }} onClick={() => setEditingId(null)}>إلغاء</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="secondary-button" style={{ flex: 1, minHeight: "32px", fontSize: "0.78rem" }} onClick={() => startEdit(contract)}>تعديل</button>
                      <button type="button" className="secondary-button" style={{ flex: 1.5, minHeight: "32px", fontSize: "0.78rem", background: "rgba(225, 29, 72, 0.04)", border: "1px solid var(--brand)", color: "var(--brand)" }} onClick={() => setActiveId(contract.id)}>
                        <FileText size={15} />
                        عرض العقد
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {activeContract && (
        <div className="contract-modal" role="dialog" aria-modal="true" onClick={() => setActiveId(null)}>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()}>
            <div className="contract-modal-toolbar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button className="primary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة العقد
              </button>
              <button 
                className="primary-button" 
                style={{ background: "#2563eb", color: "#ffffff" }} 
                onClick={(e) => {
                  const target = e.currentTarget.closest(".contract-modal-inner")?.querySelector(".contract-doc") as HTMLElement;
                  if (target) exportHtmlElementToWord(target, `عقد_اتفاق_${activeContract.id}.docx`);
                }}
              >
                <FileText size={17} />
                تحميل Word (Docx)
              </button>
              <button 
                className={isEditingContractText ? "primary-button" : "secondary-button"} 
                style={isEditingContractText ? { background: "#10b981", color: "#fff" } : {}}
                onClick={() => setIsEditingContractText(!isEditingContractText)}
              >
                <Edit size={17} />
                {isEditingContractText ? "إيقاف التعديل المباشر" : "تعديل الكتابة على الشاشة"}
              </button>
              <button className="contract-modal-close" onClick={() => setActiveId(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>

            <div className="contract-payments-editor">
              <div className="payments-editor-head">
                <strong>دفعات هذا العقد</strong>
                <span>{usingCustom ? "مخصصة لهذا العقد" : "الجدول الافتراضي من الإعدادات"}</span>
                {usingCustom && (
                  <button type="button" className="text-button" onClick={resetToDefault}>
                    استرجاع الافتراضي
                  </button>
                )}
              </div>
              <div className="stat-editor">
                {resolvedPayments.map((term) => (
                  <div key={term.id} className="payment-row">
                    <label>
                      وصف الدفعة
                      <input value={term.label} onChange={(event) => editContractPayment(term.id, "label", event.target.value)} />
                    </label>
                    <label>
                      النسبة %
                      <input
                        type="number"
                        value={term.percent}
                        onChange={(event) => editContractPayment(term.id, "percent", event.target.value)}
                      />
                    </label>
                    <button type="button" className="secondary-button" style={{ minWidth: "auto", padding: "4px 8px", marginTop: "16px", height: "35px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(30, 41, 59, 0.05)", border: "1px solid #cbd5e1", color: "#1e293b", fontSize: "0.75rem" }} title="عرض المطالبة المالية" onClick={() => { setActiveId(null); onSelectClaim(term, activeContract!); }}>
                      <FileText size={14} />
                      مطالبة
                    </button>
                    <button type="button" className="icon-danger" style={{ marginTop: "16px" }} title="حذف" onClick={() => removeContractPayment(term.id)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="secondary-button" onClick={addContractPayment}>
                <Plus size={17} />
                إضافة دفعة لهذا العقد
              </button>
            </div>

            <ContractDocument
              contract={activeContract}
              project={activeProject}
              client={activeClient}
              payments={resolvedPayments}
              stamp={stamp}
              signature={signature}
              site={site}
              isEditingText={isEditingContractText}
            />
          </div>
        </div>
      )}
    </section>
  );
}

// أسماء العملات للتفقيط (الوحدة والوحدة الفرعية) حسب رمز العملة.
const currencyWords: Record<string, { unit: string; sub: string }> = {
  SAR: { unit: "ريال سعودي", sub: "هللة" },
  USD: { unit: "دولار أمريكي", sub: "سنت" },
  EUR: { unit: "يورو", sub: "سنت" },
  AED: { unit: "درهم إماراتي", sub: "فلس" },
  QAR: { unit: "ريال قطري", sub: "درهم" },
  KWD: { unit: "دينار كويتي", sub: "فلس" },
  BHD: { unit: "دينار بحريني", sub: "فلس" },
  OMR: { unit: "ريال عماني", sub: "بيسة" },
  EGP: { unit: "جنيه مصري", sub: "قرش" },
  JOD: { unit: "دينار أردني", sub: "قرش" }
};

function numberToArabicWords(value: number | string, currency: string = "SAR"): string {
  const num = parseFloat(value as string);
  if (isNaN(num) || num === 0) return "صفر";

  const currencyObj = currencyWords[currency] || currencyWords.SAR;

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  const integerWords = convertIntegerToArabicWords(integerPart);
  let result = integerWords + " " + currencyObj.unit;

  if (decimalPart > 0) {
    const decimalWords = convertIntegerToArabicWords(decimalPart);
    result += " و" + decimalWords + " " + currencyObj.sub;
  }

  return result;
}

function convertIntegerToArabicWords(num: number): string {
  if (num === 0) return "صفر";
  
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const onesDigit = num % 10;
    const tensDigit = Math.floor(num / 10);
    return (onesDigit > 0 ? ones[onesDigit] + " و" : "") + tens[tensDigit];
  }
  if (num < 1000) {
    const hundredsDigit = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundredsDigit] + (remainder > 0 ? " و" + convertIntegerToArabicWords(remainder) : "");
  }
  if (num < 1000000) {
    const thousandsPart = Math.floor(num / 1000);
    const remainder = num % 1000;
    let thousandLabel = "ألف";
    if (thousandsPart === 1) thousandLabel = "ألف";
    else if (thousandsPart === 2) thousandLabel = "ألفين";
    else if (thousandsPart >= 3 && thousandsPart <= 10) thousandLabel = convertIntegerToArabicWords(thousandsPart) + " آلاف";
    else thousandLabel = convertIntegerToArabicWords(thousandsPart) + " ألف";

    if (thousandsPart === 1) {
      return "ألف" + (remainder > 0 ? " و" + convertIntegerToArabicWords(remainder) : "");
    }
    return thousandLabel + (remainder > 0 ? " و" + convertIntegerToArabicWords(remainder) : "");
  }
  if (num < 1000000000) {
    const millionsPart = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let millionLabel = "مليون";
    if (millionsPart === 1) millionLabel = "مليون";
    else if (millionsPart === 2) millionLabel = "مليونين";
    else if (millionsPart >= 3 && millionsPart <= 10) millionLabel = convertIntegerToArabicWords(millionsPart) + " ملايين";
    else millionLabel = convertIntegerToArabicWords(millionsPart) + " مليون";

    if (millionsPart === 1) {
      return "مليون" + (remainder > 0 ? " و" + convertIntegerToArabicWords(remainder) : "");
    }
    return millionLabel + (remainder > 0 ? " و" + convertIntegerToArabicWords(remainder) : "");
  }

  return num.toString();
}

function getArabicDayName(dateString: string | Date): string {
  const date = new Date(dateString);
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[date.getDay()] || "";
}

function formatArabicDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "");
}

function PageWatermark() {
  return null;
}

function DocumentHeader({ documentTitle, site }: { documentTitle?: string; site?: SiteSettings }) {
  void site;
  if (!documentTitle) return null;

  return (
    <div className="doc-header-info-block" style={{ position: "absolute", top: "34mm", left: 0, right: 0, padding: "0 40px", direction: "rtl", zIndex: 2, display: "flex", justifyContent: "center" }}>
      <span style={{ 
        display: "inline-block", 
        padding: "6px 26px", 
        background: "#d91c24", 
        color: "#ffffff", 
        fontWeight: "800", 
        fontSize: "1.15rem", 
        borderRadius: "6px",
        boxShadow: "0 2px 5px rgba(217, 28, 36, 0.25)"
      }}>
        {documentTitle}
      </span>
    </div>
  );
}

/**
 * الفاتورة الضريبية — صفحة A4 واحدة بنفس ترويسة باقي المستندات.
 *
 * قياس السعة على نسخة طبق الأصل: 14 بنداً بالمقاس الحالي. البنود الزائدة
 * كانت ستُقصّ بصمت بسبب overflow:hidden، لذلك يصغُر الخط مرتين ثم يظهر
 * تحذير — نفس معالجة العقد وعرض السعر.
 */
function InvoiceDocument({
  invoice,
  project,
  client,
  site,
  stamp,
  signature,
}: {
  invoice: Invoice;
  project?: Project;
  client?: Client;
  site: SiteSettings;
  stamp: string;
  signature: string;
}) {
  const currency = "SAR";
  const items = invoice.items ?? [];
  const subtotal = invoice.subtotal ?? items.reduce((s, it) => s + it.total, 0);
  const vatPercent = invoice.vatPercent ?? 15;
  const vatAmount = invoice.vatAmount ?? Math.round(subtotal * vatPercent) / 100;
  const total = invoice.amount || subtotal + vatAmount;
  const issuedAt = invoice.date ? new Date(invoice.date) : new Date();

  const sellerName = site.companyNameAr || "مؤسسة كنان لأنظمة الأمن والسلامة";
  const sellerTax = site.companyTaxNumber || "313072607300003";

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    // التحميل عند الطلب: مكتبة QR لا داعي لتحميلها مع بقية الشاشات
    import("qrcode")
      .then(async (QR) => {
        const payload = zatcaQrPayload({
          sellerName,
          sellerTaxNumber: sellerTax,
          issuedAt,
          totalWithVat: total,
          vatAmount,
        });
        const url = await QR.toDataURL(payload, { margin: 0, width: 220 });
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        /* بلا رمز أفضل من كسر المستند كله */
      });
    return () => {
      cancelled = true;
    };
  }, [sellerName, sellerTax, total, vatAmount, invoice.date]);

  const ITEM_CAPACITY = 14;
  const itemFont = items.length <= 10 ? "0.78rem" : items.length <= 12 ? "0.72rem" : "0.66rem";
  const itemPad = items.length <= 10 ? "5px" : items.length <= 12 ? "4px" : "3px";

  const cell = { padding: itemPad, border: "1px solid #cbd5e1", fontSize: itemFont } as const;

  return (
    <div className="contract-doc">
      <div className="contract-page" style={{ position: "relative", overflow: "hidden" }}>
        <PageWatermark />
        <DocumentHeader documentTitle="فاتورة ضريبية" site={site} />

        <h2 style={{ textAlign: "center", fontSize: "1.15rem", color: "#1e293b", marginBlock: "4px 9px", fontWeight: "800" }}>
          فاتورة ضريبية — Tax Invoice
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px", fontSize: "0.78rem", background: "#f8fafc", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", direction: "rtl" }}>
          <div><strong>رقم الفاتورة:</strong> {invoice.number}</div>
          <div style={{ textAlign: "left" }}><strong>تاريخ الإصدار:</strong> {formatDate(invoice.date)}</div>
          <div><strong>المشروع:</strong> {project?.name || "—"}</div>
          <div style={{ textAlign: "left" }}><strong>تاريخ الاستحقاق:</strong> {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}</div>
          <div><strong>الحالة:</strong> {invoice.status}</div>
          <div style={{ textAlign: "left" }}><strong>طريقة السداد:</strong> تحويل بنكي</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", direction: "rtl" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ ...cell, textAlign: "right", width: "50%" }}>البائع (المورّد)</th>
              <th style={{ ...cell, textAlign: "right" }}>المشتري (العميل)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...cell, textAlign: "right" }}>
                <strong>{sellerName}</strong><br />
                الرقم الضريبي: {sellerTax}
                {site.companyCRNumber ? ` — س.ت: ${site.companyCRNumber}` : ""}<br />
                {site.contactAddress || "الرياض — المملكة العربية السعودية"}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                <strong>{client?.name || "—"}</strong><br />
                الرقم الضريبي: {client?.taxId || "—"}
                {client?.commercialRegister ? ` — س.ت: ${client.commercialRegister}` : ""}<br />
                {client?.address || "—"}{client?.phone ? ` — ${client.phone}` : ""}
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ ...cell, textAlign: "center", width: "34px" }}>#</th>
              <th style={{ ...cell, textAlign: "right" }}>البيان / الوصف</th>
              <th style={{ ...cell, textAlign: "center", width: "55px" }}>الكمية</th>
              <th style={{ ...cell, textAlign: "left", width: "92px" }}>سعر الوحدة</th>
              <th style={{ ...cell, textAlign: "left", width: "96px" }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ ...cell, textAlign: "center" }}>{index + 1}</td>
                <td style={{ ...cell, textAlign: "right" }}>{item.description}</td>
                <td style={{ ...cell, textAlign: "center" }}>{item.quantity}</td>
                <td style={{ ...cell, textAlign: "left" }}>{formatMoney(item.unitPrice, currency)}</td>
                <td style={{ ...cell, textAlign: "left" }}>{formatMoney(item.total, currency)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...cell, textAlign: "center", color: "#64748b" }}>
                  فاتورة بمبلغ إجمالي بلا بنود تفصيلية.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {items.length > ITEM_CAPACITY && (
          <p style={{ marginTop: "6px", padding: "6px 10px", border: "1px solid #dc2626", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", fontSize: "0.72rem", fontWeight: "700" }}>
            تنبيه: عدد البنود ({items.length}) يتجاوز ما تتّسع له الصفحة ({ITEM_CAPACITY} بنداً).
            البنود الأخيرة لن تظهر في النسخة المطبوعة — قسّم الفاتورة أو ادمج البنود المتشابهة.
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginTop: "10px", direction: "rtl" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flex: 1 }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="رمز الفاتورة الضريبية" style={{ width: "24mm", height: "24mm", flex: "none", border: "1px solid #e2e8f0", borderRadius: "6px" }} />
            ) : (
              <div style={{ width: "24mm", height: "24mm", flex: "none", border: "1px dashed #94a3b8", borderRadius: "6px", display: "grid", placeItems: "center", fontSize: "0.62rem", color: "#64748b", textAlign: "center" }}>
                رمز QR
              </div>
            )}
            <div style={{ flex: 1, padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc" }}>
              <strong style={{ fontSize: "0.82rem", color: "#1e3a8a", display: "block", borderBottom: "1px dashed #cbd5e1", paddingBottom: "5px", marginBottom: "6px" }}>
                الحساب البنكي والضريبي للمؤسسة:
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 15px", fontSize: "0.78rem", color: "#334155" }}>
                <div><strong>اسم البنك:</strong> مصرف الراجحي</div>
                <div style={{ textAlign: "left" }}><strong>الرقم الضريبي:</strong> {sellerTax}</div>
                <div style={{ gridColumn: "span 2" }}><strong>الآيبان:</strong> <code style={{ fontStyle: "normal" }}>SA9080000448608016265902</code></div>
              </div>
            </div>
          </div>

          <table style={{ width: "82mm", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              <tr><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1" }}>الإجمالي قبل الضريبة</td><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(subtotal, currency)}</td></tr>
              <tr><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1" }}>وعاء ضريبة القيمة المضافة</td><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(subtotal, currency)}</td></tr>
              <tr><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1" }}>ضريبة القيمة المضافة ({vatPercent}%)</td><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(vatAmount, currency)}</td></tr>
              <tr><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1", background: "#fff5f5", fontWeight: "800", color: "#e11d48" }}>الإجمالي المستحق</td><td style={{ padding: "5px 9px", border: "1px solid #cbd5e1", background: "#fff5f5", fontWeight: "800", color: "#e11d48", textAlign: "left" }}>{formatMoney(total, currency)}</td></tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontWeight: "600", fontSize: "0.8rem", marginBlock: "8px", textAlign: "right", direction: "rtl" }}>
          الإجمالي كتابةً: فقط {numberToArabicWords(total, currency)} لا غير، شامل ضريبة القيمة المضافة.
        </p>

        <table className="contract-sign-table" style={{ marginTop: "6px", direction: "rtl", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "right", padding: "4px 6px", fontSize: "0.8rem" }}>المُصدِر</th>
              <th style={{ textAlign: "right", padding: "4px 6px", fontSize: "0.8rem" }}>استلام العميل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="sign-cell" style={{ padding: "7px", fontSize: "0.78rem" }}>
                  <span style={{ fontWeight: "800", display: "block" }}>{sellerName}</span>
                  <span>يمثلها: المهندس طارق مختار علي</span>
                  {stamp && <img src={stamp} alt="ختم المؤسسة" className="stamp-img" style={{ maxHeight: "50px", marginBlock: "4px" }} />}
                  {signature && <img src={signature} alt="توقيع المؤسسة" className="stamp-img" style={{ maxHeight: "50px", marginBlock: "4px" }} />}
                  <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "10px", display: "block" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
              <td>
                <div className="sign-cell" style={{ padding: "7px", fontSize: "0.78rem" }}>
                  <span style={{ fontWeight: "800", display: "block" }}>{client?.name || "................"}</span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "10px", display: "block" }}>التوقيع بالاستلام: ............................</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClaimDocument({
  contract,
  project,
  client,
  paymentTerm,
  stamp,
  signature,
  site,
}: {
  contract: Contract;
  project?: Project;
  client?: Client;
  paymentTerm: PaymentTerm;
  stamp: string;
  signature: string;
  site: SiteSettings;
}) {
  const contractCurrency = contract.currency || "SAR";
  const amountValue = (Number(contract.value) * (Number(paymentTerm.percent) || 0)) / 100;
  const vatValue = amountValue * 0.15;
  const totalValue = amountValue + vatValue;

  const valueWords = numberToArabicWords(totalValue, contractCurrency);
  const formattedDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="contract-doc">
      <div className="contract-page" style={{ position: "relative", overflow: "hidden" }}>
        <PageWatermark />
        <DocumentHeader documentTitle="مطالبة مالية" site={site} />

        <h2 style={{ textAlign: "center", fontSize: "1.4rem", color: "#1e293b", marginBlock: "20px", fontWeight: "800" }}>مطالبة مالية بالدفعة</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", fontSize: "0.85rem", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", direction: "rtl" }}>
          <div><strong>رقم المطالبة:</strong> CL-{contract.id.toString().slice(0, 8)}-{paymentTerm.id}</div>
          <div style={{ textAlign: "left" }}><strong>التاريخ:</strong> {formattedDate} م</div>
          <div><strong>السادة:</strong> {contract.secondPartyName || client?.name || "................"}</div>
          <div style={{ textAlign: "left" }}><strong>المشروع:</strong> {project?.name || "................"}</div>
          <div><strong>رقم العقد:</strong> CN-{contract.id.toString().slice(0, 8)}</div>
          <div style={{ textAlign: "left" }}><strong>رقم عرض السعر:</strong> {contract.quotationNumber || "—"}</div>
        </div>

        <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "15px", direction: "rtl", textAlign: "right" }}>
          إشارة إلى عقد الاتفاق المبرم لتنفيذ أعمال أنظمة السلامة ومكافحة الحريق، نتقدم إليكم بموجب هذا الطلب بالمطالبة المالية لقيمة الدفعة المستحقة حسب شروط العقد الموضحة تفاصيلها أدناه:
        </p>

        <div className="table-wrap" style={{ marginBlock: "15px", direction: "rtl" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>بيان الدفعة</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center", width: "100px" }}>النسبة من العقد</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "left", width: "120px" }}>قيمة الدفعة</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "left", width: "120px" }}>ضريبة القيمة المضافة (15%)</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "left", width: "130px" }}>الإجمالي المستحق</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #cbd5e1", fontWeight: "600" }}>{paymentTerm.label}</td>
                <td style={{ padding: "10px", border: "1px solid #cbd5e1", textAlign: "center" }}>{paymentTerm.percent}%</td>
                <td style={{ padding: "10px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(amountValue, contractCurrency)}</td>
                <td style={{ padding: "10px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(vatValue, contractCurrency)}</td>
                <td style={{ padding: "10px", border: "1px solid #cbd5e1", textAlign: "left", fontWeight: "700", color: "#e11d48", background: "#fff5f5" }}>{formatMoney(totalValue, contractCurrency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="contract-intro-p" style={{ fontWeight: "600", fontSize: "0.9rem", marginBlock: "15px", textAlign: "right", direction: "rtl" }}>
          المبلغ المطلوب كتابةً: فقط {valueWords} شامل ضريبة القيمة المضافة.
        </p>

        {/* المسافات مضغوطة عمداً: بالقيم السابقة (هامش توقيع 60px وجدول 25px)
            كان المستند يتجاوز ارتفاع A4 بنحو 11مم، فيجلس صف التوقيع فوق الشريط
            الأحمر في أسفل الترويسة عند الطباعة. */}
        <table className="contract-sign-table" style={{ marginTop: "12px", direction: "rtl", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "right", padding: "6px" }}>مقدم الطلب (الطرف الأول)</th>
              <th style={{ textAlign: "right", padding: "6px" }}>اعتماد العميل (الطرف الثاني)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="sign-cell" style={{ minHeight: "90px", padding: "8px" }}>
                  <span style={{ fontWeight: "800", display: "block" }}>{site.companyNameAr || "مؤسسة كنان لأنظمة الأمن والسلامة"}</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>يمثلها: المهندس طارق مختار علي</span>
                  {stamp && <img src={stamp} alt="ختم الطرف الأول" className="stamp-img" style={{ maxHeight: "60px", marginBlock: "4px" }} />}
                  {signature && <img src={signature} alt="توقيع الطرف الأول" className="stamp-img" style={{ maxHeight: "60px", marginBlock: "4px" }} />}
                  <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "24px", display: "block" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
              <td>
                <div className="sign-cell" style={{ minHeight: "90px", padding: "8px" }}>
                  <span style={{ fontWeight: "800", display: "block" }}>{contract.secondPartyName || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>يمثلها: {contract.secondPartyRepresentative || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>الصفة: {contract.secondPartyRole || "المالك"}</span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "24px", display: "block" }}>التوقيع بالاعتماد: ............................</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bank Details box formatted exactly like client screenshots */}
        <div style={{ marginTop: "12px", padding: "10px 15px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", direction: "rtl" }}>
          <strong style={{ fontSize: "0.9rem", color: "#1e3a8a", display: "block", borderBottom: "1px dashed #cbd5e1", paddingBottom: "6px", marginBottom: "8px" }}>
            الحساب البنكي والضريبي للمؤسسة:
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 15px", fontSize: "0.85rem", color: "#334155" }}>
            <div><strong>اسم البنك:</strong> مصرف الراجحي</div>
            <div style={{ textAlign: "left" }}><strong>الرقم الضريبي:</strong> {site.companyTaxNumber || "313072607300003"}</div>
            <div style={{ gridColumn: "span 2" }}><strong>رقم الحساب:</strong> <code style={{ fontStyle: "normal", letterSpacing: "0.5px" }}>448000010006086265902</code></div>
            <div style={{ gridColumn: "span 2" }}><strong>الآيبان:</strong> <code style={{ fontStyle: "normal", letterSpacing: "0.5px" }}>SA9080000448608016265902</code></div>
          </div>
        </div>

        <ContractFooter site={site} />
      </div>
    </div>
  );
}

function ContractDocument({
  contract,
  project,
  client,
  payments,
  stamp,
  signature,
  site,
  isEditingText = false,
}: {
  contract: Contract;
  project?: Project;
  client?: Client;
  payments: PaymentTerm[];
  stamp: string;
  signature: string;
  site: SiteSettings;
  isEditingText?: boolean;
}) {
  const contractCurrency = contract.currency || "SAR";
  const valueWords = numberToArabicWords(contract.value, contractCurrency);
  const dayName = getArabicDayName(contract.startDate);
  const formattedStartDate = formatArabicDate(contract.startDate);
  const paymentAmount = (percent: string) => formatMoney((Number(contract.value) * (Number(percent) || 0)) / 100, contractCurrency);
  const resolvedSpecs = contract.specs && contract.specs.length > 0 ? contract.specs : defaultSpecs;

  const defaultPayments = [
    { id: 1, label: "عند التعميد", percent: "30" },
    { id: 2, label: "عند الانتهاء من تمديد شبكة الإطفاء وتأسيس نقاط الإنذار للقبو الأول", percent: "15" },
    { id: 3, label: "عند الانتهاء من تمديد شبكة الإطفاء وتأسيس نقاط الإنذار للقبو الثاني", percent: "15" },
    { id: 4, label: "عند الانتهاء من تمديد شبكة الإطفاء وتأسيس نقاط الإنذار للدور الأرضي", percent: "15" },
    { id: 5, label: "عند الانتهاء من تمديد شبكة الإطفاء وتأسيس الإنذار للدور الأول والملحق", percent: "15" },
    { id: 6, label: "عند الانتهاء من تسليم المشروع للدفاع المدني واستخراج الشهادات", percent: "10" }
  ];
  const resolvedPayments = payments && payments.length > 0 ? payments : defaultPayments;

  return (
    <div className="contract-doc" contentEditable={isEditingText} suppressContentEditableWarning={true} style={isEditingText ? { outline: "2px dashed #2563eb", borderRadius: "8px", padding: "4px" } : {}}>
      {/* ==================== PAGE 1 ==================== */}
      <div className="contract-page" style={{ position: "relative", overflow: "hidden", background: "#ffffff", padding: "12mm 15mm 15mm 15mm" }}>
        <DocumentHeader documentTitle="عقد اتفاق" site={site} />

        <h2 className="contract-page-title" style={{ fontSize: "1.5rem", margin: "4px 0 10px 0" }}>عقد الاتفاق</h2>
        <p className="contract-intro-p" style={{ fontSize: "0.88rem", lineHeight: "1.55", marginBottom: "8px" }}>
          بعون الله تعالى تم الاتفاق في مدينة الرياض يوم {dayName} بتاريخ {formattedStartDate}م بين كل من:
        </p>

        <div className="contract-parties-box" style={{ margin: "8px 0" }}>
          <div className="party-card" style={{ padding: "8px 10px" }}>
            <h4 style={{ fontSize: "0.92rem", marginBottom: "6px" }}>الطرف الأول (المقاول):</h4>
            <ul className="party-details" style={{ fontSize: "0.82rem", lineHeight: "1.5" }}>
              <li><strong>الاسم:</strong> {site.companyNameAr || "مؤسسة كنان لأنظمة الأمن والسلامة"}</li>
              <li><strong>السجل التجاري:</strong> {site.companyCRNumber || "7050404537"}</li>
              <li><strong>يمثلها في التوقيع:</strong> المهندس طارق مختار علي</li>
              <li><strong>الصفة:</strong> مدير المشاريع</li>
              <li><strong>العنوان:</strong> {site.contactAddress || "الرياض - حي الفيحاء - شارع المطر"}</li>
              <li><strong>الهاتف:</strong> {site.contactPhone || "0574590198"}</li>
              <li><strong>البريد الإلكتروني:</strong> {site.contactEmail || "info@kenan4saftey.com"}</li>
            </ul>
          </div>
          <div className="party-card" style={{ padding: "8px 10px" }}>
            <h4 style={{ fontSize: "0.92rem", marginBottom: "6px" }}>الطرف الثاني (المالك):</h4>
            <ul className="party-details" style={{ fontSize: "0.82rem", lineHeight: "1.5" }}>
              <li><strong>اسم المنشأة/العميل:</strong> {contract.secondPartyName || client?.name || "................"}</li>
              <li><strong>السجل التجاري/الهوية:</strong> {contract.secondPartyRegister || client?.phone || "................"}</li>
              <li><strong>يمثلها في التوقيع:</strong> {contract.secondPartyRepresentative || client?.name || "................"}</li>
              <li><strong>الصفة:</strong> {contract.secondPartyRole || "المالك"}</li>
              <li><strong>العنوان:</strong> {client?.address || "................"}</li>
              <li><strong>الهاتف:</strong> {client?.phone || "................"}</li>
              <li><strong>البريد الإلكتروني:</strong> {client?.phone ? `${client.phone}@client.com` : "................"}</li>
            </ul>
          </div>
        </div>

        <p className="contract-intro-p" style={{ fontSize: "0.86rem", lineHeight: "1.5", marginTop: "6px", marginBottom: "8px", color: "#000000" }}>
          ويشار إليهم مجتمعين بهذا العقد بالطرفين أو الطرفان وحيث اتفق الطرفان على أن يقوم الطرف الأول بتنفيذ وتوريد وتركيب شبكة إطفاء الحريق العادي والرش الآلي ونظام التهوية للموقع الخاص بالطرف الثاني الكائن بمدينة {contract.locationCity || "الرياض"}{contract.locationDistrict ? `، حي ${contract.locationDistrict}` : ""}، على قطعة رقم ({contract.locationPlot || "—"})، من المخطط التنظيمي رقم ({contract.locationPlan || "—"}) وعليه قد تقدم الطرف الأول بعرضه بجدول للكميات مرفق بعرض الأسعار رقم ({contract.quotationNumber || `QT-${contract.id + 650}`}) وقيمته ({formatMoney(contract.quotationValue || contract.value, contractCurrency)}) فقط {numberToArabicWords(contract.quotationValue || contract.value, contractCurrency)} شامل ضريبة القيمة المضافة. وبهذا فقد تم الاتفاق والتعاقد بين الطرفين على ما يلي:
        </p>

        <h3 className="contract-section-title" style={{ marginTop: "8px", marginBottom: "4px", fontSize: "0.95rem" }}>البنود والمواصفات:</h3>
        <p style={{ fontSize: "0.84rem", margin: "0 0 6px 0" }}>بحسب العرض الفني المقدم من الطرف الأول والمعتمد من قبل الطرف الثاني والموضح تفاصيله أدناه:</p>
        <ol className="spec-list" style={{ fontSize: "0.84rem", lineHeight: "1.45", paddingRight: "18px", margin: "0 0 10px 0" }}>
          {resolvedSpecs.map((spec, index) => (
            <li key={index} style={{ marginBottom: "2px" }}>{spec}</li>
          ))}
        </ol>

        <h3 className="contract-section-title" style={{ marginTop: "10px", marginBottom: "4px", fontSize: "0.95rem" }}>الشروط العامة:</h3>
        <ol className="terms-list" style={{ fontSize: "0.84rem", lineHeight: "1.45", paddingRight: "18px", margin: 0 }}>
          {(site.contractGeneralTerms || `مدة هذا المشروع سنة وتعتمد حسب سير العمل في الموقع، تبدأ اعتبارا من تاريخ توقيع العقد بين الطرفين واستلام الدفعة الأولى غير قابلة للتمديد.
إنهاء الأعمال والاستلام والتسليم:
- يقوم الطرف الأول بإشعار الطرف الثاني بإنهاء الأعمال، ويقوم بتسليمه الاستشاري طبقاً للمخططات المعتمدة واستخراج شهادة إنهاء التركيبات للموقع وتوقيع محضر استلام وحساب ما للطرف الأول وما عليه وتسليمه باقي مستحقاته بالتنسيق مع الدفاع المدني.
- لا يحق لأي طرف من الطرفين إلغاء العقد بعد البدء والمباشرة في العمل إلا بخطاب رسمي يبدي أسباب فسخ العقد.
ضمان الأعمال:
- ضمان الطرف الأول لمدة سنة على جميع الأجهزة والمواد من تاريخ تسليم الموقع، والضمان للأعطال ولا يشمل سوء الاستخدام.
- يكون ضمان الأعمال من الطرف الأول لمدة سنة من تاريخ تسليم المشروع.
- صيانة مجانية لمدة سنة من تاريخ التشغيل.
يقوم الطرف الثاني بتوفير مصدر الكهرباء والمياه والأعمال المدنية كالتكسير والتلييس والحفر والردم وقاطع الكهرباء والكابل وتوصيل الخاص بالمضخة والرافعة في حالة الارتفاعات التي تزيد عن 8 متر.
يلتزم الطرف الثاني بأخلاء الموقع للعمل بالتنسيق مع الطرف الأول وتسهيل مهمة العاملين للتنفيذ.
الطرف الأول غير مسؤول عن أي مخالفات معمارية في الموقع.`)
            .split("\n")
            .map((line, i) => line.trim() && <li key={i} style={{ marginBottom: "2px" }}>{line.trim()}</li>)
          }
          <li>تبلغ القيمة الإجمالية لهذا العقد مبلغ وقدره ({formatMoney(contract.value, contractCurrency)}) فقط {valueWords} شامل ضريبة القيمة المضافة.</li>
        </ol>
      </div>

      {/* ==================== PAGE 2 ==================== */}
      <div className="contract-page" style={{ position: "relative", overflow: "hidden", background: "#ffffff", padding: "12mm 15mm 15mm 15mm" }}>
        <h3 className="contract-section-title" style={{ marginTop: "4px", marginBottom: "4px", fontSize: "0.95rem" }}>الجزاءات والغرامات:</h3>
        <ol className="terms-list" style={{ fontSize: "0.84rem", lineHeight: "1.45", paddingRight: "18px", margin: "0 0 8px 0" }}>
          {(site.contractFines || `في حال لم ينته المقاول من تنفيذ الأعمال المتعاقد عليها بعد انقضاء المدة المحددة للعقد، يتم احتساب غرامة تأخير على الطرف الأول بمقدار (300) ريال عن كل يوم تأخير، على ألا يتجاوز إجمالي هذه المبالغ 10% من قيمة العقد.
للطرف الثاني الحق في خصم تلك الغرامة من مستحقات المقاول بعد إخطار الطرف الأول بخطاب رسمي عن طريق الإيميل المدون بهذا العقد.`)
            .split("\n")
            .map((line, i) => line.trim() && <li key={i} style={{ marginBottom: "2px" }}>{line.trim()}</li>)
          }
        </ol>

        <h3 className="contract-section-title" style={{ marginTop: "8px", marginBottom: "4px", fontSize: "0.95rem" }}>المراسلات:</h3>
        <p className="contract-intro-p" style={{ fontSize: "0.86rem", lineHeight: "1.5", marginBottom: "8px" }}>
          تتم المراسلات الرسمية بين الطرفين بواسطة البريد الإلكتروني والجوال الموضح بهذا العقد، وتعتبر الرسائل المرسلة إلى البريد أو الجوال إشعاراً بالوصول وهي تبرأ الذمة بمجرد الإرسال، ويلتزم كلا الطرفين بإشعار الطرف الآخر خطياً في حال تغير عنوانه.
        </p>

        <h3 className="contract-section-title" style={{ marginTop: "8px", marginBottom: "4px", fontSize: "0.95rem" }}>العمالة والسلامة:</h3>
        <ol className="terms-list" style={{ fontSize: "0.84rem", lineHeight: "1.45", paddingRight: "18px", margin: "0 0 8px 0" }}>
          {(site.contractSafety || `يلتزم الطرف الأول بتوفير وتأمين العدد الكافي من الأيدي العاملة اللازمة والمطلوبة لتنفيذ المشروع.
يلتزم الطرف الأول بتوفير عمالة فنية ماهرة ذات الخبرة في تنفيذ جميع الأعمال.
يلتزم الطرف الأول بتأمين الأعمال في الموقع وإلزام العمالة بالالتزام باشتراطات الأمن والسلامة في الموقع.
يعد الطرف الأول مسئول مسؤولية تامة عن سلامة جميع العاملين بالموقع كما يعتبر مسؤول عن كافة تصرفات العاملين وسلوكهم داخل المشروع ومع المجاورين، دون أدنى مسؤولية على الطرف الثاني.
يلتزم الطرف الأول باستمرار العمل دون توقف كما يلتزم الطرف الثاني بتسليم الدفعات في وقتها مع المراحل المذكورة في بند الدفعات.
يلتزم الطرف الأول باستبدال أي عامل أو موظف يطلب الطرف الثاني أو من يمثله استبداله بسبب مخالفته أو عدم اتقانه للعمل.`)
            .split("\n")
            .map((line, i) => line.trim() && <li key={i} style={{ marginBottom: "2px" }}>{line.trim()}</li>)
          }
        </ol>

        <h3 className="contract-section-title" style={{ marginTop: "8px", marginBottom: "4px", fontSize: "0.95rem" }}>الدفعات المالية:</h3>
        <ol className="terms-list" style={{ fontSize: "0.84rem", lineHeight: "1.45", paddingRight: "18px", margin: "0 0 10px 0" }}>
          {resolvedPayments.map((term, i) => (
            <li key={term.id || i} style={{ marginBottom: "2px" }}>
              دفع <strong>{term.percent}%</strong> {term.label} (بقيمة {paymentAmount(term.percent)}).
            </li>
          ))}
        </ol>

        <h3 className="contract-section-title" style={{ marginTop: "8px", marginBottom: "4px", fontSize: "0.95rem" }}>تسوية الخلافات والقانون الواجب التطبيق:</h3>
        <p className="contract-intro-p" style={{ fontSize: "0.86rem", lineHeight: "1.5", marginBottom: "8px" }}>
          {site.contractDisputes || `اتفق الطرفان على أن أي خلاف أو نزاع ينشأ بينهما، فإنهما يلتزمان ببذل كافة المساعي الودية لتسويته، وإلا فإنه يتم اللجوء الى المحكمة المختصة في الرياض، ولا يحول الخلاف أو النزاع الحاصل دون الالتزام بتطبيق هذا العقد واستمرار الطرفين في تنفيذ الأعمال بالشكل المتعاقد عليه. وفي جميع الأحوال لا يجوز للطرف الثاني مطالبة الطرف الأول بعدم الاستمرار في تنفيذ الأعمال ما دام يلتزم ببنود هذا العقد.`}
        </p>
        
        <p className="contract-intro-p" style={{ fontWeight: "800", textAlign: "center", margin: "14px 0 6px 0", fontSize: "0.88rem" }}>
          بهذا يقر الطرفان أنهما اطلعوا على بنود هذه الاتفاقية وفهما فهماً تاماً نافياً للجهالة وبالتوقيع عليها تصبح سارية.
        </p>
        
        <p className="contract-intro-p" style={{ textAlign: "center", fontStyle: "italic", marginBottom: "12px", fontSize: "0.84rem" }}>
          وعلى هذا تم الاتفاق بين الطرفين وتوقيع العقد من نسختين، والله ولي التوفيق.
        </p>

        <table className="contract-sign-table" style={{ margin: "10px 0" }}>
          <thead>
            <tr>
              <th style={{ padding: "6px", fontSize: "0.88rem" }}>الطرف الأول</th>
              <th style={{ padding: "6px", fontSize: "0.88rem" }}>الطرف الثاني</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "8px" }}>
                <div className="sign-cell" style={{ minHeight: "90px" }}>
                  <span style={{ fontWeight: "800", display: "block", fontSize: "0.88rem" }}>مؤسسة كنان لأنظمة الأمن والسلامة</span>
                  <span style={{ fontSize: "0.82rem", display: "block" }}>يمثلها: المهندس طارق مختار علي</span>
                  {stamp && <img src={stamp} alt="ختم الطرف الأول" className="stamp-img" style={{ maxHeight: "65px" }} />}
                  {signature && <img src={signature} alt="توقيع الطرف الأول" className="stamp-img" style={{ maxHeight: "65px" }} />}
                  <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "24px" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
              <td style={{ padding: "8px" }}>
                <div className="sign-cell" style={{ minHeight: "90px" }}>
                  <span style={{ fontWeight: "800", display: "block", fontSize: "0.88rem" }}>{contract.secondPartyName || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.82rem", display: "block" }}>يمثلها: {contract.secondPartyRepresentative || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.82rem", display: "block" }}>الصفة: {contract.secondPartyRole || "المالك"}</span>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "24px" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bank-info-box" style={{ marginTop: "10px", padding: "8px 12px", background: "#f8fafc", border: "1px solid #cbd5e1" }}>
          <strong style={{ fontSize: "0.85rem", color: "#1e3a8a", display: "block", borderBottom: "1px dashed #cbd5e1", paddingBottom: "4px", marginBottom: "6px" }}>
            الحساب البنكي والضريبي للمؤسسة:
          </strong>
          <div className="bank-info-grid" style={{ fontSize: "0.82rem", gridGap: "4px 12px" }}>
            <div><strong>اسم البنك:</strong> مصرف الراجحي</div>
            <div><strong>الرقم الضريبي:</strong> {site.companyTaxNumber || "313072607300003"}</div>
            <div style={{ gridColumn: "span 2" }}><strong>رقم الحساب:</strong> <code style={{ fontStyle: "normal" }}>448000010006086265902</code></div>
            <div style={{ gridColumn: "span 2" }}><strong>الآيبان:</strong> <code style={{ fontStyle: "normal" }}>SA9080000448608016265902</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractFooter({ site }: { site?: SiteSettings }) {
  void site;
  return null;
}

function ReportsView({
  projects,
  clients,
  workers,
  inventory,
  invoices,
  expenses,
  attendance,
  downloadReportPdf,
  downloadReportExcel,
}: {
  projects: Project[];
  clients: Client[];
  workers: Worker[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  downloadReportPdf: (id: string | number, name: string) => void;
  downloadReportExcel: (id: string | number, name: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"projects" | "finance" | "quick">("projects");
  const [selectedProjId, setSelectedProjId] = useState<number | string>("");

  // date states for finance report
  const [startDate, setStartDate] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-01-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // نطاق التصدير السريع: كل المشاريع افتراضياً، أو مشروع بعينه عند اختياره
  const [quickProjId, setQuickProjId] = useState<number | string>("");
  const quickProject = projects.find((p) => String(p.id) === String(quickProjId)) ?? null;
  const belongsToQuickProject = (projectId: unknown) =>
    !quickProject || String(projectId ?? "") === String(quickProject.id);
  const scopedProjects = projects.filter((p) => !quickProject || String(p.id) === String(quickProject.id));
  const scopedWorkers = workers.filter(
    (w) =>
      !quickProject ||
      String(w.currentProjectId ?? "") === String(quickProject.id) ||
      attendance.some(
        (a) => String(a.projectId) === String(quickProject.id) && String(a.workerId) === String(w.id),
      ),
  );
  const scopedInvoices = invoices.filter((i) => belongsToQuickProject(i.projectId));
  const scopedExpenses = expenses.filter((e) => belongsToQuickProject(e.projectId));
  const quickSuffix = quickProject ? `_${String(quickProject.name).replace(/[\\/:*?"<>|]/g, "-")}` : "";

  // Calculate detailed project metrics
  const activeProject = projects.find((p) => String(p.id) === String(selectedProjId));
  const activeProjClient = activeProject ? clients.find((c) => c.id === activeProject.clientId) : null;
  const activeProjExpenses = activeProject ? expenses.filter((e) => e.projectId === activeProject.id) : [];
  const activeProjInvoices = activeProject ? invoices.filter((i) => i.projectId === activeProject.id) : [];
  const totalInvoicedOnProj = activeProjInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalExpensesOnProj = activeProjExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProjProfit = totalInvoicedOnProj - totalExpensesOnProj;

  // Filter workers who worked on this project
  const activeProjWorkers = activeProject
    ? workers.filter((w) => {
        const isAssigned = w.currentProjectId === activeProject.id;
        const hasAttendance = attendance.some((a) => a.projectId === activeProject.id && a.workerId === w.id);
        return isAssigned || hasAttendance;
      })
    : [];

  // Calculate days worked for each active worker
  const workersReportData = activeProjWorkers.map((w) => {
    const daysWorked = attendance.filter((a) => a.projectId === activeProject?.id && a.workerId === w.id && a.status === "حاضر").length;
    const totalWage = daysWorked * (w.dailyRate || 0);
    return {
      ...w,
      daysWorked,
      totalWage,
    };
  });

  // Calculate Financial report metrics
  const filteredInvoices = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d >= start && d <= end;
    });
  }, [invoices, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return expenses.filter((exp) => {
      const d = new Date(exp.date);
      return d >= start && d <= end;
    });
  }, [expenses, startDate, endDate]);

  const totalFinanceIncome = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalFinanceExpense = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netFinanceProfit = totalFinanceIncome - totalFinanceExpense;

  // Quick report actions
  const reports = [
    {
      title: "تقرير المشاريع السريع",
      icon: BriefcaseBusiness,
      action: () =>
        downloadCsv(
          `projects${quickSuffix}.csv`,
          scopedProjects.map((project) => ({
            id: project.id,
            name: project.name,
            type: project.type,
            client: clients.find((client) => client.id === project.clientId)?.name ?? "",
            status: project.status,
            progress: `${project.progress}%`,
            budget: project.budget,
          })),
        ),
    },
    {
      title: "تقرير العمال السريع",
      icon: HardHat,
      action: () =>
        downloadCsv(
          `workers${quickSuffix}.csv`,
          scopedWorkers.map((worker) => ({
            id: worker.id,
            name: worker.name,
            specialty: worker.specialty,
            attendance: worker.attendance,
            dailyRate: worker.dailyRate,
            // أيام الحضور المحسوبة على المشروع المختار فقط
            daysOnProject: quickProject
              ? attendance.filter(
                  (a) =>
                    String(a.projectId) === String(quickProject.id) &&
                    String(a.workerId) === String(worker.id) &&
                    a.status === "حاضر",
                ).length
              : "",
          })),
        ),
    },
    {
      // المخزن مخزن مركزي وليس مرتبطاً بمشروع، فلا يتأثر باختيار المشروع
      title: "تقرير المخزن السريع",
      icon: Warehouse,
      action: () =>
        downloadCsv(
          "inventory.csv",
          inventory.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            purchasePrice: item.purchasePrice,
            supplier: item.supplier,
          })),
        ),
    },
    {
      title: "تقرير الحسابات السريع",
      icon: WalletCards,
      action: () =>
        downloadCsv(`finance${quickSuffix}.csv`, [
          ...scopedInvoices.map((invoice) => ({
            type: "invoice",
            reference: invoice.number,
            projectId: invoice.projectId,
            project: projects.find((p) => String(p.id) === String(invoice.projectId))?.name ?? "",
            amount: invoice.amount,
            status: invoice.status,
          })),
          ...scopedExpenses.map((expense) => ({
            type: "expense",
            reference: expense.type,
            projectId: expense.projectId,
            project: projects.find((p) => String(p.id) === String(expense.projectId))?.name ?? "",
            amount: expense.amount,
            status: expense.description,
          })),
        ]),
    },
  ];

  // Financial report csv download
  const downloadFinanceReportCsv = () => {
    const data = [
      ...filteredInvoices.map((inv) => ({
        النوع: "فاتورة / وارد",
        الرقم_المرجعي: inv.number,
        المشروع: projects.find(p => p.id === inv.projectId)?.name ?? "—",
        المبلغ_ريال: inv.amount,
        التاريخ: inv.date,
        الحالة: inv.status
      })),
      ...filteredExpenses.map((exp) => ({
        النوع: "مصروف / صادر",
        الرقم_المرجعي: exp.type,
        المشروع: projects.find(p => p.id === exp.projectId)?.name ?? "—",
        المبلغ_ريال: exp.amount,
        التاريخ: exp.date,
        الحالة: exp.description
      }))
    ];
    downloadCsv(`financial_report_${startDate}_to_${endDate}.csv`, data);
  };

  return (
    <section className="section-stack" style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Tabs selectors */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button 
          onClick={() => setActiveTab("projects")} 
          style={{ padding: "10px 18px", fontSize: "0.95rem", fontWeight: "700", border: 0, borderRadius: "8px", background: activeTab === "projects" ? "var(--brand)" : "#f1f5f9", color: activeTab === "projects" ? "white" : "#475569", cursor: "pointer", transition: "all 0.2s" }}
        >
          📁 تقارير المشاريع التفصيلية
        </button>
        <button 
          onClick={() => setActiveTab("finance")} 
          style={{ padding: "10px 18px", fontSize: "0.95rem", fontWeight: "700", border: 0, borderRadius: "8px", background: activeTab === "finance" ? "var(--brand)" : "#f1f5f9", color: activeTab === "finance" ? "white" : "#475569", cursor: "pointer", transition: "all 0.2s" }}
        >
          💳 تقرير الحسابات والمالية
        </button>
        <button 
          onClick={() => setActiveTab("quick")} 
          style={{ padding: "10px 18px", fontSize: "0.95rem", fontWeight: "700", border: 0, borderRadius: "8px", background: activeTab === "quick" ? "var(--brand)" : "#f1f5f9", color: activeTab === "quick" ? "white" : "#475569", cursor: "pointer", transition: "all 0.2s" }}
        >
          ⚡ تصدير سريع (ملفات عامة)
        </button>
      </div>

      {activeTab === "projects" && (
        <div className="panel wide">
          <SectionTitle icon={BriefcaseBusiness} title="تقرير المشروع الكامل" />
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBlock: "15px", flexWrap: "wrap" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.95rem" }}>اختر المشروع لعرض الداتا:</label>
            <select 
              value={selectedProjId} 
              onChange={(e) => setSelectedProjId(e.target.value)} 
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", minWidth: "240px" }}
            >
              <option value="">اختر مشروع...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {activeProject && (
              <div style={{ marginRight: "auto", display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => downloadReportPdf(activeProject.id, activeProject.name)}
                  className="primary-button" 
                  style={{ minHeight: "36px", fontSize: "0.85rem" }}
                >
                  <FileText size={15} /> تحميل PDF (الرسمي)
                </button>
                <button 
                  onClick={() => downloadReportExcel(activeProject.id, activeProject.name)}
                  className="primary-button" 
                  style={{ minHeight: "36px", fontSize: "0.85rem", background: "#10b981" }}
                >
                  <Download size={15} /> تحميل Excel (المالي)
                </button>
              </div>
            )}
          </div>

          {activeProject ? (
            <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
              {/* Info grid */}
              <div className="metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <MiniStat title="العميل" value={activeProjClient?.name ?? "—"} icon={Users} />
                <MiniStat title="المهندس المشرف" value={activeProject.engineer || "—"} icon={HardHat} />
                <MiniStat title="الميزانية المعتمدة" value={`${activeProject.budget} ر.س`} icon={WalletCards} />
                <MiniStat title="حالة العمل" value={activeProject.status} icon={Gauge} />
                <MiniStat title="تاريخ البدء" value={formatDate(activeProject.startDate)} icon={BriefcaseBusiness} />
                <MiniStat title="نسبة الإنجاز" value={`${activeProject.progress}%`} icon={BarChart3} />
              </div>

              {/* Financial calculations */}
              <div className="dashboard-grid three" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderRight: "4px solid #3b82f6" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>المبالغ المفوترة (الإيراد)</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px" }}>{currency.format(totalInvoicedOnProj)}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderRight: "4px solid #ef4444" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>المبالغ المصروفة (التكلفة)</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px" }}>{currency.format(totalExpensesOnProj)}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", borderRight: "4px solid #10b981" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>صافي أرباح المشروع</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px", color: netProjProfit >= 0 ? "#16a34a" : "#dc2626" }}>{currency.format(netProjProfit)}</div>
                </div>
              </div>

              {/* Project SVG Bar Chart */}
              <div className="panel" style={{ padding: "20px", border: "1px solid #e2e8f0", background: "#ffffff", borderRadius: "12px" }}>
                <SectionTitle icon={BarChart3} title="رسم بياني: الميزانية مقابل التكاليف والإيراد الفعلي" />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", direction: "ltr", marginTop: "15px" }}>
                  <svg width="100%" height="220" viewBox="0 0 500 220" style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
                    <line x1="50" y1="30" x2="450" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="50" y1="80" x2="450" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="50" y1="130" x2="450" y2="130" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="50" y1="180" x2="450" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                    {(() => {
                      const maxVal = Math.max(Number(activeProject.budget) || 1, totalInvoicedOnProj, totalExpensesOnProj);
                      const getH = (val: number) => ((val || 0) / maxVal) * 130;
                      const hBudget = getH(Number(activeProject.budget));
                      const hInvoiced = getH(totalInvoicedOnProj);
                      const hExpense = getH(totalExpensesOnProj);
                      return (
                        <>
                          <rect x="100" y={180 - hBudget} width="35" height={hBudget} rx="4" fill="#3b82f6" opacity="0.85" />
                          <text x="117" y={170 - hBudget} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e3a8a">
                            {formatMoney(Number(activeProject.budget) || 0, "SAR")}
                          </text>
                          <rect x="220" y={180 - hInvoiced} width="35" height={hInvoiced} rx="4" fill="#10b981" opacity="0.85" />
                          <text x="237" y={170 - hInvoiced} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#064e3b">
                            {formatMoney(totalInvoicedOnProj, "SAR")}
                          </text>
                          <rect x="340" y={180 - hExpense} width="35" height={hExpense} rx="4" fill="#ef4444" opacity="0.85" />
                          <text x="357" y={170 - hExpense} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7f1d1d">
                            {formatMoney(totalExpensesOnProj, "SAR")}
                          </text>
                        </>
                      );
                    })()}
                    <text x="117" y="200" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">الميزانية</text>
                    <text x="237" y="200" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">الإيراد</text>
                    <text x="357" y="200" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">التكلفة</text>
                  </svg>
                </div>
              </div>

              {/* Details sections */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
                {/* Expenses list */}
                <div className="panel" style={{ padding: "16px", border: "1px solid #e2e8f0" }}>
                  <SectionTitle icon={WalletCards} title="مصاريف وتكاليف المشروع" />
                  <div className="table-wrap" style={{ marginTop: "12px" }}>
                    <table>
                      <thead><tr><th>التاريخ</th><th>التصنيف</th><th>الوصف</th><th>المبلغ</th></tr></thead>
                      <tbody>
                        {activeProjExpenses.map((exp) => (
                          <tr key={exp.id}>
                            <td>{formatDate(exp.date)}</td>
                            <td><span className="badge warning">{exp.type}</span></td>
                            <td>{exp.description || "—"}</td>
                            <td style={{ fontWeight: "700" }}>{currency.format(exp.amount)}</td>
                          </tr>
                        ))}
                        {activeProjExpenses.length === 0 && (
                          <tr><td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: "12px" }}>لا توجد مصاريف مسجلة لهذا المشروع.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Workers list */}
                <div className="panel" style={{ padding: "16px", border: "1px solid #e2e8f0" }}>
                  <SectionTitle icon={HardHat} title="تقرير العمال وأيام العمل" />
                  <div className="table-wrap" style={{ marginTop: "12px" }}>
                    <table>
                      <thead><tr><th>اسم العامل</th><th>التخصص</th><th>اليومية</th><th>أيام العمل</th><th>إجمالي الأجر</th></tr></thead>
                      <tbody>
                        {workersReportData.map((w) => (
                          <tr key={w.id}>
                            <td><strong>{w.name}</strong></td>
                            <td>{w.specialty}</td>
                            <td>{w.dailyRate} ر.س</td>
                            <td><span className="badge success">{w.daysWorked} يوم</span></td>
                            <td style={{ fontWeight: "700" }}>{currency.format(w.totalWage)}</td>
                          </tr>
                        ))}
                        {workersReportData.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "12px" }}>لا يوجد عمال مسجلين في هذا المشروع.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", marginTop: "20px" }}>
              📁 يرجى اختيار مشروع من القائمة المنسدلة في الأعلى لعرض تقرير البيانات التفصيلي الخاص به.
            </div>
          )}
        </div>
      )}

      {activeTab === "finance" && (
        <div className="panel wide">
          <SectionTitle icon={WalletCards} title="تقرير الحسابات وحركة المال" />
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBlock: "15px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ margin: 0, fontWeight: "600", fontSize: "0.9rem" }}>من تاريخ:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ margin: 0, fontWeight: "600", fontSize: "0.9rem" }}>إلى تاريخ:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>

            <div style={{ marginRight: "auto", display: "flex", gap: "8px" }}>
              <button onClick={downloadFinanceReportCsv} className="primary-button" style={{ minHeight: "36px", fontSize: "0.85rem", background: "#10b981" }}>
                <Download size={15} /> تصدير Excel
              </button>
              <button onClick={() => window.print()} className="secondary-button" style={{ minHeight: "36px", fontSize: "0.85rem" }}>
                <Printer size={15} /> طباعة PDF
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
            {/* Financial summaries */}
            <div className="dashboard-grid three" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderRight: "4px solid #10b981", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>إجمالي الوارد (الفواتير)</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#0f172a", marginTop: "6px" }}>{currency.format(totalFinanceIncome)}</div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderRight: "4px solid #ef4444", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>إجمالي الصادر (المصاريف)</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#0f172a", marginTop: "6px" }}>{currency.format(totalFinanceExpense)}</div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderRight: "4px solid #3b82f6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>صافي الربح المالي</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "700", color: netFinanceProfit >= 0 ? "#16a34a" : "#dc2626", marginTop: "6px" }}>{currency.format(netFinanceProfit)}</div>
              </div>
            </div>

            {/* Finance SVG Chart */}
            <div className="panel" style={{ padding: "20px", border: "1px solid #e2e8f0", background: "#ffffff", borderRadius: "12px" }}>
              <SectionTitle icon={BarChart3} title="رسم بياني: مقارنة حركات المقبوضات مقابل المصروفات" />
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", direction: "ltr", marginTop: "15px" }}>
                <svg width="100%" height="220" viewBox="0 0 500 220" style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
                  <line x1="50" y1="30" x2="450" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="50" y1="80" x2="450" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="50" y1="130" x2="450" y2="130" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <line x1="50" y1="180" x2="450" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                  {(() => {
                    const maxVal = Math.max(totalFinanceIncome, totalFinanceExpense, 1);
                    const getH = (val: number) => ((val || 0) / maxVal) * 130;
                    const hIncome = getH(totalFinanceIncome);
                    const hExpense = getH(totalFinanceExpense);
                    return (
                      <>
                        <rect x="150" y={180 - hIncome} width="50" height={hIncome} rx="6" fill="#10b981" opacity="0.85" />
                        <text x="175" y={170 - hIncome} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#064e3b">
                          {formatMoney(totalFinanceIncome, "SAR")}
                        </text>
                        <rect x="300" y={180 - hExpense} width="50" height={hExpense} rx="6" fill="#ef4444" opacity="0.85" />
                        <text x="325" y={170 - hExpense} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7f1d1d">
                          {formatMoney(totalFinanceExpense, "SAR")}
                        </text>
                      </>
                    );
                  })()}
                  <text x="175" y="200" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">إجمالي المقبوضات</text>
                  <text x="325" y="200" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">إجمالي المصروفات</text>
                </svg>
              </div>
            </div>

            {/* Incomes vs Expenses Lists */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
              {/* Invoices List */}
              <div className="panel" style={{ padding: "16px", border: "1px solid #e2e8f0" }}>
                <SectionTitle icon={ReceiptText} title="حركات الوارد (الفواتير)" />
                <div className="table-wrap" style={{ marginTop: "12px" }}>
                  <table>
                    <thead><tr><th>رقم الفاتورة</th><th>المشروع</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
                    <tbody>
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td><strong>{inv.number}</strong></td>
                          <td>{projects.find(p => p.id === inv.projectId)?.name ?? "—"}</td>
                          <td>{formatDate(inv.date)}</td>
                          <td style={{ fontWeight: "700", color: "#16a34a" }}>{currency.format(inv.amount)}</td>
                        </tr>
                      ))}
                      {filteredInvoices.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: "12px" }}>لا توجد فواتير واردة للفترة المحددة.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses List */}
              <div className="panel" style={{ padding: "16px", border: "1px solid #e2e8f0" }}>
                <SectionTitle icon={WalletCards} title="حركات الصادر (المصروفات)" />
                <div className="table-wrap" style={{ marginTop: "12px" }}>
                  <table>
                    <thead><tr><th>المصروف</th><th>المشروع</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
                    <tbody>
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id}>
                          <td><strong>{exp.type}</strong></td>
                          <td>{projects.find(p => p.id === exp.projectId)?.name ?? "—"}</td>
                          <td>{formatDate(exp.date)}</td>
                          <td style={{ fontWeight: "700", color: "#dc2626" }}>{currency.format(exp.amount)}</td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: "12px" }}>لا توجد مصروفات صادرة للفترة المحددة.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "quick" && (
        <>
        <div className="panel wide" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ margin: 0, fontWeight: "600", fontSize: "0.95rem" }}>نطاق التصدير:</label>
            <select
              value={quickProjId}
              onChange={(e) => setQuickProjId(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", minWidth: "240px" }}
            >
              <option value="">كل المشاريع</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {quickProject
                ? `الملفات ستحتوي بيانات «${quickProject.name}» فقط (عدا المخزن، فهو مخزن مركزي).`
                : "الملفات ستحتوي بيانات كل المشاريع."}
            </span>
            {quickProject && (
              <button
                className="primary-button"
                style={{ marginRight: "auto", minHeight: "36px", fontSize: "0.85rem", background: "#10b981" }}
                onClick={() => downloadReportExcel(quickProject.id, quickProject.name)}
              >
                <Download size={15} /> كشف حساب المشروع (Excel)
              </button>
            )}
          </div>
        </div>
        <div className="report-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <article key={report.title} className="report-card">
                <Icon size={28} />
                <h3>{report.title}</h3>
                <div className="report-actions">
                  <button className="secondary-button" onClick={report.action}>
                    <Download size={17} />
                    Excel
                  </button>
                  <button className="secondary-button" onClick={() => window.print()}>
                    <FileText size={17} />
                    PDF
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        </>
      )}
    </section>
  );
}

function AlertsView({
  alerts,
  onResolve,
  goToSection,
}: {
  alerts: AppAlert[];
  onResolve: (id: string) => void;
  goToSection: (section: Section) => void;
}) {
  return (
    <section className="panel">
      <SectionTitle icon={Bell} title="مركز التنبيهات" />
      {alerts.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={24} />
          <p>لا توجد تنبيهات حالية — كل شيء تمام</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <article key={alert.id} className={`alert-item ${alert.tone}`}>
              <AlertTriangle size={19} />
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => goToSection(alert.section)} title="الانتقال للقسم المعني">
                <strong>{alert.title}</strong>
                <span>{alert.detail}</span>
              </div>
              <button type="button" className="secondary-button" style={{ minHeight: "32px", fontSize: "0.78rem", flexShrink: 0 }} onClick={() => onResolve(alert.id)}>
                <CheckCircle2 size={15} /> تم الحل
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StaffView({
  staff,
  addStaff,
  deleteStaff,
  updateStaff,
}: {
  staff: StaffAccount[];
  addStaff: (member: Omit<StaffAccount, "id">) => void;
  deleteStaff: (id: number) => void;
  updateStaff?: (id: number, member: Partial<StaffAccount>) => void;
}) {
  const assignable = navItems.filter((item) => item.id !== "settings");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(staffRoles[0]);
  const [sections, setSections] = useState<Section[]>(["dashboard"]);
  const [perms, setPerms] = useState<Partial<Record<Section, "view" | "edit">>>({ dashboard: "edit" });

  const toggleSection = (id: Section) => {
    setSections((current) => {
      if (current.includes(id)) {
        setPerms((p) => {
          const next = { ...p };
          delete next[id];
          return next;
        });
        return current.filter((item) => item !== id);
      }
      setPerms((p) => ({ ...p, [id]: "edit" }));
      return [...current, id];
    });
  };
  const setPerm = (id: Section, level: "view" | "edit") => setPerms((p) => ({ ...p, [id]: level }));

  const labelFor = (id: Section) => navItems.find((item) => item.id === id)?.label ?? id;

  const startEdit = (member: StaffAccount) => {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPassword("");
    setRole(member.role);
    setSections(member.sections || ["dashboard"]);
    setPerms(member.permissions || { dashboard: "edit" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole(staffRoles[0]);
    setSections(["dashboard"]);
    setPerms({ dashboard: "edit" });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingId !== null) {
      if (updateStaff) {
        const updatePayload: Partial<StaffAccount> = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          sections,
          permissions: perms,
        };
        if (password) {
          updatePayload.password = password;
        }
        updateStaff(editingId, updatePayload);
      }
      cancelEdit();
    } else {
      if (!password) return;
      addStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        sections,
        permissions: perms,
      });
      cancelEdit();
    }
  };

  return (
    <section className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <SectionTitle icon={UserPlus} title={editingId !== null ? "تعديل حساب موظف" : "إنشاء حساب موظف"} />
        <label>
          الاسم
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@kenan.com"
            required
            disabled={editingId !== null}
          />
        </label>
        <label>
          كلمة المرور {editingId !== null && "(اختياري)"}
          <input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={editingId === null}
            placeholder={editingId !== null ? "اتركها فارغة للاحتفاظ بالكلمة الحالية" : ""}
          />
        </label>
        <label>
          الدور
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {staffRoles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="permissions-field">
          <span className="image-field-label">الأقسام والصلاحيات</span>
          <div style={{ display: "grid", gap: "6px" }}>
            {assignable.map((item) => {
              const on = sections.includes(item.id);
              const level = perms[item.id] ?? "edit";
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "8px", background: on ? "rgba(225,29,72,0.03)" : "#fff" }}>
                  <label className="permission-check" style={{ margin: 0 }}>
                    <input type="checkbox" checked={on} onChange={() => toggleSection(item.id)} />
                    {item.label}
                  </label>
                  {on && item.id !== "dashboard" && (
                    <div style={{ display: "inline-flex", border: "1px solid var(--line)", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                      <button type="button" onClick={() => setPerm(item.id, "edit")} style={{ padding: "4px 12px", border: "none", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", background: level !== "view" ? "var(--brand)" : "#fff", color: level !== "view" ? "#fff" : "var(--muted)" }}>تعديل</button>
                      <button type="button" onClick={() => setPerm(item.id, "view")} style={{ padding: "4px 12px", border: "none", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", background: level === "view" ? "var(--brand)" : "#fff", color: level === "view" ? "#fff" : "var(--muted)" }}>مشاهدة</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary-button" style={{ flex: 1 }}>
            {editingId !== null ? <Save size={18} /> : <UserPlus size={18} />}
            {editingId !== null ? "حفظ التعديلات" : "إنشاء الحساب"}
          </button>
          {editingId !== null && (
            <button type="button" className="secondary-button" onClick={cancelEdit}>
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="panel wide">
        <SectionTitle icon={Users} title="حسابات الموظفين" />
        {staff.length === 0 ? (
          <div className="empty-state">
            <Users size={24} />
            <p>لا توجد حسابات موظفين بعد</p>
          </div>
        ) : (
          <div className="staff-grid">
            {staff.map((member) => (
              <article key={member.id} className="staff-card">
                <div className="staff-head">
                  <span className="staff-avatar">
                    <UserCog size={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{member.name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{member.role}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" className="secondary-button" style={{ minWidth: "32px", width: "32px", height: "32px", minHeight: "32px", padding: 0, display: "inline-flex", justifyContent: "center", alignItems: "center" }} title="تعديل" onClick={() => startEdit(member)}>
                      <Edit size={15} />
                    </button>
                    <button type="button" className="icon-danger" title="حذف" style={{ minWidth: "32px", width: "32px", height: "32px", minHeight: "32px", padding: 0, display: "inline-flex", justifyContent: "center", alignItems: "center" }} onClick={() => deleteStaff(member.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="staff-email" dir="ltr" style={{ margin: "8px 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  {member.email}
                </p>
                <div className="staff-perms">
                  {member.sections.map((section) => (
                    <span key={section} className="perm-chip">
                      {labelFor(section)}
                      {section !== "dashboard" && (
                        <small style={{ marginInlineStart: "4px", opacity: 0.7 }}>
                          {member.permissions?.[section] === "view" ? "(مشاهدة)" : "(تعديل)"}
                        </small>
                      )}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SiteContentView({
  stats,
  updateStat,
  addStat,
  deleteStat,
  site,
  updateSiteField,
}: {
  stats: SiteStat[];
  updateStat: (id: number, field: "value" | "label", next: string) => void;
  addStat: () => void;
  deleteStat: (id: number) => void;
  site: SiteSettings;
  updateSiteField: (field: keyof SiteSettings, value: any) => void;
}) {
  return (
    <section className="section-stack">
      <div className="panel">
        <SectionTitle icon={BarChart3} title="أرقام الإثبات على الموقع" />
        <p className="panel-hint">
          الأرقام دي بتظهر للعميل في الموقع وبتبني الثقة. عدّلها زي ما تحب وهتتحدث على الموقع فورًا.
        </p>
        <div className="stat-editor">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-row">
              <label>
                الرقم
                <input value={stat.value} onChange={(event) => updateStat(stat.id, "value", event.target.value)} />
              </label>
              <label>
                الوصف
                <input value={stat.label} onChange={(event) => updateStat(stat.id, "label", event.target.value)} />
              </label>
              <button type="button" className="icon-danger" title="حذف" onClick={() => deleteStat(stat.id)}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="secondary-button" onClick={addStat}>
          <Plus size={17} />
          إضافة رقم
        </button>
      </div>

      <div className="panel">
        <SectionTitle icon={Building2} title="بيانات الشركة الرسمية للمستندات" />
        <p className="panel-hint">
          البيانات دي بتظهر في ترويسات التقارير وعروض الأسعار وعقود الصرف الرسمية.
        </p>
        <div className="dashboard-grid">
          <label>
            اسم المؤسسة/الشركة (عربي)
            <input
              type="text"
              value={site.companyNameAr ?? ""}
              onChange={(e) => updateSiteField("companyNameAr", e.target.value)}
              placeholder="مؤسسة كنان لأنظمة الأمن والسلامة"
            />
          </label>
          <label>
            اسم المؤسسة/الشركة (إنجليزي)
            <input
              type="text"
              value={site.companyNameEn ?? ""}
              onChange={(e) => updateSiteField("companyNameEn", e.target.value)}
              placeholder="Kanan Safety & Fire Protection Systems Co."
            />
          </label>
          <label>
            رقم السجل التجاري (CR)
            <input
              type="text"
              value={site.companyCRNumber ?? ""}
              onChange={(e) => updateSiteField("companyCRNumber", e.target.value.trim())}
              placeholder="7050404537"
            />
          </label>
          <label>
            الرقم الضريبي (VAT)
            <input
              type="text"
              value={site.companyTaxNumber ?? ""}
              onChange={(e) => updateSiteField("companyTaxNumber", e.target.value.trim())}
              placeholder="313072607300003"
            />
          </label>
        </div>
      </div>

      <div className="panel">
        <SectionTitle icon={MessageSquare} title="إعدادات منصات ومعلومات التواصل" />
        <p className="panel-hint">
          حدد أرقام التواصل وعناوين المنصات الاجتماعية التي تظهر للعملاء في الموقع العام.
        </p>
        <div className="dashboard-grid">
          <label>
            رقم الواتساب (بدون رموز أو مسافات، مثلاً 966531357480)
            <input
              type="text"
              value={site.contactWhatsApp ?? ""}
              onChange={(e) => updateSiteField("contactWhatsApp", e.target.value.trim())}
              placeholder="966531357480"
            />
          </label>
          <label>
            رقم الاتصال المباشر (مثل +966531357480)
            <input
              type="text"
              value={site.contactPhone ?? ""}
              onChange={(e) => updateSiteField("contactPhone", e.target.value.trim())}
              placeholder="+966531357480"
            />
          </label>
          <label>
            البريد الإلكتروني
            <input
              type="email"
              value={site.contactEmail ?? ""}
              onChange={(e) => updateSiteField("contactEmail", e.target.value.trim())}
              placeholder="info@kenan4saftey.com"
            />
          </label>
          <label>
            العنوان (المقر)
            <input
              type="text"
              value={site.contactAddress ?? ""}
              onChange={(e) => updateSiteField("contactAddress", e.target.value)}
              placeholder="الرياض - حي المنار"
            />
          </label>
          <label>
            رابط فيسبوك (Facebook)
            <input
              type="text"
              value={site.contactFacebook ?? ""}
              onChange={(e) => updateSiteField("contactFacebook", e.target.value.trim())}
              placeholder="https://facebook.com"
            />
          </label>
          <label>
            رابط إنستغرام (Instagram)
            <input
              type="text"
              value={site.contactInstagram ?? ""}
              onChange={(e) => updateSiteField("contactInstagram", e.target.value.trim())}
              placeholder="https://instagram.com"
            />
          </label>
          <label>
            رابط تيك توك (TikTok)
            <input
              type="text"
              value={site.contactTikTok ?? ""}
              onChange={(e) => updateSiteField("contactTikTok", e.target.value.trim())}
              placeholder="https://tiktok.com"
            />
          </label>
          <label>
            رسالة الواتساب التلقائية عند النقر
            <input
              type="text"
              value={site.contactWhatsAppMsg ?? ""}
              onChange={(e) => updateSiteField("contactWhatsAppMsg", e.target.value)}
              placeholder="أريد معاينة مجانية لموقعي"
            />
          </label>
        </div>
      </div>

      <div className="panel">
        <SectionTitle icon={Eye} title="معاينة كما تظهر للعميل" />
        <div className="proof-preview">
          {stats.map((stat) => (
            <div key={stat.id} className="proof-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanySettingsView({
  stamp,
  setStamp,
  signature,
  setSignature,
  payments,
  updatePayment,
  addPayment,
  deletePayment,
  clients,
  updateClientPayment,
  addClientPayment,
  deleteClientPayment,
  site,
  updateSiteField,
}: {
  stamp: string;
  setStamp: (value: string) => void;
  signature: string;
  setSignature: (value: string) => void;
  payments: PaymentTerm[];
  updatePayment: (id: number, field: "label" | "percent", next: string) => void;
  addPayment: () => void;
  deletePayment: (id: number) => void;
  clients: Client[];
  updateClientPayment: (clientId: number, termId: number, field: "label" | "percent", next: string) => void;
  addClientPayment: (clientId: number) => void;
  deleteClientPayment: (clientId: number, termId: number) => void;
  site: SiteSettings;
  updateSiteField: (field: keyof SiteSettings, value: any) => void;
}) {
  const total = payments.reduce((sum, term) => sum + (Number(term.percent) || 0), 0);
  const [selectedClientId, setSelectedClientId] = useState<number | "">(clients[0]?.id ?? "");
  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;
  const clientPayments = selectedClient?.payments ?? [];
  const clientTotal = clientPayments.reduce((sum, term) => sum + (Number(term.percent) || 0), 0);

  return (
    <section className="section-stack">
      <div className="panel">
        <SectionTitle icon={Stamp} title="ختم الشركة وتوقيع الطرف الأول" />
        <p className="panel-hint">
          الختم والتوقيع يظهروا على العقد المطبوع جنب اسم الطرف الأول. ارفع صور بصيغة PNG بخلفية شفافة (يُفضّل).
        </p>
        <div className="dashboard-grid">
          <ImageField label="صورة الختم" value={stamp} onChange={setStamp} />
          <ImageField label="صورة التوقيع" value={signature} onChange={setSignature} />
        </div>
      </div>

      <div className="panel">
        <SectionTitle icon={WalletCards} title="جدول الدفعات الافتراضي" />
        <p className="panel-hint">
          دي الدفعات اللي بتظهر تلقائيًا في كل عقد (نسبة من قيمة العقد). تقدر تعدّلها لكل عقد على حدة من شاشة العقود.
        </p>
        <div className="stat-editor">
          {payments.map((term) => (
            <div key={term.id} className="payment-row">
              <label>
                وصف الدفعة
                <input value={term.label} onChange={(event) => updatePayment(term.id, "label", event.target.value)} />
              </label>
              <label>
                النسبة %
                <input
                  type="number"
                  value={term.percent}
                  onChange={(event) => updatePayment(term.id, "percent", event.target.value)}
                />
              </label>
              <button type="button" className="icon-danger" title="حذف" onClick={() => deletePayment(term.id)}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <div className={total === 100 ? "payment-total ok" : "payment-total warn"}>
          إجمالي النسب: {total}%{total !== 100 ? " — يفضّل تكون 100%" : ""}
        </div>
        <button type="button" className="secondary-button" onClick={addPayment}>
          <Plus size={17} />
          إضافة دفعة
        </button>
      </div>

      <div className="panel">
        <SectionTitle icon={Users} title="جدول دفعات العملاء" />
        <p className="panel-hint">
          لكل عميل تقدر تحدّد جدول دفعات خاص بيه. لو سِبته فاضي، بيتستخدم الجدول الافتراضي اللي فوق.
        </p>
        <label className="compact-select" style={{ display: "grid", gap: "4px", maxWidth: "320px", marginBottom: "12px" }}>
          العميل
          <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value === "" ? "" : Number(event.target.value))}>
            <option value="">— اختر عميل —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        {selectedClient ? (
          <>
            <div className="stat-editor">
              {clientPayments.map((term) => (
                <div key={term.id} className="payment-row">
                  <label>
                    وصف الدفعة
                    <input value={term.label} onChange={(event) => updateClientPayment(selectedClient.id, term.id, "label", event.target.value)} />
                  </label>
                  <label>
                    النسبة %
                    <input type="number" value={term.percent} onChange={(event) => updateClientPayment(selectedClient.id, term.id, "percent", event.target.value)} />
                  </label>
                  <button type="button" className="icon-danger" title="حذف" onClick={() => deleteClientPayment(selectedClient.id, term.id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            {clientPayments.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>لا توجد دفعات مخصّصة لهذا العميل — سيُستخدم الجدول الافتراضي.</p>
            ) : (
              <div className={clientTotal === 100 ? "payment-total ok" : "payment-total warn"}>
                إجمالي النسب: {clientTotal}%{clientTotal !== 100 ? " — يفضّل تكون 100%" : ""}
              </div>
            )}
            <button type="button" className="secondary-button" onClick={() => addClientPayment(selectedClient.id)}>
              <Plus size={17} />
              إضافة دفعة لهذا العميل
            </button>
          </>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>اختر عميلًا لإدارة جدول دفعاته.</p>
        )}
      </div>

      <div className="panel">
        <SectionTitle icon={FileText} title="قوالب الشروط والبنود للعقود وعروض الأسعار" />
        <p className="panel-hint">
          تقدر تعدل بنود العقود وشروط السلامة والجزاءات وعروض الأسعار الافتراضية اللي بتظهر للعملاء.
        </p>
        <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>الشروط العامة للعقد:</strong>
            <textarea 
              rows={6} 
              value={site.contractGeneralTerms ?? ""} 
              onChange={(e) => updateSiteField("contractGeneralTerms", e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.88rem", width: "100%", resize: "vertical" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>الجزاءات والغرامات:</strong>
            <textarea 
              rows={4} 
              value={site.contractFines ?? ""} 
              onChange={(e) => updateSiteField("contractFines", e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.88rem", width: "100%", resize: "vertical" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>شروط السلامة والعمالة:</strong>
            <textarea 
              rows={4} 
              value={site.contractSafety ?? ""} 
              onChange={(e) => updateSiteField("contractSafety", e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.88rem", width: "100%", resize: "vertical" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>تسوية الخلافات والقانون المطبق:</strong>
            <textarea 
              rows={4} 
              value={site.contractDisputes ?? ""} 
              onChange={(e) => updateSiteField("contractDisputes", e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.88rem", width: "100%", resize: "vertical" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>شروط وملاحظات عرض السعر الافتراضية:</strong>
            <textarea 
              rows={5} 
              value={site.quotationDefaultNotes ?? ""} 
              onChange={(e) => updateSiteField("quotationDefaultNotes", e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.88rem", width: "100%", resize: "vertical" }}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

function ShowcaseView({
  showcase,
  addShowcase,
  deleteShowcase,
}: {
  showcase: ShowcaseItem[];
  addShowcase: (item: Omit<ShowcaseItem, "id">) => void;
  deleteShowcase: (id: number) => void;
}) {
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState("");
  const [opinion, setOpinion] = useState("");
  const [clientPhoto, setClientPhoto] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientName.trim()) return;
    addShowcase({
      clientName: clientName.trim(),
      projectType: projectType.trim(),
      city: city.trim(),
      year: year.trim(),
      duration: duration.trim(),
      opinion: opinion.trim(),
      clientPhoto,
      photos,
    });
    setClientName("");
    setProjectType("");
    setCity("");
    setYear("");
    setDuration("");
    setOpinion("");
    setClientPhoto("");
    setPhotos([]);
  };

  return (
    <section className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <SectionTitle icon={Plus} title="إضافة عميل للمعرض" />
        <label>
          اسم العميل
          <input value={clientName} onChange={(event) => setClientName(event.target.value)} required />
        </label>
        <label>
          القطاع
          <input
            value={projectType}
            onChange={(event) => setProjectType(event.target.value)}
            placeholder="تجاري، صناعي، سكني، صحي..."
          />
        </label>
        <div className="two-fields">
          <label>
            المدينة
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="الرياض" />
          </label>
          <label>
            سنة التنفيذ
            <input value={year} onChange={(event) => setYear(event.target.value)} placeholder="2025" />
          </label>
        </div>
        <label>
          مدة التنفيذ
          <input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="مثال: 14 يوم" />
        </label>
        <label>
          رأي العميل
          <textarea value={opinion} onChange={(event) => setOpinion(event.target.value)} rows={3} />
        </label>
        <ImageField label="صورة العميل أو شعار الشركة" value={clientPhoto} onChange={setClientPhoto} maxDim={512} />
        <MultiImageField label="صور الأعمال" values={photos} onChange={setPhotos} />
        <button className="primary-button">
          <Plus size={18} />
          إضافة للمعرض
        </button>
      </form>

      <div className="panel wide">
        <SectionTitle icon={Images} title="عملاء المعرض" />
        {showcase.length === 0 ? (
          <div className="empty-state">
            <Images size={24} />
            <p>لا يوجد عملاء في المعرض بعد</p>
          </div>
        ) : (
          <div className="showcase-admin-grid">
            {showcase.map((item) => (
              <article key={item.id} className="showcase-admin-card">
                <div className="showcase-admin-head">
                  <ShowcaseAvatar name={item.clientName} photo={item.clientPhoto} />
                  <div>
                    <h3>{item.clientName}</h3>
                    <span>{item.projectType || "—"}</span>
                  </div>
                  <button type="button" className="icon-danger" title="حذف" onClick={() => deleteShowcase(item.id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="showcase-admin-meta">
                  <span>
                    <Clock size={15} />
                    {item.duration || "—"}
                  </span>
                  <span>
                    <Images size={15} />
                    {item.photos.length} صورة
                  </span>
                </div>
                {item.opinion && <p className="showcase-admin-opinion">{item.opinion}</p>}
                {item.photos.length > 0 && (
                  <div className="showcase-admin-thumbs">
                    {item.photos.slice(0, 4).map((src, index) => (
                      <img key={index} src={src} alt="" />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ShowcaseAvatar({ name, photo }: { name: string; photo: string }) {
  if (photo) {
    return <img className="showcase-avatar" src={photo} alt={name} />;
  }
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
  return <span className="showcase-avatar initials">{initials || "?"}</span>;
}

function ImageField({
  label,
  value,
  onChange,
  maxDim,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // عند تمرير maxDim تُضغط الصورة (للصور الفوتوغرافية). اتركها فارغة للحفاظ على الأصل مثل ختم PNG شفاف.
  maxDim?: number;
}) {
  const [url, setUrl] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        onChange(maxDim ? await resizeImage(file, maxDim) : await readImageFile(file));
      } catch {
        triggerAlert("تعذّر قراءة الصورة، جرّب صورة أخرى.");
      }
    }
    event.target.value = "";
  };

  const addUrl = () => {
    if (url.trim()) {
      onChange(url.trim());
      setUrl("");
    }
  };

  return (
    <div className="image-field">
      <span className="image-field-label">{label}</span>
      <div className="image-field-row">
        <label className="upload-chip">
          <ImagePlus size={16} />
          رفع صورة
          <input
            type="file"
            accept="image/*"
            style={{ display: "block", position: "absolute", width: "1px", height: "1px", opacity: 0, overflow: "hidden", pointerEvents: "none" }}
            onChange={handleFile}
          />
        </label>
        <div className="url-add">
          <Link2 size={15} />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="أو الصق رابط صورة" />
          <button type="button" onClick={addUrl}>
            إضافة
          </button>
        </div>
      </div>
      {value && (
        <div className="image-preview single">
          <span>
            <img src={value} alt="" />
            <button type="button" onClick={() => onChange("")} title="إزالة">
              <X size={14} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

function MultiImageField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [url, setUrl] = useState("");

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    try {
      const dataUrls = await Promise.all(files.map((file) => resizeImage(file, 1400)));
      onChange([...values, ...dataUrls]);
    } catch {
      triggerAlert("تعذّر قراءة بعض الصور، جرّب صورًا أخرى.");
    }
    event.target.value = "";
  };

  const addUrl = () => {
    if (url.trim()) {
      onChange([...values, url.trim()]);
      setUrl("");
    }
  };

  return (
    <div className="image-field">
      <span className="image-field-label">{label}</span>
      <div className="image-field-row">
        <label className="upload-chip">
          <ImagePlus size={16} />
          رفع صور
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "block", position: "absolute", width: "1px", height: "1px", opacity: 0, overflow: "hidden", pointerEvents: "none" }}
            onChange={handleFiles}
          />
        </label>
        <div className="url-add">
          <Link2 size={15} />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="أو الصق رابط صورة" />
          <button type="button" onClick={addUrl}>
            إضافة
          </button>
        </div>
      </div>
      {values.length > 0 && (
        <div className="image-preview multi">
          {values.map((src, index) => (
            <span key={index}>
              <img src={src} alt="" />
              <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== index))} title="إزالة">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", required = false, placeholder, defaultValue }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string | number }) {
  return (
    <label>
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />
    </label>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: ComponentType<any>; title: string }) {
  return (
    <div className="section-title">
      <Icon size={20} />
      <h2>{title}</h2>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: ComponentType<any>; label: string; value: string; tone: string }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>
        <Icon size={24} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function MiniStat({ title, value, icon: Icon }: { title: string; value: string | number; icon: ComponentType<any> }) {
  return (
    <article className="mini-stat">
      <Icon size={22} />
      <p>{title}</p>
      <strong>{value}</strong>
    </article>
  );
}

function OperationTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="operation-tile">
      <span>{numberFormat.format(value)}</span>
      <p>{label}</p>
    </article>
  );
}

function ProjectRow({ project, clientName }: { project: Project; clientName: string }) {
  return (
    <article className="project-row">
      <div>
        <strong>{project.name}</strong>
        <span>{clientName}</span>
      </div>
      <Badge value={project.status} />
      <Progress value={project.progress} />
    </article>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress-wrap" aria-label={`نسبة التنفيذ ${value}%`}>
      <span style={{ width: `${value}%` }} />
      <strong>{value}%</strong>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <span className={`badge ${statusTone(value)}`}>{value}</span>;
}

function AlertList({ alerts }: { alerts: AppAlert[] }) {
  if (!alerts.length) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={24} />
        <p>لا توجد تنبيهات حالية</p>
      </div>
    );
  }
  return (
    <div className="alert-list">
      {alerts.map((alert, index) => (
        <article key={`${alert.title}-${index}`} className={`alert-item ${alert.tone}`}>
          <AlertTriangle size={19} />
          <div>
            <strong>{alert.title}</strong>
            <span>{alert.detail}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// QUOTATIONS MANAGEMENT VIEW
// ============================================
function QuotationDocument({
  quotation,
  client,
  stamp,
  signature,
  site,
  isEditingText = false,
}: {
  quotation: Quotation;
  client?: Client;
  stamp: string;
  signature: string;
  site: SiteSettings;
  isEditingText?: boolean;
}) {
  // عملة النظام هي الريال السعودي حصراً؛ كان الاحتياطي هنا "EGP" فيطبع عرض
  // سعر بالجنيه المصري متى غاب حقل العملة عن السجل.
  const quotationCurrency = quotation.currency || "SAR";
  const valueWords = numberToArabicWords(quotation.value, quotationCurrency);
  const formattedDate = formatArabicDate(quotation.date);
  const formattedValidUntil = formatArabicDate(quotation.validUntil);

  const subtotal = quotation.items.reduce((acc, it) => acc + it.total, 0);
  const vat = Math.round(subtotal * (quotation.taxPercent / 100));
  const finalTotal = subtotal + vat;

  // عرض السعر صفحة واحدة ثابتة على A4 مع overflow:hidden، فالبنود الزائدة
  // تُقصّ بصمت. قياس السعة: 20 بنداً بالمقاس الحالي، 22 و24 بعد تصغيرين.
  const QUOTE_CAPACITY = 24;
  const itemCount = quotation.items.length;
  const itemFontSize = itemCount <= 20 ? "0.74rem" : itemCount <= 22 ? "0.68rem" : "0.62rem";
  const itemCellPadding = itemCount <= 20 ? "3px 6px" : itemCount <= 22 ? "2px 5px" : "1px 4px";

  return (
    <div className="contract-doc" contentEditable={isEditingText} suppressContentEditableWarning={true} style={isEditingText ? { outline: "2px dashed #2563eb", borderRadius: "8px", padding: "4px" } : {}}>
      <div className="contract-page" style={{ position: "relative", overflow: "hidden", padding: "8mm 12mm 6mm 12mm", minHeight: "297mm", maxHeight: "297mm", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <PageWatermark />
        <DocumentHeader documentTitle="عرض سعر" site={site} />

        {/* Metadata info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.78rem", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <div><strong>رقم العرض:</strong> {quotation.number}</div>
          <div><strong>التاريخ:</strong> {formattedDate} م</div>
          <div><strong>صالح لغاية:</strong> {formattedValidUntil} م</div>
        </div>

        {/* Intro Text */}
        <div style={{ marginBottom: "6px", fontSize: "0.80rem", lineHeight: "1.35", direction: "rtl", textAlign: "right" }}>
          <div style={{ fontWeight: "bold", fontSize: "0.88rem", marginBottom: "2px" }}>
            السادة: {quotation.clientName || client?.name || "................"} المحترمين
          </div>
          <div style={{ fontWeight: "600", marginBottom: "2px" }}>السلام عليكم ورحمة الله وبركاته،،،</div>
          <p style={{ margin: 0, textIndent: "10px" }}>
            {quotation.introText || `يسر مؤسسة كنان لأنظمة الأمن والسلامة أن تقدم عرض سعرها لتوريد وتنفيذ أنظمة السلامة لكم في موقعكم في مدينة / ${quotation.locationCity || client?.city || "الرياض"}${quotation.locationDistrict ? ` - حي ${quotation.locationDistrict}` : ""}${quotation.locationPlot ? ` - قطعة رقم (${quotation.locationPlot})` : ""}${quotation.locationPlan ? ` - مخطط رقم (${quotation.locationPlan})` : ""}${quotation.projectAddress || client?.address ? ` - ${quotation.projectAddress || client?.address}` : ""} وذلك حسب المخطط المعتمد.`}
          </p>
        </div>

        <h3 className="contract-section-title" style={{ marginTop: "6px", marginBottom: "3px", fontSize: "0.85rem" }}>جدول الكميات والمواد:</h3>
        <div className="table-wrap" style={{ marginBlock: "4px", direction: "rtl", pageBreakInside: "avoid", breakInside: "avoid" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: itemFontSize, pageBreakInside: "avoid", breakInside: "avoid" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", width: "35px", textAlign: "center" }}>الرقم</th>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", textAlign: "right" }}>الصنف</th>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", width: "140px", textAlign: "right" }}>الوصف / الماركة</th>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", width: "50px", textAlign: "center" }}>الكمية</th>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", width: "85px", textAlign: "left" }}>السعر</th>
                <th style={{ padding: "3px 6px", border: "1px solid #cbd5e1", width: "95px", textAlign: "left" }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "center" }}>{index + 1}</td>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "right" }}>{item.name}</td>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "right" }}>{item.brand || "—"}</td>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "left" }}>{Number(item.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: itemCellPadding, border: "1px solid #cbd5e1", textAlign: "left" }}>{Number(item.total).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {quotation.items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "6px", textAlign: "center", color: "#64748b" }}>لا توجد بنود مدخلة لعرض السعر.</td>
                </tr>
              )}
            </tbody>
          </table>

          {itemCount > QUOTE_CAPACITY && (
            <p style={{ marginTop: "4px", padding: "4px 8px", border: "1px solid #dc2626", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", fontSize: "0.70rem", fontWeight: "700" }}>
              تنبيه: عدد البنود ({itemCount}) يتجاوز ما تتّسع له الصفحة ({QUOTE_CAPACITY} بنداً).
              البنود الأخيرة لن تظهر في النسخة المطبوعة — قسّم العرض أو ادمج البنود المتشابهة.
            </p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBlock: "4px" }}>
          <table style={{ width: "270px", borderCollapse: "collapse", fontSize: "0.76rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>المجموع الفرعي:</td>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1", textAlign: "left" }}>{Number(subtotal).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>ضريبة القيمة المضافة ({quotation.taxPercent}%):</td>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1", textAlign: "left" }}>{Number(vat).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1" }}>الإجمالي النهائي:</td>
                <td style={{ padding: "2px 6px", border: "1px solid #cbd5e1", textAlign: "left", color: "#d91c24" }}>{formatMoney(finalTotal, quotationCurrency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="contract-intro-p" style={{ fontWeight: "600", fontSize: "0.78rem", marginBlock: "3px" }}>
          المبلغ الإجمالي كتابةً: فقط {valueWords} شامل ضريبة القيمة المضافة.
        </p>

        {/* Standard terms & notes */}
        <div style={{ marginBlock: "4px", padding: "5px 8px", border: "1px dashed #d91c24", borderRadius: "6px", background: "#fff5f5" }}>
          <strong style={{ display: "block", marginBottom: "2px", fontSize: "0.78rem", color: "#d91c24" }}>شروط وملاحظات العرض:</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "0.74rem", lineHeight: "1.35", color: "#334155" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "1px" }}>
              <span style={{ color: "#d91c24", fontWeight: "bold" }}>•</span>
              <span>الأسعار بالريال السعودي.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "1px" }}>
              <span style={{ color: "#d91c24", fontWeight: "bold" }}>•</span>
              <span>العرض يشمل تسليم الاستشاري ومهندس الموقع.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "1px" }}>
              <span style={{ color: "#d91c24", fontWeight: "bold" }}>•</span>
              <span>العرض يشمل عمل الشوب دروينق لأعمال الإطفاء واستخراج شهادة إنهاء التركيبات.</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "1px" }}>
              <span style={{ color: "#d91c24", fontWeight: "bold" }}>•</span>
              <span>العرض لا يشمل الأعمال المدنية من تكسير وحفر وردم.</span>
            </li>
            {quotation.notes && (
              <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginTop: "1px", fontWeight: "bold" }}>
                <span style={{ color: "#d91c24", fontWeight: "bold" }}>•</span>
                <span>ملاحظات إضافية: {quotation.notes}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Bank & Tax details */}
        <div className="bank-info-box" style={{ marginTop: "4px", padding: "4px 8px", background: "#f8fafc", border: "1px solid #cbd5e1" }}>
          <strong style={{ fontSize: "0.74rem", color: "#1e3a8a", display: "block", borderBottom: "1px dashed #cbd5e1", paddingBottom: "2px", marginBottom: "2px" }}>
            الحساب البنكي والضريبي للمؤسسة:
          </strong>
          <div className="bank-info-grid" style={{ fontSize: "0.72rem", gridGap: "2px 6px" }}>
            <div><strong>اسم البنك:</strong> مصرف الراجحي</div>
            <div><strong>الرقم الضريبي:</strong> {site.companyTaxNumber || "313072607300003"}</div>
            <div style={{ gridColumn: "span 2" }}><strong>رقم الحساب:</strong> <code style={{ fontStyle: "normal" }}>448000010006086265902</code></div>
            <div style={{ gridColumn: "span 2" }}><strong>الآيبان:</strong> <code style={{ fontStyle: "normal" }}>SA9080000448608016265902</code></div>
          </div>
        </div>

        <ContractFooter site={site} />
      </div>
    </div>
  );
}

function QuotationsView({
  quotations,
  clients,
  inventory,
  addQuotation,
  deleteQuotation,
  updateStatus,
  updateQuotation,
  stamp,
  signature,
  onCsvImport,
  downloadPdf,
  downloadExcel,
  isPMOrAdmin,
  site,
}: {
  quotations: Quotation[];
  clients: Client[];
  inventory: InventoryItem[];
  addQuotation: (clientId: number | string, date: string, validUntil: string, items: QuotationItem[], value: number, notes?: string, currencyCode?: string, introText?: string, locationCity?: string, locationDistrict?: string, locationPlot?: string, locationPlan?: string) => void;
  deleteQuotation: (id: number | string) => void;
  updateStatus: (id: number | string, status: "مسودة" | "مرسل" | "معتمد" | "ملغي") => void;
  updateQuotation: (id: number | string, payload: { date: string; validUntil: string; taxPercent: number; currency: string; notes: string; items: QuotationItem[] }) => void;
  stamp: string;
  signature: string;
  onCsvImport: (text: string) => void;
  downloadPdf: (id: number | string, number: string) => void;
  downloadExcel: (id: number | string, number: string) => void;
  isPMOrAdmin: boolean;
  site: SiteSettings;
}) {
  const [activeId, setActiveId] = useState<number | string | null>(null);
  const [isEditingQuotationText, setIsEditingQuotationText] = useState(false);
  const activeQuotation = quotations.find((item) => item.id === activeId) ?? null;
  const activeClient = activeQuotation ? clients.find((c) => String(c.id) === String(activeQuotation.clientId)) : undefined;

  // تعديل عرض سعر (مسموح قبل التعميد فقط)
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [editItems, setEditItems] = useState<QuotationItem[]>([]);
  const [editMeta, setEditMeta] = useState({ date: "", validUntil: "", taxPercent: 15, currency: "SAR", notes: "" });
  const startQuotationEdit = (q: Quotation) => {
    setEditing(q);
    setEditItems(q.items.map((it) => ({ ...it })));
    setEditMeta({ date: q.date, validUntil: q.validUntil, taxPercent: q.taxPercent ?? 15, currency: q.currency || "SAR", notes: q.notes || "" });
  };
  const updateEditItem = (index: number, field: "name" | "brand" | "qty" | "price", val: string | number) => {
    setEditItems((curr) => {
      const copy = [...curr];
      const item = { ...copy[index] };
      if (field === "name") item.name = String(val);
      else if (field === "brand") item.brand = String(val);
      else if (field === "qty") { item.qty = Number(val) || 0; item.total = item.qty * item.price; }
      else if (field === "price") { item.price = Number(val) || 0; item.total = item.qty * item.price; }
      copy[index] = item;
      return copy;
    });
  };
  const consolidateQuotationItems = (items: QuotationItem[]): QuotationItem[] => {
    const result: QuotationItem[] = [];
    for (const item of items) {
      const trimmedName = item.name.trim();
      if (!trimmedName) continue;
      const existingIndex = result.findIndex(
        (r) => r.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingIndex !== -1) {
        const existing = result[existingIndex];
        existing.qty = (Number(existing.qty) || 0) + (Number(item.qty) || 1);
        if (!existing.brand && item.brand) existing.brand = item.brand;
        if (item.price > 0 && existing.price === 0) existing.price = item.price;
        existing.total = existing.qty * existing.price;
      } else {
        result.push({
          ...item,
          name: trimmedName,
          brand: item.brand || "",
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0,
          total: (Number(item.qty) || 1) * (Number(item.price) || 0),
        });
      }
    }
    return result;
  };

  const saveQuotationEdit = () => {
    if (!editing) return;
    if (editItems.some((it) => !it.name.trim())) {
      triggerAlert("يرجى إدخال أسماء جميع البنود");
      return;
    }
    const consolidated = consolidateQuotationItems(editItems);
    updateQuotation(editing.id, { ...editMeta, items: consolidated });
    setEditing(null);
  };

  const [formItems, setFormItems] = useState<QuotationItem[]>([{ name: "", brand: "", qty: 1, price: 0, total: 0 }]);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState<number | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [formIntroText, setFormIntroText] = useState("");
  const [formLocationCity, setFormLocationCity] = useState("الرياض");
  const [formLocationDistrict, setFormLocationDistrict] = useState("");
  const [formLocationPlot, setFormLocationPlot] = useState("");
  const [formLocationPlan, setFormLocationPlan] = useState("");

  const addFormItem = () => {
    setFormItems((curr) => [...curr, { name: "", brand: "", qty: 1, price: 0, total: 0 }]);
  };

  const removeFormItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems((curr) => curr.filter((_, i) => i !== index));
  };

  const updateFormItem = (index: number, field: keyof QuotationItem, val: string | number) => {
    setFormItems((curr) => {
      const copy = [...curr];
      const item = { ...copy[index] };
      if (field === "name") {
        item.name = String(val);
      } else if (field === "brand") {
        item.brand = String(val);
      } else if (field === "qty") {
        item.qty = Number(val) || 0;
        item.total = item.qty * item.price;
      } else if (field === "price") {
        item.price = Number(val) || 0;
        item.total = item.qty * item.price;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawClientId = data.get("clientId");
    const clientId = rawClientId ? String(rawClientId).trim() : "";
    const date = String(data.get("date") || new Date().toISOString().slice(0, 10));
    const validUntil = String(data.get("validUntil") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    const notes = String(data.get("notes") || "");
    const currency = String(data.get("currency") || "SAR");

    if (!clientId) {
      triggerAlert("يرجى اختيار العميل أولاً");
      return;
    }
    if (formItems.some((it) => !it.name.trim())) {
      triggerAlert("يرجى إدخال أسماء البنود لجميع العناصر المضافة");
      return;
    }

    const consolidatedItems = consolidateQuotationItems(formItems);
    const subtotal = consolidatedItems.reduce((acc, it) => acc + it.total, 0);
    const value = Math.round(subtotal * 1.15); // with 15% VAT

    addQuotation(clientId, date, validUntil, consolidatedItems, value, notes, currency, formIntroText, formLocationCity, formLocationDistrict, formLocationPlot, formLocationPlan);
    setFormItems([{ name: "", brand: "", qty: 1, price: 0, total: 0 }]);
    setFormIntroText("");
    setFormLocationCity("الرياض");
    setFormLocationDistrict("");
    setFormLocationPlot("");
    setFormLocationPlan("");
    event.currentTarget.reset();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === quotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotations.map((q) => q.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const deleteSelected = () => {
    triggerConfirm(`هل أنت متأكد من حذف ${selectedIds.length} عروض أسعار؟`, () => {
      selectedIds.forEach((id) => deleteQuotation(id));
      setSelectedIds([]);
    });
  };

  const exportSelected = () => {
    const list = quotations.filter((q) => selectedIds.includes(q.id));
    const target = list.length ? list : quotations;
    downloadCsv(
      "quotations.csv",
      target.map((q) => {
        const client = clients.find((cl) => cl.id === q.clientId);
        return {
          "رقم عرض السعر": q.number,
          "العميل": client?.name ?? "",
          "التاريخ": q.date,
          "صالح حتى": q.validUntil,
          "القيمة": q.value,
          "الحالة": q.status,
          "ملاحظات": q.notes ?? "",
        };
      })
    );
  };

  const formSubtotal = formItems.reduce((acc, it) => acc + it.total, 0);
  const formTax = Math.round(formSubtotal * 0.15);
  const formTotal = formSubtotal + formTax;

  return (
    <section className="content-grid content-grid--stack">
      {isPMOrAdmin && (
        <form className="form-panel" onSubmit={handleSubmit} style={{ position: "relative" }}>
        <SectionTitle icon={Plus} title="إنشاء عرض سعر جديد" />
        <label>
          العميل
          <select name="clientId" required>
            <option value="">اختر عميل...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="two-fields">
          <Field label="تاريخ العرض" name="date" type="date" required />
          <Field label="صالح حتى تاريخ" name="validUntil" type="date" required />
        </div>
        <div style={{ marginTop: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", background: "#f8fafc" }}>
          <strong style={{ fontSize: "0.85rem", color: "var(--brand)", display: "block", marginBottom: "8px" }}>📍 بيانات الموقع (تظهر في PDF):</strong>
          <div className="two-fields">
            <label style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "4px" }}>
              المدينة
              <input value={formLocationCity} onChange={e => setFormLocationCity(e.target.value)} placeholder="الرياض" style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }} />
            </label>
            <label style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "4px" }}>
              الحي
              <input value={formLocationDistrict} onChange={e => setFormLocationDistrict(e.target.value)} placeholder="اسم الحي" style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }} />
            </label>
          </div>
          <div className="two-fields" style={{ marginTop: "8px" }}>
            <label style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "4px" }}>
              رقم القطعة
              <input value={formLocationPlot} onChange={e => setFormLocationPlot(e.target.value)} placeholder="رقم قطعة الأرض" style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }} />
            </label>
            <label style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "4px" }}>
              رقم المخطط
              <input value={formLocationPlan} onChange={e => setFormLocationPlan(e.target.value)} placeholder="رقم المخطط" style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }} />
            </label>
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong>✏️ نص مقدمة العرض (اختياري — يظهر في PDF):</strong>
            <textarea
              value={formIntroText}
              onChange={e => setFormIntroText(e.target.value)}
              rows={3}
              placeholder={`يسر مؤسسة كنان لأنظمة الأمن والسلامة أن تقدم عرض سعرها لتوريد وتنفيذ أنظمة السلامة لكم في موقعكم في مدينة ${formLocationCity}${formLocationDistrict ? ` - حي ${formLocationDistrict}` : ""}${formLocationPlot ? ` - قطعة رقم (${formLocationPlot})` : ""} وذلك حسب المخطط المعتمد.`}
              style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", lineHeight: "1.6", resize: "vertical" }}
            />
          </label>
        </div>

        <label>
          العملة
          <select name="currency" defaultValue="SAR">
            <option value="SAR">SAR (ريال سعودي)</option>
          </select>
        </label>

        <div style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
          <strong style={{ fontSize: "0.9rem", color: "var(--text)", display: "block", marginBottom: "8px" }}>بناء البنود والأسعار:</strong>
          {formItems.map((item, index) => {
            const suggestions = (() => {
              if (suggestionIndex !== index || !suggestionQuery.trim()) return [];
              const normalizedQuery = normalizeArabic(suggestionQuery.toLowerCase());
              return inventory.filter((i) => 
                normalizeArabic(i.name.toLowerCase()).includes(normalizedQuery) ||
                (i.brand && normalizeArabic(i.brand.toLowerCase()).includes(normalizedQuery))
              );
            })();
            return (
              <div key={index} style={{ display: "flex", gap: "8px", alignItems: "flex-end", marginBottom: "12px", position: "relative" }}>
                <div style={{ flex: 3, position: "relative" }}>
                  <label style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column" }}>
                    الصنف
                    <input
                      value={item.name}
                      onChange={(e) => {
                        updateFormItem(index, "name", e.target.value);
                        setSuggestionIndex(index);
                        setSuggestionQuery(e.target.value);
                      }}
                      onFocus={() => {
                        setSuggestionIndex(index);
                        setSuggestionQuery(item.name);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setSuggestionIndex(null);
                        }, 300);
                      }}
                      placeholder="ابدأ كتابة المنتج (مثل: مضخة حريق...)"
                      required
                      style={{ padding: "6px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", width: "100%" }}
                    />
                  </label>
                  {suggestionIndex === index && suggestions.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      left: 0,
                      zIndex: 99,
                      background: "white",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      maxHeight: "180px",
                      overflowY: "auto",
                      marginTop: "4px"
                    }}>
                      {suggestions.map((invItem) => (
                        <button
                          key={invItem.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevents input blur
                            updateFormItem(index, "name", invItem.name);
                            updateFormItem(index, "brand", invItem.brand || "");
                            updateFormItem(index, "price", invItem.salePrice || 0);
                            setSuggestionIndex(null);
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            padding: "8px 12px",
                            background: "none",
                            border: "none",
                            borderBottom: "1px solid #f1f5f9",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: "0.82rem"
                          }}
                        >
                          <strong style={{ color: "#0f172a" }}>{invItem.name}</strong>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                            {invItem.brand ? `الماركة: ${invItem.brand} | ` : ""}سعر البيع: {invItem.salePrice} ريال
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label style={{ flex: 1.5, fontSize: "0.8rem", display: "flex", flexDirection: "column" }}>
                  الوصف
                  <input
                    value={item.brand || ""}
                    onChange={(e) => updateFormItem(index, "brand", e.target.value)}
                    placeholder="مثل: TOSY"
                    style={{ padding: "6px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                  />
                </label>
                <label style={{ flex: 0.8, fontSize: "0.8rem", display: "flex", flexDirection: "column" }}>
                  الكمية
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateFormItem(index, "qty", Number(e.target.value))}
                    required
                    style={{ padding: "6px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center" }}
                  />
                </label>
                <label style={{ flex: 1, fontSize: "0.8rem", display: "flex", flexDirection: "column" }}>
                  السعر
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateFormItem(index, "price", Number(e.target.value))}
                    required
                    style={{ padding: "6px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center" }}
                  />
                </label>
                <button
                  type="button"
                  className="icon-danger"
                  style={{ padding: "8px", minHeight: "36px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => removeFormItem(index)}
                  title="حذف البند"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          <button type="button" className="secondary-button" onClick={addFormItem} style={{ minHeight: "30px", fontSize: "0.8rem", padding: "0 10px" }}>
            <Plus size={14} />
            إضافة بند جديد
          </button>
        </div>

        <div style={{ marginTop: "14px", padding: "10px", background: "#f8fafc", borderRadius: "6px", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>المجموع قبل الضريبة:</span>
            <strong>{currency.format(formSubtotal)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>ضريبة القيمة المضافة (15%):</span>
            <strong>{currency.format(formTax)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px dashed #cbd5e1", paddingTop: "4px", color: "var(--brand)" }}>
            <span>المجموع النهائي شامل الضريبة:</span>
            <strong>{currency.format(formTotal)}</strong>
          </div>
        </div>

        <label style={{ marginTop: "12px", display: "block" }}>
          ملاحظات وشروط إضافية
          <textarea name="notes" rows={2} placeholder="مثال: الأسعار شاملة التوصيل، التركيب، والضمان سنتين..." />
        </label>

        <button className="primary-button" style={{ marginTop: "12px" }}>
          <Plus size={18} />
          إنشاء عرض السعر
        </button>
        </form>
      )}

      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          <SectionTitle icon={ReceiptText} title="عروض الأسعار المالية" />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button type="button" className="secondary-button" onClick={toggleSelectAll}>
              {selectedIds.length === quotations.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
            {selectedIds.length > 0 && (
              <>
                <button type="button" className="secondary-button icon-danger text-danger" onClick={deleteSelected} style={{ color: "#ef4444" }}>
                  <Trash2 size={16} />
                  حذف المحدد ({selectedIds.length})
                </button>
                <button type="button" className="secondary-button" onClick={exportSelected}>
                  <Download size={16} />
                  تصدير المحدد
                </button>
              </>
            )}
            {selectedIds.length === 0 && (
              <button type="button" className="secondary-button" onClick={exportSelected}>
                <Download size={16} />
                تصدير الكل (CSV)
              </button>
            )}
            <label className="secondary-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", margin: 0 }}>
              <Download size={16} style={{ transform: "rotate(180deg)" }} />
              <span>استيراد CSV</span>
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const text = evt.target?.result as string;
                      onCsvImport(text);
                    };
                    reader.readAsText(file, "UTF-8");
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "45px", textAlign: "center" }}>
                  <input type="checkbox" checked={quotations.length > 0 && selectedIds.length === quotations.length} onChange={toggleSelectAll} />
                </th>
                <th>رقم العرض</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>صالح لغاية</th>
                <th>القيمة الإجمالية</th>
                <th>الحالة</th>
                <th style={{ width: "150px" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => {
                const client = clients.find((c) => String(c.id) === String(q.clientId));
                const isSelected = selectedIds.includes(q.id);
                return (
                  <tr key={q.id} style={{ background: isSelected ? "rgba(225, 29, 72, 0.04)" : undefined }}>
                    <td style={{ textAlign: "center" }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(q.id)} />
                    </td>
                    <td>
                      <strong>{q.number}</strong>
                    </td>
                    <td>
                      {client?.name || "—"}
                    </td>
                    <td>
                      {formatDate(q.date)}
                    </td>
                    <td>
                      {formatDate(q.validUntil)}
                    </td>
                    <td>
                      <strong style={{ color: "var(--brand)" }}>{formatMoney(q.value, q.currency)}</strong>
                    </td>
                    <td>
                      <select
                        value={q.status}
                        onChange={(e) => updateStatus(q.id, e.target.value as any)}
                        style={{ padding: "4px 8px", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "4px", background: "#fff" }}
                      >
                        <option value="مسودة">مسودة</option>
                        <option value="مرسل">مرسل</option>
                        <option value="معتمد">معتمد</option>
                        <option value="ملغي">ملغي</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button type="button" className="secondary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem", background: "rgba(225, 29, 72, 0.04)", border: "1px solid var(--brand)", color: "var(--brand)" }} onClick={() => setActiveId(q.id)}>
                          <Eye size={14} />
                          عرض العرض
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem", opacity: q.status === "معتمد" ? 0.45 : 1, cursor: q.status === "معتمد" ? "not-allowed" : "pointer" }}
                          disabled={q.status === "معتمد"}
                          title={q.status === "معتمد" ? "عرض معتمد — لا يمكن التعديل" : "تعديل عرض السعر"}
                          onClick={() => startQuotationEdit(q)}
                        >
                          تعديل
                        </button>
                        <button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => triggerConfirm("هل أنت متأكد من حذف عرض السعر هذا؟", () => deleteQuotation(q.id))} title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>لا توجد عروض أسعار مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="contract-modal" role="dialog" aria-modal="true" onClick={() => setEditing(null)}>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "760px" }}>
            <div className="contract-modal-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <strong style={{ fontSize: "1rem" }}>تعديل عرض السعر {editing.number}</strong>
              <button className="contract-modal-close" onClick={() => setEditing(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, padding: "12px 4px" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ flex: 1, minWidth: 140 }}>التاريخ<input type="date" value={editMeta.date} onChange={(e) => setEditMeta((m) => ({ ...m, date: e.target.value }))} /></label>
                <label style={{ flex: 1, minWidth: 140 }}>صالح حتى<input type="date" value={editMeta.validUntil} onChange={(e) => setEditMeta((m) => ({ ...m, validUntil: e.target.value }))} /></label>
                <label style={{ width: 110 }}>الضريبة %<input type="number" min={0} max={100} value={editMeta.taxPercent} onChange={(e) => setEditMeta((m) => ({ ...m, taxPercent: Number(e.target.value) || 0 }))} /></label>
                <label style={{ width: 130 }}>العملة<select value="SAR" onChange={(e) => setEditMeta((m) => ({ ...m, currency: e.target.value }))}><option value="SAR">SAR (ريال سعودي)</option></select></label>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>البند</th><th>الماركة</th><th style={{ width: 90 }}>الكمية</th><th style={{ width: 110 }}>السعر</th><th style={{ width: 110 }}>الإجمالي</th><th style={{ width: 50 }}></th></tr></thead>
                  <tbody>
                    {editItems.map((it, i) => (
                      <tr key={i}>
                        <td><input value={it.name} onChange={(e) => updateEditItem(i, "name", e.target.value)} style={{ width: "100%", padding: "4px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }} /></td>
                        <td><input value={it.brand} onChange={(e) => updateEditItem(i, "brand", e.target.value)} style={{ width: "100%", padding: "4px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }} /></td>
                        <td><input type="number" min={0} value={it.qty} onChange={(e) => updateEditItem(i, "qty", e.target.value)} style={{ width: "100%", padding: "4px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }} /></td>
                        <td><input type="number" min={0} value={it.price} onChange={(e) => updateEditItem(i, "price", e.target.value)} style={{ width: "100%", padding: "4px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }} /></td>
                        <td>{formatMoney(it.qty * it.price, editMeta.currency)}</td>
                        <td>{editItems.length > 1 && <button type="button" className="icon-danger" style={iconDangerStyle} onClick={() => setEditItems((cur) => cur.filter((_, x) => x !== i))}><Trash2 size={14} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button type="button" className="secondary-button" onClick={() => setEditItems((cur) => [...cur, { name: "", brand: "", qty: 1, price: 0, total: 0 }])}><Plus size={14} />إضافة بند</button>
                <span style={{ marginInlineStart: "auto", fontWeight: 600 }}>
                  الإجمالي شامل الضريبة: {formatMoney(Math.round(editItems.reduce((acc, it) => acc + it.qty * it.price, 0) * (1 + editMeta.taxPercent / 100)), editMeta.currency)}
                </span>
              </div>
              <label>ملاحظات<textarea rows={2} value={editMeta.notes} onChange={(e) => setEditMeta((m) => ({ ...m, notes: e.target.value }))} /></label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="primary-button" onClick={saveQuotationEdit}>حفظ التعديلات</button>
                <button type="button" className="secondary-button" onClick={() => setEditing(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeQuotation && (
        <div className="contract-modal" role="dialog" aria-modal="true" onClick={() => setActiveId(null)}>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "900px" }}>
            <div className="contract-modal-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="primary-button" onClick={() => downloadPdf(activeQuotation.id, activeQuotation.number)}>
                <FileText size={17} />
                تحميل PDF (الرسمي)
              </button>
              <button 
                className="primary-button" 
                style={{ background: "#2563eb", color: "#ffffff" }} 
                onClick={(e) => {
                  const target = e.currentTarget.closest(".contract-modal-inner")?.querySelector(".contract-doc") as HTMLElement;
                  if (target) exportHtmlElementToWord(target, `عرض_سعر_${activeQuotation.number}.docx`);
                }}
              >
                <FileText size={17} />
                تحميل Word (Docx)
              </button>
              <button className="primary-button" style={{ background: "#10b981", color: "#fff" }} onClick={() => downloadExcel(activeQuotation.id, activeQuotation.number)}>
                <Download size={17} />
                تحميل Excel (المالي)
              </button>
              <button 
                className={isEditingQuotationText ? "primary-button" : "secondary-button"} 
                style={isEditingQuotationText ? { background: "#10b981", color: "#fff" } : {}}
                onClick={() => setIsEditingQuotationText(!isEditingQuotationText)}
              >
                <Edit size={17} />
                {isEditingQuotationText ? "إيقاف التعديل المباشر" : "تعديل الكتابة على الشاشة"}
              </button>
              <button className="secondary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة المتصفح
              </button>
              <button className="contract-modal-close" onClick={() => setActiveId(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            <QuotationDocument quotation={activeQuotation} client={activeClient} stamp={stamp} signature={signature} site={site} isEditingText={isEditingQuotationText} />
          </div>
        </div>
      )}
    </section>
  );
}

// Helper hooks and utilities used across InternalApp views.
function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const setValue = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (err) {
        console.error("تعذر الحفظ في المتصفح", err);
        triggerAlert("تعذّر الحفظ: مساحة التخزين في المتصفح ممتلئة. جرّب تقليل عدد الصور أو حجمها ثم أعد المحاولة.");
      }
      return next;
    });
  };
  return [state, setValue];
}

function nextId<T extends { id: number | string }>(items: T[]): number {
  const numericIds = items.map((i) => Number(i.id)).filter((n) => !Number.isNaN(n));
  return numericIds.length ? Math.max(...numericIds) + 1 : 1;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

const numberFormat = new Intl.NumberFormat("ar-SA");
const currency = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 });
const currencyOptions = ["SAR"];
const currencyByCode: Record<string, Intl.NumberFormat> = {
  SAR: new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }),
  EGP: new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }),
  AED: new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }),
};
function formatMoney(value: number, code: string = "SAR"): string {
  return (currencyByCode[code] ?? currencyByCode.SAR).format(value);
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const row: string[] = [];
    let cur = "";
    let inQuote = false;
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') inQuote = !inQuote;
      else if (ch === "," && !inQuote) {
        row.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    row.push(cur.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, k) => {
      obj[h] = row[k] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

function resizeImage(file: File, maxSide = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const largest = Math.max(img.width, img.height) || 1;
        const ratio = Math.min(1, maxSide / largest);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(data);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(data);
        }
      };
      img.onerror = () => resolve(data);
      img.src = data;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function statusTone(status: string): string {
  if (["مكتمل", "تم", "مدفوعة", "حاضر", "تم الحل", "منخفضة"].includes(status)) return "success";
  if (["جاري", "جزئية", "إجازة", "قيد المعالجة", "متوسطة"].includes(status)) return "info";
  if (["متأخر", "متأخرة", "غياب", "متوقف", "مفتوح", "عالية"].includes(status)) return "danger";
  return "muted";
}

const navItems = [
  { id: "dashboard", label: "لوحة التحكم", icon: BarChart3 },
  { id: "clients", label: "العملاء", icon: Users },
  { id: "contractors", label: "المقاولين", icon: BriefcaseBusiness },
  { id: "projects", label: "المواقع والمشاريع", icon: Building2 },
  { id: "stages", label: "التنفيذ", icon: Layers3 },
  { id: "systems", label: "الأنظمة الفنية", icon: Gauge },
  { id: "deficiencies", label: "نواقص المواقع", icon: OctagonAlert },
  { id: "dailyReports", label: "تقرير اليوم الموحد", icon: ClipboardList },
  { id: "supplyOrders", label: "استلام التوريد", icon: Truck },
  { id: "workers", label: "العمال", icon: HardHat },
  { id: "teams", label: "فرق العمل", icon: UsersRound },
  { id: "attendance", label: "الحضور", icon: CalendarCheck },
  { id: "leaves", label: "الإجازات", icon: CalendarOff },
  { id: "payroll", label: "الرواتب", icon: WalletCards },
  { id: "inventory", label: "المخزن والمواد", icon: Warehouse },
  { id: "finance", label: "الحسابات والدفعات المالية", icon: WalletCards },
  { id: "contracts", label: "العقود", icon: FileText },
  { id: "maintenance", label: "الصيانة", icon: Wrench },
  { id: "quotations", label: "عروض الأسعار", icon: ReceiptText },
  { id: "reports", label: "التقارير", icon: BarChart3 },
  { id: "showcase", label: "عملاؤنا", icon: Images },
  { id: "site", label: "محتوى الموقع", icon: Globe },
  { id: "config", label: "الإعدادات", icon: Settings },
  { id: "alerts", label: "التنبيهات", icon: Bell },
  { id: "settings", label: "الصلاحيات", icon: UserCog },
] as const;

const stageProgress = { "لم يبدأ": 0, "جاري": 50, "تم": 100 } as const;

const triggerConfirm = (message: string, onConfirm: () => void) => {
  if (typeof window !== "undefined" && (window as any).triggerConfirm) {
    (window as any).triggerConfirm(message, onConfirm);
  } else {
    if (window.confirm(message)) onConfirm();
  }
};

const triggerAlert = (message: string) => {
  if (typeof window !== "undefined" && (window as any).triggerAlert) {
    (window as any).triggerAlert(message);
  } else {
    window.alert(message);
  }
};


function DashboardView({
  totals,
  projects,
  clients,
  stages,
  workers,
  alerts,
  invoices,
  expenses,
  deficiencies,
  systems,
  quotations,
  contracts,
  inventory,
  attendance,
  leaves,
  maintenanceContracts,
  maintenanceVisits,
  setActiveSection,
}: {
  totals: { revenue: number; expenseTotal: number; profit: number; delayed: number; activeWorkers: number; lowStock: number };
  projects: Project[];
  clients: Client[];
  stages: ProjectStage[];
  workers: Worker[];
  alerts: AppAlert[];
  invoices: Invoice[];
  expenses: Expense[];
  deficiencies: SiteDeficiency[];
  systems: ProjectSystem[];
  quotations: Quotation[];
  contracts: Contract[];
  inventory: InventoryItem[];
  attendance: AttendanceRecord[];
  leaves: Leave[];
  maintenanceContracts: MaintenanceContract[];
  maintenanceVisits: MaintenanceVisit[];
  setActiveSection: (section: Section) => void;
}) {
  const [allSupplyOrders, setAllSupplyOrders] = useState<SupplyOrder[]>([]);
  const [allDailyReports, setAllDailyReports] = useState<DailySiteReport[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardDetails = async () => {
      setLoadingDetails(true);
      try {
        const supplyPromises = projects.map((p) =>
          apiFetch(`/api/projects/${p.id}/supply-orders`).catch(() => [])
        );
        const reportPromises = projects.map((p) =>
          apiFetch(`/api/projects/${p.id}/daily-reports`).catch(() => [])
        );

        const supplyResults = await Promise.all(supplyPromises);
        const reportResults = await Promise.all(reportPromises);

        if (!isMounted) return;

        const flatSupply = supplyResults.flat().filter(Boolean) as SupplyOrder[];
        const flatReports = reportResults.flat().filter(Boolean) as DailySiteReport[];

        setAllSupplyOrders(flatSupply);
        setAllDailyReports(flatReports);
      } catch (err) {
        console.error("Error fetching dashboard details", err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    if (projects.length > 0) {
      fetchDashboardDetails();
    }
  }, [projects]);

  // Formatted financial totals
  const formattedRevenue = currency.format(totals.revenue);
  const formattedExpense = currency.format(totals.expenseTotal);
  const formattedProfit = currency.format(totals.profit);

  // KPIs Calculations
  const activeProjects = projects.filter((p) => p.status === "جاري");
  const completedProjects = projects.filter((p) => p.status === "مكتمل");
  const activeProjectsCount = activeProjects.length;
  const completedProjectsCount = completedProjects.length;

  const averageProgress = activeProjectsCount
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjectsCount)
    : 0;

  // Open Deficiencies (نواقص مفتوحة)
  const openDeficiencies = deficiencies.filter((d) => d.status === "مفتوح" || d.status === "قيد المعالجة");
  const criticalDeficienciesCount = openDeficiencies.filter((d) => d.severity === "عالية").length;

  // Pending Supply Orders (طلبات التوريد المعلقة)
  const pendingOrders = allSupplyOrders.filter((o) => o.status === "PENDING" || o.status === "PARTIAL");

  // Scheduled Maintenance Visits (زيارات صيانة مجدولة قريبة)
  const upcomingVisits = maintenanceVisits.filter((v) => v.status === "مجدولة");

  // Attendance rate today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const todayPresentCount = todayAttendance.filter((a) => a.status === "حاضر").length;
  const attendanceRate = workers.length ? Math.round((todayPresentCount / workers.length) * 100) : 0;

  // Attention lists
  // 1. Expiring quotations (status draft or sent, expiring in 15 days or less)
  const today = new Date();
  const expiringQuotations = quotations.filter((q) => {
    if (q.status !== "مسودة" && q.status !== "مرسل") return false;
    const diffTime = new Date(q.validUntil).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -5 && diffDays <= 15; // Expired recently or expiring soon
  });

  // 2. Pending leaves
  const pendingLeaves = leaves.filter((l) => l.status === "مطلوبة");

  // 3. High severity open deficiencies
  const highDeficiencies = openDeficiencies.filter((d) => d.severity === "عالية");

  // 4. Overdue or upcoming maintenance visits (next 7 days)
  const upcomingMaintenanceVisits = upcomingVisits.filter((v) => {
    const diffTime = new Date(v.scheduledDate).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  // Combine into a clean attention list
  const attentionItems: {
    id: string;
    type: "quote" | "leave" | "deficiency" | "visit";
    title: string;
    detail: string;
    severity: "danger" | "warning" | "info";
    actionLabel: string;
    actionSection: Section;
  }[] = [];

  highDeficiencies.forEach((d) => {
    const projName = projects.find((p) => p.id === d.projectId)?.name || "مشروع غير معروف";
    attentionItems.push({
      id: `def-${d.id}`,
      type: "deficiency",
      title: "نقص حرج بالموقع",
      detail: `${projName}: ${d.description}`,
      severity: "danger",
      actionLabel: "عرض النواقص",
      actionSection: "deficiencies",
    });
  });

  pendingLeaves.forEach((l) => {
    const workerName = workers.find((w) => w.id === l.workerId)?.name || "موظف";
    attentionItems.push({
      id: `leave-${l.id}`,
      type: "leave",
      title: "طلب إجازة معلّق",
      detail: `${workerName}: من ${l.startDate} إلى ${l.endDate}`,
      severity: "warning",
      actionLabel: "اعتماد الإجازات",
      actionSection: "leaves",
    });
  });

  expiringQuotations.forEach((q) => {
    const clientName = clients.find((c) => c.id === q.clientId)?.name || "عميل";
    attentionItems.push({
      id: `quote-${q.id}`,
      type: "quote",
      title: "عرض سعر ينتهي قريباً",
      detail: `${q.number} - ${clientName} (${currency.format(q.value)})`,
      severity: "info",
      actionLabel: "إدارة العروض",
      actionSection: "quotations",
    });
  });

  upcomingMaintenanceVisits.forEach((v) => {
    const contract = maintenanceContracts.find((c) => c.id === v.contractId);
    const clientName = contract ? clients.find((c) => c.id === contract.clientId)?.name : "عميل";
    attentionItems.push({
      id: `visit-${v.id}`,
      type: "visit",
      title: "زيارة صيانة وقائية مجدولة",
      detail: `${clientName} بتاريخ ${v.scheduledDate}`,
      severity: "info",
      actionLabel: "جدول الصيانة",
      actionSection: "maintenance",
    });
  });

  // Recent Activity Feed from Daily Site Reports (latest 5 reports across all projects)
  const recentActivities = allDailyReports
    .map((r) => {
      const proj = projects.find((p) => p.id === r.projectId);
      return {
        id: r.id,
        projectName: proj?.name || "مشروع",
        date: r.date,
        submittedBy: r.submittedBy?.name || "مهندس الموقع",
        workersCount: r.workersCount,
        problems: r.problems,
        solutions: r.solutions,
        completionPercent: r.completionPercent,
        createdAt: r.createdAt,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Time based greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "صباح الخير";
    if (hr < 18) return "مساء الخير";
    return "مساء الخير";
  };

  const getSystemBadgeClass = (projId: number | string, systemType: SystemType) => {
    const sys = systems.find((s) => s.projectId === projId && s.type === systemType);
    if (!sys) return "db-system-badge";
    if (sys.status === "معتمد" || sys.status === "مركّب") return "db-system-badge active";
    return "db-system-badge warning";
  };

  const getSystemStatusLabel = (projId: number | string, systemType: SystemType) => {
    const sys = systems.find((s) => s.projectId === projId && s.type === systemType);
    return sys ? sys.status : "غير مدرج";
  };

  return (
    <div className="db-container animate-fade-in">
      {/* Header Panel */}
      <div className="db-header">
        <div className="db-greeting">
          <h1>{getGreeting()}، أدمن كنان</h1>
          <p>لوحة التحكم الفنية والتشغيلية لمشاريع مكافحة وإنذار الحريق</p>
        </div>
        <div className="db-actions">
          <button className="db-btn-quick db-btn-brand" onClick={() => setActiveSection("projects")}>
            <MIcon name="add" size={18} />
            <span>مشروع جديد</span>
          </button>
          <button className="db-btn-quick" onClick={() => setActiveSection("attendance")}>
            <MIcon name="calendar_today" size={18} />
            <span>تسجيل الحضور</span>
          </button>
          <button className="db-btn-quick" onClick={() => setActiveSection("deficiencies")}>
            <MIcon name="report" size={18} />
            <span>تسجيل نقص</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="db-kpi-grid">
        {/* Active Projects */}
        <div className="db-kpi-card db-brand" onClick={() => setActiveSection("projects")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="domain" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">مواقع قيد التنفيذ</span>
            <span className="db-kpi-value">{activeProjectsCount}</span>
            <span className="db-kpi-subtext">من إجمالي {projects.length} مشاريع</span>
          </div>
        </div>

        {/* Execution progress */}
        <div className="db-kpi-card db-info" onClick={() => setActiveSection("stages")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="layers" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">معدل إنجاز المواقع</span>
            <span className="db-kpi-value">{averageProgress}%</span>
            <span className="db-kpi-subtext">متوسط التقدم التشغيلي</span>
          </div>
        </div>

        {/* Site Deficiencies */}
        <div className="db-kpi-card db-danger" onClick={() => setActiveSection("deficiencies")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="report_problem" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">نواقص مفتوحة</span>
            <span className="db-kpi-value">{openDeficiencies.length}</span>
            <span className="db-kpi-subtext">{criticalDeficienciesCount} حرجة تحتاج معالجة</span>
          </div>
        </div>

        {/* Material Supply Orders */}
        <div className="db-kpi-card db-warning" onClick={() => setActiveSection("supplyOrders")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="local_shipping" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">طلبات توريد معلقة</span>
            <span className="db-kpi-value">{pendingOrders.length}</span>
            <span className="db-kpi-subtext">أصناف تحت الشحن أو جزئية</span>
          </div>
        </div>

        {/* Maintenance visits */}
        <div className="db-kpi-card db-purple" onClick={() => setActiveSection("maintenance")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="build" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">زيارات الصيانة المجدولة</span>
            <span className="db-kpi-value">{upcomingVisits.length}</span>
            <span className="db-kpi-subtext">عقود صيانة وقائية نشطة</span>
          </div>
        </div>

        {/* Workforce */}
        <div className="db-kpi-card db-success" onClick={() => setActiveSection("workers")}>
          <div className="db-kpi-icon-wrap">
            <MIcon name="engineering" size={24} />
          </div>
          <div className="db-kpi-content">
            <span className="db-kpi-label">حضور القوى العاملة</span>
            <span className="db-kpi-value">{attendanceRate}%</span>
            <span className="db-kpi-subtext">{todayPresentCount} حاضرين اليوم بالمواقع</span>
          </div>
        </div>
      </div>

      {/* Financial health card */}
      <div className="db-panel" style={{ gap: "16px" }}>
        <div className="db-panel-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div className="db-panel-title">
            <MIcon name="payments" size={20} />
            <span>الوضع المالي الإجمالي للمشاريع</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {/* Revenue */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "12px", borderRight: "4px solid #10b981" }}>
            <MIcon name="arrow_upward" size={24} style={{ color: "#10b981" }} />
            <div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>إجمالي الفواتير الصادرة (الإيرادات)</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{formattedRevenue}</div>
            </div>
          </div>
          {/* Expenses */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "12px", borderRight: "4px solid #ef4444" }}>
            <MIcon name="arrow_downward" size={24} style={{ color: "#ef4444" }} />
            <div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>تكاليف ومصروفات المشاريع</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{formattedExpense}</div>
            </div>
          </div>
          {/* Net Profit */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "12px", borderRight: "4px solid #3b82f6" }}>
            <MIcon name="trending_up" size={24} style={{ color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>صافي هامش الربح التشغيلي</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{formattedProfit}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="db-sections-grid">
        {/* Column 1: Projects health matrix */}
        <div className="db-panel">
          <div className="db-panel-header">
            <div className="db-panel-title">
              <MIcon name="domain" size={22} />
              <span>مصفوفة تغطية الأنظمة وجاهزية المواقع</span>
            </div>
            <span className="db-panel-badge">{activeProjectsCount} مواقع نشطة</span>
          </div>

          <div className="table-wrap" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>اسم الموقع / المشروع</th>
                  <th>العميل</th>
                  <th>تقدّم التنفيذ</th>
                  <th>أنظمة السلامة والمكافحة</th>
                  <th style={{ width: "90px" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                          المشرف: {p.engineer || "غير معيّن"}
                        </div>
                      </td>
                      <td>{client?.name || "—"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, width: "32px", textAlign: "left" }}>{p.progress}%</span>
                          <Progress value={p.progress} />
                        </div>
                      </td>
                      <td>
                        <div className="db-systems-row">
                          <span className={getSystemBadgeClass(p.id, "إنذار حريق")} title={`إنذار حريق: ${getSystemStatusLabel(p.id, "إنذار حريق")}`}>
                            <MIcon name="notifications_active" size={12} />
                            إنذار
                          </span>
                          <span className={getSystemBadgeClass(p.id, "شبكة إطفاء")} title={`شبكة إطفاء: ${getSystemStatusLabel(p.id, "شبكة إطفاء")}`}>
                            <MIcon name="local_fire_department" size={12} />
                            إطفاء
                          </span>
                          <span className={getSystemBadgeClass(p.id, "تهوية وتكييف")} title={`تهوية وسحب دخان: ${getSystemStatusLabel(p.id, "تهوية وتكييف")}`}>
                            <MIcon name="air" size={12} />
                            تهوية
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="secondary-button"
                          style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.78rem" }}
                          onClick={() => {
                            setActiveSection("projects");
                          }}
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {activeProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      لا توجد مشاريع نشطة قيد التنفيذ حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Attention lists and Activities */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Attention Panel */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div className="db-panel-title">
                <MIcon name="report" size={20} style={{ color: "#f59e0b" }} />
                <span>يحتاج انتباهك الفوري</span>
              </div>
              <span className="db-panel-badge" style={{ background: "#fef3c7", color: "#d97706" }}>
                {attentionItems.length} تنبيهات
              </span>
            </div>

            <div className="db-attention-list">
              {attentionItems.slice(0, 5).map((item) => (
                <div key={item.id} className="db-attention-item">
                  <div className="db-attention-info">
                    <div className={`db-attention-icon ${item.severity}`}>
                      <MIcon
                        name={
                          item.type === "deficiency"
                            ? "report_problem"
                            : item.type === "leave"
                            ? "calendar_today"
                            : item.type === "quote"
                            ? "receipt_long"
                            : "build"
                        }
                        size={18}
                      />
                    </div>
                    <div className="db-attention-text">
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                  <div className="db-attention-action">
                    <button onClick={() => setActiveSection(item.actionSection)}>{item.actionLabel}</button>
                  </div>
                </div>
              ))}
              {attentionItems.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                  <MIcon name="verified_user" size={32} style={{ color: "#10b981", marginBottom: "8px", opacity: 0.8 }} />
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", margin: 0 }}>كل شيء يسير بسلاسة، لا تنبيهات حالياً.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Operations Updates */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div className="db-panel-title">
                <MIcon name="history" size={20} />
                <span>آخر تقارير التشغيل الميداني</span>
              </div>
            </div>

            <div className="db-activity-feed">
              {recentActivities.map((act) => (
                <div key={act.id} className="db-activity-item">
                  <div className="db-activity-dot"></div>
                  <div className="db-activity-card">
                    <div className="db-activity-meta">
                      <strong>{act.projectName}</strong>
                      <span>{act.date}</span>
                    </div>
                    <div className="db-activity-details">
                      تم تقديم تقرير بواسطة المهندس <strong>{act.submittedBy}</strong>. نسبة إنجاز الأعمال الإجمالية: <strong>{act.completionPercent}%</strong> مع حضور <strong>{act.workersCount} عمال</strong> في الموقع.
                    </div>
                    {act.problems && (
                      <div className="db-activity-notes db-activity-problems">
                        <strong>المشاكل المبلّغ عنها:</strong> {act.problems}
                        {act.solutions && (
                          <div style={{ marginTop: "4px", fontSize: "0.74rem" }}>
                            <strong>الحل المقترح:</strong> {act.solutions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                  <p style={{ fontSize: "0.82rem" }}>لا توجد تقارير تشغيل ميداني مسجلة بعد.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconDangerStyle = { background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "inline-flex", padding: 4 } as const;

function ClientsView({ clients, projects, addClient, deleteClient, updateClient, onCsvImport }: {
  clients: Client[]; projects: Project[];
  addClient: (e: FormEvent<HTMLFormElement>) => void;
  deleteClient: (id: number) => void; updateClient: (c: Client) => void;
  onCsvImport: (t: string) => void;
}) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addClient}>
        <SectionTitle icon={UserPlus} title="إضافة عميل جديد" />
        <Field label="اسم العميل / المنشأة" name="name" required />
        <div className="two-fields">
          <Field label="الهاتف" name="phone" />
          <Field label="النوع" name="type" placeholder="مالك وحدة / استشاري ..." />
        </div>
        <Field label="العنوان" name="address" />
        <label>ملاحظات<textarea name="notes" rows={2} /></label>
        <button className="primary-button"><Plus size={18} />إضافة العميل</button>
      </form>
      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <SectionTitle icon={Users} title="قائمة العملاء" />
          <label className="secondary-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, margin: 0 }}>
            <Download size={16} style={{ transform: "rotate(180deg)" }} /><span>استيراد CSV</span>
            <input type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = (ev) => onCsvImport(ev.target?.result as string); r.readAsText(file, "UTF-8"); } e.target.value = ""; }} />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>الاسم</th><th>الهاتف</th><th>العنوان</th><th>النوع</th><th>المشاريع</th><th style={{ width: 130 }}>إجراءات</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td><td>{c.phone || "—"}</td><td>{c.address || "—"}</td><td>{c.type || "—"}</td>
                  <td>{projects.filter((p) => p.clientId === c.id).length}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingClient(c)}>تعديل</button>
                      <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف هذا العميل؟", () => deleteClient(c.id))}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد عملاء مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editingClient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "480px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800 }}>تعديل بيانات العميل</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateClient({
                ...editingClient,
                name: String(f.get("name") || "").trim(),
                phone: String(f.get("phone") || "").trim(),
                type: String(f.get("type") || "").trim(),
                address: String(f.get("address") || "").trim(),
                notes: String(f.get("notes") || "").trim(),
              });
              setEditingClient(null);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>الاسم
                <input name="name" defaultValue={editingClient.name} required style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>الهاتف
                <input name="phone" defaultValue={editingClient.phone} required style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>النوع
                <input name="type" defaultValue={editingClient.type || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>العنوان
                <input name="address" defaultValue={editingClient.address || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>ملاحظات
                <textarea name="notes" defaultValue={editingClient.notes || ""} rows={2} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    triggerConfirm("هل أنت تأكد من حذف هذا العميل بالكامل؟", () => {
                      deleteClient(editingClient.id);
                      setEditingClient(null);
                    });
                  }}
                  style={{ background: "#dc2626", color: "#fff", border: 0, padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={15} />
                  حذف العميل
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="secondary-button" onClick={() => setEditingClient(null)}>إلغاء</button>
                  <button type="submit" className="primary-button" style={{ background: "var(--brand)", color: "#fff", border: 0 }}>حفظ التغييرات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function ContractorsView({ contractors, projects, addContractor, deleteContractor, updateContractor }: {
  contractors: Contractor[]; projects: Project[];
  addContractor: (e: FormEvent<HTMLFormElement>) => void;
  deleteContractor: (id: number) => void; updateContractor: (c: Contractor) => void;
}) {
  void projects;
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addContractor}>
        <SectionTitle icon={UserPlus} title="إضافة مقاول جديد" />
        <Field label="اسم المقاول" name="name" required />
        <div className="two-fields">
          <Field label="الهاتف" name="phone" />
          <Field label="التخصص" name="specialty" placeholder="تمديدات / دهانات ..." />
        </div>
        <div className="two-fields">
          <Field label="الشركة" name="company" />
          <Field label="العنوان" name="address" />
        </div>
        <label>ملاحظات<textarea name="notes" rows={2} /></label>
        <button className="primary-button"><Plus size={18} />إضافة المقاول</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={BriefcaseBusiness} title="قائمة المقاولين" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>الاسم</th><th>التخصص</th><th>الشركة</th><th>الهاتف</th><th>العنوان</th><th style={{ width: 130 }}>إجراءات</th></tr></thead>
            <tbody>
              {contractors.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td><td>{c.specialty || "—"}</td><td>{c.company || "—"}</td><td>{c.phone || "—"}</td><td>{c.address || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingContractor(c)}>تعديل</button>
                      <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف هذا المقاول؟", () => deleteContractor(c.id))}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {contractors.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد مقاولين مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editingContractor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "480px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800 }}>تعديل بيانات المقاول</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateContractor({
                ...editingContractor,
                name: String(f.get("name") || "").trim(),
                phone: String(f.get("phone") || "").trim(),
                specialty: String(f.get("specialty") || "").trim(),
                company: String(f.get("company") || "").trim(),
                address: String(f.get("address") || "").trim(),
                notes: String(f.get("notes") || "").trim(),
              });
              setEditingContractor(null);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>الاسم
                <input name="name" defaultValue={editingContractor.name} required style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>الهاتف
                <input name="phone" defaultValue={editingContractor.phone || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>التخصص
                <input name="specialty" defaultValue={editingContractor.specialty || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>الشركة
                <input name="company" defaultValue={editingContractor.company || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>العنوان
                <input name="address" defaultValue={editingContractor.address || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>ملاحظات
                <textarea name="notes" defaultValue={editingContractor.notes || ""} rows={2} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="secondary-button" onClick={() => setEditingContractor(null)}>إلغاء</button>
                <button type="submit" className="primary-button" style={{ background: "var(--brand)", color: "#fff", border: 0 }}>حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectsView({
  projects,
  clients,
  stages,
  addProject,
  deleteProject,
  updateProject,
  setSelectedProjectId,
  setActiveSection,
  isAdmin,
  isPMOrAdmin,
}: {
  projects: Project[]; clients: Client[]; stages: ProjectStage[];
  addProject: (e: FormEvent<HTMLFormElement>) => void;
  deleteProject: (id: number | string) => void; updateProject: (p: Project) => void;
  setSelectedProjectId: (id: number | string) => void; setActiveSection: (s: Section) => void;
  isAdmin: boolean;
  isPMOrAdmin: boolean;
}) {
  const projectStatuses: Project["status"][] = ["لم يبدأ", "جاري", "متوقف", "متأخر", "مكتمل"];
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  return (
    <section className="content-grid content-grid--stack">
      {isPMOrAdmin && (
        <form className="form-panel" onSubmit={addProject}>
          <SectionTitle icon={Plus} title="إضافة مشروع / موقع جديد" />
          <Field label="اسم المشروع" name="name" required />
          <label>العميل<select name="clientId" required><option value="">اختر عميل...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <div className="two-fields">
            <Field label="نوع المشروع" name="type" placeholder="فيلا / فرع ..." />
            <Field label="مهندس الموقع" name="engineer" />
          </div>
          <Field label="عنوان الموقع" name="address" />
          <div className="two-fields">
            <Field label="تاريخ البداية" name="startDate" type="date" />
            <Field label="تاريخ النهاية" name="endDate" type="date" />
          </div>
          <div className="two-fields">
            <Field label="الميزانية (ريال)" name="budget" type="number" />
            <Field label="نسبة الإنجاز %" name="progress" type="number" />
          </div>
          <label>الحالة<select name="status" defaultValue="جاري">{projectStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <button className="primary-button"><Plus size={18} />إضافة المشروع</button>
        </form>
      )}
      <div className="panel wide">
        <SectionTitle icon={Building2} title="متابعة المواقع والمشاريع" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>المشروع</th><th>العميل</th><th>المهندس</th><th>الحالة</th><th>الإنجاز</th><th>المراحل</th><th style={{ width: 220 }}>إجراءات</th></tr></thead>
            <tbody>
              {projects.map((p) => {
                const client = clients.find((c) => c.id === p.clientId);
                const stageCount = stages.filter((s) => s.projectId === p.id).length;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td><td>{client?.name || "—"}</td><td>{p.engineer || "—"}</td>
                    <td><Badge value={p.status} /></td>
                    <td style={{ minWidth: 110 }}><Progress value={p.progress} /></td>
                    <td>{stageCount}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem", border: "1px solid var(--brand)", color: "var(--brand)" }} onClick={() => { setSelectedProjectId(p.id); setActiveSection("projectDetail"); }}><Eye size={14} />التفاصيل</button>
                        <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingProject(p)}>تعديل</button>
                        {isAdmin && <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف هذا المشروع؟", () => deleteProject(p.id))}><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد مشاريع مسجلة.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editingProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "520px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800 }}>تعديل بيانات المشروع / الموقع</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateProject({
                ...editingProject,
                name: String(f.get("name") || editingProject.name).trim(),
                type: String(f.get("type") || editingProject.type).trim(),
                clientId: (f.get("clientId") || editingProject.clientId) as any,
                engineer: String(f.get("engineer") || editingProject.engineer).trim(),
                address: String(f.get("address") || editingProject.address).trim(),
                startDate: String(f.get("startDate") || editingProject.startDate),
                endDate: String(f.get("endDate") || editingProject.endDate),
                budget: Number(f.get("budget")) || editingProject.budget,
                status: String(f.get("status") || editingProject.status) as Project["status"],
                progress: Number(f.get("progress")) || editingProject.progress,
              });
              setEditingProject(null);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>اسم المشروع
                <input name="name" defaultValue={editingProject.name} required disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
              </label>
              <div className="two-fields">
                <label>النوع
                  <input name="type" defaultValue={editingProject.type} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
                </label>
                <label>مهندس الموقع
                  <input name="engineer" defaultValue={editingProject.engineer} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
                </label>
              </div>
              <label>عنوان الموقع
                <input name="address" defaultValue={editingProject.address} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
              </label>
              <div className="two-fields">
                <label>تاريخ البدء
                  <input name="startDate" type="date" defaultValue={editingProject.startDate} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
                </label>
                <label>تاريخ النهاية
                  <input name="endDate" type="date" defaultValue={editingProject.endDate} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
                </label>
              </div>
              <div className="two-fields">
                <label>الميزانية (ريال)
                  <input name="budget" type="number" defaultValue={editingProject.budget} disabled={!isPMOrAdmin} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: !isPMOrAdmin ? "#f1f5f9" : "#fff" }} />
                </label>
                <label>نسبة الإنجاز %
                  <input name="progress" type="number" min="0" max="100" defaultValue={editingProject.progress} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                </label>
              </div>
              <label>حالة المشروع
                <select name="status" defaultValue={editingProject.status} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                  {projectStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="secondary-button" onClick={() => setEditingProject(null)}>إلغاء</button>
                <button type="submit" className="primary-button" style={{ background: "var(--brand)", color: "#fff", border: 0 }}>حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectDetailView({ project, client, stages, systems, deficiencies, assignments, workers, teams, onBack, downloadReportPdf, downloadReportExcel }: {
  project?: Project; client?: Client; stages: ProjectStage[]; systems: ProjectSystem[];
  deficiencies: SiteDeficiency[]; assignments: ProjectAssignment[]; workers: Worker[]; teams: WorkTeam[]; onBack: () => void;
  downloadReportPdf: (id: string | number, name: string) => void;
  downloadReportExcel: (id: string | number, name: string) => void;
}) {
  if (!project) return <section className="panel"><p style={{ color: "var(--muted)" }}>اختر مشروعًا من قائمة المواقع والمشاريع.</p></section>;
  return (
    <section className="panel" style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <SectionTitle icon={Building2} title={project.name} />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="primary-button" style={{ height: "38px", minHeight: "auto", fontSize: "0.85rem" }} onClick={() => downloadReportPdf(project.id, project.name)}>تقرير المشروع (PDF)</button>
          <button type="button" className="primary-button" style={{ height: "38px", minHeight: "auto", fontSize: "0.85rem", background: "#10b981", color: "#fff" }} onClick={() => downloadReportExcel(project.id, project.name)}>كشف المشروع (Excel)</button>
          <button type="button" className="secondary-button" style={{ height: "38px", minHeight: "auto", fontSize: "0.85rem" }} onClick={onBack}>عودة للمشاريع</button>
        </div>
      </div>
      <div className="metric-grid">
        <MiniStat title="العميل" value={client?.name ?? "—"} icon={Users} />
        <MiniStat title="المهندس" value={project.engineer || "—"} icon={HardHat} />
        <MiniStat title="الحالة" value={project.status} icon={Gauge} />
        <MiniStat title="نسبة الإنجاز" value={`${project.progress}%`} icon={BarChart3} />
      </div>
      <div className="operations-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <div className="panel">
          <SectionTitle icon={Layers3} title="مراحل التنفيذ" />
          {stages.length ? stages.map((s) => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}><span>{s.name}</span><Badge value={s.status} /></div>) : <p style={{ color: "var(--muted)" }}>لا توجد مراحل.</p>}
        </div>
        <div className="panel">
          <SectionTitle icon={Gauge} title="الأنظمة الفنية" />
          {systems.length ? systems.map((s) => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}><span>{s.name} <small style={{ color: "var(--muted)" }}>({s.type})</small></span><Badge value={s.status} /></div>) : <p style={{ color: "var(--muted)" }}>لا توجد أنظمة.</p>}
        </div>
        <div className="panel">
          <SectionTitle icon={OctagonAlert} title="نواقص الموقع" />
          {deficiencies.length ? deficiencies.map((d) => <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}><span>{d.description}</span><Badge value={d.status} /></div>) : <p style={{ color: "var(--muted)" }}>لا توجد نواقص.</p>}
        </div>
        <div className="panel">
          <SectionTitle icon={UsersRound} title="فرق العمل المعيّنة" />
          {assignments.length ? assignments.map((a) => { const team = teams.find((t) => t.id === a.teamId); const worker = workers.find((w) => w.id === a.workerId); return <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}><span>{team?.name || worker?.name || "—"}</span><small style={{ color: "var(--muted)" }}>{a.roleOnSite}</small></div>; }) : <p style={{ color: "var(--muted)" }}>لا توجد تعيينات.</p>}
        </div>
      </div>
    </section>
  );
}

function StagesView({ projects, stages, selectedProjectId, setSelectedProjectId, addStage, updateStageStatus, updateStageNotes, deleteStage, isAdmin }: {
  projects: Project[]; stages: ProjectStage[]; selectedProjectId: number | string; setSelectedProjectId: (id: number | string) => void;
  addStage: (e: FormEvent<HTMLFormElement>) => void; updateStageStatus: (id: number | string, status: ProjectStage["status"]) => void;
  updateStageNotes: (id: number | string, notes: string) => void; deleteStage: (id: number | string) => void;
  isAdmin: boolean;
}) {
  const stageStatuses: ProjectStage["status"][] = ["لم يبدأ", "جاري", "تم"];
  const projectStages = stages.filter((s) => String(s.projectId) === String(selectedProjectId));
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addStage}>
        <SectionTitle icon={Plus} title="إضافة مرحلة تنفيذ" />
        <label>المشروع<select name="projectId" required value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <Field label="اسم المرحلة" name="name" required placeholder="تأسيس / تشطيب ..." />
        <label>الحالة<select name="status" defaultValue="لم يبدأ">{stageStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>ملاحظات<textarea name="notes" rows={2} /></label>
        <button className="primary-button"><Plus size={18} />إضافة المرحلة</button>
      </form>
      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <SectionTitle icon={Layers3} title="مراحل التنفيذ" />
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(Number(e.target.value))} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>المرحلة</th><th>الحالة</th><th>آخر تحديث</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {projectStages.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", color: "#64748b", whiteSpace: "nowrap" }}>ملاحظة الموقع:</span>
                      <input
                        type="text"
                        defaultValue={s.notes || ""}
                        placeholder="اكتب ملاحظة هنا..."
                        onBlur={(e) => {
                          if (e.target.value !== (s.notes || "")) {
                            updateStageNotes(s.id, e.target.value);
                          }
                        }}
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 8px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          width: "100%",
                          maxWidth: "320px",
                          background: "#fff",
                          fontWeight: "normal"
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <select
                      value={s.status}
                      onChange={(e) => updateStageStatus(s.id, e.target.value as ProjectStage["status"])}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        fontWeight: "bold",
                        color: s.status === "تم" ? "#166534" : s.status === "جاري" ? "#1e40af" : "#b45309",
                        background: s.status === "تم" ? "#d1fae5" : s.status === "جاري" ? "#dbeafe" : "#fef3c7"
                      }}
                    >
                      {stageStatuses.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </td>
                  <td>{formatDate(s.updatedAt)}</td>
                  <td>{isAdmin && <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteStage(s.id)}><Trash2 size={16} /></button>}</td>
                </tr>
              ))}
              {projectStages.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد مراحل لهذا المشروع.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function WorkersView({ workers, projects, addWorker, deleteWorker, updateWorker }: {
  workers: Worker[]; projects: Project[];
  addWorker: (e: FormEvent<HTMLFormElement>) => void; deleteWorker: (id: number | string) => void; updateWorker: (w: Worker) => void;
}) {
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addWorker}>
        <SectionTitle icon={UserPlus} title="إضافة عامل / فني" />
        <Field label="الاسم" name="name" required />
        <div className="two-fields">
          <Field label="التخصص" name="specialty" placeholder="كهربائي / فني إنذار ..." />
          <Field label="الهاتف" name="phone" />
        </div>
        <div className="two-fields">
          <Field label="اليومية (ريال)" name="dailyRate" type="number" />
          <label>الموقع الحالي<select name="currentProjectId"><option value="">— غير معيّن —</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        </div>
        <button className="primary-button"><Plus size={18} />إضافة العامل</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={HardHat} title="قائمة العمال والفنيين" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>الاسم</th><th>التخصص</th><th>الهاتف</th><th>اليومية</th><th>الموقع الحالي</th><th style={{ width: 130 }}>إجراءات</th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.name}</strong></td><td>{w.specialty || "—"}</td><td>{w.phone || "—"}</td><td>{currency.format(w.dailyRate)}</td>
                  <td>{projects.find((p) => p.id === w.currentProjectId)?.name || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingWorker(w)}>تعديل</button>
                      <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف هذا العامل؟", () => deleteWorker(w.id))}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {workers.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد عمال مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editingWorker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "480px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800 }}>تعديل بيانات العامل</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateWorker({
                ...editingWorker,
                name: String(f.get("name") || "").trim(),
                specialty: String(f.get("specialty") || "").trim(),
                phone: String(f.get("phone") || "").trim(),
                dailyRate: Number(f.get("dailyRate")) || 0,
                currentProjectId: f.get("currentProjectId") ? Number(f.get("currentProjectId")) : null,
              });
              setEditingWorker(null);
            }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>الاسم
                <input name="name" defaultValue={editingWorker.name} required style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>التخصص
                <input name="specialty" defaultValue={editingWorker.specialty || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>الهاتف
                <input name="phone" defaultValue={editingWorker.phone || ""} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>اليومية (ريال)
                <input name="dailyRate" type="number" defaultValue={editingWorker.dailyRate || 0} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </label>
              <label>الموقع الحالي
                <select name="currentProjectId" defaultValue={editingWorker.currentProjectId || ""}>
                  <option value="">— غير معيّن —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="secondary-button" onClick={() => setEditingWorker(null)}>إلغاء</button>
                <button type="submit" className="primary-button" style={{ background: "var(--brand)", color: "#fff", border: 0 }}>حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function DeficienciesView({ deficiencies, projects, engineers, addDeficiency, updateDeficiencyStatus, deleteDeficiency, isAdmin, isSiteEngineer }: {
  deficiencies: SiteDeficiency[]; projects: Project[]; engineers: string[];
  addDeficiency: (e: FormEvent<HTMLFormElement>) => void; updateDeficiencyStatus: (id: number | string, status: SiteDeficiency["status"]) => void; deleteDeficiency: (id: number | string) => void;
  isAdmin: boolean; isSiteEngineer: boolean;
}) {
  const statuses: SiteDeficiency["status"][] = ["مفتوح", "قيد المعالجة", "تم الحل"];
  const severities: SiteDeficiency["severity"][] = ["منخفضة", "متوسطة", "عالية"];
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addDeficiency}>
        <SectionTitle icon={Plus} title={isSiteEngineer ? "تنفيذ وإرسال نواقص الموقع" : "تسجيل نقص على موقع"} />
        <label>الموقع / المشروع<select name="projectId" required><option value="">اختر مشروع...</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>رفعه (مهندس / استشاري)<select name="raisedBy"><option value="">—</option>{engineers.map((e) => <option key={e}>{e}</option>)}</select></label>
        <label>وصف النقص / الملاحظة للمشروع المالي والمشتريات<textarea name="description" rows={2} required /></label>
        <label>درجة الخطورة<select name="severity" defaultValue="متوسطة">{severities.map((s) => <option key={s}>{s}</option>)}</select></label>
        <button className="primary-button"><Plus size={18} />{isSiteEngineer ? "تنفيذ وإرسال للنظام" : "تسجيل النقص"}</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={OctagonAlert} title="نواقص المواقع" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>الموقع</th><th>الوصف</th><th>الخطورة</th><th>رفعه</th><th>الحالة</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {deficiencies.map((d) => (
                <tr key={d.id}>
                  <td>{projects.find((p) => p.id === d.projectId)?.name || "—"}</td>
                  <td>{d.description}</td><td><Badge value={d.severity} /></td><td>{d.raisedBy || "—"}</td>
                  <td><select value={d.status} onChange={(e) => updateDeficiencyStatus(d.id, e.target.value as SiteDeficiency["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{statuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td>{isAdmin && <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteDeficiency(d.id)}><Trash2 size={16} /></button>}</td>
                </tr>
              ))}
              {deficiencies.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد نواقص مسجلة.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SystemsView({ systems, components, projects, addSystem, updateSystemStatus, deleteSystem, addComponent, updateComponentStatus, deleteComponent, isAdmin }: {
  systems: ProjectSystem[]; components: SystemComponent[]; projects: Project[];
  addSystem: (e: FormEvent<HTMLFormElement>) => void; updateSystemStatus: (id: number | string, status: ProjectSystem["status"]) => void; deleteSystem: (id: number | string) => void;
  addComponent: (systemId: number | string, data: Omit<SystemComponent, "id" | "systemId">) => void; updateComponentStatus: (id: number | string, status: SystemComponent["installStatus"]) => void; deleteComponent: (id: number | string) => void;
  isAdmin: boolean;
}) {
  const [selectedSystemId, setSelectedSystemId] = useState<number | string | null>(null);
  const sysTypes: ProjectSystem["type"][] = ["إنذار حريق", "شبكة إطفاء", "تهوية وتكييف"];
  const sysStatuses: ProjectSystem["status"][] = ["تصميم", "جاري التركيب", "مركّب", "تشغيل تجريبي", "معتمد"];
  const compStatuses: SystemComponent["installStatus"][] = ["بانتظار", "مركّب", "تم اختباره"];
  const selectedComponents = components.filter((c) => c.systemId === selectedSystemId);
  const addComp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSystemId) return;
    const f = new FormData(e.currentTarget);
    addComponent(selectedSystemId, { componentType: String(f.get("componentType") ?? ""), description: String(f.get("description") ?? ""), manufacturer: String(f.get("manufacturer") ?? ""), model: String(f.get("model") ?? ""), quantity: Number(f.get("quantity")) || 0, unit: String(f.get("unit") ?? ""), location: String(f.get("location") ?? ""), installStatus: "بانتظار", installDate: "" });
    e.currentTarget.reset();
  };
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addSystem}>
        <SectionTitle icon={Plus} title="إضافة نظام فني" />
        <label>المشروع<select name="projectId" required><option value="">اختر مشروع...</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>نوع النظام<select name="type" defaultValue="إنذار حريق">{sysTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
        <Field label="اسم/وصف النظام" name="name" required />
        <label>الحالة<select name="status" defaultValue="تصميم">{sysStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <button className="primary-button"><Plus size={18} />إضافة النظام</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={Gauge} title="الأنظمة الفنية" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>المشروع</th><th>النوع</th><th>النظام</th><th>الحالة</th><th>المكوّنات</th><th style={{ width: 150 }}>إجراءات</th></tr></thead>
            <tbody>
              {systems.map((s) => (
                <tr key={s.id} style={{ background: s.id === selectedSystemId ? "rgba(225,29,72,0.04)" : undefined }}>
                  <td>{projects.find((p) => p.id === s.projectId)?.name || "—"}</td><td>{s.type}</td><td><strong>{s.name}</strong></td>
                  <td><select value={s.status} onChange={(e) => updateSystemStatus(s.id, e.target.value as ProjectSystem["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{sysStatuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td>{components.filter((c) => c.systemId === s.id).length}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setSelectedSystemId(s.id === selectedSystemId ? null : s.id)}>المكوّنات</button>
                      {isAdmin && <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف هذا النظام ومكوّناته؟", () => { if (selectedSystemId === s.id) setSelectedSystemId(null); deleteSystem(s.id); })}><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {systems.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد أنظمة مسجلة.</td></tr>}
            </tbody>
          </table>
        </div>
        {selectedSystemId && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <SectionTitle icon={Boxes} title={`مكوّنات: ${systems.find((s) => s.id === selectedSystemId)?.name ?? ""}`} />
            <form onSubmit={addComp} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end", marginBottom: 12 }}>
              <input name="componentType" placeholder="نوع المكوّن" required style={{ flex: 2, minWidth: 120, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input name="description" placeholder="الوصف" style={{ flex: 2, minWidth: 120, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input name="quantity" type="number" placeholder="الكمية" style={{ width: 80, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input name="unit" placeholder="الوحدة" style={{ width: 80, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input name="location" placeholder="الموقع داخل المبنى" style={{ flex: 1, minWidth: 100, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <button className="secondary-button" style={{ minHeight: 34 }}><Plus size={14} />إضافة مكوّن</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead><tr><th>المكوّن</th><th>الوصف</th><th>الكمية</th><th>الموقع</th><th>حالة التركيب</th><th style={{ width: 60 }}>حذف</th></tr></thead>
                <tbody>
                  {selectedComponents.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.componentType}</strong></td><td>{c.description || "—"}</td><td>{c.quantity} {c.unit}</td><td>{c.location || "—"}</td>
                      <td><select value={c.installStatus} onChange={(e) => updateComponentStatus(c.id, e.target.value as SystemComponent["installStatus"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{compStatuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                      <td>{isAdmin && <button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteComponent(c.id)}><Trash2 size={16} /></button>}</td>
                    </tr>
                  ))}
                  {selectedComponents.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد مكوّنات لهذا النظام.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// تحويل دور الموظف العربي إلى دور النظام في الباك إند والعكس
const staffRoleToApi: Record<string, string> = {
  "مدير عام": "ADMIN",
  "مدير مشاريع": "PROJECT_MANAGER",
  "مهندس مشروع": "SITE_ENGINEER",
  "مسؤول مشتريات": "PROCUREMENT",
  "محاسب": "PROCUREMENT",
  "عامل/فني": "TECHNICIAN",
  "موظف استقبال": "WORKER",
};
const staffRoleFromApi: Record<string, string> = {
  ADMIN: "مدير عام",
  PROJECT_MANAGER: "مدير مشاريع",
  SITE_ENGINEER: "مهندس مشروع",
  PROCUREMENT: "محاسب",
  TECHNICIAN: "عامل/فني",
  WORKER: "موظف استقبال",
};

// تحويل بين قيم الواجهة العربية وقيم الـ enum في الباك إند
const stageStatusFromApi: Record<string, ProjectStage["status"]> = { TODO: "لم يبدأ", DOING: "جاري", DONE: "تم" };
const stageStatusToApi: Record<ProjectStage["status"], string> = { "لم يبدأ": "TODO", "جاري": "DOING", "تم": "DONE" };
const severityFromApi: Record<string, SiteDeficiency["severity"]> = { LOW: "منخفضة", MEDIUM: "متوسطة", HIGH: "عالية" };
const severityToApi: Record<SiteDeficiency["severity"], string> = { "منخفضة": "LOW", "متوسطة": "MEDIUM", "عالية": "HIGH" };
const defStatusFromApi: Record<string, SiteDeficiency["status"]> = { OPEN: "مفتوح", IN_PROGRESS: "قيد المعالجة", RESOLVED: "تم الحل" };
const defStatusToApi: Record<SiteDeficiency["status"], string> = { "مفتوح": "OPEN", "قيد المعالجة": "IN_PROGRESS", "تم الحل": "RESOLVED" };
const systemTypeFromApi: Record<string, ProjectSystem["type"]> = { VENTILATION: "تهوية وتكييف", FIRE_FIGHTING: "شبكة إطفاء", FIRE_ALARM: "إنذار حريق" };
const systemTypeToApi: Record<ProjectSystem["type"], string> = { "تهوية وتكييف": "VENTILATION", "شبكة إطفاء": "FIRE_FIGHTING", "إنذار حريق": "FIRE_ALARM" };
const systemStatusFromApi: Record<string, ProjectSystem["status"]> = { DESIGN: "تصميم", INSTALLING: "جاري التركيب", INSTALLED: "مركّب", TESTING: "تشغيل تجريبي", CERTIFIED: "معتمد" };
const systemStatusToApi: Record<ProjectSystem["status"], string> = { "تصميم": "DESIGN", "جاري التركيب": "INSTALLING", "مركّب": "INSTALLED", "تشغيل تجريبي": "TESTING", "معتمد": "CERTIFIED" };
const compStatusFromApi: Record<string, SystemComponent["installStatus"]> = { PENDING: "بانتظار", INSTALLED: "مركّب", TESTED: "تم اختباره" };
const compStatusToApi: Record<SystemComponent["installStatus"], string> = { "بانتظار": "PENDING", "مركّب": "INSTALLED", "تم اختباره": "TESTED" };

const attendanceFromApi: Record<string, AttendanceRecord["status"]> = { PRESENT: "حاضر", ABSENT: "غياب", LEAVE: "إجازة" };
const attendanceToApi: Record<AttendanceRecord["status"], string> = { "حاضر": "PRESENT", "غياب": "ABSENT", "إجازة": "LEAVE" };
const leaveTypeFromApi: Record<string, Leave["type"]> = { ANNUAL: "سنوية", SICK: "مرضية", UNPAID: "بدون راتب" };
const leaveTypeToApi: Record<Leave["type"], string> = { "سنوية": "ANNUAL", "مرضية": "SICK", "بدون راتب": "UNPAID" };
const leaveStatusFromApi: Record<string, Leave["status"]> = { PENDING: "مطلوبة", APPROVED: "مقبولة", REJECTED: "مرفوضة" };
const leaveStatusToApi: Record<Leave["status"], string> = { "مطلوبة": "PENDING", "مقبولة": "APPROVED", "مرفوضة": "REJECTED" };

const payrollStatusFromApi: Record<string, PayrollRun["status"]> = { DRAFT: "مسودة", APPROVED: "معتمد", PAID: "مدفوع" };
const payrollStatusToApi: Record<PayrollRun["status"], string> = { "مسودة": "DRAFT", "معتمد": "APPROVED", "مدفوع": "PAID" };

const maintenanceFrequencyFromApi: Record<string, MaintenanceContract["frequency"]> = { MONTHLY: "شهري", QUARTERLY: "ربع سنوي", SEMI_ANNUAL: "نصف سنوي", ANNUAL: "سنوي" };
const maintenanceFrequencyToApi: Record<MaintenanceContract["frequency"], string> = { "شهري": "MONTHLY", "ربع سنوي": "QUARTERLY", "نصف سنوي": "SEMI_ANNUAL", "سنوي": "ANNUAL" };

const maintenanceContractStatusFromApi: Record<string, MaintenanceContract["status"]> = { ACTIVE: "نشط", EXPIRED: "منتهي", RENEWED: "متجدد", CANCELLED: "ملغي" };
const maintenanceContractStatusToApi: Record<MaintenanceContract["status"], string> = { "نشط": "ACTIVE", "منتهي": "EXPIRED", "متجدد": "RENEWED", "ملغي": "CANCELLED" };

const visitStatusFromApi: Record<string, MaintenanceVisit["status"]> = { SCHEDULED: "مجدولة", DONE: "تمت", MISSED: "فائتة" };
const visitStatusToApi: Record<MaintenanceVisit["status"], string> = { "مجدولة": "SCHEDULED", "تمت": "DONE", "فائتة": "MISSED" };

const invoiceStatusFromApi: Record<string, Invoice["status"]> = { PAID: "مدفوعة", PARTIAL: "جزئية", LATE: "متأخرة" };
const invoiceStatusToApi: Record<Invoice["status"], string> = { "مدفوعة": "PAID", "جزئية": "PARTIAL", "متأخرة": "LATE" };

const DAILY_REPORT_SYSTEM_TYPES: DailyReportSystemType[] = ["FIRE_ALARM", "FIRE_FIGHTING", "VENTILATION"];
const DAILY_REPORT_SYSTEM_LABELS: Record<DailyReportSystemType, string> = {
  FIRE_ALARM: "نظام الإنذار",
  FIRE_FIGHTING: "الإطفاء",
  VENTILATION: "التهوية وسحب الدخان",
};

const supplyStatusLabels: Record<SupplyOrderStatus, string> = {
  PENDING: "بانتظار التوريد",
  PARTIAL: "استلام جزئي",
  RECEIVED: "تم الاستلام",
};

function SupplyOrdersView({ projects, quotations, canCreate }: { projects: Project[]; quotations: Quotation[]; canCreate: boolean }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ? String(projects[0].id) : "");
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sourceQuotationId, setSourceQuotationId] = useState("");
  const [draftItems, setDraftItems] = useState<{ name: string; brand: string; orderedQty: number; unit: string }[]>([{ name: "", brand: "", orderedQty: 1, unit: "" }]);
  const [draftNotes, setDraftNotes] = useState("");
  const [savingItem, setSavingItem] = useState<string | null>(null);

  const loadOrders = async (projectId: string) => {
    if (!projectId) { setOrders([]); return; }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/projects/${projectId}/supply-orders`);
      setOrders(Array.isArray(data) ? data.map((o: any) => ({ ...o, items: (o.items ?? []).map((it: any) => ({ ...it, orderedQty: Number(it.orderedQty) || 0, receivedQty: Number(it.receivedQty) || 0 })) })) : []);
    } catch (e) {
      console.warn("Supply orders fetch failed, loading local fallback:", e);
      try {
        const raw = window.localStorage.getItem(`kenan.supply_orders_${projectId}`);
        setOrders(raw ? JSON.parse(raw) : []);
      } catch {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const applyQuotationItems = (quotationId: string) => {
    setSourceQuotationId(quotationId);
    if (!quotationId) return;
    const q = quotations.find((x) => String(x.id) === quotationId);
    if (q && q.items.length) {
      setDraftItems(q.items.map((it) => ({ name: it.name, brand: it.brand || "", orderedQty: it.qty, unit: "" })));
    }
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) return;
    const items = draftItems.filter((it) => it.name.trim());
    if (!items.length) {
      triggerAlert("أضف صنفًا واحدًا على الأقل");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/projects/${selectedProjectId}/supply-orders`, {
        method: "POST",
        body: JSON.stringify({
          quotationId: sourceQuotationId || undefined,
          notes: draftNotes,
          items: items.map((it) => ({ name: it.name, brand: it.brand || undefined, orderedQty: it.orderedQty, unit: it.unit || undefined })),
        }),
      });
      setDraftItems([{ name: "", brand: "", orderedQty: 1, unit: "" }]);
      setDraftNotes("");
      setSourceQuotationId("");
      await loadOrders(selectedProjectId);
    } catch (e) {
      console.warn("Supply orders submit failed, saving locally:", e);
      const orderId = `so-${Date.now()}`;
      const newOrder: SupplyOrder = {
        id: orderId,
        orderNumber: `SO-${Date.now().toString().slice(-4)}`,
        projectId: selectedProjectId,
        quotationId: sourceQuotationId || null,
        status: "PENDING",
        notes: draftNotes,
        createdAt: new Date().toISOString(),
        items: items.map((it, idx) => ({ id: `soi-${Date.now()}-${idx}`, orderId, name: it.name, brand: it.brand || "", orderedQty: it.orderedQty, receivedQty: 0, unit: it.unit || "", confirmed: false }))
      };
      const updated = [newOrder, ...orders];
      setOrders(updated);
      try { window.localStorage.setItem(`kenan.supply_orders_${selectedProjectId}`, JSON.stringify(updated)); } catch {}
      setDraftItems([{ name: "", brand: "", orderedQty: 1, unit: "" }]);
      setDraftNotes("");
      setSourceQuotationId("");
    } finally {
      setSubmitting(false);
    }
  };

  const receiveItem = async (order: SupplyOrder, item: SupplyOrderItem, receivedQty: number, confirmed: boolean) => {
    setSavingItem(item.id);
    try {
      const updated = await apiFetch(`/api/projects/${selectedProjectId}/supply-orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ items: [{ id: item.id, receivedQty, confirmed }] }),
      });
      setOrders((cur) => cur.map((o) => (o.id === order.id ? { ...updated, items: (updated.items ?? []).map((it: any) => ({ ...it, orderedQty: Number(it.orderedQty) || 0, receivedQty: Number(it.receivedQty) || 0 })) } : o)));
    } catch (e) {
      console.warn("Receive item failed, updating locally:", e);
      const updatedOrders = orders.map((o) => {
        if (o.id === order.id) {
          const updatedItems = o.items.map((it) => (it.id === item.id ? { ...it, receivedQty, confirmed } : it));
          return { ...o, items: updatedItems };
        }
        return o;
      });
      setOrders(updatedOrders);
      try { window.localStorage.setItem(`kenan.supply_orders_${selectedProjectId}`, JSON.stringify(updatedOrders)); } catch {}
    } finally {
      setSavingItem(null);
    }
  };

  const projectQuotations = quotations;

  return (
    <section className="content-grid content-grid--stack">
      {canCreate && (
        <form className="form-panel" onSubmit={submitOrder}>
          <SectionTitle icon={Plus} title="إنشاء طلب توريد" />
          <label>
            المشروع
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} required>
              <option value="">اختر مشروع...</option>
              {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
          </label>
          <label>
            من عرض سعر (اختياري — ينسخ البنود والكميات)
            <select value={sourceQuotationId} onChange={(e) => applyQuotationItems(e.target.value)}>
              <option value="">بدون — إدخال يدوي</option>
              {projectQuotations.map((q) => <option key={q.id} value={String(q.id)}>{q.number}</option>)}
            </select>
          </label>
          {draftItems.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-end" }}>
              <input placeholder="الصنف" value={it.name} onChange={(e) => setDraftItems((cur) => cur.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} style={{ flex: 2, minWidth: 130, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input placeholder="الماركة" value={it.brand} onChange={(e) => setDraftItems((cur) => cur.map((x, xi) => xi === i ? { ...x, brand: e.target.value } : x))} style={{ width: 100, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input type="number" min={0.01} step="any" placeholder="الكمية" value={it.orderedQty} onChange={(e) => setDraftItems((cur) => cur.map((x, xi) => xi === i ? { ...x, orderedQty: Number(e.target.value) || 0 } : x))} style={{ width: 80, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              <input placeholder="الوحدة" value={it.unit} onChange={(e) => setDraftItems((cur) => cur.map((x, xi) => xi === i ? { ...x, unit: e.target.value } : x))} style={{ width: 80, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }} />
              {draftItems.length > 1 && <button type="button" className="icon-danger" style={iconDangerStyle} onClick={() => setDraftItems((cur) => cur.filter((_, xi) => xi !== i))}><Trash2 size={14} /></button>}
            </div>
          ))}
          <button type="button" className="secondary-button" onClick={() => setDraftItems((cur) => [...cur, { name: "", brand: "", orderedQty: 1, unit: "" }])}><Plus size={14} />إضافة صنف</button>
          <label>ملاحظات<textarea rows={2} value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} /></label>
          <button className="primary-button" disabled={submitting || !selectedProjectId}><Plus size={18} />{submitting ? "جارٍ الإنشاء..." : "إنشاء طلب التوريد"}</button>
        </form>
      )}
      <div className="panel wide">
        <SectionTitle icon={Truck} title="طلبات التوريد والاستلام" />
        {!canCreate && (
          <label style={{ maxWidth: 320, display: "block", marginBottom: 10 }}>
            المشروع
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">اختر مشروع...</option>
              {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
          </label>
        )}
        {error && <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>}
        {loading && <p style={{ color: "#64748b" }}>جارٍ التحميل...</p>}
        {!loading && orders.length === 0 && <p style={{ color: "#64748b", padding: 8 }}>لا توجد طلبات توريد لهذا المشروع.</p>}
        {orders.map((order) => (
          <div key={order.id} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <strong>{order.orderNumber}</strong>
              {order.quotation && <span style={{ fontSize: "0.82rem", color: "#64748b" }}>مرتبط بعرض {order.quotation.number}</span>}
              <Badge value={supplyStatusLabels[order.status]} />
              <span style={{ marginInlineStart: "auto", fontSize: "0.8rem", color: "#64748b" }}>{order.createdBy?.name || ""} · {order.createdAt ? String(order.createdAt).split("T")[0] : ""}</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>الصنف</th><th>الماركة</th><th>المطلوب</th><th style={{ width: 110 }}>المستلم</th><th style={{ width: 120 }}>تأكيد الاستلام</th></tr></thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id} style={{ background: it.confirmed ? "rgba(16,185,129,0.06)" : undefined }}>
                      <td><strong>{it.name}</strong></td>
                      <td>{it.brand || "—"}</td>
                      <td>{it.orderedQty} {it.unit || ""}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          defaultValue={it.receivedQty}
                          disabled={savingItem === it.id}
                          onBlur={(e) => {
                            const v = Number(e.target.value) || 0;
                            if (v !== it.receivedQty) receiveItem(order, it, v, it.confirmed);
                          }}
                          style={{ width: 90, padding: "4px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }}
                        />
                      </td>
                      <td>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
                          <input
                            type="checkbox"
                            checked={it.confirmed}
                            disabled={savingItem === it.id}
                            onChange={(e) => receiveItem(order, it, it.receivedQty, e.target.checked)}
                          />
                          {it.confirmed ? "مؤكد" : "تأكيد"}
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.notes && <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 6 }}>ملاحظات: {order.notes}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function DailyReportsView({ projects }: { projects: Project[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ? String(projects[0].id) : "");
  const [reports, setReports] = useState<DailySiteReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (projectId: string) => {
    if (!projectId) {
      setReports([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/projects/${projectId}/daily-reports`);
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProjectId) return;
    const form = event.currentTarget;
    const f = new FormData(form);
    setSubmitting(true);
    setError("");
    try {
      const systemEntries = DAILY_REPORT_SYSTEM_TYPES.map((type) => ({
        systemType: type,
        foundationDone: f.get(`sys_${type}_foundation`) === "on",
        wiringDone: f.get(`sys_${type}_wiring`) === "on",
        installDone: f.get(`sys_${type}_install`) === "on",
      }));
      await apiFetch(`/api/projects/${selectedProjectId}/daily-reports`, {
        method: "POST",
        body: JSON.stringify({
          workersCount: Number(f.get("workersCount")) || 0,
          systemEntries,
          problems: String(f.get("problems") ?? ""),
          solutions: String(f.get("solutions") ?? ""),
          needsQuoteRequest: f.get("needsQuoteRequest") === "on",
          needsConsultantReview: f.get("needsConsultantReview") === "on",
          engineerNotes: String(f.get("engineerNotes") ?? ""),
          completionPercent: Number(f.get("completionPercent")) || 0,
          signature: String(f.get("signature") ?? ""),
        }),
      });
      form.reset();
      await loadReports(selectedProjectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال التقرير");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={submitReport}>
        <SectionTitle icon={ClipboardList} title="تقرير اليوم الموحد" />
        <label>
          المشروع
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} required>
            <option value="">اختر مشروع...</option>
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>عدد العمالة بالموقع<input name="workersCount" type="number" min={0} /></label>
        {DAILY_REPORT_SYSTEM_TYPES.map((type) => (
          <fieldset key={type} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
            <legend style={{ fontSize: "0.85rem", fontWeight: 600, padding: "0 6px" }}>{DAILY_REPORT_SYSTEM_LABELS[type]}</legend>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}><input type="checkbox" name={`sys_${type}_foundation`} />تأسيس</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}><input type="checkbox" name={`sys_${type}_wiring`} />أسلاك</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}><input type="checkbox" name={`sys_${type}_install`} />تركيب</label>
            </div>
          </fieldset>
        ))}
        <label>المشاكل<textarea name="problems" rows={2} /></label>
        <label>الحلول<textarea name="solutions" rows={2} /></label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "6px 0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}><input type="checkbox" name="needsQuoteRequest" />يحتاج طلب سعر</label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}><input type="checkbox" name="needsConsultantReview" />يحتاج مراجعة استشاري</label>
        </div>
        <label>ملاحظات مهندس المشروع<textarea name="engineerNotes" rows={2} /></label>
        <label>نسبة استلام المشروع %<input name="completionPercent" type="number" min={0} max={100} /></label>
        <label>التوقيع / الاعتماد<input name="signature" type="text" /></label>
        {error && <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>}
        <button className="primary-button" disabled={submitting || !selectedProjectId}>
          <Plus size={18} />
          {submitting ? "جارٍ الإرسال..." : "إرسال التقرير"}
        </button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={ClipboardList} title="تقارير سابقة" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>التاريخ</th><th>المهندس</th><th>العمالة</th><th>نسبة الاستلام</th><th>المشاكل</th><th>ملاحظات إضافية</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString("ar-EG")}</td>
                  <td>{r.submittedBy?.name || "—"}</td>
                  <td>{r.workersCount}</td>
                  <td>{r.completionPercent}%</td>
                  <td>{r.problems || "—"}</td>
                  <td>
                    {r.needsQuoteRequest && <Badge value="يحتاج طلب سعر" />}{" "}
                    {r.needsConsultantReview && <Badge value="يحتاج مراجعة استشاري" />}
                    {!r.needsQuoteRequest && !r.needsConsultantReview && "—"}
                  </td>
                </tr>
              ))}
              {!loading && reports.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد تقارير مسجلة لهذا المشروع.</td></tr>}
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>جارٍ التحميل...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TeamsView({ teams, assignments, projects, workers, contractors, addTeam, deleteTeam, addAssignment, deleteAssignment }: {
  teams: WorkTeam[]; assignments: ProjectAssignment[]; projects: Project[]; workers: Worker[]; contractors: Contractor[];
  addTeam: (e: FormEvent<HTMLFormElement>) => void; deleteTeam: (id: number | string) => void;
  addAssignment: (e: FormEvent<HTMLFormElement>) => void; deleteAssignment: (id: number | string) => void;
}) {
  return (
    <section className="content-grid content-grid--stack">
      <div className="forms-duo">
        <form className="form-panel" onSubmit={addTeam}>
          <SectionTitle icon={UsersRound} title="إضافة فريق عمل" />
          <Field label="اسم الفريق" name="name" required />
          <div className="two-fields">
            <Field label="قائد الفريق" name="teamLead" />
            <Field label="التخصص" name="trade" placeholder="إطفاء / إنذار ..." />
          </div>
          <label>تابع لمقاول (اختياري)<select name="subcontractorId"><option value="">فريق داخلي</option>{contractors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <button className="primary-button"><Plus size={18} />إضافة الفريق</button>
        </form>
        <form className="form-panel" onSubmit={addAssignment}>
          <SectionTitle icon={Plus} title="تعيين على موقع" />
          <label>الموقع / المشروع<select name="projectId" required><option value="">اختر مشروع...</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>الفريق<select name="teamId"><option value="">—</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label>أو عامل مباشر<select name="workerId"><option value="">—</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
          <Field label="الدور في الموقع" name="roleOnSite" />
          <button className="primary-button"><Plus size={18} />تعيين</button>
        </form>
      </div>
      <div className="panel wide">
        <SectionTitle icon={UsersRound} title="فرق العمل" />
        <div className="table-wrap" style={{ marginBottom: 20 }}>
          <table>
            <thead><tr><th>الفريق</th><th>القائد</th><th>التخصص</th><th>النوع</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td><td>{t.teamLead || "—"}</td><td>{t.trade || "—"}</td>
                  <td>{t.subcontractorId ? (contractors.find((c) => c.id === t.subcontractorId)?.name || "مقاول") : "داخلي"}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteTeam(t.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {teams.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد فرق.</td></tr>}
            </tbody>
          </table>
        </div>
        <SectionTitle icon={Building2} title="التعيينات على المواقع" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>الموقع</th><th>الفريق / العامل</th><th>الدور</th><th>من</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{projects.find((p) => p.id === a.projectId)?.name || "—"}</td>
                  <td>{teams.find((t) => t.id === a.teamId)?.name || workers.find((w) => w.id === a.workerId)?.name || "—"}</td>
                  <td>{a.roleOnSite || "—"}</td><td>{formatDate(a.startDate)}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteAssignment(a.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد تعيينات.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AttendanceView({ attendance, workers, projects, upsertAttendance }: {
  attendance: AttendanceRecord[]; workers: Worker[]; projects: Project[];
  upsertAttendance: (record: Omit<AttendanceRecord, "id">) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const statuses: AttendanceRecord["status"][] = ["حاضر", "غياب", "إجازة"];
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const workerId = Number(f.get("workerId"));
    if (!workerId) return;
    const hours = Number(f.get("hours")) || 0;
    upsertAttendance({ workerId, projectId: Number(f.get("projectId")) || null, date: String(f.get("date") || date), status: String(f.get("status") || "حاضر") as AttendanceRecord["status"], checkIn: String(f.get("checkIn") ?? ""), checkOut: String(f.get("checkOut") ?? ""), hours, overtimeHours: Number(f.get("overtimeHours")) || 0 });
    e.currentTarget.reset();
  };
  const dayRecords = attendance.filter((a) => a.date === date);
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={submit}>
        <SectionTitle icon={CalendarCheck} title="تسجيل حضور" />
        <Field label="التاريخ" name="date" type="date" />
        <label>العامل<select name="workerId" required><option value="">اختر عامل...</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <label>الموقع<select name="projectId"><option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>الحالة<select name="status" defaultValue="حاضر">{statuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <div className="two-fields">
          <Field label="ساعات العمل" name="hours" type="number" />
          <Field label="ساعات إضافية" name="overtimeHours" type="number" />
        </div>
        <button className="primary-button"><Plus size={18} />تسجيل</button>
      </form>
      <div className="panel wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <SectionTitle icon={CalendarCheck} title="سجل الحضور" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>العامل</th><th>الموقع</th><th>الحالة</th><th>الساعات</th><th>إضافي</th></tr></thead>
            <tbody>
              {dayRecords.map((a) => (
                <tr key={a.id}>
                  <td><strong>{workers.find((w) => w.id === a.workerId)?.name || "—"}</strong></td>
                  <td>{projects.find((p) => p.id === a.projectId)?.name || "—"}</td>
                  <td><Badge value={a.status} /></td><td>{a.hours}</td><td>{a.overtimeHours}</td>
                </tr>
              ))}
              {dayRecords.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد سجلات في هذا اليوم.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function LeavesView({ leaves, workers, addLeave, updateLeaveStatus, deleteLeave }: {
  leaves: Leave[]; workers: Worker[];
  addLeave: (e: FormEvent<HTMLFormElement>) => void; updateLeaveStatus: (id: number | string, status: Leave["status"]) => void; deleteLeave: (id: number | string) => void;
}) {
  const types: Leave["type"][] = ["سنوية", "مرضية", "بدون راتب"];
  const statuses: Leave["status"][] = ["مطلوبة", "مقبولة", "مرفوضة"];
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addLeave}>
        <SectionTitle icon={CalendarOff} title="طلب إجازة" />
        <label>العامل<select name="workerId" required><option value="">اختر عامل...</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <label>النوع<select name="type" defaultValue="سنوية">{types.map((t) => <option key={t}>{t}</option>)}</select></label>
        <div className="two-fields">
          <Field label="من" name="startDate" type="date" />
          <Field label="إلى" name="endDate" type="date" />
        </div>
        <label>السبب<textarea name="reason" rows={2} /></label>
        <button className="primary-button"><Plus size={18} />تسجيل الطلب</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={CalendarOff} title="طلبات الإجازات" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>العامل</th><th>النوع</th><th>من</th><th>إلى</th><th>الحالة</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td><strong>{workers.find((w) => w.id === l.workerId)?.name || "—"}</strong>{l.reason && <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{l.reason}</div>}</td>
                  <td>{l.type}</td><td>{formatDate(l.startDate)}</td><td>{formatDate(l.endDate)}</td>
                  <td><select value={l.status} onChange={(e) => updateLeaveStatus(l.id, e.target.value as Leave["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{statuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteLeave(l.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد طلبات إجازة.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PayrollView({ payroll, workers, addPayroll, updatePayrollStatus, deletePayroll }: {
  payroll: PayrollRun[]; workers: Worker[];
  addPayroll: (e: FormEvent<HTMLFormElement>) => void; updatePayrollStatus: (id: number | string, status: PayrollRun["status"]) => void; deletePayroll: (id: number | string) => void;
}) {
  const statuses: PayrollRun["status"][] = ["مسودة", "معتمد", "مدفوع"];
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addPayroll}>
        <SectionTitle icon={WalletCards} title="مسير راتب جديد" />
        <label>العامل<select name="workerId" required><option value="">اختر عامل...</option>{workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <div className="two-fields">
          <Field label="الفترة (YYYY-MM)" name="period" placeholder="2026-06" />
          <Field label="أيام الحضور" name="presentDays" type="number" />
        </div>
        <div className="two-fields">
          <Field label="الأساسي (ريال)" name="baseAmount" type="number" />
          <Field label="الإضافي (ريال)" name="overtimeAmount" type="number" />
        </div>
        <Field label="الخصومات (ريال)" name="deductions" type="number" />
        <button className="primary-button"><Plus size={18} />إنشاء المسير</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={WalletCards} title="مسيّرات الرواتب" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>العامل</th><th>الفترة</th><th>أيام</th><th>الأساسي</th><th>الصافي</th><th>الحالة</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {payroll.map((p) => (
                <tr key={p.id}>
                  <td><strong>{workers.find((w) => w.id === p.workerId)?.name || "—"}</strong></td>
                  <td>{p.period}</td><td>{p.presentDays}</td><td>{currency.format(p.baseAmount)}</td>
                  <td><strong style={{ color: "var(--brand)" }}>{currency.format(p.netAmount)}</strong></td>
                  <td><select value={p.status} onChange={(e) => updatePayrollStatus(p.id, e.target.value as PayrollRun["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{statuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deletePayroll(p.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {payroll.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد مسيّرات رواتب.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MaintenanceView({ contracts, visits, clients, projects, addContract, updateContractStatus, deleteContract, addVisit, completeVisit, deleteVisit }: {
  contracts: MaintenanceContract[]; visits: MaintenanceVisit[]; clients: Client[]; projects: Project[];
  addContract: (e: FormEvent<HTMLFormElement>) => void; updateContractStatus: (id: number | string, status: MaintenanceContract["status"]) => void; deleteContract: (id: number | string) => void;
  addVisit: (contractId: number | string, scheduledDate: string) => void; completeVisit: (id: number | string, performedBy: string) => void; deleteVisit: (id: number | string) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const frequencies: MaintenanceContract["frequency"][] = ["شهري", "ربع سنوي", "نصف سنوي", "سنوي"];
  const cStatuses: MaintenanceContract["status"][] = ["نشط", "منتهي", "متجدد", "ملغي"];
  const selectedVisits = visits.filter((v) => String(v.contractId) === String(selectedId));
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addContract}>
        <SectionTitle icon={Plus} title="عقد صيانة دورية" />
        <label>العميل<select name="clientId" required><option value="">اختر عميل...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>الموقع (اختياري)<select name="projectId"><option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="two-fields">
          <Field label="القيمة" name="value" type="number" />
          <label>العملة<select name="currency" defaultValue="SAR">{currencyOptions.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <label>التكرار<select name="frequency" defaultValue="ربع سنوي">{frequencies.map((fr) => <option key={fr}>{fr}</option>)}</select></label>
        <div className="two-fields">
          <Field label="من" name="startDate" type="date" />
          <Field label="إلى" name="endDate" type="date" />
        </div>
        <button className="primary-button"><Plus size={18} />إنشاء العقد</button>
      </form>
      <div className="panel wide">
        <SectionTitle icon={Wrench} title="عقود الصيانة" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>الرقم</th><th>العميل</th><th>التكرار</th><th>القيمة</th><th>الحالة</th><th>الزيارات</th><th style={{ width: 130 }}>إجراءات</th></tr></thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} style={{ background: String(c.id) === String(selectedId) ? "rgba(225,29,72,0.04)" : undefined }}>
                  <td><strong>{c.contractNumber}</strong></td><td>{clients.find((cl) => String(cl.id) === String(c.clientId))?.name || "—"}</td><td>{c.frequency}</td>
                  <td>{formatMoney(c.value, c.currency)}</td>
                  <td><select value={c.status} onChange={(e) => updateContractStatus(c.id, e.target.value as MaintenanceContract["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{cStatuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td>{visits.filter((v) => String(v.contractId) === String(c.id)).length}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setSelectedId(String(c.id) === String(selectedId) ? null : c.id)}>الزيارات</button>
                      <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => triggerConfirm("حذف عقد الصيانة؟", () => { if (String(selectedId) === String(c.id)) setSelectedId(null); deleteContract(c.id); })}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد عقود صيانة.</td></tr>}
            </tbody>
          </table>
        </div>
        {selectedId && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <SectionTitle icon={CalendarCheck} title={`زيارات العقد: ${contracts.find((c) => String(c.id) === String(selectedId))?.contractNumber ?? ""}`} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 12, flexWrap: "wrap" }}>
              <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              <button type="button" className="secondary-button" style={{ minHeight: 34 }} onClick={() => addVisit(selectedId, visitDate)}><Plus size={14} />جدولة زيارة</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>التاريخ المجدول</th><th>الحالة</th><th>نُفّذت بواسطة</th><th>تاريخ التنفيذ</th><th style={{ width: 150 }}>إجراءات</th></tr></thead>
                <tbody>
                  {selectedVisits.map((v) => (
                    <tr key={v.id}>
                      <td>{formatDate(v.scheduledDate)}</td><td><Badge value={v.status} /></td><td>{v.performedBy || "—"}</td><td>{v.completedDate ? formatDate(v.completedDate) : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {v.status !== "تمت" && <button type="button" className="secondary-button" style={{ minHeight: 26, padding: "0 8px", fontSize: "0.74rem" }} onClick={() => { const by = window.prompt("اسم منفّذ الزيارة:"); if (by) completeVisit(v.id, by); }}>تأكيد التنفيذ</button>}
                          <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteVisit(v.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {selectedVisits.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا توجد زيارات مجدولة.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export interface InternalAppProps {
  user: { role: string; name?: string; email?: string; picture?: string; sections?: Section[]; permissions?: Partial<Record<Section, "view" | "edit">> };
  onLogout: () => void;
  onOpenSite: () => void;
}

export function InternalApp({ user, onLogout, onOpenSite }: InternalAppProps) {
  const isAdmin = user.role?.toUpperCase() === "ADMIN" || user.role === "مدير عام" || user.role === "admin";
  const isPMOrAdmin = isAdmin || user.role?.toUpperCase() === "PROJECT_MANAGER" || user.role === "مدير مشاريع" || user.role?.toLowerCase() === "project_manager";
  const allowedSections = useMemo(() => {
    if (isAdmin) return null;
    if (user.sections && user.sections.length > 0) {
      return new Set(user.sections);
    }
    const roleUpper = user.role?.toUpperCase();
    if (roleUpper === "PROJECT_MANAGER" || user.role === "مدير مشاريع") {
      return new Set<Section>([
        "dashboard", "clients", "quotations", "contracts", "projects",
        "stages", "systems", "deficiencies", "dailyReports", "supplyOrders", "workers", "teams",
        "attendance", "leaves", "payroll", "inventory", "finance",
        "maintenance", "reports", "site", "config"
      ]);
    }
    if (roleUpper === "SITE_ENGINEER" || user.role === "مهندس مشروع" || user.role === "مهندس الموقع" || user.role === "مهندس موقع") {
      return new Set<Section>([
        "projects", "stages", "systems", "deficiencies", "dailyReports", "supplyOrders", "workers",
        "teams", "attendance", "leaves", "inventory"
      ]);
    }
    if (roleUpper === "PROCUREMENT" || user.role === "محاسب" || user.role === "المحاسب") {
      return new Set<Section>([
        "dashboard", "clients", "quotations", "contracts", "projects",
        "supplyOrders", "inventory", "finance", "payroll", "reports"
      ]);
    }
    return new Set<Section>(user.sections ?? []);
  }, [isAdmin, user.sections, user.role]);
  const canAccess = (section: Section) => {
    if (isAdmin) return true;
    if (section === "settings") return false;
    if (section === "projectDetail") return allowedSections?.has("projects") ?? false;
    return allowedSections?.has(section) ?? false;
  };
  const visibleNav = navItems.filter((item) => canAccess(item.id as Section));

  const [activeSection, setActiveSection] = useState<Section>(() => {
    if (isAdmin) return "dashboard";
    const sections = (user.sections ?? []) as Section[];
    if (sections.includes("dashboard")) return "dashboard";
    return sections[0] ?? "dashboard";
  });
  const [search, setSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [clients, setClients] = useLocalStorage<Client[]>("kenan.clients_v3", seedClients);
  const [projects, setProjects] = useLocalStorage<Project[]>("kenan.projects_v3", seedProjects);
  const [stages, setStages] = useLocalStorage<ProjectStage[]>("kenan.stages_v3", seedStages);
  const [workers, setWorkers] = useLocalStorage<Worker[]>("kenan.workers_v3", seedWorkers);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("kenan.inventory_v3", seedInventory);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contracts, setContracts] = useLocalStorage<Contract[]>("kenan.contracts_v3", seedContracts);
  const [contractors, setContractors] = useLocalStorage<Contractor[]>("kenan.contractors_v3", seedContractors);
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>("kenan.quotations_v3", seedQuotations);
  const [showcase, setShowcase] = useLocalStorage<ShowcaseItem[]>("kenan.showcase_v3", seedShowcase);
  const [staff, setStaff] = useLocalStorage<StaffAccount[]>("kenan.staff_v3", seedStaff);
  const [site, setSite] = useLocalStorage<SiteSettings>("kenan.site_v3", seedSite);
  const [, setProjectDetails] = useLocalStorage<ProjectWorkflow[]>("kenan.projectDetails_v3", []);
  const [deficiencies, setDeficiencies] = useLocalStorage<SiteDeficiency[]>("kenan.deficiencies_v3", seedDeficiencies);
  const [maintenanceContracts, setMaintenanceContracts] = useState<MaintenanceContract[]>([]);
  const [maintenanceVisits, setMaintenanceVisits] = useState<MaintenanceVisit[]>([]);
  const [systems, setSystems] = useLocalStorage<ProjectSystem[]>("kenan.systems_v3", seedSystems);
  const [components, setComponents] = useLocalStorage<SystemComponent[]>("kenan.components_v3", seedComponents);
  const [teams, setTeams] = useLocalStorage<WorkTeam[]>("kenan.teams_v3", seedTeams);
  const [assignments, setAssignments] = useLocalStorage<ProjectAssignment[]>("kenan.assignments_v3", seedAssignments);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>("kenan.attendance_v3", seedAttendance);
  const [leaves, setLeaves] = useLocalStorage<Leave[]>("kenan.leaves_v3", seedLeaves);
  const [payroll, setPayroll] = useState<PayrollRun[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);
  const [employeesMenuOpen, setEmployeesMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; onConfirm: () => void }>({ open: false, message: "", onConfirm: () => {} });
  const [alertModal, setAlertModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [activeClaimTerm, setActiveClaimTerm] = useState<PaymentTerm | null>(null);
  const [activeClaimContract, setActiveClaimContract] = useState<Contract | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const isSiteEngineer = user.role?.toUpperCase() === "SITE_ENGINEER" || user.role === "مهندس مشروع" || user.role?.toLowerCase() === "site_engineer";
  
  const roleFilteredProjects = useMemo(() => {
    if (!isSiteEngineer) return projects;
    return projects.filter((p) => p.engineer === user.name);
  }, [projects, isSiteEngineer, user.name]);

  const roleFilteredClients = useMemo(() => {
    if (!isSiteEngineer) return clients;
    return clients.filter((c) => roleFilteredProjects.some((p) => p.clientId === c.id));
  }, [clients, roleFilteredProjects, isSiteEngineer]);

  const roleFilteredStages = useMemo(() => {
    if (!isSiteEngineer) return stages;
    return stages.filter((s) => roleFilteredProjects.some((p) => p.id === s.projectId));
  }, [stages, roleFilteredProjects, isSiteEngineer]);

  const roleFilteredWorkers = useMemo(() => {
    if (!isSiteEngineer) return workers;
    return workers.filter((w) => roleFilteredProjects.some((p) => p.id === w.currentProjectId || assignments.some((a) => a.projectId === p.id && a.workerId === w.id)));
  }, [workers, roleFilteredProjects, assignments, isSiteEngineer]);

  const roleFilteredDeficiencies = useMemo(() => {
    if (!isSiteEngineer) return deficiencies;
    return deficiencies.filter((d) => roleFilteredProjects.some((p) => p.id === d.projectId));
  }, [deficiencies, roleFilteredProjects, isSiteEngineer]);

  const roleFilteredAttendance = useMemo(() => {
    if (!isSiteEngineer) return attendance;
    return attendance.filter((a) => roleFilteredProjects.some((p) => p.id === a.projectId));
  }, [attendance, roleFilteredProjects, isSiteEngineer]);

  const roleFilteredSystems = useMemo(() => {
    if (!isSiteEngineer) return systems;
    return systems.filter((sys) => roleFilteredProjects.some((p) => p.id === sys.projectId));
  }, [systems, roleFilteredProjects, isSiteEngineer]);
  
  const roleFilteredContractors = useMemo(() => {
    if (!isSiteEngineer) return contractors;
    return contractors.filter((c) => assignments.some((a) => roleFilteredProjects.some((p) => p.id === a.projectId) && a.subcontractorId === c.id));
  }, [contractors, roleFilteredProjects, assignments, isSiteEngineer]);

  useEffect(() => {
    (window as any).triggerConfirm = (message: string, onConfirm: () => void) => {
      setConfirmModal({ open: true, message, onConfirm });
    };
    (window as any).triggerAlert = (message: string) => {
      setAlertModal({ open: true, message });
    };
    return () => {
      try {
        delete (window as any).triggerConfirm;
        delete (window as any).triggerAlert;
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (["stages", "systems", "deficiencies", "workers", "teams", "maintenance"].includes(activeSection)) {
      setProjectsMenuOpen(true);
    }
    if (["settings", "attendance", "leaves", "payroll"].includes(activeSection)) {
      setEmployeesMenuOpen(true);
    }
  }, [activeSection]);

  const [selectedProjectId, setSelectedProjectId] = useState<number | string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const projId = params.get("projectId");
      if (projId) {
        return isNaN(Number(projId)) ? projId : Number(projId);
      }
    }
    return projects[0]?.id ?? 1;
  });


  // URL section sync removed — each account type has its own dashboard route


  const [notice, setNotice] = useState("");
  const [showRawToast, setShowRawToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const backendClients = await apiFetch("/api/projects/clients");
        if (backendClients && backendClients.length) {
          const mapped = backendClients.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || "",
            address: c.address || "",
            type: c.type || "عميل",
            notes: c.notes || "",
          }));
          setClients(mapped);
        }
      } catch (e) {
        console.error("Failed to load clients:", e);
      }

      try {
        const backendProjects = await apiFetch("/api/projects");
        if (backendProjects && backendProjects.length) {
          const mapped = backendProjects.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.type || "مكافحة حريق",
            clientId: p.clientId,
            address: p.address || "",
            startDate: p.startDate ? p.startDate.split("T")[0] : "",
            endDate: p.endDate ? p.endDate.split("T")[0] : "",
            status: p.status === "PLANNED" ? "لم يبدأ" :
                    p.status === "IN_PROGRESS" ? "جاري" :
                    p.status === "SUSPENDED" ? "متوقف" :
                    p.status === "DELAYED" ? "متأخر" : "مكتمل",
            engineer: p.engineer?.name || "",
            budget: Number(p.budget) || 0,
            progress: Number(p.progress) || 0,
          }));
          setProjects(mapped);
          if (mapped[0]) setSelectedProjectId(mapped[0].id);

          // تحميل المراحل والنواقص والأنظمة من نفس الاستجابة (بدل localStorage)
          const backendStages: ProjectStage[] = [];
          const backendDeficiencies: SiteDeficiency[] = [];
          const backendSystems: ProjectSystem[] = [];
          const backendComponents: SystemComponent[] = [];
          for (const p of backendProjects) {
            for (const s of p.stages ?? []) {
              backendStages.push({
                id: s.id,
                projectId: p.id,
                name: s.name,
                status: stageStatusFromApi[s.status] ?? "لم يبدأ",
                notes: s.notes || "",
                updatedAt: s.updatedAt ? String(s.updatedAt).split("T")[0] : "",
              });
            }
            for (const d of p.deficiencies ?? []) {
              backendDeficiencies.push({
                id: d.id,
                projectId: p.id,
                raisedBy: d.raisedBy?.name || "",
                description: d.description,
                severity: severityFromApi[d.severity] ?? "متوسطة",
                status: defStatusFromApi[d.status] ?? "مفتوح",
                raisedDate: d.raisedDate ? String(d.raisedDate).split("T")[0] : "",
                resolvedDate: d.resolvedDate ? String(d.resolvedDate).split("T")[0] : "",
              });
            }
            for (const sys of p.systems ?? []) {
              backendSystems.push({
                id: sys.id,
                projectId: p.id,
                type: systemTypeFromApi[sys.type] ?? "إنذار حريق",
                name: sys.name,
                status: systemStatusFromApi[sys.status] ?? "تصميم",
                notes: sys.notes || "",
              });
              for (const c of sys.components ?? []) {
                backendComponents.push({
                  id: c.id,
                  systemId: sys.id,
                  componentType: c.componentType,
                  description: c.description || "",
                  manufacturer: c.manufacturer || "",
                  model: c.model || "",
                  quantity: Number(c.quantity) || 0,
                  unit: c.unit || "",
                  location: c.location || "",
                  installStatus: compStatusFromApi[c.installStatus] ?? "بانتظار",
                  installDate: c.installDate ? String(c.installDate).split("T")[0] : "",
                });
              }
            }
          }
          setStages(backendStages);
          setDeficiencies(backendDeficiencies);
          setSystems(backendSystems);
          setComponents(backendComponents);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }

      try {
        const backendQuotations = await apiFetch("/api/quotations");
        if (backendQuotations && backendQuotations.length) {
          const mapped = backendQuotations.map((q: any) => ({
            id: q.id,
            number: q.number,
            clientId: q.clientId,
            date: q.date ? q.date.split("T")[0] : "",
            validUntil: q.validUntil ? q.validUntil.split("T")[0] : "",
            status: q.status === "APPROVED" ? "معتمد" :
                    q.status === "CANCELLED" ? "ملغي" :
                    q.status === "SENT" ? "مرسل" : "مسودة",
            items: (q.items || []).map((it: any) => ({
              name: it.name || "",
              brand: it.brand || "",
              qty: Number(it.qty) || 0,
              price: Number(it.price) || 0,
              total: Number(it.total) || (Number(it.qty) || 0) * (Number(it.price) || 0),
            })),
            value: Number(q.value) || 0,
            taxPercent: Number(q.taxPercent) || 15,
            currency: q.currency || "SAR",
            notes: q.notes || "",
          }));
          setQuotations(mapped);
        }
      } catch (e) {
        console.error("Failed to load quotations:", e);
      }

      try {
        const backendContracts = await apiFetch("/api/contracts");
        if (backendContracts && backendContracts.length) {
          const mapped = backendContracts.map((c: any) => ({
            id: c.id,
            number: c.number,
            projectName: c.project?.name || "",
            projectId: c.projectId,
            clientId: c.clientId,
            value: Number(c.value) || 0,
            currency: c.currency || "SAR",
            startDate: c.startDate ? c.startDate.split("T")[0] : "",
            endDate: c.endDate ? c.endDate.split("T")[0] : "",
            status: c.status === "ACTIVE" ? "ساري" : "منتهي",
            warranty: c.warranty || "سنتين",
            clauses: c.clauses || "",
            secondPartyName: c.secondPartyName || "",
            secondPartyRegister: c.secondPartyRegister || "",
            secondPartyRepresentative: c.secondPartyRepresentative || "",
            secondPartyRole: c.secondPartyRole || "المالك",
            locationCity: c.locationCity || "الرياض",
            locationDistrict: c.locationDistrict || "",
            locationPlot: c.locationPlot || "",
            locationPlan: c.locationPlan || "",
            quotationNumber: c.quotationNumber || "",
            quotationValue: Number(c.quotationValue) || 0,
            specs: c.specs || [],
            payments: c.payments || [],
          }));
          setContracts(mapped);
        }
      } catch (e) {
        console.error("Failed to load contracts:", e);
      }

      try {
        // حسابات الموظفين الحقيقية من قاعدة البيانات (متاحة للأدمن فقط — 403 لغيره متوقعة)
        const backendUsers = await apiFetch("/api/users");
        if (Array.isArray(backendUsers) && backendUsers.length) {
          setStaff((cur) => backendUsers
            .filter((u: any) => u.isActive !== false)
            .map((u: any, i: number) => {
              const local = cur.find((s) => s.email === u.email);
              return {
                id: i + 1,
                backendId: u.id,
                name: u.name,
                email: u.email,
                password: "",
                role: staffRoleFromApi[u.role] || u.role,
                sections: local?.sections ?? [],
                permissions: local?.permissions ?? {},
                isActive: u.isActive,
              };
            }));
        }
      } catch (e) {
        // مستخدم غير أدمن — تجاهل
      }

      try {
        const backendInventory = await apiFetch("/api/inventory");
        if (Array.isArray(backendInventory)) {
          setInventory(backendInventory.map((it: any) => ({
            id: it.id,
            name: it.name,
            brand: it.brand || "",
            quantity: Number(it.quantity) || 0,
            unit: it.unit || "قطعة",
            purchasePrice: Number(it.purchasePrice) || 0,
            salePrice: Number(it.salePrice) || 0,
            supplier: it.supplier || "",
            receivedAt: it.receivedAt ? String(it.receivedAt).split("T")[0] : "",
            minQuantity: Number(it.minQuantity) || 0,
          })));
        }
      } catch (e) {
        console.error("Failed to load inventory:", e);
      }

      try {
        const [backendWorkers, backendTeams, backendAssignments, backendAttendance, backendLeaves] = await Promise.all([
          apiFetch("/api/hr/workers").catch(() => null),
          apiFetch("/api/hr/teams").catch(() => null),
          apiFetch("/api/hr/assignments").catch(() => null),
          apiFetch("/api/hr/attendance").catch(() => null),
          apiFetch("/api/hr/leaves").catch(() => null),
        ]);
        if (Array.isArray(backendWorkers)) {
          setWorkers(backendWorkers.map((w: any) => ({
            id: w.id,
            name: w.name,
            specialty: w.specialty || "",
            phone: w.phone || "",
            dailyRate: Number(w.dailyRate) || 0,
            currentProjectId: w.assignments?.[0]?.projectId ?? null,
            attendance: "غياب",
            hours: 0,
            nationalId: w.nationalId || "",
            employmentType: w.employmentType || "يومي",
            monthlySalary: Number(w.monthlySalary) || 0,
            isActive: w.isActive,
          })));
        }
        if (Array.isArray(backendTeams)) {
          setTeams(backendTeams.map((t: any) => ({
            id: t.id,
            name: t.name,
            subcontractorId: t.subcontractorId ?? null,
            teamLead: t.teamLead || "",
            trade: t.trade || "",
          })));
        }
        if (Array.isArray(backendAssignments)) {
          setAssignments(backendAssignments.map((a: any) => ({
            id: a.id,
            projectId: a.projectId,
            teamId: a.teamId ?? null,
            workerId: a.workerId ?? null,
            subcontractorId: a.contractorId ?? null,
            roleOnSite: a.roleOnSite || "",
            startDate: a.startDate ? String(a.startDate).split("T")[0] : "",
            endDate: a.endDate ? String(a.endDate).split("T")[0] : "",
          })));
        }
        if (Array.isArray(backendAttendance)) {
          setAttendance(backendAttendance.map((r: any) => ({
            id: r.id,
            workerId: r.workerId,
            projectId: r.projectId ?? null,
            date: r.date ? String(r.date).split("T")[0] : "",
            status: attendanceFromApi[r.status] ?? "غياب",
            checkIn: r.checkIn || "",
            checkOut: r.checkOut || "",
            hours: Number(r.hours) || 0,
            overtimeHours: Number(r.overtimeHours) || 0,
          })));
        }
        if (Array.isArray(backendLeaves)) {
          setLeaves(backendLeaves.map((l: any) => ({
            id: l.id,
            workerId: l.workerId,
            type: leaveTypeFromApi[l.type] ?? "سنوية",
            startDate: l.startDate ? String(l.startDate).split("T")[0] : "",
            endDate: l.endDate ? String(l.endDate).split("T")[0] : "",
            status: leaveStatusFromApi[l.status] ?? "مطلوبة",
            reason: l.reason || "",
          })));
        }
      } catch (e) {
        console.error("Failed to load HR data:", e);
      }
      try {
        const backendPayroll = await apiFetch("/api/hr/payroll");
        if (Array.isArray(backendPayroll)) {
          setPayroll(backendPayroll.map((p: any) => ({
            id: p.id,
            workerId: p.workerId,
            period: p.period,
            presentDays: Number(p.presentDays) || 0,
            baseAmount: Number(p.baseAmount) || 0,
            overtimeAmount: Number(p.overtimeAmount) || 0,
            deductions: Number(p.deductions) || 0,
            netAmount: Number(p.netAmount) || 0,
            status: payrollStatusFromApi[p.status] ?? "مسودة",
            notes: p.notes || "",
          })));
        }
      } catch (e) {
        console.error("Failed to load payroll:", e);
      }

      try {
        const backendMaintContracts = await apiFetch("/api/maintenance/contracts");
        if (Array.isArray(backendMaintContracts)) {
          setMaintenanceContracts(backendMaintContracts.map((c: any) => ({
            id: c.id,
            contractNumber: c.contractNumber,
            clientId: c.clientId,
            projectId: c.projectId || null,
            value: Number(c.value) || 0,
            currency: c.currency || "SAR",
            startDate: c.startDate ? c.startDate.split("T")[0] : "",
            endDate: c.endDate ? c.endDate.split("T")[0] : "",
            frequency: maintenanceFrequencyFromApi[c.frequency] ?? "شهري",
            status: maintenanceContractStatusFromApi[c.status] ?? "نشط",
            notes: c.notes || "",
          })));
        }
      } catch (e) {
        console.error("Failed to load maintenance contracts:", e);
      }

      try {
        const backendMaintVisits = await apiFetch("/api/maintenance/visits");
        if (Array.isArray(backendMaintVisits)) {
          setMaintenanceVisits(backendMaintVisits.map((v: any) => ({
            id: v.id,
            contractId: v.contractId,
            scheduledDate: v.scheduledDate ? v.scheduledDate.split("T")[0] : "",
            completedDate: v.completedDate ? v.completedDate.split("T")[0] : null,
            status: visitStatusFromApi[v.status] ?? "مجدولة",
            performedBy: v.performedBy || "",
            notes: v.notes || "",
          })));
        }
      } catch (e) {
        console.error("Failed to load maintenance visits:", e);
      }

      try {
        const backendInvoices = await apiFetch("/api/finance/invoices");
        if (Array.isArray(backendInvoices)) {
          setInvoices(backendInvoices.map((inv: any) => ({
            id: inv.id,
            projectId: inv.projectId,
            number: inv.number,
            amount: Number(inv.amount) || 0,
            status: invoiceStatusFromApi[inv.status] ?? "جزئية",
            date: (inv.issueDate || inv.createdAt || "").split("T")[0],
            clientId: inv.clientId ?? null,
            dueDate: inv.dueDate ? String(inv.dueDate).split("T")[0] : undefined,
            subtotal: inv.subtotal != null ? Number(inv.subtotal) : undefined,
            vatPercent: inv.vatPercent != null ? Number(inv.vatPercent) : undefined,
            vatAmount: inv.vatAmount != null ? Number(inv.vatAmount) : undefined,
            notes: inv.notes ?? undefined,
            items: Array.isArray(inv.items)
              ? inv.items.map((it: any) => ({
                  description: it.description,
                  quantity: Number(it.quantity) || 0,
                  unitPrice: Number(it.unitPrice) || 0,
                  total: Number(it.total) || 0,
                }))
              : undefined,
          })));
        }
      } catch (e) {
        console.error("Failed to load invoices:", e);
      }

      try {
        const backendExpenses = await apiFetch("/api/finance/expenses");
        if (Array.isArray(backendExpenses)) {
          setExpenses(backendExpenses.map((exp: any) => ({
            id: exp.id,
            projectId: exp.projectId || null,
            type: exp.type,
            amount: Number(exp.amount) || 0,
            description: exp.description || "",
            date: exp.date ? exp.date.split("T")[0] : "",
          })));
        }
      } catch (e) {
        console.error("Failed to load expenses:", e);
      }
    }

    loadData();
  }, []);

  const downloadQuotationPdf = async (id: string | number, num: string) => {
    const modalDoc = document.querySelector(".contract-modal-inner .contract-doc") as HTMLElement;
    if (modalDoc) {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;
        const canvas = await html2canvas(modalDoc, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${num || "عرض_سعر"}.pdf`);
        return;
      } catch (err) {
        console.warn("Screen element capture failed, opening print dialog:", err);
      }
    }
    window.print();
  };

  const downloadCsvAsExcel = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadQuotationExcel = async (id: string | number, num: string) => {
    try {
      const blob = await apiFetch(`/api/quotations/${id}/excel`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${num}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Backend quotation excel fetch failed, generating client-side excel fallback:", e);
      const targetQ = quotations.find((q) => String(q.id) === String(id));
      if (targetQ) {
        const headers = ["اسم البند", "الماركة", "الكمية", "السعر الفردي", "الإجمالي"];
        const rows = targetQ.items.map((it) => [it.name, it.brand || "", it.qty, it.price, it.total]);
        downloadCsvAsExcel(`${num || "عرض_سعر"}.csv`, headers, rows);
        setNotice("تم تحضير ملف الإكسيل وتنزيله بنجاح");
      }
    }
  };

  const downloadProjectReportPdf = async (projectId: string | number, projectName: string) => {
    try {
      const payload = {
        nameAr: site.companyNameAr || "",
        nameEn: site.companyNameEn || "",
        crNumber: site.companyCRNumber || "",
        taxNumber: site.companyTaxNumber || "",
        address: site.contactAddress || "",
        phone: site.contactPhone || "",
        email: site.contactEmail || "",
        stamp: site.stamp || "",
        signature: site.signature || ""
      };
      const blob = await apiFetch(`/api/reports/project/${projectId}/pdf`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `تقرير_${projectName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Backend project report PDF fetch failed, falling back to client-side PDF generation:", e);
      try {
        const targetProject = projects.find((p: any) => String(p.id) === String(projectId)) || { id: projectId, name: projectName };
        await generateClientProjectReportPdf(targetProject, site);
      } catch (err) {
        triggerAlert("خطأ أثناء تحميل كشف المشروع PDF: " + (err as Error).message);
      }
    }
  };

  const downloadProjectReportExcel = async (projectId: string | number, projectName: string) => {
    try {
      const blob = await apiFetch(`/api/reports/project/${projectId}/excel`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `كشف_${projectName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Backend project excel fetch failed, generating client-side excel fallback:", e);
      // كشف حساب من البيانات المحمّلة في المتصفح: نفس أعمدة كشف السيرفر
      const targetP = projects.find((p) => String(p.id) === String(projectId));
      const movements = [
        ...invoices
          .filter((inv) => String(inv.projectId) === String(projectId))
          .map((inv) => ({
            date: inv.date,
            kind: "فاتورة",
            reference: inv.number,
            statement: `فاتورة على المشروع — الحالة: ${inv.status}`,
            debit: 0,
            credit: Number(inv.amount) || 0,
          })),
        ...expenses
          .filter((exp) => String(exp.projectId) === String(projectId))
          .map((exp) => ({
            date: exp.date,
            kind: "مصروف",
            reference: exp.type,
            statement: exp.description || "",
            debit: Number(exp.amount) || 0,
            credit: 0,
          })),
      ].sort((a, b) => (a.date < b.date ? -1 : 1));

      let balance = 0;
      const headers = ["التاريخ", "النوع", "المرجع", "البيان", "مدين (مصروف)", "دائن (فاتورة)", "الرصيد"];
      const rows: (string | number)[][] = movements.map((m) => {
        balance += m.credit - m.debit;
        return [m.date, m.kind, m.reference, m.statement, m.debit, m.credit, balance];
      });
      const totalCredit = movements.reduce((sum, m) => sum + m.credit, 0);
      const totalDebit = movements.reduce((sum, m) => sum + m.debit, 0);
      rows.push(["", "", "", "الإجمالي", totalDebit, totalCredit, balance]);
      rows.push([]);
      rows.push(["", "", "", "قيمة العقد", Number(targetP?.budget) || 0, "", ""]);

      downloadCsvAsExcel(`كشف_حساب_${projectName}.csv`, headers, rows);
      setNotice("تعذر الوصول للسيرفر — تم تحضير كشف الحساب من البيانات المحمّلة");
    }
  };

  const clientsById = useMemo(() => new Map<string | number, Client>(clients.map((c) => [c.id, c])), [clients]);
  const projectsById = useMemo(() => new Map<string | number, Project>(projects.map((p) => [p.id, p])), [projects]);
  const selectedProject = projectsById.get(selectedProjectId) ?? projects[0];

  useEffect(() => {
    if (!notice) return;
    setShowRawToast(true);
    const t = setTimeout(() => { setShowRawToast(false); setNotice(""); }, 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const filteredClients = roleFilteredClients.filter((c) => `${c.name} ${c.phone} ${c.address} ${c.type}`.toLowerCase().includes(search.toLowerCase()));
  const filteredProjects = roleFilteredProjects.filter((p) => {
    const cn = clientsById.get(p.clientId)?.name ?? "";
    return `${p.name} ${p.type} ${cn} ${p.engineer}`.toLowerCase().includes(search.toLowerCase());
  });
  const filteredContractors = roleFilteredContractors.filter((c) => `${c.name} ${c.phone} ${c.specialty} ${c.company}`.toLowerCase().includes(search.toLowerCase()));
  const filteredQuotations = quotations.filter((q) => {
    const cn = clientsById.get(q.clientId)?.name ?? "";
    return `${q.number} ${cn} ${q.status}`.toLowerCase().includes(search.toLowerCase());
  });
  const addClientFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name) {
      triggerAlert("يرجى إدخال اسم العميل");
      return;
    }
    const address = String(form.get("address") ?? "");
    const type = String(form.get("type") ?? "عميل");
    const notes = String(form.get("notes") ?? "");

    const newId = nextId(clients);
    const newClient: Client = { id: newId, name, phone, address, type, notes } as unknown as Client;
    setClients((cur) => [...cur, newClient]);
    event.currentTarget.reset();
    setNotice("تمت إضافة العميل بنجاح");

    try {
      const saved = await apiFetch("/api/projects/clients", {
        method: "POST",
        body: JSON.stringify({ name, phone, address, type, notes }),
      });
      if (saved && saved.id) {
        setClients((cur) => cur.map((c) => (c.id === newId ? { ...c, id: saved.id } : c)));
      }
    } catch (e) {
      console.warn("Client add backend sync skipped:", e);
    }
  };
  const deleteClient = async (id: number | string) => {
    setClients((cur) => cur.filter((c) => String(c.id) !== String(id)));
    setNotice("تم حذف العميل بنجاح");
    try {
      await apiFetch(`/api/projects/clients/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Client delete backend sync skipped:", e);
    }
  };
  const updateClient = async (client: Client) => {
    setClients((cur) => cur.map((c) => (String(c.id) === String(client.id) ? client : c)));
    setNotice("تم تحديث بيانات العميل بنجاح");
    try {
      await apiFetch(`/api/projects/clients/${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: client.name,
          phone: client.phone,
          address: client.address,
          type: client.type,
          notes: client.notes,
        }),
      });
    } catch (e) {
      console.warn("Client update backend sync skipped:", e);
    }
  };

  const addQuotation = async (clientId: number | string, date: string, validUntil: string, items: QuotationItem[], value: number, notes?: string, currencyCode: string = "SAR", introText?: string, locationCity?: string, locationDistrict?: string, locationPlot?: string, locationPlan?: string) => {
    try {
      const savedQ = await apiFetch("/api/quotations", {
        method: "POST",
        body: JSON.stringify({
          clientId: String(clientId),
          date,
          validUntil,
          taxPercent: 15,
          currency: currencyCode,
          notes: notes || "",
          items: items.map(it => ({
            name: it.name,
            brand: it.brand || "",
            qty: Number(it.qty) || 1,
            price: Number(it.price) || 0
          }))
        })
      });

      setQuotations((cur) => [...cur, {
        id: savedQ.id,
        number: savedQ.number,
        clientId: savedQ.clientId,
        date: savedQ.date.split("T")[0],
        validUntil: savedQ.validUntil.split("T")[0],
        status: "مسودة",
        items: savedQ.items,
        value: Number(savedQ.value),
        taxPercent: Number(savedQ.taxPercent) || 15,
        currency: savedQ.currency,
        notes: savedQ.notes,
        introText: introText || "",
        locationCity: locationCity || "الرياض",
        locationDistrict: locationDistrict || "",
        locationPlot: locationPlot || "",
        locationPlan: locationPlan || "",
      }]);
      setNotice("تم إنشاء عرض السعر بنجاح في قاعدة البيانات");
    } catch {
      // Fallback: store locally when backend not reachable (static hosting)
      const newId = Date.now();
      const subtotal = items.reduce((acc, it) => acc + it.total, 0);
      const fallbackQuotation = {
        id: newId,
        number: `QT-${newId.toString().slice(-4)}`,
        clientId: Number(clientId),
        date,
        validUntil,
        status: "مسودة" as const,
        items: items.map((it, i) => ({ ...it, id: i + 1, total: it.qty * it.price })),
        value: Math.round(subtotal * 1.15),
        taxPercent: 15,
        currency: currencyCode,
        notes: notes || "",
        introText: introText || "",
        locationCity: locationCity || "الرياض",
        locationDistrict: locationDistrict || "",
        locationPlot: locationPlot || "",
        locationPlan: locationPlan || "",
      };
      setQuotations((cur) => [...cur, fallbackQuotation]);
      setNotice("تم إنشاء عرض السعر وحفظه محلياً");
    }
  };
  const deleteQuotation = async (id: number | string) => {
    setQuotations((cur) => cur.filter((q) => String(q.id) !== String(id)));
    setNotice("تم حذف عرض السعر بنجاح");
    try {
      await apiFetch(`/api/quotations/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("Quotation delete backend sync skipped:", e);
    }
  };
  const updateQuotationStatus = async (id: number | string, status: "مسودة" | "مرسل" | "معتمد" | "ملغي") => {
    setQuotations((cur) => cur.map((q) => (String(q.id) === String(id) ? { ...q, status } : q)));
    setNotice("تم تحديث حالة عرض السعر بنجاح");
    const backendStatus = status === "معتمد" ? "APPROVED" : status === "ملغي" ? "CANCELLED" : status === "مرسل" ? "SENT" : "DRAFT";
    try {
      await apiFetch(`/api/quotations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: backendStatus })
      });
    } catch (e) {
      console.warn("Quotation status backend sync skipped:", e);
    }
  };

  const updateQuotationDetails = async (
    id: number | string,
    payload: { date: string; validUntil: string; taxPercent: number; currency: string; notes: string; items: QuotationItem[] },
  ) => {
    setQuotations((cur) => cur.map((q) => (String(q.id) === String(id) ? {
      ...q,
      date: payload.date,
      validUntil: payload.validUntil,
      taxPercent: payload.taxPercent,
      currency: payload.currency,
      notes: payload.notes,
      items: payload.items.map((it) => ({ ...it, total: it.qty * it.price })),
      value: payload.items.reduce((sum, item) => sum + (item.qty * item.price), 0),
    } : q)));
    setNotice("تم تعديل عرض السعر بنجاح");

    try {
      await apiFetch(`/api/quotations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          date: payload.date,
          validUntil: payload.validUntil,
          taxPercent: payload.taxPercent,
          currency: payload.currency,
          notes: payload.notes,
          items: payload.items.map((it) => ({ name: it.name, brand: it.brand, qty: it.qty, price: it.price })),
        }),
      });
    } catch (e) {
      console.warn("Quotation details backend sync skipped:", e);
    }
  };

  const addContractFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const projectId = String(form.get("projectId") || "");
    const value = Number(form.get("value")) || 0;
    if (!projectId || !value) return;

    // Read the specs
    const specs: string[] = [];
    for (let i = 0; i < 13; i++) {
      const val = form.get(`spec_${i}`);
      if (val !== null && String(val).trim()) {
        specs.push(String(val));
      }
    }

    const project = projects.find((p) => String(p.id) === projectId);
    const clientId = project ? String(project.clientId) : "1";

    const payload = {
      projectId,
      clientId,
      value,
      currency: String(form.get("currency") || "SAR"),
      startDate: String(form.get("startDate") || new Date().toISOString().slice(0, 10)),
      endDate: String(form.get("endDate") || new Date().toISOString().slice(0, 10)),
      warranty: String(form.get("warranty") || "سنتين"),
      clauses: String(form.get("clauses") || ""),
      secondPartyName: String(form.get("secondPartyName") || ""),
      secondPartyRegister: String(form.get("secondPartyRegister") || ""),
      secondPartyRepresentative: String(form.get("secondPartyRepresentative") || ""),
      secondPartyRole: String(form.get("secondPartyRole") || "المالك"),
      locationCity: String(form.get("locationCity") || "الرياض"),
      locationDistrict: String(form.get("locationDistrict") || ""),
      locationPlot: String(form.get("locationPlot") || ""),
      locationPlan: String(form.get("locationPlan") || ""),
      quotationNumber: String(form.get("quotationNumber") || ""),
      quotationValue: Number(form.get("quotationValue") || 0),
      specs: specs.length > 0 ? specs : undefined,
    };

    let newContract: Contract;
    try {
      const savedC = await apiFetch("/api/contracts", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      newContract = {
        id: savedC.id,
        projectId: savedC.projectId,
        value: Number(savedC.value),
        currency: savedC.currency,
        startDate: savedC.startDate ? savedC.startDate.split("T")[0] : payload.startDate,
        endDate: savedC.endDate ? savedC.endDate.split("T")[0] : payload.endDate,
        warranty: savedC.warranty,
        clauses: savedC.clauses,
        secondPartyName: savedC.secondPartyName,
        secondPartyRegister: savedC.secondPartyRegister,
        secondPartyRepresentative: savedC.secondPartyRepresentative,
        secondPartyRole: savedC.secondPartyRole,
        locationCity: savedC.locationCity,
        locationDistrict: savedC.locationDistrict,
        locationPlot: savedC.locationPlot,
        locationPlan: savedC.locationPlan,
        quotationNumber: savedC.quotationNumber,
        quotationValue: Number(savedC.quotationValue) || 0,
        specs: savedC.specs,
      };
    } catch {
      newContract = {
        id: Date.now(),
        ...payload,
        projectId: Number(payload.projectId) || 1,
        specs: payload.specs || defaultSpecs,
      };
    }

    setContracts((cur) => [...cur, newContract]);
    event.currentTarget.reset();
    setNotice("تم إنشاء العقد بنجاح");
  };
  const deleteContract = async (id: number | string) => {
    setContracts((cur) => cur.filter((c) => String(c.id) !== String(id)));
    setNotice("تم حذف العقد بنجاح");
    try {
      await apiFetch(`/api/contracts/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("Contract delete backend sync skipped:", e);
    }
  };
  const updateContract = async (contract: Contract) => {
    setContracts((cur) => cur.map((c) => (String(c.id) === String(contract.id) ? contract : c)));
    setNotice("تم تحديث بيانات العقد بنجاح");
    try {
      await apiFetch(`/api/contracts/${contract.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          value: Number(contract.value) || 0,
          currency: contract.currency,
          startDate: contract.startDate,
          endDate: contract.endDate,
          warranty: contract.warranty,
          clauses: contract.clauses,
          secondPartyName: contract.secondPartyName,
          secondPartyRegister: contract.secondPartyRegister,
          secondPartyRepresentative: contract.secondPartyRepresentative,
          secondPartyRole: contract.secondPartyRole,
          locationCity: contract.locationCity,
          locationDistrict: contract.locationDistrict,
          locationPlot: contract.locationPlot,
          locationPlan: contract.locationPlan,
          quotationNumber: contract.quotationNumber,
          quotationValue: Number(contract.quotationValue) || 0,
          specs: contract.specs,
        }),
      });
    } catch (e) {
      console.warn("Contract update backend sync skipped:", e);
    }
  };
  const setContractPayments = async (contractId: number | string, payments: PaymentTerm[]) => {
    setContracts((cur) => cur.map((c) => (String(c.id) === String(contractId) ? { ...c, payments } : c)));
    setNotice("تم تحديث دفعات العقد بنجاح");
    try {
      await apiFetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        body: JSON.stringify({
          payments: payments.map((p) => ({ label: p.label, percent: Number(p.percent) || 0 })),
        }),
      });
    } catch (e) {
      console.warn("Contract payments backend sync skipped:", e);
    }
  };

  const addInventoryItemFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const payload = {
      name,
      brand: String(form.get("brand") ?? "").trim(),
      quantity: Number(form.get("quantity")) || 0,
      unit: String(form.get("unit") ?? "") || "قطعة",
      purchasePrice: Number(form.get("purchasePrice")) || 0,
      salePrice: Number(form.get("salePrice")) || 0,
      supplier: String(form.get("supplier") ?? ""),
      minQuantity: Number(form.get("minQuantity")) || 0,
    };

    const localId = nextId(inventory);
    setInventory((cur) => [...cur, {
      ...payload,
      id: localId,
      receivedAt: new Date().toISOString().slice(0, 10),
    }]);
    formEl.reset();
    setNotice("تمت إضافة المنتج للمخزن بنجاح");

    try {
      const created = await apiFetch("/api/inventory", { method: "POST", body: JSON.stringify(payload) });
      if (created && created.id) {
        setInventory((cur) => cur.map((i) => (i.id === localId ? { ...i, id: created.id } : i)));
      }
    } catch (e) {
      console.warn("Inventory add backend sync skipped:", e);
    }
  };
  const deleteInventoryItem = async (id: number | string) => {
    setInventory((cur) => cur.filter((i) => String(i.id) !== String(id)));
    setNotice("تم حذف الصنف من المخزن بنجاح");
    try {
      await apiFetch(`/api/inventory/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Inventory delete backend sync skipped:", e);
    }
  };
  const updateInventoryItem = async (updated: InventoryItem) => {
    setInventory((cur) => cur.map((i) => (String(i.id) === String(updated.id) ? updated : i)));
    setNotice("تم تحديث بيانات الصنف بنجاح");
    try {
      await apiFetch(`/api/inventory/${updated.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: updated.name,
          brand: updated.brand,
          quantity: Number(updated.quantity) || 0,
          unit: updated.unit,
          purchasePrice: Number(updated.purchasePrice) || 0,
          salePrice: Number(updated.salePrice) || 0,
          supplier: updated.supplier,
          minQuantity: Number(updated.minQuantity) || 0,
        }),
      });
    } catch (e) {
      console.warn("Inventory update backend sync skipped:", e);
    }
  };
  const issueInventory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const itemId = String(form.get("itemId") ?? "");
    const projectId = String(form.get("projectId") ?? "");
    const quantity = Number(form.get("quantity"));
    if (!itemId || !projectId || quantity <= 0) return;

    setInventory((cur) => cur.map((i) => (String(i.id) === itemId ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i)));
    formEl.reset();
    setNotice("تم صرف الخامات للمشروع وتسجيلها بنجاح");

    try {
      await apiFetch(`/api/inventory/${itemId}/issue`, {
        method: "POST",
        body: JSON.stringify({ projectId, quantity }),
      });
    } catch (e) {
      console.warn("Inventory issue backend sync skipped:", e);
    }
  };
  const exportInventoryExcel = async () => {
    try {
      const blob = await apiFetch("/api/inventory/export/excel");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventory.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Backend inventory excel export failed, generating client-side excel fallback:", e);
      const headers = ["الصنف", "الماركة", "الكمية", "الوحدة", "سعر الشراء", "سعر البيع", "المورد"];
      const rows = inventory.map((i) => [i.name, i.brand || "", i.quantity, i.unit, i.purchasePrice, i.salePrice, i.supplier || ""]);
      downloadCsvAsExcel("مخزون_كنان.csv", headers, rows);
      setNotice("تم تصدير المخزن بنجاح وتنزيل الملف");
    }
  };
  const handleCsvImport = (section: Section, text: string) => {
    const rows = parseCsv(text);
    if (!rows.length) { triggerAlert("الملف فارغ أو غير صالح"); return; }
    try {
      if (section === "clients") {
        setClients((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, name: r["الاسم"] || r["name"] || "", phone: r["الهاتف"] || r["phone"] || "", address: r["العنوان"] || r["address"] || "", type: r["النوع"] || r["type"] || "عميل", notes: r["ملاحظات"] || r["notes"] || "" })); return [...cur, ...imported]; });
        setNotice("تم استيراد العملاء");
      } else if (section === "inventory") {
        const items = rows
          .map((r) => ({
            name: r["الاسم"] || r["name"] || "",
            brand: r["الماركة"] || r["brand"] || "",
            quantity: Number(r["الكمية"] || r["quantity"] || 0),
            unit: r["الوحدة"] || r["unit"] || "قطعة",
            purchasePrice: Number(r["سعر الشراء"] || r["purchasePrice"] || 0),
            salePrice: Number(r["سعر البيع"] || r["salePrice"] || 0),
            supplier: r["المورد"] || r["supplier"] || "",
            minQuantity: Number(r["الحد الأدنى"] || r["minQuantity"] || 0),
          }))
          .filter((it) => it.name.trim());
        if (!items.length) { triggerAlert("لا توجد أصناف صالحة في الملف"); return; }
        apiFetch("/api/inventory/import", { method: "POST", body: JSON.stringify({ items }) })
          .then(async () => {
            const fresh = await apiFetch("/api/inventory");
            if (Array.isArray(fresh)) {
              setInventory(fresh.map((it: any) => ({
                id: it.id,
                name: it.name,
                brand: it.brand || "",
                quantity: Number(it.quantity) || 0,
                unit: it.unit || "قطعة",
                purchasePrice: Number(it.purchasePrice) || 0,
                salePrice: Number(it.salePrice) || 0,
                supplier: it.supplier || "",
                receivedAt: it.receivedAt ? String(it.receivedAt).split("T")[0] : "",
                minQuantity: Number(it.minQuantity) || 0,
              })));
            }
            setNotice(`تم استيراد ${items.length} صنف للمخزن`);
          })
          .catch((e) => triggerAlert("تعذر استيراد المخزن: " + (e as Error).message));
        return;
      } else if (section === "quotations") {
        setQuotations((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, number: r["رقم العرض"] || r["number"] || `QT-${baseId + i}`, clientId: Number(r["رقم العميل"] || r["clientId"] || 1), date: r["التاريخ"] || r["date"] || new Date().toISOString().slice(0, 10), validUntil: r["صالح لغاية"] || r["validUntil"] || new Date().toISOString().slice(0, 10), status: (r["الحالة"] || r["status"] || "مسودة") as Quotation["status"], items: [], value: Number(r["القيمة"] || r["value"] || 0), taxPercent: Number(r["نسبة الضريبة"] || 15), currency: r["العملة"] || "SAR" })); return [...cur, ...imported]; });
        setNotice("تم استيراد عروض الأسعار");
      } else if (section === "contracts") {
        setContracts((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, projectId: Number(r["رقم المشروع"] || r["projectId"] || 1), value: Number(r["القيمة"] || r["value"] || 0), currency: r["العملة"] || "SAR", startDate: r["تاريخ البداية"] || new Date().toISOString().slice(0, 10), endDate: r["تاريخ النهاية"] || new Date().toISOString().slice(0, 10), warranty: r["الضمان"] || "سنتين", clauses: r["البنود"] || "" })); return [...cur, ...imported]; });
        setNotice("تم استيراد العقود");
      } else if (section === "workers") {
        const workerRows = rows
          .map((r) => ({ name: r["الاسم"] || r["name"] || "", specialty: r["التخصص"] || "", phone: r["الهاتف"] || "", dailyRate: Number(r["اليومية"] || 0) }))
          .filter((w) => w.name.trim());
        if (!workerRows.length) { triggerAlert("لا يوجد عمال صالحون في الملف"); return; }
        Promise.all(workerRows.map((w) => apiFetch("/api/hr/workers", { method: "POST", body: JSON.stringify(w) })))
          .then((created) => {
            setWorkers((cur) => [...cur, ...created.map((c: any, i: number) => ({ id: c.id, ...workerRows[i], currentProjectId: null, attendance: "غياب" as const, hours: 0 }))]);
            setNotice(`تم استيراد ${workerRows.length} عامل`);
          })
          .catch((e) => triggerAlert("تعذر استيراد العمال: " + (e as Error).message));
        return;
      }
    } catch { triggerAlert("تعذر استيراد الملف. تأكد من تنسيق CSV."); }
  };

  const setStamp = (val: string) => setSite((cur) => ({ ...cur, stamp: val }));
  const setSignature = (val: string) => setSite((cur) => ({ ...cur, signature: val }));
  const updateDefaultPayment = (id: number, field: keyof PaymentTerm, value: string) => setSite((cur) => ({ ...cur, payments: (cur.payments ?? []).map((p) => p.id === id ? { ...p, [field]: value } : p) }));
  const addDefaultPayment = () => setSite((cur) => ({ ...cur, payments: [...(cur.payments ?? []), { id: nextId(cur.payments ?? []), label: "", percent: "" }] }));
  const deleteDefaultPayment = (id: number) => setSite((cur) => ({ ...cur, payments: (cur.payments ?? []).filter((p) => p.id !== id) }));

  const updateClientPayment = (clientId: number, id: number, field: keyof PaymentTerm, value: string) => { setClients((cur) => cur.map((c) => c.id === clientId ? { ...c, payments: (c.payments ?? []).map((p) => p.id === id ? { ...p, [field]: value } : p) } : c)); };
  const addClientPayment = (clientId: number) => { setClients((cur) => cur.map((c) => c.id === clientId ? { ...c, payments: [...(c.payments ?? []), { id: nextId(c.payments ?? []), label: "", percent: "" }] } : c)); };
  const deleteClientPayment = (clientId: number, id: number) => { setClients((cur) => cur.map((c) => c.id === clientId ? { ...c, payments: (c.payments ?? []).filter((p) => p.id !== id) } : c)); };

  const updateStat = (id: number, field: keyof SiteStat, value: string) => setSite((cur) => ({ ...cur, stats: cur.stats.map((s) => s.id === id ? { ...s, [field]: value } : s) }));
  const addStat = () => setSite((cur) => ({ ...cur, stats: [...cur.stats, { id: nextId(cur.stats), value: "", label: "" }] }));
  const deleteStat = (id: number) => setSite((cur) => ({ ...cur, stats: cur.stats.filter((s) => s.id !== id) }));
  const updateSiteField = (field: keyof SiteSettings, value: any) => { setSite((cur) => ({ ...cur, [field]: value })); };

  const addShowcaseItem = (item: Omit<ShowcaseItem, "id">) => setShowcase((cur) => [...cur, { ...item, id: nextId(cur) }]);
  const deleteShowcaseItem = (id: number) => setShowcase((cur) => cur.filter((s) => s.id !== id));

  const visibleAlerts = useMemo(() => {
    const projectAlerts = projects.filter((p) => p.status === "متأخر" || p.progress < 45).map((p) => ({ id: p.status === "متأخر" ? `project-late-${p.id}` : `project-prog-${p.id}`, title: p.status === "متأخر" ? "مشروع متأخر" : "نسبة تنفيذ منخفضة", detail: p.name, tone: p.status === "متأخر" ? "danger" : "warning", section: "projects" as Section }));
    const stockAlerts = inventory.filter((i) => i.quantity <= i.minQuantity).map((i) => ({ id: `stock-${i.id}`, title: "نقص خامات", detail: i.name, tone: "danger", section: "inventory" as Section }));
    return [...projectAlerts, ...stockAlerts].filter((a) => !dismissedAlerts.includes(a.id));
  }, [projects, inventory, dismissedAlerts]);
  const resolveAlert = (id: string) => setDismissedAlerts((cur) => (cur.includes(id) ? cur : [...cur, id]));

  const addStaffMember = async (member: Omit<StaffAccount, "id">) => {
    const localId = nextId(staff);
    setStaff((cur) => [...cur, { ...member, id: localId, password: "", isActive: true }]);
    setNotice("تم إنشاء حساب الموظف بنجاح");
    try {
      const created = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          password: member.password,
          role: staffRoleToApi[member.role] || "WORKER",
        }),
      });
      if (created && created.id) {
        setStaff((cur) => cur.map((s) => (s.id === localId ? { ...s, backendId: created.id } : s)));
      }
    } catch (e) {
      console.warn("Staff member add backend sync skipped:", e);
    }
  };
  const deleteStaffMember = async (id: number) => {
    const member = staff.find((s) => s.id === id);
    setStaff((cur) => cur.filter((s) => s.id !== id));
    setNotice("تم إزالة حساب الموظف بنجاح");
    try {
      if (member?.backendId) {
        await apiFetch(`/api/users/${member.backendId}`, { method: "DELETE" });
      }
    } catch (e) {
      console.warn("Staff member delete backend sync skipped:", e);
    }
  };

  const updateStaffMember = async (id: number, member: Partial<StaffAccount>) => {
    setStaff((cur) =>
      cur.map((s) =>
        s.id === id
          ? {
              ...s,
              name: member.name ?? s.name,
              email: member.email ?? s.email,
              role: member.role ?? s.role,
              sections: member.sections ?? s.sections,
              permissions: member.permissions ?? s.permissions,
            }
          : s
      )
    );
    setNotice("تم تحديث حساب الموظف بنجاح");
    const existing = staff.find((s) => s.id === id);
    try {
      if (existing?.backendId) {
        const payload: any = {};
        if (member.name) payload.name = member.name;
        if (member.role) payload.role = staffRoleToApi[member.role] || "WORKER";
        if (member.password) payload.password = member.password;
        await apiFetch(`/api/users/${existing.backendId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.warn("Staff member update backend sync skipped:", e);
    }
  };

  const totals = useMemo(() => {
    const rev = invoices.reduce((s, e) => s + Number(e.amount || 0), 0);
    const exp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return {
      revenue: rev,
      expenseTotal: exp,
      profit: rev - exp,
      delayed: projects.filter((p) => p.status === "متأخر").length,
      activeWorkers: workers.filter((w) => w.currentProjectId !== null).length,
      lowStock: inventory.filter((i) => i.quantity <= i.minQuantity).length,
    };
  }, [invoices, expenses, projects, workers, inventory]);

  const filteredInvoices = invoices;

  // ===== معالجات الأقسام التشغيلية (CRUD محفوظ في localStorage) =====
  const addContractorFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    if (!name) return;
    setContractors((cur) => [...cur, { id: nextId(cur), name, phone: String(f.get("phone") ?? ""), specialty: String(f.get("specialty") ?? ""), company: String(f.get("company") ?? ""), address: String(f.get("address") ?? ""), notes: String(f.get("notes") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة المقاول");
  };
  const deleteContractor = (id: number) => { setContractors((cur) => cur.filter((c) => c.id !== id)); setNotice("تم حذف المقاول"); };
  const updateContractor = (c: Contractor) => { setContractors((cur) => cur.map((x) => (x.id === c.id ? c : x))); setNotice("تم تحديث المقاول"); };

  const addProjectFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const clientId = String(f.get("clientId") ?? "");
    if (!name || !clientId) return;

    const localId = nextId(projects);
    const pData = {
      id: localId,
      name,
      type: String(f.get("type") ?? "مكافحة حريق"),
      clientId,
      address: String(f.get("address") ?? ""),
      startDate: String(f.get("startDate") || new Date().toISOString().slice(0, 10)),
      endDate: String(f.get("endDate") || new Date().toISOString().slice(0, 10)),
      status: "لم يبدأ" as const,
      engineer: "",
      budget: Number(f.get("budget")) || 0,
      progress: 0,
    };
    setProjects((cur) => [...cur, pData]);
    if (!selectedProjectId) setSelectedProjectId(localId);
    event.currentTarget.reset();
    setNotice("تمت إضافة المشروع بنجاح");

    try {
      const newProject = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: pData.name,
          type: pData.type,
          clientId: pData.clientId,
          address: pData.address,
          startDate: pData.startDate,
          endDate: pData.endDate,
          budget: pData.budget,
        }),
      });
      if (newProject && newProject.id) {
        setProjects((cur) => cur.map((p) => (p.id === localId ? { ...p, id: newProject.id } : p)));
      }
    } catch (e) {
      console.warn("Project add backend sync skipped:", e);
    }
  };
  const deleteProject = async (id: number | string) => {
    setProjects((cur) => cur.filter((p) => String(p.id) !== String(id)));
    setNotice("تم حذف المشروع بنجاح");
    try {
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Project delete backend sync skipped:", e);
    }
  };

  const addStageFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const projectId = String(f.get("projectId") ?? "");
    const name = String(f.get("name") ?? "").trim();
    if (!projectId || !name) return;
    const status = String(f.get("status") || "لم يبدأ") as ProjectStage["status"];
    const notes = String(f.get("notes") ?? "");

    const localId = nextId(stages);
    setStages((cur) => [...cur, { id: localId, projectId, name, status, notes, updatedAt: new Date().toISOString().slice(0, 10) }]);
    form.reset();
    setNotice("تمت إضافة المرحلة بنجاح");

    try {
      const created = await apiFetch(`/api/projects/${projectId}/stages`, {
        method: "POST",
        body: JSON.stringify({ name, status: stageStatusToApi[status], notes }),
      });
      if (created && created.id) {
        setStages((cur) => cur.map((s) => (s.id === localId ? { ...s, id: created.id } : s)));
      }
    } catch (e) {
      console.warn("Stage add backend sync skipped:", e);
    }
  };
  const updateStageStatus = async (id: number | string, status: ProjectStage["status"]) => {
    setStages((cur) => cur.map((s) => (String(s.id) === String(id) ? { ...s, status, updatedAt: new Date().toISOString().slice(0, 10) } : s)));
    setNotice("تم تحديث حالة المرحلة بنجاح");
    const stage = stages.find((s) => String(s.id) === String(id));
    try {
      await apiFetch(`/api/projects/stages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: stageStatusToApi[status], notes: stage?.notes || "" }),
      });
    } catch (e) {
      console.warn("Stage status backend sync skipped:", e);
    }
  };
  const updateStageNotes = async (id: number | string, notes: string) => {
    const stage = stages.find((s) => String(s.id) === String(id));
    setStages((cur) => cur.map((s) => (String(s.id) === String(id) ? { ...s, notes, updatedAt: new Date().toISOString().slice(0, 10) } : s)));
    try {
      await apiFetch(`/api/projects/stages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: stageStatusToApi[stage?.status || "لم يبدأ"], notes }),
      });
    } catch (e) {
      console.warn("Stage notes backend sync skipped:", e);
    }
  };
  const deleteStage = async (id: number | string) => {
    setStages((cur) => cur.filter((s) => String(s.id) !== String(id)));
    setNotice("تم حذف المرحلة بنجاح");
    try {
      await apiFetch(`/api/projects/stages/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Stage delete backend sync skipped:", e);
    }
  };

  const addWorkerFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const f = new FormData(formEl);
    const name = String(f.get("name") ?? "").trim();
    if (!name) return;

    const localId = nextId(workers);
    setWorkers((cur) => [...cur, {
      id: localId,
      name,
      specialty: String(f.get("specialty") ?? ""),
      phone: String(f.get("phone") ?? ""),
      dailyRate: Number(f.get("dailyRate")) || 0,
      currentProjectId: null,
      attendance: "غياب",
      hours: 0,
    }]);
    formEl.reset();
    setNotice("تمت إضافة العامل بنجاح");

    try {
      const created = await apiFetch("/api/hr/workers", {
        method: "POST",
        body: JSON.stringify({
          name,
          specialty: String(f.get("specialty") ?? ""),
          phone: String(f.get("phone") ?? ""),
          dailyRate: Number(f.get("dailyRate")) || 0,
        }),
      });
      if (created && created.id) {
        setWorkers((cur) => cur.map((w) => (w.id === localId ? { ...w, id: created.id } : w)));
      }
    } catch (e) {
      console.warn("Worker add backend sync skipped:", e);
    }
  };
  const deleteWorker = async (id: number | string) => {
    setWorkers((cur) => cur.filter((w) => String(w.id) !== String(id)));
    setNotice("تم حذف العامل بنجاح");
    try {
      await apiFetch(`/api/hr/workers/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Worker delete backend sync skipped:", e);
    }
  };
  const updateWorker = async (w: Worker) => {
    setWorkers((cur) => cur.map((x) => (String(x.id) === String(w.id) ? w : x)));
    setNotice("تم تحديث بيانات العامل بنجاح");
    try {
      await apiFetch(`/api/hr/workers/${w.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: w.name,
          specialty: w.specialty,
          phone: w.phone,
          dailyRate: Number(w.dailyRate) || 0,
          nationalId: w.nationalId,
          employmentType: w.employmentType,
          monthlySalary: Number(w.monthlySalary) || 0,
        }),
      });
    } catch (e) {
      console.warn("Worker update backend sync skipped:", e);
    }
  };

  const addDeficiencyFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const projectId = String(f.get("projectId") ?? "");
    const description = String(f.get("description") ?? "").trim();
    if (!projectId || !description) return;
    const severity = String(f.get("severity") || "متوسطة") as SiteDeficiency["severity"];

    const localId = nextId(deficiencies);
    setDeficiencies((cur) => [...cur, {
      id: localId,
      projectId,
      raisedBy: String(f.get("raisedBy") ?? "") || user.name || "",
      description,
      severity,
      status: "مفتوح",
      raisedDate: new Date().toISOString().slice(0, 10),
      resolvedDate: "",
    }]);
    form.reset();
    setNotice("تم تسجيل النقص بنجاح");

    try {
      const created = await apiFetch(`/api/projects/${projectId}/deficiencies`, {
        method: "POST",
        body: JSON.stringify({ description, severity: severityToApi[severity] }),
      });
      if (created && created.id) {
        setDeficiencies((cur) => cur.map((d) => (d.id === localId ? { ...d, id: created.id } : d)));
      }
    } catch (e) {
      console.warn("Deficiency add backend sync skipped:", e);
    }
  };
  const updateDeficiencyStatus = async (id: number | string, status: SiteDeficiency["status"]) => {
    setDeficiencies((cur) => cur.map((d) => (String(d.id) === String(id) ? { ...d, status, resolvedDate: status === "تم الحل" ? new Date().toISOString().slice(0, 10) : "" } : d)));
    setNotice("تم تحديث حالة النقص بنجاح");
    try {
      await apiFetch(`/api/projects/deficiencies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: defStatusToApi[status] }),
      });
    } catch (e) {
      console.warn("Deficiency status backend sync skipped:", e);
    }
  };
  const deleteDeficiency = async (id: number | string) => {
    setDeficiencies((cur) => cur.filter((d) => String(d.id) !== String(id)));
    setNotice("تم حذف النقص بنجاح");
    try {
      await apiFetch(`/api/projects/deficiencies/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Deficiency delete backend sync skipped:", e);
    }
  };

  const addLeaveFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const f = new FormData(formEl);
    const workerId = String(f.get("workerId") ?? "");
    if (!workerId) return;
    const type = String(f.get("type") || "سنوية") as Leave["type"];
    const startDate = String(f.get("startDate") || new Date().toISOString().slice(0, 10));
    const endDate = String(f.get("endDate") || new Date().toISOString().slice(0, 10));
    const reason = String(f.get("reason") ?? "");

    const localId = nextId(leaves);
    setLeaves((cur) => [...cur, { id: localId, workerId, type, startDate, endDate, status: "مطلوبة", reason }]);
    formEl.reset();
    setNotice("تم تسجيل طلب الإجازة بنجاح");

    try {
      const created = await apiFetch("/api/hr/leaves", {
        method: "POST",
        body: JSON.stringify({ workerId, type: leaveTypeToApi[type], startDate, endDate, reason }),
      });
      if (created && created.id) {
        setLeaves((cur) => cur.map((l) => (l.id === localId ? { ...l, id: created.id } : l)));
      }
    } catch (e) {
      console.warn("Leave add backend sync skipped:", e);
    }
  };
  const updateLeaveStatus = async (id: number | string, status: Leave["status"]) => {
    setLeaves((cur) => cur.map((l) => (String(l.id) === String(id) ? { ...l, status } : l)));
    setNotice("تم تحديث حالة الإجازة بنجاح");
    try {
      await apiFetch(`/api/hr/leaves/${id}`, { method: "PATCH", body: JSON.stringify({ status: leaveStatusToApi[status] }) });
    } catch (e) {
      console.warn("Leave status backend sync skipped:", e);
    }
  };
  const deleteLeave = async (id: number | string) => {
    setLeaves((cur) => cur.filter((l) => String(l.id) !== String(id)));
    setNotice("تم حذف الإجازة بنجاح");
    try {
      await apiFetch(`/api/hr/leaves/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Leave delete backend sync skipped:", e);
    }
  };

  const addTeamFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const f = new FormData(formEl);
    const name = String(f.get("name") ?? "").trim();
    if (!name) return;
    const subcontractorId = String(f.get("subcontractorId") ?? "");
    const teamLead = String(f.get("teamLead") ?? "");
    const trade = String(f.get("trade") ?? "");

    const localId = nextId(teams);
    setTeams((cur) => [...cur, { id: localId, name, subcontractorId: subcontractorId || null, teamLead, trade }]);
    formEl.reset();
    setNotice("تمت إضافة الفريق بنجاح");

    try {
      const created = await apiFetch("/api/hr/teams", {
        method: "POST",
        body: JSON.stringify({ name, subcontractorId: subcontractorId || undefined, teamLead, trade }),
      });
      if (created && created.id) {
        setTeams((cur) => cur.map((t) => (t.id === localId ? { ...t, id: created.id } : t)));
      }
    } catch (e) {
      console.warn("Team add backend sync skipped:", e);
    }
  };
  const deleteTeam = async (id: number | string) => {
    setTeams((cur) => cur.filter((t) => String(t.id) !== String(id)));
    setAssignments((cur) => cur.filter((a) => String(a.teamId) !== String(id)));
    setNotice("تم حذف الفريق بنجاح");
    try {
      await apiFetch(`/api/hr/teams/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Team delete backend sync skipped:", e);
    }
  };
  const updateTeam = (t: WorkTeam) => { setTeams((cur) => cur.map((x) => (x.id === t.id ? t : x))); };
  const addAssignmentFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const f = new FormData(formEl);
    const projectId = String(f.get("projectId") ?? "");
    if (!projectId) return;
    const teamId = String(f.get("teamId") ?? "");
    const workerId = String(f.get("workerId") ?? "");
    const roleOnSite = String(f.get("roleOnSite") ?? "");
    const startDate = String(f.get("startDate") || new Date().toISOString().slice(0, 10));
    const endDate = String(f.get("endDate") ?? "");

    const localId = nextId(assignments);
    setAssignments((cur) => [...cur, { id: localId, projectId, teamId: teamId || null, workerId: workerId || null, subcontractorId: null, roleOnSite, startDate, endDate }]);
    formEl.reset();
    setNotice("تم تعيين الفريق على الموقع بنجاح");

    try {
      const created = await apiFetch("/api/hr/assignments", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          teamId: teamId || undefined,
          workerId: workerId || undefined,
          roleOnSite,
          startDate,
          endDate: endDate || undefined,
        }),
      });
      if (created && created.id) {
        setAssignments((cur) => cur.map((a) => (a.id === localId ? { ...a, id: created.id } : a)));
      }
    } catch (e) {
      console.warn("Assignment add backend sync skipped:", e);
    }
  };
  const deleteAssignment = async (id: number | string) => {
    setAssignments((cur) => cur.filter((a) => String(a.id) !== String(id)));
    setNotice("تم حذف التعيين بنجاح");
    try {
      await apiFetch(`/api/hr/assignments/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Assignment delete backend sync skipped:", e);
    }
  };

  const upsertAttendance = async (record: Omit<AttendanceRecord, "id">) => {
    const localId = Date.now();
    setAttendance((cur) => {
      const idx = cur.findIndex((a) => a.workerId === record.workerId && a.date === record.date);
      if (idx >= 0) { const copy = [...cur]; copy[idx] = { ...copy[idx], ...record }; return copy; }
      return [...cur, { ...record, id: localId }];
    });
    setNotice("تم تسجيل الحضور بنجاح");
    try {
      await apiFetch("/api/hr/attendance", {
        method: "POST",
        body: JSON.stringify({
          workerId: record.workerId,
          projectId: record.projectId || undefined,
          date: record.date,
          status: attendanceToApi[record.status],
          checkIn: record.checkIn || undefined,
          checkOut: record.checkOut || undefined,
          hours: Number(record.hours) || 0,
          overtimeHours: Number(record.overtimeHours) || 0,
        }),
      });
    } catch (e) {
      console.warn("Attendance backend sync skipped:", e);
    }
  };

  const addPayrollFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const workerId = String(f.get("workerId"));
    if (!workerId) return;
    const baseAmount = Number(f.get("baseAmount")) || 0;
    const overtimeAmount = Number(f.get("overtimeAmount")) || 0;
    const deductions = Number(f.get("deductions")) || 0;
    const period = String(f.get("period") || new Date().toISOString().slice(0, 7));
    const presentDays = Number(f.get("presentDays")) || 0;
    const notes = String(f.get("notes") ?? "");
    const netAmount = baseAmount + overtimeAmount - deductions;

    const localId = nextId(payroll);
    setPayroll((cur) => [...cur, {
      id: localId,
      workerId,
      period,
      presentDays,
      baseAmount,
      overtimeAmount,
      deductions,
      netAmount,
      status: "مسودة",
      notes,
    }]);
    form.reset();
    setNotice("تم إنشاء مسير الراتب بنجاح");

    try {
      const created = await apiFetch("/api/hr/payroll", {
        method: "POST",
        body: JSON.stringify({
          workerId,
          period,
          presentDays,
          baseAmount,
          overtimeAmount,
          deductions,
          netAmount,
          status: "DRAFT",
          notes,
        }),
      });
      if (created && created.id) {
        setPayroll((cur) => cur.map((p) => (p.id === localId ? { ...p, id: created.id } : p)));
      }
    } catch (e) {
      console.warn("Payroll add backend sync skipped:", e);
    }
  };

  const updatePayrollStatus = async (id: number | string, status: PayrollRun["status"]) => {
    setPayroll((cur) => cur.map((p) => (String(p.id) === String(id) ? { ...p, status } : p)));
    setNotice("تم تحديث حالة مسير الراتب بنجاح");
    try {
      await apiFetch(`/api/hr/payroll/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: payrollStatusToApi[status] }),
      });
    } catch (e) {
      console.warn("Payroll status backend sync skipped:", e);
    }
  };

  const deletePayroll = async (id: number | string) => {
    setPayroll((cur) => cur.filter((p) => String(p.id) !== String(id)));
    setNotice("تم حذف المسير بنجاح");
    try {
      await apiFetch(`/api/hr/payroll/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Payroll delete backend sync skipped:", e);
    }
  };

  const addSystemFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const projectId = String(f.get("projectId") ?? "");
    const name = String(f.get("name") ?? "").trim();
    if (!projectId || !name) return;
    const type = String(f.get("type") || "إنذار حريق") as ProjectSystem["type"];
    const status = String(f.get("status") || "تصميم") as ProjectSystem["status"];
    const notes = String(f.get("notes") ?? "");

    const localId = nextId(systems);
    setSystems((cur) => [...cur, { id: localId, projectId, type, name, status, notes }]);
    form.reset();
    setNotice("تمت إضافة النظام بنجاح");

    try {
      const created = await apiFetch(`/api/projects/${projectId}/systems`, {
        method: "POST",
        body: JSON.stringify({ type: systemTypeToApi[type], name, status: systemStatusToApi[status], notes }),
      });
      if (created && created.id) {
        setSystems((cur) => cur.map((s) => (s.id === localId ? { ...s, id: created.id } : s)));
      }
    } catch (e) {
      console.warn("System add backend sync skipped:", e);
    }
  };
  const updateSystemStatus = async (id: number | string, status: ProjectSystem["status"]) => {
    setSystems((cur) => cur.map((s) => (String(s.id) === String(id) ? { ...s, status } : s)));
    setNotice("تم تحديث حالة النظام بنجاح");
    try {
      await apiFetch(`/api/projects/systems/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: systemStatusToApi[status] }),
      });
    } catch (e) {
      console.warn("System status backend sync skipped:", e);
    }
  };
  const deleteSystem = async (id: number | string) => {
    setSystems((cur) => cur.filter((s) => String(s.id) !== String(id)));
    setComponents((cur) => cur.filter((c) => String(c.systemId) !== String(id)));
    setNotice("تم حذف النظام بنجاح");
    try {
      await apiFetch(`/api/projects/systems/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("System delete backend sync skipped:", e);
    }
  };
  const addComponentForSystem = async (systemId: number | string, data: Omit<SystemComponent, "id" | "systemId">) => {
    const localId = nextId(components);
    setComponents((cur) => [...cur, { ...data, id: localId, systemId }]);
    setNotice("تمت إضافة المكوّن بنجاح");
    try {
      const created = await apiFetch(`/api/projects/systems/${systemId}/components`, {
        method: "POST",
        body: JSON.stringify({
          componentType: data.componentType,
          description: data.description,
          manufacturer: data.manufacturer,
          model: data.model,
          quantity: data.quantity,
          unit: data.unit,
          location: data.location,
        }),
      });
      if (created && created.id) {
        setComponents((cur) => cur.map((c) => (c.id === localId ? { ...c, id: created.id } : c)));
      }
    } catch (e) {
      console.warn("Component add backend sync skipped:", e);
    }
  };
  const updateComponentStatus = async (id: number | string, installStatus: SystemComponent["installStatus"]) => {
    setComponents((cur) => cur.map((c) => (String(c.id) === String(id) ? { ...c, installStatus, installDate: installStatus === "تم اختباره" ? new Date().toISOString().slice(0, 10) : c.installDate } : c)));
    try {
      await apiFetch(`/api/projects/components/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ installStatus: compStatusToApi[installStatus] }),
      });
    } catch (e) {
      console.warn("Component status backend sync skipped:", e);
    }
  };
  const deleteComponent = async (id: number | string) => {
    setComponents((cur) => cur.filter((c) => String(c.id) !== String(id)));
    setNotice("تم حذف المكوّن بنجاح");
    try {
      await apiFetch(`/api/projects/components/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Component delete backend sync skipped:", e);
    }
  };

  const addMaintenanceFromForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const clientId = String(f.get("clientId"));
    if (!clientId) return;
    const contractNumber = String(f.get("contractNumber") || `MNT-${Date.now().toString().slice(-6)}`);
    const projectId = f.get("projectId") ? String(f.get("projectId")) : null;
    const value = Number(f.get("value")) || 0;
    const currency = String(f.get("currency") || "SAR");
    const startDate = String(f.get("startDate") || new Date().toISOString().slice(0, 10));
    const endDate = String(f.get("endDate") || new Date().toISOString().slice(0, 10));
    const frequency = String(f.get("frequency") || "ربع سنوي") as MaintenanceContract["frequency"];
    const notes = String(f.get("notes") ?? "");

    try {
      const created = await apiFetch("/api/maintenance/contracts", {
        method: "POST",
        body: JSON.stringify({
          contractNumber,
          clientId,
          projectId,
          value,
          currency,
          startDate,
          endDate,
          frequency: maintenanceFrequencyToApi[frequency],
          status: "ACTIVE",
          notes,
        }),
      });
      setMaintenanceContracts((cur) => [...cur, {
        id: created.id,
        contractNumber,
        clientId,
        projectId,
        value,
        currency,
        startDate,
        endDate,
        frequency,
        status: "نشط",
        notes,
      }]);
      form.reset();
      setNotice("تم إنشاء عقد الصيانة");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر إنشاء عقد الصيانة");
    }
  };

  const updateMaintenanceStatus = async (id: number | string, status: MaintenanceContract["status"]) => {
    try {
      await apiFetch(`/api/maintenance/contracts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: maintenanceContractStatusToApi[status] }),
      });
      setMaintenanceContracts((cur) => cur.map((c) => (c.id === id ? { ...c, status } : c)));
      setNotice("تم تحديث حالة عقد الصيانة");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر تحديث حالة عقد الصيانة");
    }
  };

  const deleteMaintenance = async (id: number | string) => {
    try {
      await apiFetch(`/api/maintenance/contracts/${id}`, { method: "DELETE" });
      setMaintenanceContracts((cur) => cur.filter((c) => c.id !== id));
      setMaintenanceVisits((cur) => cur.filter((v) => v.contractId !== id));
      setNotice("تم حذف عقد الصيانة");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر حذف عقد الصيانة");
    }
  };

  const addVisitForContract = async (contractId: number | string, scheduledDate: string) => {
    try {
      const created = await apiFetch("/api/maintenance/visits", {
        method: "POST",
        body: JSON.stringify({
          contractId,
          scheduledDate,
          status: "SCHEDULED",
        }),
      });
      setMaintenanceVisits((cur) => [...cur, {
        id: created.id,
        contractId,
        scheduledDate,
        completedDate: "",
        status: "مجدولة",
        performedBy: "",
        notes: "",
      }]);
      setNotice("تمت جدولة الزيارة");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر جدولة الزيارة");
    }
  };

  const completeVisit = async (id: number | string, performedBy: string) => {
    try {
      await apiFetch(`/api/maintenance/visits/${id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
          performedBy,
          completedDate: new Date().toISOString().slice(0, 10),
        }),
      });
      setMaintenanceVisits((cur) => cur.map((v) => (v.id === id ? { ...v, status: "تمت" as const, completedDate: new Date().toISOString().slice(0, 10), performedBy } : v)));
      setNotice("تم إتمام الزيارة بنجاح");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر إتمام الزيارة");
    }
  };

  const deleteVisit = async (id: number | string) => {
    try {
      await apiFetch(`/api/maintenance/visits/${id}`, { method: "DELETE" });
      setMaintenanceVisits((cur) => cur.filter((v) => v.id !== id));
      setNotice("تم حذف الزيارة");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر حذف الزيارة");
    }
  };

  const addInvoice = async (projectId: string | number, number: string, amount: number, status: string, dueDate?: string) => {
    const tempId = "inv_" + Date.now();
    const newInv: Invoice = {
      id: tempId,
      projectId,
      number,
      amount,
      status: status as Invoice["status"],
      date: new Date().toISOString().slice(0, 10),
    };
    setInvoices((cur) => [...cur, newInv]);

    try {
      const created = await apiFetch("/api/finance/invoices", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectId && String(projectId).trim() !== "" ? String(projectId) : undefined,
          number,
          amount,
          status: invoiceStatusToApi[status as Invoice["status"]] || "PARTIAL",
          dueDate,
        }),
      });
      if (created && created.id) {
        setInvoices((cur) => cur.map((inv) => (inv.id === tempId ? { ...inv, id: created.id } : inv)));
      }
      setNotice("تمت إضافة الفاتورة وحفظها على السيرفر");
    } catch (e) {
      setInvoices((cur) => cur.filter((inv) => inv.id !== tempId));
      triggerAlert("لم يتم حفظ الفاتورة على السيرفر: " + (e as Error).message);
    }
  };

  const deleteInvoice = async (id: number | string) => {
    const removed = invoices.find((inv) => inv.id === id);
    setInvoices((cur) => cur.filter((inv) => inv.id !== id));
    try {
      await apiFetch(`/api/finance/invoices/${id}`, { method: "DELETE" });
      setNotice("تم حذف الفاتورة من السيرفر");
    } catch (e) {
      if (removed) setInvoices((cur) => [...cur, removed]);
      triggerAlert("لم يتم حذف الفاتورة من السيرفر: " + (e as Error).message);
    }
  };

  const addExpense = async (projectId: string | number | null, type: string, amount: number, description: string, date: string) => {
    const tempId = "exp_" + Date.now();
    const newExp: Expense = {
      id: tempId,
      projectId,
      type,
      amount,
      description,
      date,
    };
    setExpenses((cur) => [...cur, newExp]);

    try {
      const created = await apiFetch("/api/finance/expenses", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectId ? String(projectId) : null,
          type,
          amount,
          description,
          date,
        }),
      });
      if (created && created.id) {
        setExpenses((cur) => cur.map((exp) => (exp.id === tempId ? { ...exp, id: created.id } : exp)));
      }
      setNotice("تمت إضافة المصروف وحفظه على السيرفر");
    } catch (e) {
      setExpenses((cur) => cur.filter((exp) => exp.id !== tempId));
      triggerAlert("لم يتم حفظ المصروف على السيرفر: " + (e as Error).message);
    }
  };

  const deleteExpense = async (id: number | string) => {
    try {
      await apiFetch(`/api/finance/expenses/${id}`, { method: "DELETE" });
      setExpenses((cur) => cur.filter((exp) => exp.id !== id));
      setNotice("تم حذف المصروف");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر حذف المصروف");
    }
  };

  const canModify = (section: Section) => {
    if (isAdmin) return true;
    if (section === "dailyReports") return canAccess("dailyReports");
    return user.permissions?.[section] === "edit";
  };

  const renderSection = () => {
    const isReadOnly = !canModify(activeSection);
    const element = (() => {
      switch (activeSection) {
      case "clients":
        return <ClientsView clients={filteredClients} projects={projects} addClient={addClientFromForm} deleteClient={deleteClient} updateClient={updateClient} onCsvImport={(t: string) => handleCsvImport("clients", t)} />;
      case "contractors":
        return <ContractorsView contractors={filteredContractors} projects={projects} addContractor={addContractorFromForm} deleteContractor={deleteContractor} updateContractor={updateContractor} />;
      case "projects":
        return (
          <ProjectsView
            projects={filteredProjects}
            clients={clients}
            stages={stages}
            addProject={addProjectFromForm}
            deleteProject={deleteProject}
            updateProject={async (p: Project) => {
              try {
                const updated = await apiFetch(`/api/projects/${p.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    name: p.name,
                    type: p.type,
                    address: p.address,
                    startDate: p.startDate,
                    endDate: p.endDate,
                    status: p.status,
                    engineer: p.engineer,
                    budget: Number(p.budget) || 0,
                    progress: Number(p.progress) || 0,
                  }),
                });
                setProjects((cur) => cur.map((x) => String(x.id) === String(p.id) ? { ...x, ...updated, startDate: updated.startDate ? updated.startDate.split("T")[0] : x.startDate, endDate: updated.endDate ? updated.endDate.split("T")[0] : x.endDate } : x));
                setNotice("تم تحديث المشروع");
              } catch (e) {
                setNotice("خطأ أثناء تحديث المشروع: " + (e as Error).message);
              }
            }}
            setSelectedProjectId={setSelectedProjectId}
            setActiveSection={setActiveSection}
            isAdmin={isAdmin}
            isPMOrAdmin={isPMOrAdmin}
          />
        );
      case "projectDetail":
        return (
          <ProjectDetailView
            project={selectedProject}
            client={clientsById.get(selectedProject?.clientId ?? -1)}
            stages={stages.filter((s) => s.projectId === selectedProject?.id)}
            systems={systems.filter((s) => s.projectId === selectedProject?.id)}
            deficiencies={deficiencies.filter((d) => d.projectId === selectedProject?.id)}
            assignments={assignments.filter((a) => a.projectId === selectedProject?.id)}
            workers={workers}
            teams={teams}
            onBack={() => setActiveSection("projects")}
            downloadReportPdf={downloadProjectReportPdf}
            downloadReportExcel={downloadProjectReportExcel}
          />
        );
      case "stages":
        return <StagesView projects={filteredProjects} stages={roleFilteredStages} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} addStage={addStageFromForm} updateStageStatus={updateStageStatus} updateStageNotes={updateStageNotes} deleteStage={deleteStage} isAdmin={isAdmin} />;
      case "systems":
        return <SystemsView systems={roleFilteredSystems} components={components} projects={filteredProjects} addSystem={addSystemFromForm} updateSystemStatus={updateSystemStatus} deleteSystem={deleteSystem} addComponent={addComponentForSystem} updateComponentStatus={updateComponentStatus} deleteComponent={deleteComponent} isAdmin={isAdmin} />;
      case "deficiencies":
        return <DeficienciesView deficiencies={roleFilteredDeficiencies} projects={filteredProjects} engineers={engineers} addDeficiency={addDeficiencyFromForm} updateDeficiencyStatus={updateDeficiencyStatus} deleteDeficiency={deleteDeficiency} isAdmin={isAdmin} isSiteEngineer={isSiteEngineer} />;
      case "dailyReports":
        return <DailyReportsView projects={filteredProjects} />;
      case "supplyOrders":
        return <SupplyOrdersView projects={filteredProjects} quotations={quotations} canCreate={isAdmin || isPMOrAdmin || user.role === "محاسب" || user.role?.toUpperCase() === "PROCUREMENT"} />;
      case "workers":
        return <WorkersView workers={roleFilteredWorkers} projects={filteredProjects} addWorker={addWorkerFromForm} deleteWorker={deleteWorker} updateWorker={updateWorker} />;
      case "inventory":
        return (
          <InventoryView
            inventory={inventory}
            projects={projects}
            addInventoryItem={addInventoryItemFromForm}
            deleteInventoryItem={deleteInventoryItem}
            updateInventoryItem={updateInventoryItem}
            issueInventory={issueInventory}
            stamp={site.stamp ?? ""}
            signature={site.signature ?? ""}
            onCsvImport={(t: string) => handleCsvImport("inventory", t)}
            onExportExcel={exportInventoryExcel}
            site={site}
          />
        );
      case "finance":
        return (
          <FinanceView
            invoices={filteredInvoices}
            expenses={expenses}
            projects={projects}
            clients={clients}
            totals={totals}
            addInvoice={addInvoice}
            deleteInvoice={deleteInvoice}
            addExpense={addExpense}
            deleteExpense={deleteExpense}
            onPrintInvoice={setActiveInvoice}
          />
        );
      case "contracts":
        return (
          <ContractsView
            contracts={contracts}
            projects={projects}
            clients={clients}
            defaultPayments={site.payments ?? []}
            stamp={site.stamp ?? ""}
            signature={site.signature ?? ""}
            setContractPayments={setContractPayments}
            addContract={addContractFromForm}
            deleteContract={deleteContract}
            updateContract={updateContract}
            onCsvImport={(t: string) => handleCsvImport("contracts", t)}
            site={site}
            onSelectClaim={(term, contract) => {
              setActiveClaimTerm(term);
              setActiveClaimContract(contract);
            }}
          />
        );
      case "quotations":
        return (
          <QuotationsView
            quotations={filteredQuotations}
            clients={filteredClients}
            inventory={inventory}
            addQuotation={addQuotation}
            deleteQuotation={deleteQuotation}
            updateStatus={updateQuotationStatus}
            updateQuotation={updateQuotationDetails}
            stamp={site.stamp ?? ""}
            signature={site.signature ?? ""}
            onCsvImport={(t: string) => handleCsvImport("quotations", t)}
            downloadPdf={downloadQuotationPdf}
            downloadExcel={downloadQuotationExcel}
            isPMOrAdmin={isPMOrAdmin}
            site={site}
          />
        );
      case "reports":
        return (
          <ReportsView
            projects={projects}
            clients={clients}
            workers={workers}
            inventory={inventory}
            invoices={filteredInvoices}
            expenses={expenses}
            attendance={attendance}
            downloadReportPdf={downloadProjectReportPdf}
            downloadReportExcel={downloadProjectReportExcel}
          />
        );
      case "maintenance":
        return <MaintenanceView contracts={maintenanceContracts} visits={maintenanceVisits} clients={clients} projects={projects} addContract={addMaintenanceFromForm} updateContractStatus={updateMaintenanceStatus} deleteContract={deleteMaintenance} addVisit={addVisitForContract} completeVisit={completeVisit} deleteVisit={deleteVisit} />;
      case "teams":
        return <TeamsView teams={teams} assignments={assignments} projects={projects} workers={workers} contractors={contractors} addTeam={addTeamFromForm} deleteTeam={deleteTeam} addAssignment={addAssignmentFromForm} deleteAssignment={deleteAssignment} />;
      case "attendance":
        return <AttendanceView attendance={roleFilteredAttendance} workers={roleFilteredWorkers} projects={filteredProjects} upsertAttendance={upsertAttendance} />;
      case "leaves":
        return <LeavesView leaves={leaves} workers={workers} addLeave={addLeaveFromForm} updateLeaveStatus={updateLeaveStatus} deleteLeave={deleteLeave} />;
      case "payroll":
        return <PayrollView payroll={payroll} workers={workers} addPayroll={addPayrollFromForm} updatePayrollStatus={updatePayrollStatus} deletePayroll={deletePayroll} />;
      case "showcase":
        return <ShowcaseView showcase={showcase} addShowcase={addShowcaseItem} deleteShowcase={deleteShowcaseItem} />;
      case "site":
        return <SiteContentView stats={site.stats} updateStat={updateStat} addStat={addStat} deleteStat={deleteStat} site={site} updateSiteField={updateSiteField} />;
      case "config":
        return <CompanySettingsView stamp={site.stamp ?? ""} setStamp={setStamp} signature={site.signature ?? ""} setSignature={setSignature} payments={site.payments ?? []} updatePayment={updateDefaultPayment} addPayment={addDefaultPayment} deletePayment={deleteDefaultPayment} clients={clients} updateClientPayment={updateClientPayment} addClientPayment={addClientPayment} deleteClientPayment={deleteClientPayment} site={site} updateSiteField={updateSiteField} />;
      case "alerts":
        return <AlertsView alerts={visibleAlerts} onResolve={resolveAlert} goToSection={setActiveSection} />;
      case "settings":
        return <StaffView staff={staff} addStaff={addStaffMember} deleteStaff={deleteStaffMember} updateStaff={updateStaffMember} />;
      default:
        return (
          <DashboardView
            totals={totals}
            projects={projects}
            clients={clients}
            stages={stages}
            workers={workers}
            alerts={visibleAlerts}
            invoices={filteredInvoices}
            expenses={expenses}
            deficiencies={deficiencies}
            systems={systems}
            quotations={quotations}
            contracts={contracts}
            inventory={inventory}
            attendance={attendance}
            leaves={leaves}
            maintenanceContracts={maintenanceContracts}
            maintenanceVisits={maintenanceVisits}
            setActiveSection={setActiveSection}
          />
        );
    }
    })();
    return <div className={isReadOnly ? "view-only-mode" : ""}>{element}</div>;
  };
  const currentLabel = navItems.find((i) => i.id === activeSection)?.label ?? (activeSection === "projectDetail" ? "تفاصيل المشروع" : "");
  
  const showProjectsGroup = ["stages", "systems", "deficiencies", "workers", "teams", "maintenance"].some(id => canAccess(id as Section));
  const showEmployeesGroup = ["settings", "attendance", "leaves", "payroll"].some(id => canAccess(id as Section));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/kenan-logo.png" alt="KENAN" />
        </div>
        <nav className="nav-list" aria-label="التنقل الرئيسي" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Dashboard */}
          {canAccess("dashboard") && (
            <button className={activeSection === "dashboard" ? "active" : ""} onClick={() => setActiveSection("dashboard")} title="لوحة التحكم">
              <BarChart3 size={19} />
              <span>لوحة التحكم</span>
            </button>
          )}

          {/* Clients */}
          {canAccess("clients") && (
            <button className={activeSection === "clients" ? "active" : ""} onClick={() => setActiveSection("clients")} title="العملاء">
              <Users size={19} />
              <span>العملاء</span>
            </button>
          )}

          {/* Quotations */}
          {canAccess("quotations") && (
            <button className={activeSection === "quotations" ? "active" : ""} onClick={() => setActiveSection("quotations")} title="عروض الأسعار">
              <ReceiptText size={19} />
              <span>عروض الأسعار</span>
            </button>
          )}

          {/* Contracts */}
          {canAccess("contracts") && (
            <button className={activeSection === "contracts" ? "active" : ""} onClick={() => setActiveSection("contracts")} title="العقود">
              <FileText size={19} />
              <span>العقود</span>
            </button>
          )}

          {/* Projects Group */}
          {showProjectsGroup && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button 
                className={`nav-group-header ${projectsMenuOpen ? "open" : ""}`}
                onClick={() => setProjectsMenuOpen(!projectsMenuOpen)}
                title="المشاريع"
                style={{ width: "100%", color: "#dbe4f0", background: "none", border: 0, justifyContent: "space-between", alignItems: "center", display: "flex", minHeight: "44px", padding: "9px 12px", borderRadius: "var(--radius)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Building2 size={19} />
                  <span>المشاريع</span>
                </div>
                <ChevronDown size={14} className={`chevron-arrow ${projectsMenuOpen ? "rotate-180" : ""}`} style={{ transition: "transform 0.2s ease", transform: projectsMenuOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {projectsMenuOpen && (
                <div className="nav-sub-list" style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", marginRight: "14px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", paddingRight: "8px" }}>
                  {canAccess("projects") && (
                    <button className={activeSection === "projects" ? "active" : ""} onClick={() => setActiveSection("projects")} title="المشاريع والمواقع" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "projects" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <Building2 size={16} />
                      <span>المشاريع والمواقع</span>
                    </button>
                  )}
                  {canAccess("stages") && (
                    <button className={activeSection === "stages" ? "active" : ""} onClick={() => setActiveSection("stages")} title="التنفيذ" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "stages" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <Layers3 size={16} />
                      <span>التنفيذ</span>
                    </button>
                  )}
                  {canAccess("systems") && (
                    <button className={activeSection === "systems" ? "active" : ""} onClick={() => setActiveSection("systems")} title="الأنظمة الفنية" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "systems" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <Gauge size={16} />
                      <span>الأنظمة الفنية</span>
                    </button>
                  )}
                  {canAccess("deficiencies") && (
                    <button className={activeSection === "deficiencies" ? "active" : ""} onClick={() => setActiveSection("deficiencies")} title="نواقص المواقع" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "deficiencies" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <OctagonAlert size={16} />
                      <span>نواقص المواقع</span>
                    </button>
                  )}
                  {canAccess("dailyReports") && (
                    <button className={activeSection === "dailyReports" ? "active" : ""} onClick={() => setActiveSection("dailyReports")} title="تقرير اليوم الموحد" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "dailyReports" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <ClipboardList size={16} />
                      <span>تقرير اليوم الموحد</span>
                    </button>
                  )}
                  {canAccess("supplyOrders") && (
                    <button className={activeSection === "supplyOrders" ? "active" : ""} onClick={() => setActiveSection("supplyOrders")} title="استلام التوريد" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "supplyOrders" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <Truck size={16} />
                      <span>استلام التوريد</span>
                    </button>
                  )}
                  {canAccess("workers") && (
                    <button className={activeSection === "workers" ? "active" : ""} onClick={() => setActiveSection("workers")} title="العمال" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "workers" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <HardHat size={16} />
                      <span>العمال</span>
                    </button>
                  )}
                  {canAccess("teams") && (
                    <button className={activeSection === "teams" ? "active" : ""} onClick={() => setActiveSection("teams")} title="فرق العمل" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "teams" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <UsersRound size={16} />
                      <span>فرق العمل</span>
                    </button>
                  )}
                  {canAccess("maintenance") && (
                    <button className={activeSection === "maintenance" ? "active" : ""} onClick={() => setActiveSection("maintenance")} title="عقود الصيانة" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "maintenance" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <Wrench size={16} />
                      <span>عقود الصيانة</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Employees Group */}
          {showEmployeesGroup && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button 
                className={`nav-group-header ${employeesMenuOpen ? "open" : ""}`}
                onClick={() => setEmployeesMenuOpen(!employeesMenuOpen)}
                title="الموظفين"
                style={{ width: "100%", color: "#dbe4f0", background: "none", border: 0, justifyContent: "space-between", alignItems: "center", display: "flex", minHeight: "44px", padding: "9px 12px", borderRadius: "var(--radius)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <UserCog size={19} />
                  <span>الموظفين</span>
                </div>
                <ChevronDown size={14} className={`chevron-arrow ${employeesMenuOpen ? "rotate-180" : ""}`} style={{ transition: "transform 0.2s ease", transform: employeesMenuOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {employeesMenuOpen && (
                <div className="nav-sub-list" style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", marginRight: "14px", borderRight: "1px solid rgba(255, 255, 255, 0.15)", paddingRight: "8px" }}>
                  {canAccess("settings") && (
                    <button className={activeSection === "settings" ? "active" : ""} onClick={() => setActiveSection("settings")} title="إدارة الموظفين" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "settings" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <UserCog size={16} />
                      <span>إدارة الموظفين</span>
                    </button>
                  )}
                  {canAccess("attendance") && (
                    <button className={activeSection === "attendance" ? "active" : ""} onClick={() => setActiveSection("attendance")} title="الحضور والغياب" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "attendance" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <CalendarCheck size={16} />
                      <span>الحضور والغياب</span>
                    </button>
                  )}
                  {canAccess("leaves") && (
                    <button className={activeSection === "leaves" ? "active" : ""} onClick={() => setActiveSection("leaves")} title="الإجازات" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "leaves" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <CalendarOff size={16} />
                      <span>الإجازات</span>
                    </button>
                  )}
                  {canAccess("payroll") && (
                    <button className={activeSection === "payroll" ? "active" : ""} onClick={() => setActiveSection("payroll")} title="الرواتب" style={{ fontSize: "0.88rem", minHeight: "38px", padding: "6px 12px", width: "100%", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--radius)", background: activeSection === "payroll" ? "var(--brand)" : "none", color: "#fff", border: 0, cursor: "pointer" }}>
                      <WalletCards size={16} />
                      <span>الرواتب</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {canAccess("inventory") && (
            <button className={activeSection === "inventory" ? "active" : ""} onClick={() => setActiveSection("inventory")} title="المخزن والمواد">
              <Warehouse size={19} />
              <span>المخزن والمواد</span>
            </button>
          )}

          {/* Accounts */}
          {canAccess("finance") && (
            <button className={activeSection === "finance" ? "active" : ""} onClick={() => setActiveSection("finance")} title="الحسابات والدفعات المالية">
              <WalletCards size={19} />
              <span>الحسابات والدفعات</span>
            </button>
          )}

          {/* Reports */}
          {canAccess("reports") && (
            <button className={activeSection === "reports" ? "active" : ""} onClick={() => setActiveSection("reports")} title="التقارير">
              <BarChart3 size={19} />
              <span>التقارير</span>
            </button>
          )}

          {/* Showcase */}
          {canAccess("showcase") && (
            <button className={activeSection === "showcase" ? "active" : ""} onClick={() => setActiveSection("showcase")} title="عملاؤنا">
              <Images size={19} />
              <span>عملاؤنا</span>
            </button>
          )}

          {/* Site */}
          {canAccess("site") && (
            <button className={activeSection === "site" ? "active" : ""} onClick={() => setActiveSection("site")} title="محتوى الموقع">
              <Globe size={19} />
              <span>محتوى الموقع</span>
            </button>
          )}

          {/* General Config */}
          {canAccess("config") && (
            <button className={activeSection === "config" ? "active" : ""} onClick={() => setActiveSection("config")} title="الإعدادات">
              <Settings size={19} />
              <span>الإعدادات</span>
            </button>
          )}

          {/* Alerts */}
          {canAccess("alerts") && (
            <button className={activeSection === "alerts" ? "active" : ""} onClick={() => setActiveSection("alerts")} title="التنبيهات">
              <Bell size={19} />
              <span>التنبيهات</span>
            </button>
          )}
        </nav>
        <button className="logout-button" title="تسجيل الخروج" onClick={onLogout}>
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-right">
            <div className="topbar-logo-wrap">
              <img src="/kenan-logo.png" alt="شعار كنان" />
              <h2>كنان</h2>
            </div>
            <div className="topbar-section-title">
              <p className="topbar-eyebrow">نظام إدارة التشطيبات والتركيبات</p>
              <h1>{currentLabel}</h1>
            </div>
          </div>

          <div className="topbar-left">
            {/* Search Bar */}
            <div className="topbar-search">
              <MIcon name="search" size={18} />
              <input 
                type="text" 
                placeholder="بحث سريع في النظام..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            {canAccess("alerts") && (
              <button 
                type="button"
                className={`topbar-bell-btn ${activeSection === "alerts" ? "active" : ""}`}
                onClick={() => setActiveSection("alerts")}
                title="التنبيهات"
              >
                <MIcon name="notifications" size={20} />
                {visibleAlerts.length > 0 && (
                  <span className="topbar-bell-badge">{visibleAlerts.length}</span>
                )}
              </button>
            )}

            {/* User Dropdown */}
            <div className={`topbar-user ${isUserDropdownOpen ? "open" : ""}`}>
              <button 
                type="button"
                className="topbar-user-trigger" 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                title={user.email}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name ?? ""} />
                ) : (
                  <div className="user-avatar-placeholder">
                    <MIcon name="person" size={18} />
                  </div>
                )}
                <span>{user.name ?? user.email}</span>
                <MIcon name="keyboard_arrow_down" size={18} className="user-caret" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div 
                    style={{ position: "fixed", inset: 0, zIndex: 999 }} 
                    onClick={() => setIsUserDropdownOpen(false)} 
                  />
                  <div className="topbar-user-dropdown" style={{ zIndex: 1000 }}>
                    <div className="topbar-user-info-header">
                      <strong>{user.name ?? user.email}</strong>
                      <small>{isAdmin ? "مدير النظام (أدمن)" : "موظف"}</small>
                    </div>
                    <a 
                      href="/" 
                      className="topbar-user-dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsUserDropdownOpen(false);
                        window.location.href = "/";
                      }}
                    >
                      <MIcon name="language" size={16} />
                      <span>عرض الموقع العام</span>
                    </a>
                    <button 
                      type="button" 
                      className="topbar-user-dropdown-item logout"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <MIcon name="logout" size={16} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {renderSection()}

        {showRawToast && notice && !notice.includes("Failed to fetch") && !notice.includes("fetch") && (
          <div className="toast">{notice}</div>
        )}
      </main>

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--brand)", marginBottom: "16px" }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>تأكيد العملية</h3>
            </div>
            <p style={{ color: "var(--navy)", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 24px" }}>{confirmModal.message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                className="secondary-button" 
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                style={{ padding: "0 20px", minHeight: "40px", cursor: "pointer" }}
              >
                إلغاء
              </button>
              <button 
                className="primary-button" 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, open: false }));
                }}
                style={{ padding: "0 20px", minHeight: "40px", background: "var(--brand)", color: "#fff", border: 0, cursor: "pointer" }}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "var(--shadow-lg)", direction: "rtl", animation: "tab-fade-in 0.2s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--blue)", marginBottom: "16px" }}>
              <Bell size={24} />
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>تنبيه</h3>
            </div>
            <p style={{ color: "var(--navy)", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 24px" }}>{alertModal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                className="primary-button" 
                onClick={() => setAlertModal({ open: false, message: "" })}
                style={{ padding: "0 24px", minHeight: "40px", cursor: "pointer" }}
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}

      {activeClaimTerm && activeClaimContract && (
        <div className="contract-modal claim-modal-active" role="dialog" aria-modal="true" onClick={() => { setActiveClaimTerm(null); setActiveClaimContract(null); }}>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .claim-modal-active, .claim-modal-active * { visibility: visible !important; }
              .claim-modal-active { position: absolute !important; inset: 0 !important; width: 100% !important; background: #ffffff !important; z-index: 999999 !important; padding: 0 !important; margin: 0 !important; }
              .contract-modal-toolbar, .contract-modal-close { display: none !important; }
            }
          `}</style>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "800px" }}>
            <div className="contract-modal-toolbar">
              <button className="primary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة المطالبة
              </button>
              <button className="contract-modal-close" onClick={() => { setActiveClaimTerm(null); setActiveClaimContract(null); }} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            {(() => {
              const project = projects.find((p) => String(p.id) === String(activeClaimContract.projectId));
              return (
                <ClaimDocument
                  contract={activeClaimContract}
                  project={project}
                  client={project ? clients.find((c) => String(c.id) === String(project.clientId)) : undefined}
                  paymentTerm={activeClaimTerm}
                  stamp={site.stamp ?? ""}
                  signature={site.signature ?? ""}
                  site={site}
                />
              );
            })()}
          </div>
        </div>
      )}

      {activeInvoice && (
        <div className="contract-modal claim-modal-active" role="dialog" aria-modal="true" onClick={() => setActiveInvoice(null)}>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .claim-modal-active, .claim-modal-active * { visibility: visible !important; }
              .claim-modal-active { position: absolute !important; inset: 0 !important; width: 100% !important; background: #ffffff !important; z-index: 999999 !important; padding: 0 !important; margin: 0 !important; }
              .contract-modal-toolbar, .contract-modal-close { display: none !important; }
            }
          `}</style>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "800px" }}>
            <div className="contract-modal-toolbar">
              <button className="primary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة الفاتورة
              </button>
              <button className="contract-modal-close" onClick={() => setActiveInvoice(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            {(() => {
              const project = projects.find((p) => String(p.id) === String(activeInvoice.projectId));
              // العميل من الفاتورة إن رُبط بها، وإلا من مشروعها
              const client =
                clients.find((c) => String(c.id) === String(activeInvoice.clientId)) ??
                (project ? clients.find((c) => String(c.id) === String(project.clientId)) : undefined);
              return (
                <InvoiceDocument
                  invoice={activeInvoice}
                  project={project}
                  client={client}
                  site={site}
                  stamp={site.stamp ?? ""}
                  signature={site.signature ?? ""}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}