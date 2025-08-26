-- ========================
-- Orders Table
-- ========================
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,                -- Shopify order_id
    shop_domain VARCHAR(255) NOT NULL,    -- e.g. testupshelf.myshopify.com
    order_number INT,
    name VARCHAR(50),
    confirmation_number VARCHAR(100),
    email VARCHAR(255),
    financial_status VARCHAR(50),
    fulfillment_status VARCHAR(50),
    currency VARCHAR(10),
    subtotal_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    total_tax DECIMAL(10,2),
    total_discounts DECIMAL(10,2),
    total_weight INT,
    processed_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    closed_at DATETIME,
    customer_id BIGINT NULL,
    location_id BIGINT,
    tags TEXT,
    raw_json JSON
);

-- ========================
-- Order Line Items
-- ========================
CREATE TABLE order_line_items (
    id BIGINT PRIMARY KEY,                -- Shopify line_item.id
    order_id BIGINT NOT NULL,             -- FK → orders.id
    shop_domain VARCHAR(255) NOT NULL,    -- needed if multi-tenant
    product_id BIGINT,
    variant_id BIGINT,
    sku VARCHAR(100),
    title VARCHAR(255),
    variant_title VARCHAR(100),
    vendor VARCHAR(100),
    quantity INT,
    price DECIMAL(10,2),
    grams INT,
    fulfillment_status VARCHAR(50),
    gift_card BOOLEAN,
    taxable BOOLEAN,
    total_discount DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ========================
-- Fulfillments
-- ========================
CREATE TABLE order_fulfillments (
    id BIGINT PRIMARY KEY,                -- Shopify fulfillment.id
    order_id BIGINT NOT NULL,             -- FK → orders.id
    shop_domain VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    service VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    tracking_company VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ========================
-- Tax Lines
-- ========================
CREATE TABLE order_tax_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,             -- FK → orders.id
    shop_domain VARCHAR(255) NOT NULL,
    title VARCHAR(100),                   -- e.g. CGST
    rate DECIMAL(5,4),                    -- e.g. 0.09
    price DECIMAL(10,2),                  -- e.g. 25.65
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

ALTER TABLE `orders` ADD `store_id` BIGINT NOT NULL AFTER `shop_domain`;
ALTER TABLE `order_fulfillments` ADD `store_id` BIGINT NOT NULL AFTER `shop_domain`;
ALTER TABLE `order_line_items` ADD `store_id` BIGINT NOT NULL AFTER `shop_domain`;
ALTER TABLE `order_tax_lines` ADD `store_id` BIGINT NOT NULL AFTER `shop_domain`;
ALTER TABLE order_tax_lines
    ADD UNIQUE KEY uq_taxline (order_id, title, rate);
