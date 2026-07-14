CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL CHECK (role IN ('admin', 'engineer', 'accountant', 'worker', 'reception')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address TEXT,
  national_id VARCHAR(40),
  client_type VARCHAR(80),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_name VARCHAR(220) NOT NULL,
  project_type VARCHAR(80) NOT NULL,
  address TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'جاري',
  engineer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  budget NUMERIC(14, 2) NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_stages (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_name VARCHAR(120) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'لم يبدأ',
  notes TEXT,
  customer_signature_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_files (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id BIGINT REFERENCES project_stages(id) ON DELETE SET NULL,
  file_name VARCHAR(220) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(60) NOT NULL,
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(40),
  daily_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE worker_assignments (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_from DATE NOT NULL,
  assigned_to DATE,
  notes TEXT
);

CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  hours NUMERIC(5, 2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'حاضر',
  UNIQUE(worker_id, attendance_date)
);

CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(40),
  address TEXT,
  notes TEXT
);

CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  item_name VARCHAR(180) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL DEFAULT 'قطعة',
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
  min_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  received_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  amount NUMERIC(14, 2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'جزئية',
  due_date DATE,
  paid_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  expense_type VARCHAR(80) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contracts (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contract_value NUMERIC(14, 2) NOT NULL,
  start_date DATE,
  end_date DATE,
  clauses TEXT,
  warranty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  body TEXT,
  severity VARCHAR(40) NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT,
  action VARCHAR(120) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_engineer_id ON projects(engineer_id);
CREATE INDEX idx_project_stages_project_id ON project_stages(project_id);
CREATE INDEX idx_attendance_worker_date ON attendance(worker_id, attendance_date);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
