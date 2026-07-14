import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Flame,
  Images,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  MonitorCog,
  PackageCheck,
  Phone,
  Quote,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRoundCheck,
  Wrench,
  X,
  Wind,
  AlertTriangle,
} from "./icons";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AuthConfig, AuthUser } from "./auth";
import { seedShowcase, seedSite } from "./data";
import type { ShowcaseItem, SiteSettings } from "./types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: "outline" | "filled_blue" | "filled_black";
              size: "large" | "medium" | "small";
              type: "standard" | "icon";
              text: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              locale?: string;
              logo_alignment?: "left" | "center";
            },
          ) => void;
        };
      };
    };
  }
}

function loadShowcase(): ShowcaseItem[] {
  try {
    const raw = window.localStorage.getItem("kenan.showcase_v3");
    return raw ? (JSON.parse(raw) as ShowcaseItem[]) : seedShowcase;
  } catch {
    return seedShowcase;
  }
}

// أرقام/إعدادات الموقع التي يحررها الأدمن من اللوحة (تظهر في شريط الأرقام على الصفحة الرئيسية).
function loadSite(): SiteSettings {
  try {
    const raw = window.localStorage.getItem("kenan.site_v3");
    return raw ? { ...seedSite, ...(JSON.parse(raw) as Partial<SiteSettings>) } : seedSite;
  } catch {
    return seedSite;
  }
}

type PublicSiteProps = {
  config: AuthConfig | null;
  user: AuthUser | null;
  authError: string;
  authLoading: boolean;
  mode: "site" | "login";
  onLoginClick: () => void;
  onBackToSite: () => void;
  onGoogleCredential: (credential: string) => void;
  onEmailLogin: (email: string, password: string) => void;
  onOpenDashboard: () => void;
};

const services = [
  {
    icon: Flame,
    title: "أنظمة الإطفاء بمعالجة الرش",
    body: "تصميم وتوريد وتركيب شبكات الرش المائي الآلي الرطبة والجافة المعتمدة للدفاع المدني السعودي.",
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "أنظمة إنذار مبكر ضد الحريق",
    body: "كواشف ذكية وحساسات حرارية ودخانية متطورة مرتبطة بلوحات التحكم الكاشفة المبكرة لحماية الأرواح.",
    highlight: true,
  },
  {
    icon: Wind,
    title: "أنظمة سحب الدخان والتهوية",
    body: "تركيب مراوح دفع وسحب الدخان الميكانيكية وتأمين مسارات الهروب الآمنة في المنشآت التجارية والسكنية.",
  },
  {
    icon: AlertTriangle,
    title: "أنظمة أول أكسيد الكربون",
    body: "كواشف ذكية وتنبيهات لمستويات غاز أول أكسيد الكربون (CO) السام في الأقبية ومواقف السيارات.",
  },
  {
    icon: Flame,
    title: "أنظمة إطفاء بالغازات",
    body: "حلول الإطفاء النظيفة والذكية باستخدام الغازات الخاصة المعتمدة (FM200 - CO2 - FirePro - Aerosol).",
    highlight: true,
  },
  {
    icon: Camera,
    title: "المراقبة الأمنية (CCTV)",
    body: "كاميرات بدقة 4K مع تحليلات ذكية وكشف الحركة وتنبيهات الأمان والتسجيل المركزي.",
  },
  {
    icon: LockKeyhole,
    title: "التحكم بالدخول والعبور",
    body: "بوابات ذكية، أجهزة بصمة، كروت للدخول الآمن، وتقارير حركة الموظفين والزوار.",
  },
  {
    icon: Wrench,
    title: "الصيانة والدعم الفني",
    body: "عقود صيانة وقائية معتمدة لدى الدفاع المدني واستجابة فورية لحالات الطوارئ 24/7.",
  },
];

const projectGallery = [
  {
    image: "/images/cctv-project.jpg",
    title: "كاميرات المراقبة",
    subtitle: "أنظمة IP/NVR احترافية لتأمين المواقع التجارية",
    tag: "CCTV",
    tagColor: "brand",
  },
  {
    image: "/images/fire-pumps.jpg",
    title: "إنذار وإطفاء الحريق",
    subtitle: "تركيب حساسات الدخان والإنذار المبكر بتقنيات موثوقة",
    tag: "Fire Safety",
    tagColor: "orange",
  },
  {
    image: "/images/clean-agent-room.jpg",
    title: "الشبكات والبنية التحتية",
    subtitle: "تنظيم غرف السيرفر وتوصيل الشبكات بدقة احترافية",
    tag: "Networks",
    tagColor: "blue",
  },
  {
    image: "/images/smoke-extraction.jpg",
    title: "التهوية واستخراج الدخان",
    subtitle: "أنظمة تهوية متكاملة وشفط الدخان لتوفير بيئة آمنة",
    tag: "Ventilation",
    tagColor: "green",
  },
];

