-- ============================================================
-- Kanan ERP - Complete MySQL Database Schema & Seed Data
-- Database: u463801179_kanan_db
-- User: u463801179_kanan_user
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS worker_assignments;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS project_files;
DROP TABLE IF EXISTS project_stages;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Admin Accounts
INSERT INTO users (name, email, password_hash, role) VALUES 
('إدارة كنان للسلامة', 'kenansafety.sec@gmail.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'admin'),
('م. كريم عادل', 'kareem@kenan.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'engineer'),
('أحمد المحاسب', 'accounts@kenan.com', '$2a$10$wK1k6aVvVzO0Yh6KzY.H7eG1f5vG.3s7i3r9s8t7u6v5w4x3y2z1', 'accountant');

-- 2. Clients Table
CREATE TABLE clients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address TEXT,
  national_id VARCHAR(40),
  client_type VARCHAR(80),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clients (id, name, phone, address, client_type, notes) VALUES
(1, 'أحمد الشامي', '01001234567', 'التجمع الخامس، القاهرة', 'مالك وحدة', 'يفضل المتابعة عبر واتساب'),
(2, 'شركة المدار', '01119876543', 'مدينة نصر، القاهرة', 'شركة', 'تركيبات كاميرات وشبكات'),
(3, 'محمود عبدالعزيز', '01225556667', 'الشيخ زايد، الجيزة', 'مقاول باطن', 'مشروع دهانات وأرضيات');

-- 3. Projects Table
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
  budget DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO projects (id, client_id, project_name, project_type, address, start_date, end_date, status, engineer_id, budget, progress) VALUES
(1, 1, 'فيلا الياسمين', 'نظام إنذار حريق', 'التجمع الخامس', '2026-05-01', '2026-06-15', 'جاري', 2, 850000.00, 58),
(2, 2, 'فرع المدار الرئيسي', 'كاميرات وشبكات', 'مدينة نصر', '2026-04-22', '2026-05-28', 'متأخر', 2, 240000.00, 72),
(3, 3, 'شقة الشيخ زايد', 'إطفاء بالمياه (رش آلي)', 'الشيخ زايد', '2026-05-12', '2026-05-30', 'جاري', 2, 125000.00, 35);

-- 4. Project Stages Table
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
(1, 1, 'المعاينة', 'تم', 'تم اعتماد المقاسات', '2026-05-01'),
(2, 1, 'التأسيس', 'تم', 'تم تأسيس الكهرباء والسباكة', '2026-05-11'),
(3, 1, 'التركيب', 'جاري', 'تركيب وحدات الإضاءة والإشعار', '2026-05-21'),
(4, 1, 'الاختبار', 'لم يبدأ', '', '2026-05-21'),
(5, 1, 'التسليم', 'لم يبدأ', '', '2026-05-21'),
(6, 2, 'المعاينة', 'تم', 'تم تحديد نقاط الكاميرات', '2026-04-22'),
(7, 2, 'التأسيس', 'تم', 'سحب كابلات الشبكة', '2026-05-03'),
(8, 2, 'التركيب', 'جاري', 'نقص في بعض حوامل الكاميرات', '2026-05-23'),
(9, 2, 'الاختبار', 'جاري', 'اختبار التسجيل الليلي', '2026-05-23'),
(10, 2, 'التسليم', 'لم يبدأ', '', '2026-05-23');

-- 5. Workers Table
CREATE TABLE workers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(40),
  daily_rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  monthly_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO workers (id, name, specialty, phone, daily_rate, monthly_salary, is_active) VALUES
(1, 'سيد مصطفى', 'كهربائي', '01005550101', 450.00, 0.00, 1),
(2, 'أحمد فوزي', 'فني كاميرات', '01104440202', 500.00, 0.00, 1),
(3, 'حسن إبراهيم', 'نقاش', '01203330303', 420.00, 0.00, 1),
(4, 'رامي نبيل', 'مشرف موقع', '01002220404', 0.00, 9000.00, 1);

-- 6. Inventory Table
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
(1, 'توريد وتركيب مضخة حريق كهربائية 350 ج/د +جوكي 350 ج/د', 'TOSY', 5, 'مجموعة', 12000.00, 15000.00, 'TOSY Pumps', 1, '2026-05-10'),
(2, 'مواسير البولي ايثيلين HDPE بقطر (4 بوصة)', 'ALMONIF', 250, 'متر طولي', 45.00, 60.00, 'المنيف للمواسير', 50, '2026-05-14'),
(3, 'رشاش مياه سفلي بقطر 0.5 بوصة درجة 68 مئوية', 'TYCO أمريكي', 500, 'حبة', 180.00, 250.00, 'تايكو للسلامة', 100, '2026-05-04'),
(4, 'صندوق حريق باب واحد 1.5 بوصة داخلي', 'ALSABEH', 25, 'صندوق', 1000.00, 1400.00, 'الصانع المحلي', 5, '2026-05-20'),
(5, 'طفاية حريق بودرة 6 كغ', 'ALSABEH', 150, 'طفاية', 35.00, 50.00, 'الصانع المحلي', 20, '2026-05-20');

-- 7. Invoices Table
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

-- 8. Expenses Table
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
(1, 1, 'خامات', 185000.00, 'توريد خامات كهرباء وتشطيب', '2026-05-06'),
(2, 2, 'عمال', 42000.00, 'فنيين كاميرات وشبكات', '2026-05-17'),
(3, 3, 'نقل', 6500.00, 'نقل خامات دهانات', '2026-05-20');
