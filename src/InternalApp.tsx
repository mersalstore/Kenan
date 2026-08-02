import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  Camera,
  CheckCircle2,
  ClipboardList,
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
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState, useEffect, useRef, type ReactNode } from "react";
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
} from "./types";

function DispatchVoucher({
  voucher,
  stamp,
  signature,
}: {
  voucher: { items: { name: string; unit: string; quantity: number; purchasePrice: number }[]; project: Project | null; date: string; ref: string };
  stamp: string;
  signature: string;
}) {
  const total = voucher.items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.purchasePrice) || 0), 0);
  return (
    <div className="dispatch-voucher">
      <header className="dispatch-voucher-header">
        <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 800, color: "var(--navy)" }}>مؤسسة كنان لأنظمة الأمن والسلامة</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>س.ت: 7050404537 — الرقم الضريبي: 313072607300003</div>
        </div>
      </header>

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
        <span>مؤسسة كنان لأنظمة الأمن والسلامة — الرياض</span>
        <span>صفحة مطبوعة من نظام KENAN</span>
      </div>
    </div>
  );
}

function InventoryView({
  inventory, projects, addInventoryItem, deleteInventoryItem, updateInventoryItem, issueInventory, stamp, signature, onCsvImport,
}: { inventory: InventoryItem[]; projects: Project[]; addInventoryItem: (e: FormEvent<HTMLFormElement>) => void; deleteInventoryItem: (id: number) => void; updateInventoryItem: (u: InventoryItem) => void; issueInventory: (e: FormEvent<HTMLFormElement>) => void; stamp: string; signature: string; onCsvImport: (t: string) => void; }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editSupplier, setEditSupplier] = useState("");
  const [editMinQty, setEditMinQty] = useState(0);
  const [editBrand, setEditBrand] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
  const toggleSelect = (id: number) => { setSelectedIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])); };
  const deleteSelected = () => { if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} أصناف من المخزن؟`)) { selectedIds.forEach((id) => deleteInventoryItem(id)); setSelectedIds([]); } };
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
          <Field label="العلامة التجارية / الوصف (مثل: TOSY، ALMONIF)" name="brand" />
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
                    <td><div style={{ display: "flex", gap: "6px", alignItems: "center" }}>{isEditing ? (<><button type="button" className="primary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => saveEdit(item)}>حفظ</button><button type="button" className="secondary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setEditingId(null)}>إلغاء</button></>) : (<><button type="button" className="secondary-button" style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.76rem" }} onClick={() => startEdit(item)}>تعديل</button><button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => { if (window.confirm("هل أنت متأكد من حذف هذا الصنف من المخزن؟")) deleteInventoryItem(item.id); }} title="حذف"><Trash2 size={16} /></button></>)}</div></td>
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
            <DispatchVoucher voucher={dispatchVoucher} stamp={stamp} signature={signature} />
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
}: {
  invoices: Invoice[];
  expenses: Expense[];
  projects: Project[];
  clients: Client[];
  totals: { revenue: number; expenseTotal: number; profit: number };
}) {
  type FinanceRow = {
    kind: "invoice" | "expense";
    id: number;
    label: string;
    projectId: number;
    amount: number;
    status: string;
    date: string;
    description: string;
  };

  // دمج الفواتير والمصروفات في جدول حركات واحد، مرتّب بالأحدث.
  const rows: FinanceRow[] = [
    ...invoices.map((inv) => ({ kind: "invoice" as const, id: inv.id, label: inv.number, projectId: inv.projectId, amount: inv.amount, status: inv.status, date: inv.date, description: "" })),
    ...expenses.map((exp) => ({ kind: "expense" as const, id: exp.id, label: exp.type, projectId: exp.projectId, amount: exp.amount, status: exp.type, date: exp.date, description: exp.description })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const [active, setActive] = useState<{ kind: "invoice" | "expense"; id: number } | null>(null);
  const activeRow = active ? rows.find((r) => r.kind === active.kind && r.id === active.id) ?? null : null;
  const projectName = (id: number) => projects.find((p) => p.id === id)?.name ?? "—";
  const clientName = (projectId: number) => {
    const p = projects.find((x) => x.id === projectId);
    return p ? clients.find((c) => c.id === p.clientId)?.name ?? "—" : "—";
  };

  return (
    <section className="section-stack">
      <div className="dashboard-grid three">
        <MiniStat title="إجمالي الإيرادات" value={currency.format(totals.revenue)} icon={ReceiptText} />
        <MiniStat title="إجمالي المصروفات" value={currency.format(totals.expenseTotal)} icon={WalletCards} />
        <MiniStat title="صافي الربح" value={currency.format(totals.profit)} icon={Gauge} />
      </div>

      {activeRow && (
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <SectionTitle icon={activeRow.kind === "invoice" ? ReceiptText : WalletCards} title={activeRow.kind === "invoice" ? "تفاصيل الفاتورة" : "تفاصيل المصروف"} />
            <button type="button" className="secondary-button" onClick={() => setActive(null)}><X size={15} /> إغلاق</button>
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
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
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
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} عقود؟`)) {
      selectedIds.forEach((id) => deleteContract(id));
      setSelectedIds([]);
    }
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
                  <button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => { if (window.confirm("هل أنت متأكد من حذف هذا العقد؟")) deleteContract(contract.id); }} title="حذف">
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
            <div className="contract-modal-toolbar">
              <button className="primary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة العقد
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
                    <button type="button" className="icon-danger" title="حذف" onClick={() => removeContractPayment(term.id)}>
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