const workflowSteps = [
  {
    icon: ClipboardCheck,
    color: "purple",
    title: "طلب المعاينة",
    body: "تسجيل بيانات العميل والموقع ونوع النظام المطلوب: كاميرات، إنذار، شبكات أو صيانة.",
  },
  {
    icon: UserRoundCheck,
    color: "blue",
    title: "زيارة وتقييم الموقع",
    body: "المهندس يراجع المخارج، نقاط التركيب، مسارات الكابلات، واحتياج الخامات.",
  },
  {
    icon: ReceiptText,
    color: "indigo",
    title: "عرض فني ومالي",
    body: "إصدار عرض واضح يشمل المواصفات والكميات والمدة وخطة التنفيذ.",
  },
  {
    icon: Truck,
    color: "cyan",
    title: "تجهيز الخامات والفريق",
    body: "صرف خامات من المخزن وتوزيع الفنيين حسب تخصص كل مرحلة.",
  },
  {
    icon: PackageCheck,
    color: "green",
    title: "تنفيذ واختبار المنظومة",
    body: "تركيب وتشغيل واختبار تسجيل الكاميرات، الحساسات، الشبكة، ونقاط التحكم.",
  },
  {
    icon: BadgeCheck,
    color: "orange",
    title: "تسليم موثق وصيانة",
    body: "تسليم صور ومستندات وضمان وسجل صيانة قابل للرجوع في أي وقت.",
  },
];

const whyPoints = [
  {
    icon: BadgeCheck,
    title: "تسليم موثّق بالصور والتوقيع",
    body: "كل مشروع يُسلَّم بمحضر استلام موقّع، ومرفق معه صور ومستندات لكل مرحلة تقدر ترجع لها أي وقت تبي.",
  },
  {
    icon: ShieldCheck,
    title: "ضمان مكتوب على التركيبات",
    body: "بنود ضمان واضحة من تاريخ التسليم، فتعرف بالضبط وش المغطّى ووش حقوقك بعد التركيب.",
  },
  {
    icon: Building2,
    title: "منشأة رسمية وفواتير واضحة",
    body: "شركة مسجّلة (TRN 7050404537) ببيانات ثابتة على العروض والفواتير، تعامل رسمي من أول يوم.",
  },
  {
    icon: Wrench,
    title: "صيانة دورية وبلاغات طوارئ",
    body: "ما نختفي بعد التسليم؛ زيارات صيانة مجدولة ورد سريع على البلاغات مع سجل متابعة لكل موقع.",
  },
  {
    icon: UserRoundCheck,
    title: "فريق فني مدرّب لكل تخصص",
    body: "فنيون متخصصون في الكاميرات والإنذار والشبكات والتحكم بالدخول، مو فني واحد يسوّي كل شي.",
  },
  {
    icon: MonitorCog,
    title: "متابعة من نظام واحد",
    body: "نظام إدارة داخلي يربط المعاينة والخامات والمراحل والفواتير، فالتنفيذ منظّم والمواعيد محترمة.",
  },
];

