-- ============================================================
-- Kanan ERP - FULL Comprehensive MySQL Database Schema & Seed Data
-- Database: u463801179_kanan_db
-- Includes: All 18 Modules (Projects, Clients, Contractors, Stages,
-- Workers, Attendance, Payroll, Inventory, Invoices, Expenses,
-- Contracts, Quotations, Deficiencies, Maintenance, Settings)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS showcase_items;
DROP TABLE IF EXISTS maintenance_visits;
DROP TABLE IF EXISTS maintenance_contracts;
DROP TABLE IF EXISTS deficiencies;
DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS project_files;
DROP TABLE IF EXISTS project_stages;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS contractors;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users & Staff Accounts
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  sections JSON NULL,
  permissions JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, name, email, password_hash, role) VALUES 
(1, 'إدارة كنان للسلامة', 'kenansafety.sec@gmail.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'admin'),
(2, 'م. كريم عادل', 'kareem@kenan.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'engineer'),
(3, 'أحمد المحاسب', 'accounts@kenan.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'accountant');

-- 2. Clients
CREATE TABLE clients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address TEXT,
  sector VARCHAR(40) DEFAULT 'خاص',
  email VARCHAR(180),
  city VARCHAR(80),
  commercial_register VARCHAR(80),
  tax_id VARCHAR(80),
  digital_wallet VARCHAR(80),
  client_type VARCHAR(80) DEFAULT 'مالك',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clients (id, name, phone, address, client_type, notes) VALUES
(1, 'أحمد الشامي', '01001234567', 'التجمع الخامس، القاهرة', 'مالك وحدة', 'يفضل المتابعة عبر واتساب'),
(2, 'شركة المدار', '01119876543', 'مدينة نصر، القاهرة', 'شركة', 'تركيبات كاميرات وشبكات'),
(3, 'محمود عبدالعزيز', '01225556667', 'الشيخ زايد، الجيزة', 'مقاول باطن', 'مشروع دهانات وأرضيات');

-- 3. Contractors
CREATE TABLE contractors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  company VARCHAR(180),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO contractors (id, name, phone, specialty, company, address) VALUES
(1, 'مؤسسة الأمل للتركيبات', '01099998888', 'تركيب شبكات إطفاء', 'الأمل للمقاولات', 'القاهرة'),
(2, 'شركة النور الكهربائية', '01288887777', 'تأسيس وإنذار مبكر', 'النور جروب', 'الجيزة');

-- 4. Projects
CREATE TABLE projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT NOT NULL,
  project_name VARCHAR(220) NOT NULL,
  project_type VARCHAR(80) NOT NULL,
  address TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'جاري',
  engineer_id BIGINT,
  engineer_name VARCHAR(160),
  budget DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO projects (id, client_id, project_name, project_type, address, start_date, end_date, status, engineer_name, budget, progress) VALUES
(1, 1, 'فيلا الياسمين', 'نظام إنذار حريق', 'التجمع الخامس', '2026-05-01', '2026-06-15', 'جاري', 'م. كريم عادل', 850000.00, 58),
(2, 2, 'فرع المدار الرئيسي', 'كاميرات وشبكات', 'مدينة نصر', '2026-04-22', '2026-05-28', 'متأخر', 'م. ندى حسام', 240000.00, 72),
(3, 3, 'شقة الشيخ زايد', 'إطفاء بالمياه (رش آلي)', 'الشيخ زايد', '2026-05-12', '2026-05-30', 'جاري', 'م. يوسف سمير', 125000.00, 35);

-- 5. Project Stages
CREATE TABLE project_stages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  stage_name VARCHAR(120) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'لم يبدأ',
  notes TEXT,
  customer_signature_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO project_stages (id, project_id, stage_name, status, notes, updated_at) VALUES
(1, 1, 'المعاينة', 'تم', 'تم اعتماد المقاسات والمخططات الهندسية', '2026-05-01'),
(2, 1, 'التأسيس', 'تم', 'تم تمديد شبكات الأنابيب والكابلات', '2026-05-11'),
(3, 1, 'التركيب', 'جاري', 'تركيب الحساسات ومضخات الحريق', '2026-05-21'),
(4, 1, 'الاختبار', 'لم يبدأ', 'اختبار الضغوط واللوحة الرئيسية', '2026-05-21'),
(5, 1, 'التسليم', 'لم يبدأ', 'اعتماد الدفاع المدني', '2026-05-21'),
(6, 2, 'المعاينة', 'تم', 'تم تحديد نقاط الكاميرات وغرفة التحكم', '2026-04-22'),
(7, 2, 'التأسيس', 'تم', 'سحب كابلات السيرفرات والشبكة', '2026-05-03'),
(8, 2, 'التركيب', 'جاري', 'تركيب الكاميرات وتوصيل الـ NVR', '2026-05-23');

-- 6. Workers
CREATE TABLE workers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(40),
  daily_rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  monthly_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  employment_type VARCHAR(40) NOT NULL DEFAULT 'يومي',
  national_id VARCHAR(40),
  current_project_id BIGINT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO workers (id, name, specialty, phone, daily_rate, monthly_salary, employment_type, current_project_id) VALUES
(1, 'سيد مصطفى', 'كهربائي', '01005550101', 450.00, 0.00, 'يومي', 1),
(2, 'أحمد فوزي', 'فني كاميرات', '01104440202', 500.00, 0.00, 'يومي', 2),
(3, 'حسن إبراهيم', 'نقاش', '01203330303', 420.00, 0.00, 'يومي', 3),
(4, 'رامي نبيل', 'مشرف موقع', '01002220404', 0.00, 9000.00, 'شهري', 1);

-- 7. Attendance
CREATE TABLE attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  worker_id BIGINT NOT NULL,
  project_id BIGINT,
  attendance_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'حاضر',
  hours DECIMAL(5, 2) NOT NULL DEFAULT 8.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO attendance (worker_id, project_id, attendance_date, status, hours) VALUES
(1, 1, '2026-05-24', 'حاضر', 8.00),
(2, 2, '2026-05-24', 'حاضر', 7.50),
(3, 3, '2026-05-24', 'غياب', 0.00),
(4, 1, '2026-05-24', 'حاضر', 8.00);

-- 8. Inventory (المخزن والخامات)
CREATE TABLE inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(40) NOT NULL DEFAULT 'قطعة',
  purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  supplier VARCHAR(180),
  min_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  received_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO inventory (id, item_name, brand, quantity, unit, purchase_price, sale_price, supplier, min_quantity, received_at) VALUES
(1, 'مضخة حريق كهربائية 350 ج/د +جوكي 350 ج/د', 'TOSY', 5, 'مجموعة', 12000.00, 15000.00, 'TOSY Pumps', 1, '2026-05-10'),
(2, 'مواسير البولي ايثيلين HDPE قطر 4 بوصة', 'ALMONIF', 250, 'متر طولي', 45.00, 60.00, 'المنيف للمواسير', 50, '2026-05-14'),
(3, 'رشاش مياه سفلي 0.5 بوصة 68 مئوية', 'TYCO أمريكي', 500, 'حبة', 180.00, 250.00, 'تايكو للسلامة', 100, '2026-05-04'),
(4, 'صندوق حريق باب واحد 1.5 بوصة داخلي', 'ALSABEH', 25, 'صندوق', 1000.00, 1400.00, 'الصانع المحلي', 5, '2026-05-20'),
(5, 'طفاية حريق بودرة 6 كغ', 'ALSABEH', 150, 'طفاية', 35.00, 50.00, 'الصانع المحلي', 20, '2026-05-20');

-- 9. Invoices (الفواتير)
CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  amount DECIMAL(14, 2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'جزئية',
  due_date DATE,
  paid_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoices (id, project_id, invoice_number, amount, status, due_date) VALUES
(1, 1, 'INV-2026-001', 320000.00, 'مدفوعة', '2026-05-05'),
(2, 2, 'INV-2026-002', 90000.00, 'جزئية', '2026-05-09'),
(3, 3, 'INV-2026-003', 45000.00, 'متأخرة', '2026-05-18');

-- 10. Expenses (المصروفات)
CREATE TABLE expenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT,
  expense_type VARCHAR(80) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO expenses (id, project_id, expense_type, amount, description, expense_date) VALUES
(1, 1, 'خامات', 185000.00, 'توريد خامات كهرباء وتأسيس', '2026-05-06'),
(2, 2, 'عمال', 42000.00, 'أجور فنيين كاميرات', '2026-05-17'),
(3, 3, 'نقل', 6500.00, 'نقل معدات ومواسط إطفاء', '2026-05-20');

-- 11. Contracts (العقود والضمانات)
CREATE TABLE contracts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  contract_value DECIMAL(14, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EGP',
  start_date DATE,
  end_date DATE,
  warranty VARCHAR(220),
  clauses TEXT,
  second_party_name VARCHAR(180),
  location_city VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO contracts (id, project_id, contract_value, currency, start_date, end_date, warranty, clauses, second_party_name, location_city) VALUES
(1, 1, 850000.00, 'EGP', '2026-05-01', '2026-06-15', 'ضمان عامين شاملاً الصيانة والقطع', 'عقد توريد وتركيب شبكة إطفاء وتنبيه المبنى', 'أحمد الشامي', 'القاهرة'),
(2, 2, 240000.00, 'EGP', '2026-04-22', '2026-05-28', 'ضمان سنة واحدة على الأجهزة', 'توريد وتركيب كاميرات مراقبة وشبكات سحابية', 'شركة المدار', 'القاهرة');

-- 12. Quotations (عروض الأسعار)
CREATE TABLE quotations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  quotation_number VARCHAR(80) NOT NULL UNIQUE,
  client_id BIGINT NOT NULL,
  quotation_date DATE NOT NULL,
  valid_until DATE,
  status VARCHAR(40) DEFAULT 'معتمد',
  total_value DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  tax_percent DECIMAL(5, 2) DEFAULT 15.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO quotations (id, quotation_number, client_id, quotation_date, status, total_value) VALUES
(1, 'QUO-2026-101', 1, '2026-04-25', 'معتمد', 850000.00),
(2, 'QUO-2026-102', 2, '2026-04-18', 'مرسل', 240000.00);

-- 13. Deficiencies (ملاحظات ونواقص الموقع)
CREATE TABLE deficiencies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'مفتوح',
  severity VARCHAR(40) DEFAULT 'متوسط',
  reported_by VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO deficiencies (project_id, description, status, severity, reported_by) VALUES
(1, 'مطلوب تعديل مسار كابل الإنذار بالدور الثاني', 'مفتوح', 'متوسط', 'م. كريم عادل'),
(2, 'تثبيت حوامل الكاميرات الخارجية بالمدخل الرئيسي', 'تم الحل', 'عالي', 'م. ندى حسام');

-- 14. Maintenance Contracts (عقود وزيارات الصيانة)
CREATE TABLE maintenance_contracts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT NOT NULL,
  contract_name VARCHAR(220) NOT NULL,
  system_type VARCHAR(120) NOT NULL,
  visit_frequency VARCHAR(80) DEFAULT 'شهري',
  start_date DATE,
  end_date DATE,
  status VARCHAR(40) DEFAULT 'ساري',
  annual_cost DECIMAL(14, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO maintenance_contracts (client_id, contract_name, system_type, visit_frequency, start_date, end_date, status, annual_cost) VALUES
(1, 'عقد صيانة دورية لفيلا الياسمين', 'إنذار وإطفاء حريق', 'شهري', '2026-06-01', '2027-06-01', 'ساري', 36000.00);

-- 15. Site Settings (إعدادات النظام العامة)
CREATE TABLE site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name VARCHAR(180) DEFAULT 'شركة كنان لأنظمة السلامة',
  stamp_url TEXT,
  signature_url TEXT,
  contact_phone VARCHAR(40) DEFAULT '01000000000',
  contact_email VARCHAR(180) DEFAULT 'kenansafety.sec@gmail.com',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (id, company_name, contact_email) VALUES (1, 'شركة كنان لأنظمة السلامة ومكافحة الحريق', 'kenansafety.sec@gmail.com');
