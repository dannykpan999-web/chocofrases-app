-- ============================================================
-- CHOCOFRASES DATABASE SCHEMA
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── USERS (dashboard access) ────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'vendedor'
                CHECK (role IN ('dueno', 'vendedor', 'deposito')),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CLIENTS ─────────────────────────────────────────────────
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp_phone  VARCHAR(30) UNIQUE NOT NULL,
  name            VARCHAR(150),
  business_name   VARCHAR(150),
  address         TEXT,
  zone            VARCHAR(100),
  notes           TEXT,
  total_orders    INT NOT NULL DEFAULT 0,
  total_spent     NUMERIC(12,2) NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  airtable_id     VARCHAR(50),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku           VARCHAR(50) UNIQUE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  stock         INT NOT NULL DEFAULT 0,
  unit          VARCHAR(30) NOT NULL DEFAULT 'unidad',
  category      VARCHAR(100),
  image_url     TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  airtable_id   VARCHAR(50),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    SERIAL UNIQUE,
  client_id       UUID NOT NULL REFERENCES clients(id),
  status          VARCHAR(30) NOT NULL DEFAULT 'nuevo'
                  CHECK (status IN ('nuevo','aprobado','en_preparacion','listo','enviado','entregado','cancelado')),
  source          VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
                  CHECK (source IN ('whatsapp','dashboard','web')),
  input_type      VARCHAR(20) DEFAULT 'texto'
                  CHECK (input_type IN ('texto','audio','foto','mixto')),
  raw_message     TEXT,
  ai_transcript   TEXT,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  delivery_address TEXT,
  remito_number   INT,
  remito_url      TEXT,
  drive_file_id   TEXT,
  airtable_id     VARCHAR(50),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  telegram_msg_id BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  subtotal    NUMERIC(12,2) NOT NULL,
  notes       TEXT
);

-- ─── CONVERSATION STATE (mirror of Redis, for audit) ─────────
CREATE TABLE conversation_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(30) NOT NULL,
  direction     VARCHAR(10) NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type  VARCHAR(20) NOT NULL DEFAULT 'text',
  content       TEXT,
  order_id      UUID REFERENCES orders(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REMITO SEQUENCE ─────────────────────────────────────────
CREATE SEQUENCE remito_seq START 1000;

-- ─── BROADCASTS ──────────────────────────────────────────────
CREATE TABLE broadcasts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200) NOT NULL,
  message       TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'borrador'
                CHECK (status IN ('borrador','enviando','enviado','error')),
  total_sent    INT NOT NULL DEFAULT 0,
  total_failed  INT NOT NULL DEFAULT 0,
  sent_by       UUID REFERENCES users(id),
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_clients_phone    ON clients(whatsapp_phone);
CREATE INDEX idx_orders_client    ON orders(client_id);
CREATE INDEX idx_orders_status    ON orders(status);
CREATE INDEX idx_orders_created   ON orders(created_at DESC);
CREATE INDEX idx_items_order      ON order_items(order_id);
CREATE INDEX idx_conv_phone       ON conversation_logs(phone, created_at DESC);
CREATE INDEX idx_products_active  ON products(active, category);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clients_updated   BEFORE UPDATE ON clients   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated  BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── DEFAULT ADMIN USER (password: changeme123 — change immediately) ──
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador', 'admin@chocofrases.com.ar',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniMH5GaNB2J7gJHBR.7WItE3a',
        'dueno');

-- ─── SAMPLE PRODUCTS ─────────────────────────────────────────
INSERT INTO products (sku, name, price, stock, unit, category) VALUES
  ('CHO-001', 'Caja Especial x12',     1800.00, 50, 'caja',   'Cajas'),
  ('CHO-002', 'Caja Mixta x24',        3200.00, 30, 'caja',   'Cajas'),
  ('CHO-003', 'Bombones Surtidos x6',   950.00, 80, 'unidad', 'Bombones'),
  ('CHO-004', 'Tableta Artesanal 100g', 650.00, 60, 'unidad', 'Tabletas'),
  ('CHO-005', 'Trufas x10',            1100.00, 45, 'unidad', 'Trufas'),
  ('CHO-006', 'Sachets x50',           2500.00, 20, 'bolsa',  'Sachets');