function ContractDocument({
  contract,
  project,
  client,
  payments,
  stamp,
  signature,
}: {
  contract: Contract;
  project?: Project;
  client?: Client;
  payments: PaymentTerm[];
  stamp: string;
  signature: string;
}) {
  const contractCurrency = contract.currency || "SAR";
  const currencyUnit = (currencyWords[contractCurrency] ?? currencyWords.SAR).unit;
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

  const HeaderWave = () => (
    <div className="page-header-wave">
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Navy Blue Base Swoosh Curve */}
        <path d="M 210,0 C 440,82 730,118 1000,92 L 1000,0 Z" fill="#141b34" />
        {/* White Separator Ribbon */}
        <path d="M 250,0 C 470,72 750,102 1000,76 L 1000,0 Z" fill="#ffffff" />
        {/* Main Crimson Red Wave Ribbon */}
        <path d="M 280,0 C 490,64 770,90 1000,64 L 1000,0 Z" fill="#d91c24" />
        {/* Navy Accent Line */}
        <path d="M 360,0 C 540,44 790,56 1000,34 L 1000,0 Z" fill="#141b34" />
        {/* White Separator Line */}
        <path d="M 410,0 C 590,32 810,40 1000,20 L 1000,0 Z" fill="#ffffff" />
        {/* Topmost Red Stripe */}
        <path d="M 470,0 C 630,22 830,24 1000,10 L 1000,0 Z" fill="#d91c24" />
      </svg>
    </div>
  );

  return (
    <div className="contract-doc">
      {/* ==================== PAGE 1 ==================== */}
      <div className="contract-page">
        <header className="contract-page-header">
          <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
          <HeaderWave />
        </header>
 
        <h2 className="contract-page-title">عقد الاتفاق</h2>
        <p className="contract-intro-p">
          بعون الله تعالى تم الاتفاق في مدينة الرياض يوم {dayName} بتاريخ {formattedStartDate}م بين كل من:
        </p>

        <div className="contract-parties-box">
          <div className="party-card">
            <h4>الطرف الأول (المقاول):</h4>
            <ul className="party-details">
              <li><strong>الاسم:</strong> مؤسسة كنان لأنظمة الأمن والسلامة</li>
              <li><strong>السجل التجاري:</strong> 7050404537</li>
              <li><strong>يمثلها في التوقيع:</strong> المهندس طارق مختار علي</li>
              <li><strong>الصفة:</strong> مدير المشاريع</li>
              <li><strong>العنوان:</strong> الرياض - حي الفيحاء - شارع المطر</li>
              <li><strong>الهاتف:</strong> 0574590198</li>
              <li><strong>البريد الإلكتروني:</strong> Info@kenan4saftey.com</li>
            </ul>
          </div>
          <div className="party-card">
            <h4>الطرف الثاني (المالك):</h4>
            <ul className="party-details">
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

        <p className="contract-intro-p" style={{ fontSize: "0.9rem", lineHeight: "1.6", marginTop: "15px" }}>
          ويشار إليهم مجتمعين بهذا العقد بالطرفين أو الطرفان وحيث اتفق الطرفان على أن يقوم الطرف الأول بتنفيذ وتوريد وتركيب شبكة إطفاء الحريق العادي والرش الآلي ونظام التهوية للموقع الخاص بالطرف الثاني الكائن بمدينة {contract.locationCity || "الرياض"}، حي {contract.locationDistrict || "{{District}}"}، على قطعة رقم ({contract.locationPlot || "{{PlotNumber}}"})، من المخطط التنظيمي رقم ({contract.locationPlan || "{{PlanNumber}}"}) وعليه قد تقدم الطرف الأول بعرضه بجدول للكميات مرفق بعرض الأسعار رقم ({contract.quotationNumber || `QT-${contract.id + 650}`}) وقيمته ({formatMoney(contract.quotationValue || contract.value, contractCurrency)}) فقط {numberToArabicWords(contract.quotationValue || contract.value, contractCurrency)} شامل ضريبة القيمة المضافة. وبهذا فقد تم الاتفاق والتعاقد بين الطرفين على ما يلي:
        </p>

        <h3 className="contract-section-title" style={{ marginTop: "15px" }}>البنود والمواصفات:</h3>
        <p style={{ fontSize: "0.9rem", margin: "0 0 10px 0" }}>بحسب العرض الفني المقدم من الطرف الأول والمعتمد من قبل الطرف الثاني والموضح تفاصيله أدناه:</p>
        <ol className="spec-list" style={{ fontSize: "0.82rem", lineHeight: "1.4" }}>
          {resolvedSpecs.map((spec, index) => (
            <li key={index} style={{ marginBottom: "4px" }}>{spec}</li>
          ))}
        </ol>

        <ContractFooter />
      </div>

      {/* ==================== PAGE 2 ==================== */}
      <div className="contract-page">
        <header className="contract-page-header">
          <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
          <HeaderWave />
        </header>

        <h3 className="contract-section-title">الشروط العامة</h3>
        <ol className="terms-list">
          <li>مدة هذا المشروع سنة وتعتمد حسب سير العمل في الموقع، تبدأ اعتبارا من تاريخ توقيع العقد بين الطرفين واستلام الدفعة الأولى غير قابلة للتمديد.</li>
          <li><strong>إنهاء الأعمال والاستلام والتسليم:</strong>
            <ol style={{ listStyleType: "arabic", paddingInlineStart: "20px", marginTop: "8px" }}>
              <li>يقوم الطرف الأول بإشعار الطرف الثاني بإنهاء الأعمال، ويقوم بتسليمه الاستشاري طبقاً للمخططات المعتمدة واستخراج شهادة إنهاء التركيبات للموقع وتوقيع محضر استلام وحساب ما للطرف الأول وما عليه وتسليمه باقي مستحقاته بالتنسيق مع الدفاع المدني.</li>
              <li>لا يحق لأي طرف من الطرفين إلغاء العقد بعد البدء والمباشرة في العمل إلا بخطاب رسمي يبدي أسباب فسخ العقد.</li>
            </ol>
          </li>
          <li><strong>ضمان الأعمال:</strong>
            <ol style={{ listStyleType: "arabic", paddingInlineStart: "20px", marginTop: "8px" }}>
              <li>ضمان الطرف الأول لمدة سنة على جميع الأجهزة والمواد من تاريخ تسليم الموقع، والضمان للأعطال ولا يشمل سوء الاستخدام.</li>
              <li>يكون ضمان الأعمال من الطرف الأول لمدة سنة من تاريخ تسليم المشروع.</li>
              <li>صيانة مجانية لمدة سنة من تاريخ التشغيل.</li>
            </ol>
          </li>
          <li>يقوم الطرف الثاني بتوفير مصدر الكهرباء والمياه والأعمال المدنية كالتكسير والتلييس والحفر والردم وقاطع الكهرباء والكابل وتوصيل الخاص بالمضخة والرافعة في حالة الارتفاعات التي تزيد عن 8 متر.</li>
          <li>يلتزم الطرف الثاني بأخلاء الموقع للعمل بالتنسيق مع الطرف الأول وتسهيل مهمة العاملين للتنفيذ.</li>
          <li>الطرف الأول غير مسؤول عن أي مخالفات معمارية في الموقع.</li>
          <li>يلتزم الطرف الأول بعدم إجراء أي تعديلات أو إضافة أو حذف إلا بعد موافقة خطية من الطرف الثاني أو من يمثله.</li>
          <li>عرض السعر والعرض الفني جزء لا يتجزأ من هذا العقد.</li>
          <li>تبلغ القيمة الإجمالية لهذا العقد مبلغ وقدره ({formatMoney(contract.value, contractCurrency)}) فقط {valueWords} شامل ضريبة القيمة المضافة.</li>
          <li>يلتزم الطرف الأول باستمرار العمل دون توقف كما يلتزم الطرف الثاني بتسليم الدفعات في وقتها مع المراحل المذكورة في بند الدفعات.</li>
          <li>يلتزم الطرف الثاني بسداد الدفعات خلال مدة لا تتجاوز 10 أيام عمل، وفي حالة تأخره في السداد يتم زيادة أيام التأخير في مدة العقد.</li>
        </ol>

        <ContractFooter />
      </div>

      {/* ==================== PAGE 3 ==================== */}
      <div className="contract-page">
        <header className="contract-page-header">
          <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
          <HeaderWave />
        </header>

        <h3 className="contract-section-title">الجزاءات والغرامات:</h3>
        <ol className="terms-list">
          <li>في حال لم ينته المقاول من تنفيذ الأعمال المتعاقد عليها بعد انقضاء المدة المحددة للعقد، يتم احتساب غرامة تأخير على الطرف الأول بمقدار (300) ريال عن كل يوم تأخير، على ألا يتجاوز إجمالي هذه المبالغ 10% من قيمة العقد.</li>
          <li>للطرف الثاني الحق في خصم تلك الغرامة من مستحقات المقاول بعد إخطار الطرف الأول بخطاب رسمي عن طريق الإيميل المدون بهذا العقد.</li>
        </ol>

        <h3 className="contract-section-title">المراسلات:</h3>
        <p className="contract-intro-p" style={{ fontSize: "0.92rem" }}>
          تتم المراسلات الرسمية بين الطرفين بواسطة البريد الإلكتروني والجوال الموضح بهذا العقد، وتعتبر الرسائل المرسلة إلى البريد أو الجوال إشعاراً بالوصول وهي تبرأ الذمة بمجرد الإرسال، ويلتزم كلا الطرفين بإشعار الطرف الآخر خطياً في حال تغير عنوانه.
        </p>

        <h3 className="contract-section-title">العمالة والسلامة:</h3>
        <ol className="terms-list">
          <li>يلتزم الطرف الأول بتوفير وتأمين العدد الكافي من الأيدي العاملة اللازمة والمطلوبة لتنفيذ المشروع.</li>
          <li>يلتزم الطرف الأول بتوفير عمالة فنية ماهرة ذات الخبرة في تنفيذ جميع الأعمال.</li>
          <li>يلتزم الطرف الأول بتأمين الأعمال في الموقع وإلزام العمالة بالالتزام باشتراطات الأمن والسلامة في الموقع.</li>
          <li>يعد الطرف الأول مسئول مسئولية تامة عن سلامة جميع العاملين بالموقع كما يعتبر مسؤول عن كافة تصرفات العاملين وسلوكهم داخل المشروع ومع المجاورين، دون أدنى مسؤولية على الطرف الثاني.</li>
          <li>يلتزم الطرف الأول باستبدال أي عامل أو موظف يطلب الطرف الثاني أو من يمثله استبداله بسبب مخالفته أو عدم اتقانه للعمل.</li>
        </ol>

        <h3 className="contract-section-title">الدفعات المالية:</h3>
        <ol className="terms-list">
          {resolvedPayments.map((term, i) => (
            <li key={term.id || i}>
              دفع <strong>{term.percent}%</strong> {term.label} (بقيمة {paymentAmount(term.percent)}).
            </li>
          ))}
        </ol>

        <ContractFooter />
      </div>

      {/* ==================== PAGE 4 ==================== */}
      <div className="contract-page">
        <header className="contract-page-header">
          <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
          <HeaderWave />
        </header>

        <h3 className="contract-section-title">تسوية الخلافات والقانون الواجب التطبيق:</h3>
        <p className="contract-intro-p" style={{ fontSize: "0.92rem" }}>
          اتفق الطرفان على أن أي خلاف أو نزاع ينشأ بينهما، فإنهما يلتزمان ببذل كافة المساعي الودية لتسويته، وإلا فإنه يتم اللجوء الى المحكمة المختصة في الرياض، ولا يحول الخلاف أو النزاع الحاصل دون الالتزام بتطبيق هذا العقد واستمرار الطرفين في تنفيذ الأعمال بالشكل المتعاقد عليه. وفي جميع الأحوال لا يجوز للطرف الثاني مطالبة الطرف الأول بعدم الاستمرار في تنفيذ الأعمال ما دام يلتزم ببنود هذا العقد.
        </p>
        
        <p className="contract-intro-p" style={{ fontWeight: "800", textAlign: "center", margin: "30px 0" }}>
          بهذا يقر الطرفان أنهما اطلعوا على بنود هذه الاتفاقية وفهما فهماً تاماً نافياً للجهالة وبالتوقيع عليها تصبح سارية.
        </p>
        
        <p className="contract-intro-p" style={{ textAlign: "center", fontStyle: "italic", marginBottom: "15px" }}>
          وعلى هذا تم الاتفاق بين الطرفين وتوقيع العقد من نسختين، والله ولي التوفيق.
        </p>

        <table className="contract-sign-table">
          <thead>
            <tr>
              <th>الطرف الأول</th>
              <th>الطرف الثاني</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="sign-cell">
                  <span style={{ fontWeight: "800", display: "block" }}>مؤسسة كنان لأنظمة الأمن والسلامة</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>يمثلها: المهندس طارق مختار علي</span>
                  {stamp && <img src={stamp} alt="ختم الطرف الأول" className="stamp-img" />}
                  {signature && <img src={signature} alt="توقيع الطرف الأول" className="stamp-img" />}
                  <span style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "40px" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
              <td>
                <div className="sign-cell">
                  <span style={{ fontWeight: "800", display: "block" }}>{contract.secondPartyName || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>يمثلها: {contract.secondPartyRepresentative || client?.name || "................"}</span>
                  <span style={{ fontSize: "0.85rem", display: "block" }}>الصفة: {contract.secondPartyRole || "المالك"}</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "40px" }}>الختم والتوقيع: ............................</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bank-info-box">
          <strong style={{ fontSize: "0.95rem", color: "var(--brand)", display: "block", borderBottom: "1px dashed var(--line)", paddingBottom: "4px" }}>
            تفاصيل الحساب البنكي والضريبي للطرف الأول:
          </strong>
          <div className="bank-info-grid">
            <div>
              <strong>اسم البنك:</strong> البنك الراجحي
            </div>
            <div>
              <strong>الرقم الضريبي:</strong> 313072607300003
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <strong>رقم الحساب:</strong> <code style={{ letterSpacing: "1px", fontStyle: "normal" }}>448000010006086265902</code>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <strong>رقم الايبان:</strong> <code style={{ letterSpacing: "1px", fontStyle: "normal" }}>SA9080000448608016265902</code>
            </div>
          </div>
        </div>

        <ContractFooter />
      </div>
    </div>
  );
}

