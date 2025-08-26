import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface OrderAttributes {
  id: number;                 // Shopify order_id
  shopDomain: string;
  orderNumber?: number;
  storeId?: number;
  name?: string;
  confirmationNumber?: string;
  email?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  currency?: string;
  subtotalPrice?: number;
  totalPrice?: number;
  totalTax?: number;
  totalDiscounts?: number;
  totalWeight?: number;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
  customerId?: number;
  locationId?: number;
  tags?: string;
  rawJson?: object;
}

// Sequelize needs a type for creation (can omit optional fields)
type OrderCreationAttributes = Optional<OrderAttributes, 'orderNumber' | 'name' | 'confirmationNumber' | 'email'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public shopDomain!: string;
  public storeId?: number;
  public orderNumber?: number;
  public name?: string;
  public confirmationNumber?: string;
  public email?: string;
  public financialStatus?: string;
  public fulfillmentStatus?: string;
  public currency?: string;
  public subtotalPrice?: number;
  public totalPrice?: number;
  public totalTax?: number;
  public totalDiscounts?: number;
  public totalWeight?: number;
  public processedAt?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
  public closedAt?: Date;
  public customerId?: number;
  public locationId?: number;
  public tags?: string;
  public rawJson?: object;
}

Order.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
    shopDomain: { type: DataTypes.STRING, allowNull: false, field: 'shop_domain' },
    storeId: { type: DataTypes.STRING, allowNull: false, field: 'store_id' },
    orderNumber: { type: DataTypes.INTEGER, field: 'order_number' },
    name: { type: DataTypes.STRING },
    confirmationNumber: { type: DataTypes.STRING, field: 'confirmation_number' },
    email: { type: DataTypes.STRING },
    financialStatus: { type: DataTypes.STRING, field: 'financial_status' },
    fulfillmentStatus: { type: DataTypes.STRING, field: 'fulfillment_status' },
    currency: { type: DataTypes.STRING(10) },
    subtotalPrice: { type: DataTypes.DECIMAL(10,2), field: 'subtotal_price' },
    totalPrice: { type: DataTypes.DECIMAL(10,2), field: 'total_price' },
    totalTax: { type: DataTypes.DECIMAL(10,2), field: 'total_tax' },
    totalDiscounts: { type: DataTypes.DECIMAL(10,2), field: 'total_discounts' },
    totalWeight: { type: DataTypes.INTEGER, field: 'total_weight' },
    processedAt: { type: DataTypes.DATE, field: 'processed_at' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    closedAt: { type: DataTypes.DATE, field: 'closed_at' },
    customerId: { type: DataTypes.BIGINT, field: 'customer_id' },
    locationId: { type: DataTypes.BIGINT, field: 'location_id' },
    tags: { type: DataTypes.TEXT },
    rawJson: { type: DataTypes.JSON, field: 'raw_json' },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: false, // we use Shopify's created_at/updated_at instead
  }
);

export default Order;