export function PublicSite({
  config,
  user,
  authError,
  authLoading,
  mode,
  onLoginClick,
  onBackToSite,
  onGoogleCredential,
  onEmailLogin,
  onOpenDashboard,
}: PublicSiteProps) {
  const [showcase] = useState<ShowcaseItem[]>(() => loadShowcase());
  const [site] = useState<SiteSettings>(() => loadSite());
  const [activeItem, setActiveItem] = useState<ShowcaseItem | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "process" | "why">("about");

  useEffect(() => {
    if (!activeItem && !lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else setActiveItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, lightbox]);

  if (mode === "login") {
    return (
      <LoginPage
        config={config}
        authError={authError}
        authLoading={authLoading}
        onBackToSite={onBackToSite}
        onGoogleCredential={onGoogleCredential}
        onEmailLogin={onEmailLogin}
      />
    );
  }

  return (
    <div className="public-site">
      <header className="site-header">
        <a className="site-brand" href="#home" aria-label="KENAN">
          <img src="/kenan-logo.png" alt="KENAN" />
        </a>
        <nav className="site-nav" aria-label="روابط الموقع">
          <a href="#services">الخدمات</a>
          <a href="#projects">مشاريعنا</a>
          <a href="#about">من نحن</a>
          <a href="#showcase">عملاؤنا</a>
          <a href="#contact">تواصل</a>
        </nav>
        {user ? (
          <button className="site-login-button" onClick={onOpenDashboard}>
            لوحة التحكم
            <LayoutDashboard size={17} />
          </button>
        ) : (
          <button className="site-login-button" onClick={onLoginClick}>
            تسجيل دخول
            <ArrowLeft size={17} />
          </button>
        )}
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-copy">
            <span className="company-kicker">
              <ShieldCheck size={18} />
              أنظمة أمن وسلامة للمنشآت التجارية والسكنية
            </span>
            <h1>ننفّذ ونشغّل أنظمة الحماية من أول معاينة إلى آخر تقرير صيانة.</h1>
            <p>
              في كنان نجمع توريد وتركيب أنظمة الأمن والسلامة مع نظام إدارة متكامل يربط لك المشاريع
              والمواد والفنيين والفواتير ومراحل التسليم في مكان واحد.
            </p>
            <div className="hero-actions">
              <a className="primary-site-button pulse-glow-btn" href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`} target="_blank" rel="noreferrer">
                اطلب معاينة مجانية لموقعك
                <Phone size={17} />
              </a>
              <a className="ghost-site-button" href="#process">
                تعرّف على آلية العمل
                <ChevronLeft size={17} />
              </a>
            </div>
            <div className="hero-cta-hint">
              <span>⚡ معاينة مجانية وتقييم شامل متوفّر الحين لكل المشاريع في الرياض</span>
            </div>
            <div className="proof-strip">
              <span>كاميرات</span>
              <span>إنذار حريق</span>
              <span>شبكات</span>
              <span>صيانة 24/7</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="صورة من مشروع كنان">
            <div className="hero-img-wrap">
              <img src="/images/hero-install.jpg" alt="فريق تركيب أنظمة الأمن" />
              <div className="hero-img-overlay" />
            </div>
            <div className="hero-stats-bar">
              <div className="hero-stat">
                <strong>+150</strong>
                <span>مشروع مُسلَّم</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>24/7</strong>
                <span>دعم وصيانة</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong>100%</strong>
                <span>توثيق وضمان</span>
              </div>
            </div>
            <div className="handover-card">
              <BadgeCheck size={20} />
              <div>
                <strong>تسليم موثق</strong>
                <span>صور، ملفات، توقيع عميل، وسجل أعمال لكل مرحلة.</span>
              </div>
            </div>
          </div>
        </section>

        {site.stats.length > 0 && (
          <section className="proof-band-section" aria-label="أرقام كنان">
            <div className="proof-band">
              {site.stats.map((stat) => (
                <div key={stat.id} className="proof-item">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="site-section compact-band">
          <div>
            <strong>Riyadh - Al Manar</strong>
            <span>خدمة مواقع داخل المملكة العربية السعودية</span>
          </div>
          <div>
            <strong>TRN 7050404537</strong>
            <span>بيانات منشأة واضحة على العروض والفواتير</span>
          </div>
          <div>
            <strong>info@kenan4saftey.com</strong>
            <span>قنوات تواصل رسمية للمتابعة</span>
          </div>
        </section>

        {/* Project Gallery Section */}
        <section className="projects-gallery-section" id="projects">
          <div className="section-heading centered">
            <span>مشاريعنا</span>
            <h2>نماذج من أعمالنا المنفّذة.</h2>
            <p>
              من كاميرات المراقبة إلى الشبكات وأنظمة الإنذار — نُنفّذ كل مرحلة باحترافية موثّقة ونُسلّم بمعايير واضحة.
            </p>
          </div>
          <div className="projects-grid">
            {projectGallery.map((project, idx) => (
              <article className={`project-card project-card--${project.tagColor}`} key={idx}>
                <div className="project-card-img">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <span className={`project-tag project-tag--${project.tagColor}`}>{project.tag}</span>
                </div>
                <div className="project-card-body">
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {showcase.length > 0 && (
          <section className="site-section showcase-section" id="showcase">
            <div className="section-heading centered">
              <span>عملاؤنا</span>
              <h2>عملاء وشركات وثقوا في كنان.</h2>
              <p>اضغط على أي عميل لتشوف تفاصيل المشروع، صور التنفيذ، ورأيه بعد التسليم.</p>
            </div>
            <div className="showcase-marquee-container">
              <div className="showcase-marquee-track">
                {[...showcase, ...showcase, ...showcase, ...showcase, ...showcase, ...showcase, ...showcase, ...showcase].map((item, idx) => (
                  <button
                    type="button"
                    className="showcase-marquee-bubble"
                    key={`${item.id}-${idx}`}
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="showcase-marquee-avatar-wrap">
                      <PublicAvatar name={item.clientName} photo={item.clientPhoto} />
                    </div>
                    <h3>{item.clientName}</h3>
                    {item.projectType && <p>{item.projectType}</p>}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="site-section" id="services">
          <div className="section-heading">
            <span>الخدمات</span>
            <h2>حلول مترابطة بدل تنفيذ متفرق.</h2>
            <p>كل خدمة مبنية على حصر واضح، جدول تنفيذ، وتوثيق قابل للرجوع عند الصيانة أو التوسعات.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className={`service-item ${service.highlight ? "service-item--highlight" : ""}`} key={service.title}>
                  {service.highlight && (
                    <span className="service-highlight-badge">الدفاع المدني 🇸🇦</span>
                  )}
                  <Icon size={24} />
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="site-section about-interactive-section" id="about">
          <div className="section-heading centered">
            <span>من نحن ورؤيتنا</span>
            <h2>تعرّف على كنان، رؤيتنا، وطريقتنا المعتمدة في العمل.</h2>
            <p>مجلس إدارة ومجموعة مهندسين يدمجون بين التركيبات المطابقة للأنظمة والدعم الفني وبين إدارة المشاريع المنظمة.</p>
          </div>

          <div className="tabs-container">
            <div className="tabs-header" role="tablist" aria-label="أقسام التعريف بالشركة">
              <button
                className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
                role="tab"
                aria-selected={activeTab === "about"}
              >
                <Building2 size={16} />
                من نحن ورؤيتنا
              </button>
              <button
                className={`tab-btn ${activeTab === "process" ? "active" : ""}`}
                onClick={() => setActiveTab("process")}
                role="tab"
                aria-selected={activeTab === "process"}
              >
                <Clock size={16} />
                دورة وآلية العمل
              </button>
              <button
                className={`tab-btn ${activeTab === "why" ? "active" : ""}`}
                onClick={() => setActiveTab("why")}
                role="tab"
                aria-selected={activeTab === "why"}
              >
                <ShieldCheck size={16} />
                معايير الجودة والضمان
              </button>
            </div>

            <div className="tab-pane-content">
              {activeTab === "about" && (
                <div className="tab-about-view fade-in">
                  <div className="about-text-content">
                    <h3>الريادة في أنظمة السلامة ومكافحة الحريق</h3>
                    <p>
                      شركة كنان هي شركة سعودية متخصصة تقدم حلولاً هندسية متكاملة في مجال الأمن والسلامة ومكافحة الحريق لكافة الأنشطة (التجارية، السكنية، والصناعية) في المملكة العربية السعودية.
                    </p>
                    <p>
                      نحن نعمل على دمج التكنولوجيا الحديثة مع أفضل الممارسات الهندسية لتوفير بيئات آمنة، ونحرص على التوريد والتركيب والتشغيل بأعلى مستويات الجودة والمطابقة للاشتراطات الفنية المعتمدة.
                    </p>
                  </div>
                  <div className="about-cards-row">
                    <div className="about-vision-card">
                      <Flame size={26} className="card-icon" />
                      <h4>رؤيتنا</h4>
                      <p>أن نكون الشريك الموثوق الأول في المملكة لحماية الأرواح والممتلكات من خلال ابتكار حلول سلامة ذكية وفعّالة.</p>
                    </div>
                    <div className="about-vision-card">
                      <ShieldCheck size={26} className="card-icon blue-icon" />
                      <h4>مهمتنا</h4>
                      <p>تقديم حلول أمن وسلامة معتمدة ومتوافقة بالكامل مع لوائح الدفاع المدني السعودي والكود السعودي للبناء.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "process" && (
                <div className="tab-process-view fade-in">
                  <div className="process-timeline-flex">
                    {workflowSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div className="timeline-step-card" key={step.title}>
                          <div className="step-circle-badge">
                            <Icon size={20} />
                            <span className="step-number">{index + 1}</span>
                          </div>
                          <h4>{step.title}</h4>
                          <p>{step.body}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="process-cta-row">
                    <a className="workflow-cta-btn" href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`} target="_blank" rel="noreferrer">
                      اطلب معاينة مجانية لموقعك الحين
                      <ArrowLeft size={16} />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === "why" && (
                <div className="tab-why-view fade-in">
                  <div className="why-interactive-grid">
                    {whyPoints.map((point) => {
                      const Icon = point.icon;
                      return (
                        <div className="why-item-card" key={point.title}>
                          <div className="why-item-icon-box">
                            <Icon size={20} />
                          </div>
                          <div className="why-item-text">
                            <h4>{point.title}</h4>
                            <p>{point.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>


        <section className="site-section contact-full-section" id="contact">
          <div className="section-heading centered">
            <span>تواصل معنا</span>
            <h2>اطلب معاينة مجانية، ونوافيك بعرض فني ومالي خلال 24 ساعة.</h2>
            <p>مهندسونا جاهزون لدراسة موقعك وتقديم حل مطابق لاشتراطات الدفاع المدني.</p>
          </div>

          <div className="contact-full-grid">
            {/* Left: Contact Form */}
            <div className="contact-form-card">
              <h3 className="contact-form-title">
                <ClipboardCheck size={20} />
                اطلب معاينة مجانية
              </h3>
              <form
                className="contact-request-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const name = fd.get("name") as string;
                  const phone = fd.get("phone") as string;
                  const city = fd.get("city") as string;
                  const service = fd.get("service") as string;
                  const msg = fd.get("message") as string;
                  const text = `طلب معاينة مجانية\n\nالاسم: ${name}\nالجوال: ${phone}\nالمدينة: ${city}\nالخدمة المطلوبة: ${service}\n${msg ? "ملاحظات: " + msg : ""}`;
                  window.open(
                    `https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(text)}`,
                    "_blank"
                  );
                }}
              >
                <div className="contact-form-row">
                  <label className="contact-form-field">
                    <span>الاسم الكريم</span>
                    <input name="name" type="text" placeholder="محمد العتيبي" required />
                  </label>
                  <label className="contact-form-field">
                    <span>رقم الجوال</span>
                    <input name="phone" type="tel" placeholder="05xxxxxxxx" required dir="ltr" />
                  </label>
                </div>
                <div className="contact-form-row">
                  <label className="contact-form-field">
                    <span>المدينة</span>
                    <select name="city" required>
                      <option value="">اختر المدينة...</option>
                      <option>الرياض</option>
                      <option>جدة</option>
                      <option>مكة المكرمة</option>
                      <option>المدينة المنورة</option>
                      <option>الدمام</option>
                      <option>الخبر</option>
                      <option>تبوك</option>
                      <option>أخرى</option>
                    </select>
                  </label>
                  <label className="contact-form-field">
                    <span>الخدمة المطلوبة</span>
                    <select name="service" required>
                      <option value="">اختر الخدمة...</option>
                      <option>كاميرات مراقبة (CCTV)</option>
                      <option>نظام إنذار وإطفاء حريق</option>
                      <option>شبكات ونقاط بيانات</option>
                      <option>تهوية واستخراج دخان</option>
                      <option>صيانة وعقد سنوي</option>
                      <option>حزمة متكاملة</option>
                    </select>
                  </label>
                </div>
                <label className="contact-form-field">
                  <span>ملاحظات إضافية (اختياري)</span>
                  <textarea name="message" rows={3} placeholder="اذكر نوع المبنى أو أي تفاصيل مفيدة..." />
                </label>
                <button type="submit" className="contact-submit-btn whatsapp-style-btn">
                  <span className="wa-btn-text">راسلنا على واتساب</span>
                  <div className="wa-circle-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </div>
                </button>
              </form>
            </div>

            {/* Right: Contact Details */}
            <div className="contact-details-card">
              <h3 className="contact-form-title">
                <Phone size={20} />
                بياناتنا
              </h3>

              <div className="contact-detail-items">
                <a href={`tel:${site.contactPhone || "+966574590198"}`} className="contact-detail-item">
                  <div className="contact-detail-icon phone-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span>اتصال مباشر</span>
                    <strong dir="ltr">{site.contactPhone || "+966574590198"}</strong>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-detail-item whatsapp-item"
                >
                  <div className="contact-detail-icon wa-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <span>واتساب مباشر</span>
                    <strong>راسلنا الحين 🟢</strong>
                  </div>
                </a>

                <a href={`mailto:${site.contactEmail || "info@kenan4saftey.com"}`} className="contact-detail-item">
                  <div className="contact-detail-icon mail-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span>البريد الإلكتروني</span>
                    <strong>{site.contactEmail || "info@kenan4saftey.com"}</strong>
                  </div>
                </a>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon map-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span>الموقع</span>
                    <strong>{site.contactAddress || "الرياض - حي الفيحاء - شارع المطر"}</strong>
                  </div>
                </div>

                <a href="/registration.pdf" target="_blank" rel="noopener noreferrer" className="contact-detail-item">
                  <div className="contact-detail-icon reg-icon">
                    <ClipboardCheck size={18} />
                  </div>
                  <div>
                    <span>السجل التجاري</span>
                    <strong>7050404537 — تحميل PDF</strong>
                  </div>
                </a>
              </div>

              <div className="contact-hours-box">
                <Clock size={16} />
                <div>
                  <strong>ساعات العمل</strong>
                  <span>الأحد — الخميس: 8 ص — 6 م</span>
                  <span>الجمعة والسبت: للطوارئ فقط</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-cols-two">
          <div className="footer-logo-card">
            <img src="/kenan-logo.png" alt="KENAN Safety & Security" className="footer-logo-img" />
          </div>
          
          <div className="footer-contact-column">
            <h4>معلومات التواصل</h4>
            <div className="contact-divider"></div>
            
            <div className="contact-list-items">
              <div className="contact-item-box">
                <MapPin className="contact-icon" size={20} />
                <div className="contact-text-lines">
                  <strong>{site.contactAddress || "الرياض - حي المنار"}</strong>
                  <span>المملكة العربية السعودية</span>
                </div>
              </div>
              
              <a href={`tel:${site.contactPhone || "+966574590198"}`} className="contact-item-box">
                <Phone className="contact-icon" size={20} />
                <div className="contact-text-lines">
                  <strong>{site.contactPhone || "+966574590198"}</strong>
                </div>
              </a>
              
              <a href={`mailto:${site.contactEmail || "info@kenan4saftey.com"}`} className="contact-item-box">
                <Mail className="contact-icon" size={20} />
                <div className="contact-text-lines">
                  <strong>{site.contactEmail || "info@kenan4saftey.com"}</strong>
                </div>
              </a>
              
              <div className="contact-item-box">
                <ReceiptText className="contact-icon" size={20} />
                <div className="contact-text-lines">
                  <span>TRN: 7050404537</span>
                </div>
              </div>

              <a href="/registration.pdf" target="_blank" rel="noopener noreferrer" className="contact-item-box registration-download">
                <ClipboardCheck className="contact-icon highlight" size={20} />
                <div className="contact-text-lines">
                  <strong>السجل التجاري بالسعودية (تحميل PDF)</strong>
                </div>
              </a>
            </div>
            
            <div className="social-links-row">
              {site.contactFacebook && (
                <a href={site.contactFacebook} target="_blank" rel="noreferrer" className="social-circle" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.39-1 1-1h2V2h-3c-2.5 0-3 1.5-3 3.5V8z" />
                  </svg>
                </a>
              )}
              {site.contactInstagram && (
                <a href={site.contactInstagram} target="_blank" rel="noreferrer" className="social-circle" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              )}
              {site.contactTikTok && (
                <a href={site.contactTikTok} target="_blank" rel="noreferrer" className="social-circle" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.83.17 1.68.28 2.54.32v3.92c-1.44-.08-2.84-.57-4-1.42v6.48c0 4.1-2.91 7.74-6.96 8.35-4.46.8-8.62-2.14-9.45-6.57-.96-4.4 1.77-8.8 6.12-9.74.88-.2 1.79-.22 2.68-.08V9.61c-1.39-.46-2.9.02-3.83 1.11-.84.97-1.19 2.27-.95 3.51.34 2.1 2.3 3.58 4.43 3.32 1.79-.1 3.21-1.53 3.33-3.32V0c-.26.01-.52.01-.78.02z" />
                  </svg>
                </a>
              )}
              <a href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`} target="_blank" rel="noreferrer" className="social-circle" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} شركة كنان لأنظمة الأمن والسلامة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      {activeItem && (
        <div className="showcase-modal" role="dialog" aria-modal="true" onClick={() => setActiveItem(null)}>
          <div className="showcase-modal-inner" onClick={(event) => event.stopPropagation()}>
            <button className="showcase-modal-close" onClick={() => setActiveItem(null)} aria-label="إغلاق">
              <X size={20} />
            </button>
            <div className="showcase-modal-grid">
              <div className="showcase-modal-info">
                <div className="showcase-modal-head">
                  <PublicAvatar name={activeItem.clientName} photo={activeItem.clientPhoto} />
                  <h3>{activeItem.clientName}</h3>
                  <p>{activeItem.projectType || "مشروع منفّذ"}</p>
                </div>
                <ul className="showcase-meta">
                  {activeItem.projectType && (
                    <li>
                      <BadgeCheck size={16} />
                      <div>
                        <span>نوع العمل</span>
                        <strong>{activeItem.projectType}</strong>
                      </div>
                    </li>
                  )}
                  {activeItem.city && (
                    <li>
                      <MapPin size={16} />
                      <div>
                        <span>المدينة</span>
                        <strong>{activeItem.city}</strong>
                      </div>
                    </li>
                  )}
                  {activeItem.year && (
                    <li>
                      <CalendarDays size={16} />
                      <div>
                        <span>سنة التنفيذ</span>
                        <strong>{activeItem.year}</strong>
                      </div>
                    </li>
                  )}
                  {activeItem.duration && (
                    <li>
                      <Clock size={16} />
                      <div>
                        <span>مدة التنفيذ</span>
                        <strong>{activeItem.duration}</strong>
                      </div>
                    </li>
                  )}
                </ul>
                {activeItem.opinion && (
                  <blockquote className="showcase-quote">
                    <Quote size={20} />
                    <p>{activeItem.opinion}</p>
                  </blockquote>
                )}
              </div>
              <div className="showcase-modal-media">
                {activeItem.photos.length > 0 ? (
                  <>
                    <h4 className="showcase-media-title">
                      <Images size={17} />
                      صور من تنفيذ المشروع
                    </h4>
                    <div className="showcase-gallery">
                      {activeItem.photos.map((src, index) => (
                        <button
                          type="button"
                          className="showcase-gallery-item"
                          key={index}
                          onClick={() => setLightbox(src)}
                          aria-label={`تكبير صورة ${index + 1}`}
                        >
                          <img src={src} alt={`${activeItem.clientName} - ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="showcase-empty-media">
                    <Images size={26} />
                    <p>سيتم إضافة صور هذا المشروع قريبًا.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="إغلاق">
            <X size={22} />
          </button>
          <img src={lightbox} alt="صورة العمل" onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      {/* Floating WhatsApp Widget */}
      <div className="floating-whatsapp-container">
        <a
          href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`}
          target="_blank"
          rel="noreferrer"
          className="floating-whatsapp-widget"
          aria-label="تواصل معنا عبر واتساب"
        >
          <div className="whatsapp-widget-pulse"></div>
          <div className="whatsapp-widget-content">
            <span className="whatsapp-widget-text">راسلنا على واتساب</span>
            <div className="whatsapp-widget-icon-wrap">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============================================================
// صفحة التواصل المستقلة — /contact
// مش مربوطة بالقائمة، لينك مباشر فقط
// ============================================================
export function ContactPage() {
  const site = loadSite();

  return (
    <div className="contact-standalone-page" dir="rtl">
      {/* Watermark Logo Background */}
      <div className="contact-watermark-bg">
        <img src="/kenan-logo.png" alt="Watermark" />
      </div>

      <header className="contact-standalone-header">
        {/* Swapped elements to align logo to the left in RTL */}
        <span className="contact-standalone-tagline">أنظمة الأمن والسلامة — الرياض</span>
        <a href="/" className="contact-standalone-brand">
          <img src="/kenan-logo.png" alt="KENAN" />
        </a>
      </header>

      <main className="contact-standalone-main">
        <div className="contact-standalone-heading">
          <h1>تواصل معنا الآن</h1>
        </div>

        <div className="contact-standalone-grid-two">
          {/* واتساب */}
          <a
            href={`https://wa.me/${site.contactWhatsApp || "966574590198"}?text=${encodeURIComponent(site.contactWhatsAppMsg || "أريد معاينة مجانية لموقعي")}`}
            target="_blank"
            rel="noreferrer"
            className="contact-channel-card whatsapp"
          >
            <div className="channel-icon-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </div>
            <div className="channel-details">
              <h3>واتساب مباشر</h3>
              <p>راسلنا الحين للاستشارات والمعاينة</p>
              <span className="channel-value">راسلنا الحين 🟢</span>
            </div>
          </a>

          {/* اتصال مباشر */}
          <a
            href={`tel:${site.contactPhone || "+966574590198"}`}
            className="contact-channel-card phone"
          >
            <div className="channel-icon-wrap">
              <Phone size={24} />
            </div>
            <div className="channel-details">
              <h3>اتصال مباشر</h3>
              <p>تواصل معنا هاتفياً للرد الفوري</p>
              <span className="channel-value" dir="ltr">{site.contactPhone || "+966574590198"}</span>
            </div>
          </a>

          {/* فيسبوك */}
          {site.contactFacebook && (
            <a
              href={site.contactFacebook}
              target="_blank"
              rel="noreferrer"
              className="contact-channel-card facebook"
            >
              <div className="channel-icon-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.2 10.44 21.95V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.95 14.22 5.95C15.31 5.95 16.25 6.03 16.52 6.07V8.75H14.93C13.72 8.75 13.48 9.33 13.48 10.18V12.06H16.45L16.06 14.96H13.48V21.95C18.25 21.2 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </div>
              <div className="channel-details">
                <h3>فيسبوك</h3>
                <p>تابع صفحتنا الرسمية على فيسبوك</p>
                <span className="channel-value">kenansafety</span>
              </div>
            </a>
          )}

          {/* إنستغرام */}
          {site.contactInstagram && (
            <a
              href={site.contactInstagram}
              target="_blank"
              rel="noreferrer"
              className="contact-channel-card instagram"
            >
              <div className="channel-icon-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div className="channel-details">
                <h3>إنستغرام</h3>
                <p>شاهد أعمالنا وتغطياتنا الميدانية</p>
                <span className="channel-value">kenansafety</span>
              </div>
            </a>
          )}

          {/* تيك توك */}
          {site.contactTikTok && (
            <a
              href={site.contactTikTok}
              target="_blank"
              rel="noreferrer"
              className="contact-channel-card tiktok"
            >
              <div className="channel-icon-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.83.17 1.68.28 2.54.32v3.92c-1.44-.08-2.84-.57-4-1.42v6.48c0 4.1-2.91 7.74-6.96 8.35-4.46.8-8.62-2.14-9.45-6.57-.96-4.4 1.77-8.8 6.12-9.74.88-.2 1.79-.22 2.68-.08V9.61c-1.39-.46-2.9.02-3.83 1.11-.84.97-1.19 2.27-.95 3.51.34 2.1 2.3 3.58 4.43 3.32 1.79-.1 3.21-1.53 3.33-3.32V0c-.26.01-.52.01-.78.02z" />
                </svg>
              </div>
              <div className="channel-details">
                <h3>تيك توك</h3>
                <p>تابع مقاطع الفيديو النصائحية</p>
                <span className="channel-value">kenansafety</span>
              </div>
            </a>
          )}

          {/* البريد الإلكتروني */}
          {site.contactEmail && (
            <a
              href={`mailto:${site.contactEmail}`}
              className="contact-channel-card email"
            >
              <div className="channel-icon-wrap">
                <Mail size={24} />
              </div>
              <div className="channel-details">
                <h3>البريد الإلكتروني</h3>
                <p>راسلنا رسمياً لطلب عروض الأسعار</p>
                <span className="channel-value">{site.contactEmail}</span>
              </div>
            </a>
          )}

          {/* الموقع */}
          {site.contactAddress && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(site.contactAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="contact-channel-card location"
            >
              <div className="channel-icon-wrap">
                <MapPin size={24} />
              </div>
              <div className="channel-details">
                <h3>موقع المؤسسة</h3>
                <p>تفضل بزيارتنا في مقرنا الرئيسي</p>
                <span className="channel-value">{site.contactAddress}</span>
              </div>
            </a>
          )}
        </div>

        {/* معلومات العمل والسجل */}
        <div className="contact-standalone-footer-info">
          <div className="footer-info-item">
            <strong>ساعات العمل:</strong> الأحد — الخميس (8 ص — 6 م) | الجمعة والسبت للطوارئ فقط
          </div>
          <div className="footer-info-item">
            <strong>السجل التجاري:</strong> 7050404537 | <strong>الرقم الضريبي (TRN):</strong> 7050404537
          </div>
        </div>
      </main>
    </div>
  );
}

function PublicAvatar({ name, photo }: { name: string; photo: string }) {
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

function LoginPage({
  config,
  authError,
  authLoading,
  onBackToSite,
  onGoogleCredential,
  onEmailLogin,
}: {
  config: AuthConfig | null;
  authError: string;
  authLoading: boolean;
  onBackToSite: () => void;
  onGoogleCredential: (credential: string) => void;
  onEmailLogin: (email: string, password: string) => void;
}) {
  const isLocalhost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim() && password) onEmailLogin(email.trim(), password);
  };

  return (
    <div className="login-page">
      <button className="back-site-button" onClick={onBackToSite}>
        <ChevronLeft size={17} />
        الرجوع للموقع
      </button>
      <section className="login-panel">
        <div className="login-intro">
          <img src="/kenan-logo.png" alt="KENAN" />
          <span>Staff access</span>
          <h1>دخول نظام KENAN</h1>
          <p>
            الإدارة تدخل بحساب Google المعتمد، والموظفون يدخلون بالبريد وكلمة المرور التي ينشئها الأدمن، وكل موظف يرى
            الأقسام المسموح له بها فقط.
          </p>
          <ul>
            <li>
              <CheckCircle2 size={18} />
              الإدارة عبر Google
            </li>
            <li>
              <CheckCircle2 size={18} />
              الموظفون بالبريد وكلمة المرور
            </li>
            <li>
              <CheckCircle2 size={18} />
              صلاحيات محددة لكل حساب
            </li>
          </ul>
        </div>
        <div className="google-login-box">
          <Sparkles size={23} />
          <h2>تسجيل الدخول</h2>

          <form className="email-login-form" onSubmit={submitEmail}>
            <label>
              البريد الإلكتروني
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@kenan.com"
                autoComplete="username"
              />
            </label>
            <label>
              كلمة المرور
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </label>
            <button className="primary-site-button" type="submit" disabled={authLoading}>
              <LockKeyhole size={17} />
              دخول الموظفين
            </button>
          </form>

          <div className="login-divider">
            <span>أو دخول الإدارة</span>
          </div>

          {config?.googleReady ? (
            <GoogleButton clientId={config.clientId} disabled={authLoading} onCredential={onGoogleCredential} />
          ) : (
            <div className="auth-warning">لم يتم العثور على Google client ID في الإعدادات.</div>
          )}
          {authLoading && <span className="auth-status">جاري التحقق من الحساب...</span>}
          {authError && <div className="auth-error">{authError}</div>}
          {isLocalhost && (
            <div className="dev-origin-note" style={{ marginBottom: "8px" }}>
              للتجربة محليًا أضف هذا العنوان في Google OAuth Authorized JavaScript origins:
              <code>{window.location.origin}</code>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function GoogleButton({
  clientId,
  disabled,
  onCredential,
}: {
  clientId: string;
  disabled: boolean;
  onCredential: (credential: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.google || attempts > 60) {
        window.clearInterval(timer);
        if (!cancelled) setScriptReady(!!window.google);
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !window.google || !buttonRef.current || disabled) return;

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: clientId,
      cancel_on_tap_outside: false,
      callback: (response) => {
        if (response.credential) {
          void onCredential(response.credential);
        }
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: 320,
      locale: "ar",
    });
  }, [clientId, disabled, onCredential, scriptReady]);

  if (!scriptReady) {
    return <div className="auth-warning">جاري تحميل Google Sign-In...</div>;
  }

  return <div className="google-button-slot" ref={buttonRef} aria-disabled={disabled} />;
}