function ContractFooter() {
  return (
    <footer className="contract-footer">
      <div className="footer-column">
        <span className="footer-label">الموقع الالكتروني</span>
        <span className="footer-val">kenan4saftey.com</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-column">
        <span className="footer-label">البريد الالكتروني</span>
        <span className="footer-val">info@kenan4saftey.com</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-column">
        <span className="footer-label">الهاتف الجوال</span>
        <span className="footer-val">0574590198</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-column">
        <span className="footer-label">السجل التجاري</span>
        <span className="footer-val">7050404537</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-column" style={{ textAlign: "left" }}>
        <span className="footer-val">KSA - RIYADH</span>
        <span className="footer-val sub">السعودية - الرياض</span>
      </div>
    </footer>
  );
}

function ReportsView({
  projects,
  clients,
  workers,
  inventory,
  invoices,
  expenses,
}: {
  projects: Project[];
  clients: Client[];
  workers: Worker[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  expenses: Expense[];
}) {
  const reports = [
    {
      title: "تقرير المشاريع",
      icon: BriefcaseBusiness,
      action: () =>
        downloadCsv(
          "projects.csv",
          projects.map((project) => ({
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
      title: "تقرير العمال",
      icon: HardHat,
      action: () =>
        downloadCsv(
          "workers.csv",
          workers.map((worker) => ({
            id: worker.id,
            name: worker.name,
            specialty: worker.specialty,
            attendance: worker.attendance,
            dailyRate: worker.dailyRate,
          })),
        ),
    },
    {
      title: "تقرير المخزن",
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
      title: "تقرير الحسابات",
      icon: WalletCards,
      action: () =>
        downloadCsv("finance.csv", [
          ...invoices.map((invoice) => ({
            type: "invoice",
            reference: invoice.number,
            projectId: invoice.projectId,
            amount: invoice.amount,
            status: invoice.status,
          })),
          ...expenses.map((expense) => ({
            type: "expense",
            reference: expense.type,
            projectId: expense.projectId,
            amount: expense.amount,
            status: expense.description,
          })),
        ]),
    },
  ];

  return (
    <section className="report-grid">
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
}: {
  staff: StaffAccount[];
  addStaff: (member: Omit<StaffAccount, "id">) => void;
  deleteStaff: (id: number) => void;
}) {
  const assignable = navItems.filter((item) => item.id !== "settings");
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    addStaff({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      sections,
      permissions: perms,
    });
    setName("");
    setEmail("");
    setPassword("");
    setRole(staffRoles[0]);
    setSections(["dashboard"]);
    setPerms({ dashboard: "edit" });
  };

  return (
    <section className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <SectionTitle icon={UserPlus} title="إنشاء حساب موظف" />
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
          />
        </label>
        <label>
          كلمة المرور
          <input value={password} onChange={(event) => setPassword(event.target.value)} required />
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
        <button className="primary-button">
          <UserPlus size={18} />
          إنشاء الحساب
        </button>
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
                  <div>
                    <h3>{member.name}</h3>
                    <span>{member.role}</span>
                  </div>
                  <button type="button" className="icon-danger" title="حذف" onClick={() => deleteStaff(member.id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
                <p className="staff-email" dir="ltr">
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
        window.alert("تعذّر قراءة الصورة، جرّب صورة أخرى.");
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
      window.alert("تعذّر قراءة بعض الصور، جرّب صورًا أخرى.");
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

function SectionTitle({ icon: Icon, title }: { icon: typeof Gauge; title: string }) {
  return (
    <div className="section-title">
      <Icon size={20} />
      <h2>{title}</h2>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof Gauge; label: string; value: string; tone: string }) {
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

function MiniStat({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Gauge }) {
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
}: {
  quotation: Quotation;
  client?: Client;
  stamp: string;
  signature: string;
}) {
  const quotationCurrency = quotation.currency || "EGP";
  const valueWords = numberToArabicWords(quotation.value, quotationCurrency);
  const formattedDate = formatArabicDate(quotation.date);
  const formattedValidUntil = formatArabicDate(quotation.validUntil);

  const subtotal = quotation.items.reduce((acc, it) => acc + it.total, 0);
  const vat = Math.round(subtotal * (quotation.taxPercent / 100));
  const finalTotal = subtotal + vat;
  const HeaderWave = () => (
    <div className="page-header-wave">
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Navy Blue Base Swoosh Curve */}
        <path d="M 210,0 C 440,82 730,118 1000,92 L 1000,0 Z" fill="#141b34" />
        {/* White Separator Ribbon */}
        <path d="M 250,0 C 470,72 750,102 1000,76 L 1000,0 Z" fill="#ffffff" />
        {/* Main Crimson Red Wave Ribbon */}
        <path d="M 280,0 C 490,64 770,90 1000,64 L 1000,0 Z" fill="#d91c24" />
        {/* Navy Accent Line */}
        <path d="M 360,0 C 540,44 790,56 1000,34 L 1000,0 Z" fill="#141b34" />
        {/* White Separator Line */}
        <path d="M 410,0 C 590,32 810,40 1000,20 L 1000,0 Z" fill="#ffffff" />
        {/* Topmost Red Stripe */}
        <path d="M 470,0 C 630,22 830,24 1000,10 L 1000,0 Z" fill="#d91c24" />
      </svg>
    </div>
  );

  return (
    <div className="contract-doc">
      <div className="contract-page">
        {/* Header Section Matching PDF */}
        <header className="contract-page-header">
          <img src="/kenan-logo.png" alt="KENAN Logo" className="page-header-logo" />
          <HeaderWave />
        </header>

        <h2 className="contract-page-title" style={{ margin: "5px 0 15px 0" }}>عرض سعر أنظمة سلامة</h2>

        {/* Metadata info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "0.85rem", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <div><strong>رقم العرض:</strong> {quotation.number}</div>
          <div><strong>التاريخ:</strong> {formattedDate} م</div>
          <div><strong>صالح لغاية:</strong> {formattedValidUntil} م</div>
        </div>

        {/* Dynamic Intro Text from System */}
        <div style={{ marginBottom: "15px", fontSize: "0.95rem", lineHeight: "1.6", direction: "rtl", textAlign: "right" }}>
          <div style={{ fontWeight: "bold", fontSize: "1.05rem", marginBottom: "6px" }}>
            السادة: {quotation.clientName || client?.name || "................"} المحترمين
          </div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>السلام عليكم ورحمة الله وبركاته،،،</div>
          <p style={{ margin: 0, textIndent: "15px" }}>
            {quotation.introText || `يسر مؤسسة كنان لأنظمة الأمن والسلامة أن تقدم عرض سعرها لتوريد وتنفيذ أنظمة السلامة لكم في موقعكم في مدينة / ${quotation.locationCity || client?.city || "الرياض"}${quotation.locationDistrict ? ` - حي ${quotation.locationDistrict}` : ""}${quotation.locationPlot ? ` - قطعة رقم (${quotation.locationPlot})` : ""}${quotation.locationPlan ? ` - مخطط رقم (${quotation.locationPlan})` : ""}${quotation.projectAddress || client?.address ? ` - ${quotation.projectAddress || client?.address}` : ""} وذلك حسب المخطط المعتمد.`}
          </p>
        </div>

        <h3 className="contract-section-title" style={{ marginTop: "15px", marginBottom: "8px" }}>جدول الكميات والمواد:</h3>
        <div className="table-wrap" style={{ marginBlock: "10px", direction: "rtl", pageBreakInside: "avoid", breakInside: "avoid" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", pageBreakInside: "avoid", breakInside: "avoid" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", width: "40px", textAlign: "center" }}>الرقم</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>المنتج</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", width: "180px", textAlign: "right" }}>الوصف / الماركة</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", width: "60px", textAlign: "center" }}>الكمية</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", width: "100px", textAlign: "left" }}>سعر الوحدة</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", width: "120px", textAlign: "left" }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{index + 1}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{item.name}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{item.brand || "—"}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(item.price, quotationCurrency)}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(item.total, quotationCurrency)}</td>
                </tr>
              ))}
              {quotation.items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "12px", textAlign: "center", color: "#64748b" }}>لا توجد بنود مدخلة لعرض السعر.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBlock: "10px" }}>
          <table style={{ width: "320px", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>المجموع الفرعي:</td>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(subtotal, quotationCurrency)}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>ضريبة القيمة المضافة ({quotation.taxPercent}%):</td>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left" }}>{formatMoney(vat, quotationCurrency)}</td>
              </tr>
              <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1" }}>الإجمالي النهائي:</td>
                <td style={{ padding: "6px 10px", border: "1px solid #cbd5e1", textAlign: "left", color: "#e11d48" }}>{formatMoney(finalTotal, quotationCurrency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="contract-intro-p" style={{ fontWeight: "600", fontSize: "0.9rem", marginBlock: "10px" }}>
          المبلغ الإجمالي كتابةً: فقط {valueWords} شامل ضريبة القيمة المضافة.
        </p>

        {/* Standard terms & notes as shown in the PDF */}
        <div style={{ marginBlock: "12px", padding: "10px", border: "1px dashed #e11d48", borderRadius: "6px", background: "#fff5f5" }}>
          <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#e11d48" }}>شروط وملاحظات العرض:</strong>
          <ul style={{ margin: 0, paddingRight: "20px", fontSize: "0.8rem", lineHeight: "1.5", color: "#334155", listStyleType: "disc" }}>
            <li>الأسعار بالريال السعودي.</li>
            <li>العرض يشمل تسليم الاستشاري ومهندس الموقع.</li>
            <li>العرض يشمل عمل الشوب دروينق لأعمال الإطفاء.</li>
            <li>العرض يشمل استخراج شهادة إنهاء التركيبات.</li>
            <li>العرض لا يشمل الأعمال المدنية من تكسير وحفر وردم.</li>
            {quotation.notes && (
              <li style={{ fontWeight: "bold", marginTop: "4px", listStyleType: "none", paddingRight: "0" }}>
                ملاحظات إضافية: {quotation.notes}
              </li>
            )}
          </ul>
        </div>

        {/* Bank & Tax details */}
        <div className="bank-info-box" style={{ marginTop: "15px", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1" }}>
          <strong style={{ fontSize: "0.85rem", color: "#1e3a8a", display: "block", borderBottom: "1px dashed #cbd5e1", paddingBottom: "4px", marginBottom: "6px" }}>
            الحساب البنكي والضريبي للمؤسسة:
          </strong>
          <div className="bank-info-grid" style={{ fontSize: "0.8rem", gridGap: "4px" }}>
            <div><strong>اسم البنك:</strong> مصرف الراجحي</div>
            <div><strong>الرقم الضريبي:</strong> 313072607300003</div>
            <div style={{ gridColumn: "span 2" }}><strong>رقم الحساب:</strong> <code style={{ fontStyle: "normal" }}>448000010006086265902</code></div>
            <div style={{ gridColumn: "span 2" }}><strong>الآيبان:</strong> <code style={{ fontStyle: "normal" }}>SA9080000448608016265902</code></div>
          </div>
        </div>

        {/* Note: Signature table for Offeror & Client Approval removed per user request */}

        <ContractFooter />
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
  stamp,
  signature,
  onCsvImport,
}: {
  quotations: Quotation[];
  clients: Client[];
  inventory: InventoryItem[];
  addQuotation: (clientId: number, date: string, validUntil: string, items: QuotationItem[], value: number, notes?: string, currency?: string, extraDetails?: any) => void;
  deleteQuotation: (id: number) => void;
  updateStatus: (id: number, status: "مسودة" | "مرسل" | "معتمد" | "ملغي") => void;
  stamp: string;
  signature: string;
  onCsvImport: (text: string) => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeQuotation = quotations.find((item) => item.id === activeId) ?? null;
  const activeClient = activeQuotation ? clients.find((c) => c.id === activeQuotation.clientId) : undefined;

  const [formItems, setFormItems] = useState<QuotationItem[]>([{ name: "", brand: "", qty: 1, price: 0, total: 0 }]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState<number | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState("");

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

    const subtotal = formItems.reduce((acc, it) => acc + it.total, 0);
    const value = Math.round(subtotal * 1.15); // with 15% VAT

    if (!clientId) {
      window.alert("يرجى اختيار العميل أولاً");
      return;
    }
    if (formItems.some((it) => !it.name.trim())) {
      window.alert("يرجى إدخال أسماء البنود لجميع العناصر المضافة");
      return;
    }

    const locationCity = String(data.get("locationCity") || "");
    const locationDistrict = String(data.get("locationDistrict") || "");
    const locationPlot = String(data.get("locationPlot") || "");
    const locationPlan = String(data.get("locationPlan") || "");
    const projectAddress = String(data.get("projectAddress") || "");
    const introText = String(data.get("introText") || "");

    addQuotation(clientId, date, validUntil, formItems, value, notes, currency, {
      locationCity,
      locationDistrict,
      locationPlot,
      locationPlan,
      projectAddress,
      introText,
    });
    setFormItems([{ name: "", brand: "", qty: 1, price: 0, total: 0 }]);
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
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} عروض أسعار؟`)) {
      selectedIds.forEach((id) => deleteQuotation(id));
      setSelectedIds([]);
    }
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
        <label>
          العملة
          <select name="currency" defaultValue="SAR">
            <option value="SAR">SAR (ريال سعودي)</option>
          </select>
        </label>

        <div style={{ borderBottom: "1px dashed var(--line)", paddingBottom: "6px", marginTop: "8px" }}>
          <strong style={{ fontSize: "0.86rem", color: "var(--brand)" }}>بيانات موقع العمل ونص الترويسة بالعرض:</strong>
        </div>
        <div className="two-fields">
          <Field label="المدينة" name="locationCity" defaultValue="الرياض" placeholder="اسم المدينة" />
          <Field label="الحي" name="locationDistrict" placeholder="اسم الحي" />
        </div>
        <div className="two-fields">
          <Field label="رقم القطعة" name="locationPlot" placeholder="رقم قطعة الأرض" />
          <Field label="رقم المخطط" name="locationPlan" placeholder="رقم المخطط التنظيمي" />
        </div>
        <Field label="عنوان / تفاصيل الموقع" name="projectAddress" placeholder="مثال: التجمع الخامس / حي عرقـة" />
        <label>
          نص الترويسة المخصص (اختياري)
          <textarea name="introText" rows={2} placeholder="اتركه فارغاً للاعتماد على النص التلقائي من النظام..." />
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
                    البند / المنتج
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
                  الوصف / الماركة
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
                  السعر (البيع)
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
                const client = clients.find((c) => c.id === q.clientId);
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
                        <button type="button" className="icon-danger" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: "4px" }} onClick={() => { if (window.confirm("هل أنت متأكد من حذف عرض السعر هذا؟")) deleteQuotation(q.id); }} title="حذف">
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

      {activeQuotation && (
        <div className="contract-modal" role="dialog" aria-modal="true" onClick={() => setActiveId(null)}>
          <div className="contract-modal-inner" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "900px" }}>
            <div className="contract-modal-toolbar">
              <button className="primary-button" onClick={() => window.print()}>
                <Printer size={17} />
                طباعة عرض السعر
              </button>
              <button className="contract-modal-close" onClick={() => setActiveId(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            <QuotationDocument quotation={activeQuotation} client={activeClient} stamp={stamp} signature={signature} />
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
        window.alert("تعذّر الحفظ: مساحة التخزين في المتصفح ممتلئة. جرّب تقليل عدد الصور أو حجمها ثم أعد المحاولة.");
      }
      return next;
    });
  };
  return [state, setValue];
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
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
  { id: "workers", label: "العمال", icon: HardHat },
  { id: "teams", label: "فرق العمل", icon: UsersRound },
  { id: "attendance", label: "الحضور", icon: CalendarCheck },
  { id: "leaves", label: "الإجازات", icon: CalendarOff },
  { id: "payroll", label: "الرواتب", icon: WalletCards },
  { id: "inventory", label: "المخزن والمواد", icon: Warehouse },
  { id: "finance", label: "الحسابات", icon: WalletCards },
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


function DashboardView(props: {
  totals: { revenue: number; expenseTotal: number; profit: number; delayed: number; activeWorkers: number; lowStock: number };
  projects: Project[];
  clients: Client[];
  stages: ProjectStage[];
  workers: Worker[];
  alerts: AppAlert[];
  invoices: Invoice[];
  expenses: Expense[];
}) {
  return (
    <section className="panel">
      <SectionTitle icon={BarChart3} title="لوحة التحكم" />
      <p style={{ color: "var(--muted)" }}>تم استرجاع لوحة التحكم بعد إصلاح الملفات.</p>
    </section>
  );
}

const iconDangerStyle = { background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "inline-flex", padding: 4 } as const;

function ClientsView({ clients, projects, addClient, deleteClient, onCsvImport }: {
  clients: Client[]; projects: Project[];
  addClient: (e: FormEvent<HTMLFormElement>) => void;
  deleteClient: (id: number) => void; updateClient: (c: Client) => void;
  onCsvImport: (t: string) => void;
}) {
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addClient}>
        <SectionTitle icon={UserPlus} title="إضافة عميل جديد" />
        <Field label="اسم العميل / المنشأة" name="name" required />
        <div className="two-fields">
          <Field label="الهاتف" name="phone" required />
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
            <thead><tr><th>الاسم</th><th>الهاتف</th><th>العنوان</th><th>النوع</th><th>المشاريع</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td><td>{c.phone || "—"}</td><td>{c.address || "—"}</td><td>{c.type || "—"}</td>
                  <td>{projects.filter((p) => p.clientId === c.id).length}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف هذا العميل؟")) deleteClient(c.id); }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد عملاء مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ContractorsView({ contractors, projects, addContractor, deleteContractor }: {
  contractors: Contractor[]; projects: Project[];
  addContractor: (e: FormEvent<HTMLFormElement>) => void;
  deleteContractor: (id: number) => void; updateContractor: (c: Contractor) => void;
}) {
  void projects;
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
            <thead><tr><th>الاسم</th><th>التخصص</th><th>الشركة</th><th>الهاتف</th><th>العنوان</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {contractors.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td><td>{c.specialty || "—"}</td><td>{c.company || "—"}</td><td>{c.phone || "—"}</td><td>{c.address || "—"}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف هذا المقاول؟")) deleteContractor(c.id); }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {contractors.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد مقاولين مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProjectsView({ projects, clients, stages, addProject, deleteProject, setSelectedProjectId, setActiveSection }: {
  projects: Project[]; clients: Client[]; stages: ProjectStage[];
  addProject: (e: FormEvent<HTMLFormElement>) => void;
  deleteProject: (id: number) => void; updateProject: (p: Project) => void;
  setSelectedProjectId: (id: number) => void; setActiveSection: (s: Section) => void;
}) {
  const projectStatuses: Project["status"][] = ["لم يبدأ", "جاري", "متوقف", "متأخر", "مكتمل"];
  return (
    <section className="content-grid content-grid--stack">
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
      <div className="panel wide">
        <SectionTitle icon={Building2} title="متابعة المواقع والمشاريع" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>المشروع</th><th>العميل</th><th>المهندس</th><th>الحالة</th><th>الإنجاز</th><th>المراحل</th><th style={{ width: 150 }}>إجراءات</th></tr></thead>
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
                        <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف هذا المشروع؟")) deleteProject(p.id); }}><Trash2 size={16} /></button>
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
    </section>
  );
}

function ProjectDetailView({ project, client, stages, systems, deficiencies, assignments, workers, teams, onBack }: {
  project?: Project; client?: Client; stages: ProjectStage[]; systems: ProjectSystem[];
  deficiencies: SiteDeficiency[]; assignments: ProjectAssignment[]; workers: Worker[]; teams: WorkTeam[]; onBack: () => void;
}) {
  if (!project) return <section className="panel"><p style={{ color: "var(--muted)" }}>اختر مشروعًا من قائمة المواقع والمشاريع.</p></section>;
  return (
    <section className="panel" style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <SectionTitle icon={Building2} title={project.name} />
        <button type="button" className="secondary-button" onClick={onBack}>عودة للمشاريع</button>
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

function StagesView({ projects, stages, selectedProjectId, setSelectedProjectId, addStage, updateStageStatus, deleteStage }: {
  projects: Project[]; stages: ProjectStage[]; selectedProjectId: number; setSelectedProjectId: (id: number) => void;
  addStage: (e: FormEvent<HTMLFormElement>) => void; updateStageStatus: (id: number, status: ProjectStage["status"]) => void; deleteStage: (id: number) => void;
}) {
  const stageStatuses: ProjectStage["status"][] = ["لم يبدأ", "جاري", "تم"];
  const projectStages = stages.filter((s) => s.projectId === selectedProjectId);
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addStage}>
        <SectionTitle icon={Plus} title="إضافة مرحلة تنفيذ" />
        <label>المشروع<select name="projectId" required value={selectedProjectId} onChange={(e) => setSelectedProjectId(Number(e.target.value))}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
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
                  <td><strong>{s.name}</strong>{s.notes && <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{s.notes}</div>}</td>
                  <td><select value={s.status} onChange={(e) => updateStageStatus(s.id, e.target.value as ProjectStage["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{stageStatuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td>{formatDate(s.updatedAt)}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteStage(s.id)}><Trash2 size={16} /></button></td>
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

function WorkersView({ workers, projects, addWorker, deleteWorker }: {
  workers: Worker[]; projects: Project[];
  addWorker: (e: FormEvent<HTMLFormElement>) => void; deleteWorker: (id: number) => void; updateWorker: (w: Worker) => void;
}) {
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
            <thead><tr><th>الاسم</th><th>التخصص</th><th>الهاتف</th><th>اليومية</th><th>الموقع الحالي</th><th style={{ width: 60 }}>حذف</th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.name}</strong></td><td>{w.specialty || "—"}</td><td>{w.phone || "—"}</td><td>{currency.format(w.dailyRate)}</td>
                  <td>{projects.find((p) => p.id === w.currentProjectId)?.name || "—"}</td>
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف هذا العامل؟")) deleteWorker(w.id); }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
              {workers.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#64748b" }}>لا يوجد عمال مسجلين.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function DeficienciesView({ deficiencies, projects, engineers, addDeficiency, updateDeficiencyStatus, deleteDeficiency }: {
  deficiencies: SiteDeficiency[]; projects: Project[]; engineers: string[];
  addDeficiency: (e: FormEvent<HTMLFormElement>) => void; updateDeficiencyStatus: (id: number, status: SiteDeficiency["status"]) => void; deleteDeficiency: (id: number) => void;
}) {
  const statuses: SiteDeficiency["status"][] = ["مفتوح", "قيد المعالجة", "تم الحل"];
  const severities: SiteDeficiency["severity"][] = ["منخفضة", "متوسطة", "عالية"];
  return (
    <section className="content-grid content-grid--stack">
      <form className="form-panel" onSubmit={addDeficiency}>
        <SectionTitle icon={Plus} title="تسجيل نقص على موقع" />
        <label>الموقع / المشروع<select name="projectId" required><option value="">اختر مشروع...</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>رفعه (مهندس / استشاري)<select name="raisedBy"><option value="">—</option>{engineers.map((e) => <option key={e}>{e}</option>)}</select></label>
        <label>وصف النقص<textarea name="description" rows={2} required /></label>
        <label>درجة الخطورة<select name="severity" defaultValue="متوسطة">{severities.map((s) => <option key={s}>{s}</option>)}</select></label>
        <button className="primary-button"><Plus size={18} />تسجيل النقص</button>
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
                  <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteDeficiency(d.id)}><Trash2 size={16} /></button></td>
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

function SystemsView({ systems, components, projects, addSystem, updateSystemStatus, deleteSystem, addComponent, updateComponentStatus, deleteComponent }: {
  systems: ProjectSystem[]; components: SystemComponent[]; projects: Project[];
  addSystem: (e: FormEvent<HTMLFormElement>) => void; updateSystemStatus: (id: number, status: ProjectSystem["status"]) => void; deleteSystem: (id: number) => void;
  addComponent: (systemId: number, data: Omit<SystemComponent, "id" | "systemId">) => void; updateComponentStatus: (id: number, status: SystemComponent["installStatus"]) => void; deleteComponent: (id: number) => void;
}) {
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
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
                      <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف هذا النظام ومكوّناته؟")) { if (selectedSystemId === s.id) setSelectedSystemId(null); deleteSystem(s.id); } }}><Trash2 size={16} /></button>
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
                      <td><button className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => deleteComponent(c.id)}><Trash2 size={16} /></button></td>
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

function TeamsView({ teams, assignments, projects, workers, contractors, addTeam, deleteTeam, addAssignment, deleteAssignment }: {
  teams: WorkTeam[]; assignments: ProjectAssignment[]; projects: Project[]; workers: Worker[]; contractors: Contractor[];
  addTeam: (e: FormEvent<HTMLFormElement>) => void; deleteTeam: (id: number) => void;
  addAssignment: (e: FormEvent<HTMLFormElement>) => void; deleteAssignment: (id: number) => void;
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
  addLeave: (e: FormEvent<HTMLFormElement>) => void; updateLeaveStatus: (id: number, status: Leave["status"]) => void; deleteLeave: (id: number) => void;
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
  addPayroll: (e: FormEvent<HTMLFormElement>) => void; updatePayrollStatus: (id: number, status: PayrollRun["status"]) => void; deletePayroll: (id: number) => void;
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
  addContract: (e: FormEvent<HTMLFormElement>) => void; updateContractStatus: (id: number, status: MaintenanceContract["status"]) => void; deleteContract: (id: number) => void;
  addVisit: (contractId: number, scheduledDate: string) => void; completeVisit: (id: number, performedBy: string) => void; deleteVisit: (id: number) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const frequencies: MaintenanceContract["frequency"][] = ["شهري", "ربع سنوي", "نصف سنوي", "سنوي"];
  const cStatuses: MaintenanceContract["status"][] = ["نشط", "منتهي", "متجدد", "ملغي"];
  const selectedVisits = visits.filter((v) => v.contractId === selectedId);
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
                <tr key={c.id} style={{ background: c.id === selectedId ? "rgba(225,29,72,0.04)" : undefined }}>
                  <td><strong>{c.contractNumber}</strong></td><td>{clients.find((cl) => cl.id === c.clientId)?.name || "—"}</td><td>{c.frequency}</td>
                  <td>{formatMoney(c.value, c.currency)}</td>
                  <td><select value={c.status} onChange={(e) => updateContractStatus(c.id, e.target.value as MaintenanceContract["status"])} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{cStatuses.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td>{visits.filter((v) => v.contractId === c.id).length}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" className="secondary-button" style={{ minHeight: 28, padding: "0 10px", fontSize: "0.76rem" }} onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}>الزيارات</button>
                      <button type="button" className="icon-danger" style={iconDangerStyle} title="حذف" onClick={() => { if (window.confirm("حذف عقد الصيانة؟")) { if (selectedId === c.id) setSelectedId(null); deleteContract(c.id); } }}><Trash2 size={16} /></button>
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
            <SectionTitle icon={CalendarCheck} title={`زيارات العقد: ${contracts.find((c) => c.id === selectedId)?.contractNumber ?? ""}`} />
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
  const isAdmin = user.role === "admin";
  const allowedSections = useMemo(() => (isAdmin ? null : new Set(user.sections ?? [])), [isAdmin, user.sections]);
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
  const [clients, setClients] = useLocalStorage<Client[]>("kenan.clients_v3", seedClients);
  const [projects, setProjects] = useLocalStorage<Project[]>("kenan.projects_v3", seedProjects);
  const [stages, setStages] = useLocalStorage<ProjectStage[]>("kenan.stages_v3", seedStages);
  const [workers, setWorkers] = useLocalStorage<Worker[]>("kenan.workers_v3", seedWorkers);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("kenan.inventory_v3", seedInventory);
  const [, setInvoices] = useLocalStorage<Invoice[]>("kenan.invoices_v3", seedInvoices);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("kenan.expenses_v3", seedExpenses);
  const [contracts, setContracts] = useLocalStorage<Contract[]>("kenan.contracts_v3", seedContracts);
  const [contractors, setContractors] = useLocalStorage<Contractor[]>("kenan.contractors_v3", seedContractors);
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>("kenan.quotations_v3", seedQuotations);
  const [showcase, setShowcase] = useLocalStorage<ShowcaseItem[]>("kenan.showcase_v3", seedShowcase);
  const [staff, setStaff] = useLocalStorage<StaffAccount[]>("kenan.staff_v3", seedStaff);
  const [site, setSite] = useLocalStorage<SiteSettings>("kenan.site_v3", seedSite);
  const [, setProjectDetails] = useLocalStorage<ProjectWorkflow[]>("kenan.projectDetails_v3", []);
  const [deficiencies, setDeficiencies] = useLocalStorage<SiteDeficiency[]>("kenan.deficiencies_v3", seedDeficiencies);
  const [maintenanceContracts, setMaintenanceContracts] = useLocalStorage<MaintenanceContract[]>("kenan.maintenanceContracts_v3", seedMaintenanceContracts);
  const [maintenanceVisits, setMaintenanceVisits] = useLocalStorage<MaintenanceVisit[]>("kenan.maintenanceVisits_v3", seedMaintenanceVisits);
  const [systems, setSystems] = useLocalStorage<ProjectSystem[]>("kenan.systems_v3", seedSystems);
  const [components, setComponents] = useLocalStorage<SystemComponent[]>("kenan.components_v3", seedComponents);
  const [teams, setTeams] = useLocalStorage<WorkTeam[]>("kenan.teams_v3", seedTeams);
  const [assignments, setAssignments] = useLocalStorage<ProjectAssignment[]>("kenan.assignments_v3", seedAssignments);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>("kenan.attendance_v3", seedAttendance);
  const [leaves, setLeaves] = useLocalStorage<Leave[]>("kenan.leaves_v3", seedLeaves);
  const [payroll, setPayroll] = useLocalStorage<PayrollRun[]>("kenan.payroll_v3", seedPayroll);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id ?? 1);
  const [notice, setNotice] = useState("");
  const [showRawToast, setShowRawToast] = useState(false);

  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const selectedProject = projectsById.get(selectedProjectId) ?? projects[0];

  useEffect(() => {
    if (!notice) return;
    setShowRawToast(true);
    const t = setTimeout(() => { setShowRawToast(false); setNotice(""); }, 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const filteredClients = clients.filter((c) => `${c.name} ${c.phone} ${c.address} ${c.type}`.toLowerCase().includes(search.toLowerCase()));
  const filteredProjects = projects.filter((p) => {
    const cn = clientsById.get(p.clientId)?.name ?? "";
    return `${p.name} ${p.type} ${cn} ${p.engineer}`.toLowerCase().includes(search.toLowerCase());
  });
  const filteredContractors = contractors.filter((c) => `${c.name} ${c.phone} ${c.specialty} ${c.company}`.toLowerCase().includes(search.toLowerCase()));
  const filteredQuotations = quotations.filter((q) => {
    const cn = clientsById.get(q.clientId)?.name ?? "";
    return `${q.number} ${cn} ${q.status}`.toLowerCase().includes(search.toLowerCase());
  });
  const addClientFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !phone) return;
    setClients((cur) => [...cur, { id: nextId(cur), name, phone, address: String(form.get("address") ?? ""), type: String(form.get("type") ?? "عميل"), notes: String(form.get("notes") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة العميل بنجاح");
  };
  const deleteClient = (id: number) => {
    setClients((cur) => {
      const updated = cur.filter((c) => c.id !== id);
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("kenan.clients_v3", JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    setNotice("تم حذف العميل بنجاح");
  };
  const updateClient = (client: Client) => { setClients((cur) => cur.map((c) => (c.id === client.id ? client : c))); setNotice("تم تحديث بيانات العميل"); };

  const addQuotation = (
    clientId: number,
    date: string,
    validUntil: string,
    items: QuotationItem[],
    value: number,
    notes?: string,
    currencyCode: string = "EGP",
    extraDetails?: {
      locationCity?: string;
      locationDistrict?: string;
      locationPlot?: string;
      locationPlan?: string;
      projectAddress?: string;
      introText?: string;
    }
  ) => {
    const id = nextId(quotations);
    const newQ: Quotation = { id, number: `QT-2026-${String(id).padStart(3, "0")}`, clientId, date, validUntil, status: "مسودة", items, value, taxPercent: 15, currency: currencyCode, notes, ...extraDetails };
    setQuotations((cur) => [...cur, newQ]);
    setNotice("تم إنشاء عرض السعر بنجاح");
  };
  const deleteQuotation = (id: number) => { setQuotations((cur) => cur.filter((q) => q.id !== id)); setNotice("تم حذف عرض السعر"); };
  const updateQuotationStatus = (id: number, status: "مسودة" | "مرسل" | "معتمد" | "ملغي") => {
    setQuotations((cur) => cur.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  const addContractFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const projectId = Number(form.get("projectId"));
    const value = Number(form.get("value"));
    if (!projectId || !value) return;

    // Read the specs
    const specs: string[] = [];
    for (let i = 0; i < 13; i++) {
      const val = form.get(`spec_${i}`);
      if (val !== null) {
        specs.push(String(val));
      }
    }

    const newC: Contract = {
      id: nextId(contracts), projectId, value,
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
    setContracts((cur) => [...cur, newC]);
    event.currentTarget.reset();
    setNotice("تم إنشاء العقد بنجاح");
  };
  const deleteContract = (id: number) => { setContracts((cur) => cur.filter((c) => c.id !== id)); setNotice("تم حذف العقد بنجاح"); };
  const updateContract = (contract: Contract) => { setContracts((cur) => cur.map((c) => (c.id === contract.id ? contract : c))); setNotice("تم تحديث بيانات العقد"); };
  const setContractPayments = (contractId: number, payments: PaymentTerm[]) => {
    setContracts((cur) => cur.map((c) => (c.id === contractId ? { ...c, payments } : c)));
  };

  const addInventoryItemFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    setInventory((cur) => [...cur, {
      id: nextId(cur), name,
      brand: String(form.get("brand") ?? "").trim(),
      quantity: Number(form.get("quantity")) || 0,
      unit: String(form.get("unit") ?? ""),
      purchasePrice: Number(form.get("purchasePrice")) || 0,
      salePrice: Number(form.get("salePrice")) || 0,
      supplier: String(form.get("supplier") ?? ""),
      receivedAt: new Date().toISOString().slice(0, 10),
      minQuantity: Number(form.get("minQuantity")) || 0,
    }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة المنتج للمخزن");
  };
  const deleteInventoryItem = (id: number) => { setInventory((cur) => cur.filter((i) => i.id !== id)); setNotice("تم حذف الصنف من المخزن"); };
  const updateInventoryItem = (updated: InventoryItem) => { setInventory((cur) => cur.map((i) => (i.id === updated.id ? updated : i))); setNotice("تم تحديث بيانات الصنف"); };
  const issueInventory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const itemId = Number(form.get("itemId"));
    const quantity = Number(form.get("quantity"));
    if (!itemId || quantity <= 0) return;
    setInventory((cur) => cur.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i)));
    event.currentTarget.reset();
    setNotice("تم صرف الخامات للمشروع");
  };
  const handleCsvImport = (section: Section, text: string) => {
    const rows = parseCsv(text);
    if (!rows.length) { window.alert("الملف فارغ أو غير صالح"); return; }
    try {
      if (section === "clients") {
        setClients((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, name: r["الاسم"] || r["name"] || "", phone: r["الهاتف"] || r["phone"] || "", address: r["العنوان"] || r["address"] || "", type: r["النوع"] || r["type"] || "عميل", notes: r["ملاحظات"] || r["notes"] || "" })); return [...cur, ...imported]; });
        setNotice("تم استيراد العملاء");
      } else if (section === "inventory") {
        setInventory((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, name: r["الاسم"] || r["name"] || "", brand: r["الماركة"] || r["brand"] || "", quantity: Number(r["الكمية"] || r["quantity"] || 0), unit: r["الوحدة"] || r["unit"] || "", purchasePrice: Number(r["سعر الشراء"] || r["purchasePrice"] || 0), salePrice: Number(r["سعر البيع"] || r["salePrice"] || 0), supplier: r["المورد"] || r["supplier"] || "", receivedAt: new Date().toISOString().slice(0, 10), minQuantity: Number(r["الحد الأدنى"] || r["minQuantity"] || 0) })); return [...cur, ...imported]; });
        setNotice("تم استيراد المخزن");
      } else if (section === "quotations") {
        setQuotations((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, number: r["رقم العرض"] || r["number"] || `QT-${baseId + i}`, clientId: Number(r["رقم العميل"] || r["clientId"] || 1), date: r["التاريخ"] || r["date"] || new Date().toISOString().slice(0, 10), validUntil: r["صالح لغاية"] || r["validUntil"] || new Date().toISOString().slice(0, 10), status: (r["الحالة"] || r["status"] || "مسودة") as Quotation["status"], items: [], value: Number(r["القيمة"] || r["value"] || 0), taxPercent: Number(r["نسبة الضريبة"] || 15), currency: r["العملة"] || "EGP" })); return [...cur, ...imported]; });
        setNotice("تم استيراد عروض الأسعار");
      } else if (section === "contracts") {
        setContracts((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, projectId: Number(r["رقم المشروع"] || r["projectId"] || 1), value: Number(r["القيمة"] || r["value"] || 0), currency: r["العملة"] || "EGP", startDate: r["تاريخ البداية"] || new Date().toISOString().slice(0, 10), endDate: r["تاريخ النهاية"] || new Date().toISOString().slice(0, 10), warranty: r["الضمان"] || "سنتين", clauses: r["البنود"] || "" })); return [...cur, ...imported]; });
        setNotice("تم استيراد العقود");
      } else if (section === "workers") {
        setWorkers((cur) => { let baseId = nextId(cur); const imported = rows.map((r, i) => ({ id: baseId + i, name: r["الاسم"] || "", specialty: r["التخصص"] || "", phone: r["الهاتف"] || "", dailyRate: Number(r["اليومية"] || 0), currentProjectId: null, attendance: "غياب" as const, hours: 0 })); return [...cur, ...imported]; });
        setNotice("تم استيراد العمال");
      }
    } catch { window.alert("تعذر استيراد الملف. تأكد من تنسيق CSV."); }
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

  const addStaffMember = (member: Omit<StaffAccount, "id">) => setStaff((cur) => [...cur, { ...member, id: nextId(cur) }]);
  const deleteStaffMember = (id: number) => setStaff((cur) => cur.filter((s) => s.id !== id));

  const totals = useMemo(() => ({
    revenue: 0,
    expenseTotal: expenses.reduce((s, e) => s + e.amount, 0),
    profit: -expenses.reduce((s, e) => s + e.amount, 0),
    delayed: projects.filter((p) => p.status === "متأخر").length,
    activeWorkers: workers.filter((w) => w.currentProjectId !== null).length,
    lowStock: inventory.filter((i) => i.quantity <= i.minQuantity).length,
  }), [expenses, projects, workers, inventory]);

  const invoices = seedInvoices;
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

  const addProjectFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const clientId = Number(f.get("clientId"));
    if (!name || !clientId) return;
    setProjects((cur) => [...cur, { id: nextId(cur), name, type: String(f.get("type") ?? ""), clientId, address: String(f.get("address") ?? ""), startDate: String(f.get("startDate") || new Date().toISOString().slice(0, 10)), endDate: String(f.get("endDate") || new Date().toISOString().slice(0, 10)), status: (String(f.get("status") || "جاري") as Project["status"]), engineer: String(f.get("engineer") ?? ""), budget: Number(f.get("budget")) || 0, progress: Number(f.get("progress")) || 0 }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة المشروع");
  };
  const deleteProject = (id: number) => { setProjects((cur) => cur.filter((p) => p.id !== id)); setNotice("تم حذف المشروع"); };

  const addStageFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const projectId = Number(f.get("projectId"));
    const name = String(f.get("name") ?? "").trim();
    if (!projectId || !name) return;
    setStages((cur) => [...cur, { id: nextId(cur), projectId, name, status: (String(f.get("status") || "لم يبدأ") as ProjectStage["status"]), notes: String(f.get("notes") ?? ""), updatedAt: new Date().toISOString().slice(0, 10) }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة المرحلة");
  };
  const updateStageStatus = (id: number, status: ProjectStage["status"]) => { setStages((cur) => cur.map((s) => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString().slice(0, 10) } : s))); };
  const deleteStage = (id: number) => { setStages((cur) => cur.filter((s) => s.id !== id)); setNotice("تم حذف المرحلة"); };

  const addWorkerFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    if (!name) return;
    setWorkers((cur) => [...cur, { id: nextId(cur), name, specialty: String(f.get("specialty") ?? ""), phone: String(f.get("phone") ?? ""), dailyRate: Number(f.get("dailyRate")) || 0, currentProjectId: Number(f.get("currentProjectId")) || null, attendance: "غياب", hours: 0 }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة العامل");
  };
  const deleteWorker = (id: number) => { setWorkers((cur) => cur.filter((w) => w.id !== id)); setNotice("تم حذف العامل"); };
  const updateWorker = (w: Worker) => { setWorkers((cur) => cur.map((x) => (x.id === w.id ? w : x))); setNotice("تم تحديث العامل"); };

  const addDeficiencyFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const projectId = Number(f.get("projectId"));
    const description = String(f.get("description") ?? "").trim();
    if (!projectId || !description) return;
    setDeficiencies((cur) => [...cur, { id: nextId(cur), projectId, raisedBy: String(f.get("raisedBy") ?? ""), description, severity: (String(f.get("severity") || "متوسطة") as SiteDeficiency["severity"]), status: "مفتوح", raisedDate: new Date().toISOString().slice(0, 10), resolvedDate: "" }]);
    event.currentTarget.reset();
    setNotice("تم تسجيل النقص");
  };
  const updateDeficiencyStatus = (id: number, status: SiteDeficiency["status"]) => { setDeficiencies((cur) => cur.map((d) => (d.id === id ? { ...d, status, resolvedDate: status === "تم الحل" ? new Date().toISOString().slice(0, 10) : "" } : d))); };
  const deleteDeficiency = (id: number) => { setDeficiencies((cur) => cur.filter((d) => d.id !== id)); setNotice("تم حذف النقص"); };

  const addLeaveFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const workerId = Number(f.get("workerId"));
    if (!workerId) return;
    setLeaves((cur) => [...cur, { id: nextId(cur), workerId, type: (String(f.get("type") || "سنوية") as Leave["type"]), startDate: String(f.get("startDate") || new Date().toISOString().slice(0, 10)), endDate: String(f.get("endDate") || new Date().toISOString().slice(0, 10)), status: "مطلوبة", reason: String(f.get("reason") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تم تسجيل طلب الإجازة");
  };
  const updateLeaveStatus = (id: number, status: Leave["status"]) => { setLeaves((cur) => cur.map((l) => (l.id === id ? { ...l, status } : l))); };
  const deleteLeave = (id: number) => { setLeaves((cur) => cur.filter((l) => l.id !== id)); setNotice("تم حذف الإجازة"); };

  const addTeamFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    if (!name) return;
    setTeams((cur) => [...cur, { id: nextId(cur), name, subcontractorId: Number(f.get("subcontractorId")) || null, teamLead: String(f.get("teamLead") ?? ""), trade: String(f.get("trade") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة الفريق");
  };
  const deleteTeam = (id: number) => { setTeams((cur) => cur.filter((t) => t.id !== id)); setAssignments((cur) => cur.filter((a) => a.teamId !== id)); setNotice("تم حذف الفريق"); };
  const updateTeam = (t: WorkTeam) => { setTeams((cur) => cur.map((x) => (x.id === t.id ? t : x))); };
  const addAssignmentFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const projectId = Number(f.get("projectId"));
    if (!projectId) return;
    setAssignments((cur) => [...cur, { id: nextId(cur), projectId, teamId: Number(f.get("teamId")) || null, workerId: Number(f.get("workerId")) || null, subcontractorId: null, roleOnSite: String(f.get("roleOnSite") ?? ""), startDate: String(f.get("startDate") || new Date().toISOString().slice(0, 10)), endDate: String(f.get("endDate") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تم تعيين الفريق على الموقع");
  };
  const deleteAssignment = (id: number) => { setAssignments((cur) => cur.filter((a) => a.id !== id)); setNotice("تم حذف التعيين"); };

  const upsertAttendance = (record: Omit<AttendanceRecord, "id">) => {
    setAttendance((cur) => {
      const idx = cur.findIndex((a) => a.workerId === record.workerId && a.date === record.date);
      if (idx >= 0) { const copy = [...cur]; copy[idx] = { ...copy[idx], ...record }; return copy; }
      return [...cur, { ...record, id: nextId(cur) }];
    });
    setNotice("تم تسجيل الحضور");
  };

  const addPayrollFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const workerId = Number(f.get("workerId"));
    if (!workerId) return;
    const baseAmount = Number(f.get("baseAmount")) || 0;
    const overtimeAmount = Number(f.get("overtimeAmount")) || 0;
    const deductions = Number(f.get("deductions")) || 0;
    setPayroll((cur) => [...cur, { id: nextId(cur), workerId, period: String(f.get("period") || new Date().toISOString().slice(0, 7)), presentDays: Number(f.get("presentDays")) || 0, baseAmount, overtimeAmount, deductions, netAmount: baseAmount + overtimeAmount - deductions, status: "مسودة", notes: String(f.get("notes") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تم إنشاء مسير الراتب");
  };
  const updatePayrollStatus = (id: number, status: PayrollRun["status"]) => { setPayroll((cur) => cur.map((p) => (p.id === id ? { ...p, status } : p))); };
  const deletePayroll = (id: number) => { setPayroll((cur) => cur.filter((p) => p.id !== id)); setNotice("تم حذف المسير"); };

  const addSystemFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const projectId = Number(f.get("projectId"));
    const name = String(f.get("name") ?? "").trim();
    if (!projectId || !name) return;
    setSystems((cur) => [...cur, { id: nextId(cur), projectId, type: (String(f.get("type") || "إنذار حريق") as ProjectSystem["type"]), name, status: (String(f.get("status") || "تصميم") as ProjectSystem["status"]), notes: String(f.get("notes") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تمت إضافة النظام");
  };
  const updateSystemStatus = (id: number, status: ProjectSystem["status"]) => { setSystems((cur) => cur.map((s) => (s.id === id ? { ...s, status } : s))); };
  const deleteSystem = (id: number) => { setSystems((cur) => cur.filter((s) => s.id !== id)); setComponents((cur) => cur.filter((c) => c.systemId !== id)); setNotice("تم حذف النظام"); };
  const addComponentForSystem = (systemId: number, data: Omit<SystemComponent, "id" | "systemId">) => {
    setComponents((cur) => [...cur, { ...data, id: nextId(cur), systemId }]);
    setNotice("تمت إضافة المكوّن");
  };
  const updateComponentStatus = (id: number, installStatus: SystemComponent["installStatus"]) => { setComponents((cur) => cur.map((c) => (c.id === id ? { ...c, installStatus, installDate: installStatus === "تم اختباره" ? new Date().toISOString().slice(0, 10) : c.installDate } : c))); };
  const deleteComponent = (id: number) => { setComponents((cur) => cur.filter((c) => c.id !== id)); };

  const addMaintenanceFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const clientId = Number(f.get("clientId"));
    if (!clientId) return;
    const id = nextId(maintenanceContracts);
    setMaintenanceContracts((cur) => [...cur, { id, contractNumber: `MNT-${String(id).padStart(3, "0")}`, clientId, projectId: Number(f.get("projectId")) || null, value: Number(f.get("value")) || 0, currency: String(f.get("currency") || "SAR"), startDate: String(f.get("startDate") || new Date().toISOString().slice(0, 10)), endDate: String(f.get("endDate") || new Date().toISOString().slice(0, 10)), frequency: (String(f.get("frequency") || "ربع سنوي") as MaintenanceContract["frequency"]), status: "نشط", notes: String(f.get("notes") ?? "") }]);
    event.currentTarget.reset();
    setNotice("تم إنشاء عقد الصيانة");
  };
  const updateMaintenanceStatus = (id: number, status: MaintenanceContract["status"]) => { setMaintenanceContracts((cur) => cur.map((c) => (c.id === id ? { ...c, status } : c))); };
  const deleteMaintenance = (id: number) => { setMaintenanceContracts((cur) => cur.filter((c) => c.id !== id)); setMaintenanceVisits((cur) => cur.filter((v) => v.contractId !== id)); setNotice("تم حذف عقد الصيانة"); };
  const addVisitForContract = (contractId: number, scheduledDate: string) => { setMaintenanceVisits((cur) => [...cur, { id: nextId(cur), contractId, scheduledDate, completedDate: "", status: "مجدولة", performedBy: "", notes: "" }]); setNotice("تمت جدولة الزيارة"); };
  const completeVisit = (id: number, performedBy: string) => { setMaintenanceVisits((cur) => cur.map((v) => (v.id === id ? { ...v, status: "تمت", completedDate: new Date().toISOString().slice(0, 10), performedBy } : v))); };
  const deleteVisit = (id: number) => { setMaintenanceVisits((cur) => cur.filter((v) => v.id !== id)); };

  const renderSection = () => {
    switch (activeSection) {
      case "clients":
        return <ClientsView clients={filteredClients} projects={projects} addClient={addClientFromForm} deleteClient={deleteClient} updateClient={updateClient} onCsvImport={(t: string) => handleCsvImport("clients", t)} />;
      case "contractors":
        return <ContractorsView contractors={filteredContractors} projects={projects} addContractor={addContractorFromForm} deleteContractor={deleteContractor} updateContractor={updateContractor} />;
      case "projects":
        return <ProjectsView projects={filteredProjects} clients={clients} stages={stages} addProject={addProjectFromForm} deleteProject={deleteProject} updateProject={(p: Project) => { setProjects((cur) => cur.map((x) => x.id === p.id ? p : x)); setNotice("تم تحديث المشروع"); }} setSelectedProjectId={setSelectedProjectId} setActiveSection={setActiveSection} />;
      case "projectDetail":
        return <ProjectDetailView project={selectedProject} client={clientsById.get(selectedProject?.clientId ?? -1)} stages={stages.filter((s) => s.projectId === selectedProject?.id)} systems={systems.filter((s) => s.projectId === selectedProject?.id)} deficiencies={deficiencies.filter((d) => d.projectId === selectedProject?.id)} assignments={assignments.filter((a) => a.projectId === selectedProject?.id)} workers={workers} teams={teams} onBack={() => setActiveSection("projects")} />;
      case "stages":
        return <StagesView projects={projects} stages={stages} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} addStage={addStageFromForm} updateStageStatus={updateStageStatus} deleteStage={deleteStage} />;
      case "systems":
        return <SystemsView systems={systems} components={components} projects={projects} addSystem={addSystemFromForm} updateSystemStatus={updateSystemStatus} deleteSystem={deleteSystem} addComponent={addComponentForSystem} updateComponentStatus={updateComponentStatus} deleteComponent={deleteComponent} />;
      case "deficiencies":
        return <DeficienciesView deficiencies={deficiencies} projects={projects} engineers={engineers} addDeficiency={addDeficiencyFromForm} updateDeficiencyStatus={updateDeficiencyStatus} deleteDeficiency={deleteDeficiency} />;
      case "workers":
        return <WorkersView workers={workers} projects={projects} addWorker={addWorkerFromForm} deleteWorker={deleteWorker} updateWorker={updateWorker} />;
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
          />
        );
      case "finance":
        return <FinanceView invoices={filteredInvoices} expenses={expenses} projects={projects} clients={clients} totals={totals} />;
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
          />
        );
      case "quotations":
        return (
          <QuotationsView
            quotations={filteredQuotations}
            clients={clients}
            inventory={inventory}
            addQuotation={addQuotation}
            deleteQuotation={deleteQuotation}
            updateStatus={updateQuotationStatus}
            stamp={site.stamp ?? ""}
            signature={site.signature ?? ""}
            onCsvImport={(t: string) => handleCsvImport("quotations", t)}
          />
        );
      case "reports":
        return <ReportsView projects={projects} clients={clients} workers={workers} inventory={inventory} invoices={filteredInvoices} expenses={expenses} />;
      case "maintenance":
        return <MaintenanceView contracts={maintenanceContracts} visits={maintenanceVisits} clients={clients} projects={projects} addContract={addMaintenanceFromForm} updateContractStatus={updateMaintenanceStatus} deleteContract={deleteMaintenance} addVisit={addVisitForContract} completeVisit={completeVisit} deleteVisit={deleteVisit} />;
      case "teams":
        return <TeamsView teams={teams} assignments={assignments} projects={projects} workers={workers} contractors={contractors} addTeam={addTeamFromForm} deleteTeam={deleteTeam} addAssignment={addAssignmentFromForm} deleteAssignment={deleteAssignment} />;
      case "attendance":
        return <AttendanceView attendance={attendance} workers={workers} projects={projects} upsertAttendance={upsertAttendance} />;
      case "leaves":
        return <LeavesView leaves={leaves} workers={workers} addLeave={addLeaveFromForm} updateLeaveStatus={updateLeaveStatus} deleteLeave={deleteLeave} />;
      case "payroll":
        return <PayrollView payroll={payroll} workers={workers} addPayroll={addPayrollFromForm} updatePayrollStatus={updatePayrollStatus} deletePayroll={deletePayroll} />;
      case "showcase":
        return <ShowcaseView showcase={showcase} addShowcase={addShowcaseItem} deleteShowcase={deleteShowcaseItem} />;
      case "site":
        return <SiteContentView stats={site.stats} updateStat={updateStat} addStat={addStat} deleteStat={deleteStat} site={site} updateSiteField={updateSiteField} />;
      case "config":
        return <CompanySettingsView stamp={site.stamp ?? ""} setStamp={setStamp} signature={site.signature ?? ""} setSignature={setSignature} payments={site.payments ?? []} updatePayment={updateDefaultPayment} addPayment={addDefaultPayment} deletePayment={deleteDefaultPayment} clients={clients} updateClientPayment={updateClientPayment} addClientPayment={addClientPayment} deleteClientPayment={deleteClientPayment} />;
      case "alerts":
        return <AlertsView alerts={visibleAlerts} onResolve={resolveAlert} goToSection={setActiveSection} />;
      case "settings":
        return <StaffView staff={staff} addStaff={addStaffMember} deleteStaff={deleteStaffMember} />;
      default:
        return <DashboardView totals={totals} projects={projects} clients={clients} stages={stages} workers={workers} alerts={visibleAlerts} invoices={filteredInvoices} expenses={expenses} />;
    }
  };
  const currentLabel = navItems.find((i) => i.id === activeSection)?.label ?? (activeSection === "projectDetail" ? "تفاصيل المشروع" : "");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/kenan-logo.png" alt="KENAN" />
        </div>
        <nav className="nav-list" aria-label="التنقل الرئيسي">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={activeSection === item.id ? "active" : ""} onClick={() => setActiveSection(item.id as Section)} title={item.label}>
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="logout-button" title="تسجيل الخروج" onClick={onLogout}>
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">نظام إدارة التشطيبات والتركيبات</p>
            <h1>{currentLabel}</h1>
          </div>
          <div className="topbar-actions">
            <button className="site-link-button" title="عرض الموقع" onClick={onOpenSite}>
              <Globe size={18} />
              <span>الموقع</span>
            </button>
            <div className="user-chip" title={user.email}>
              {user.picture ? <img src={user.picture} alt={user.name ?? ""} /> : <UserCog size={18} />}
              <span>{user.name ?? user.email}</span>
              <small className="user-role">{isAdmin ? "أدمن" : "موظف"}</small>
            </div>
          </div>
        </header>

        {renderSection()}

        {showRawToast && notice && (
          <div className="toast">{notice}</div>
        )}
      </main>
    </div>
  );
}