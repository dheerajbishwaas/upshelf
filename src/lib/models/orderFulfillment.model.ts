import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface OrderFulfillmentAttributes {
  id: number;
  orderId: number;
  shopDomain: string;
  storeId?: number;
  status?: string;
  service?: string;
  createdAt?: Date;
  updatedAt?: Date;
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

type OrderFulfillmentCreationAttributes = Optional<OrderFulfillmentAttributes, 'id'>;

class OrderFulfillment extends Model<OrderFulfillmentAttributes, OrderFulfillmentCreationAttributes>
  implements OrderFulfillmentAttributes {
  public id!: number;
  public orderId!: number;
  public shopDomain!: string;
  public storeId?: number;
  public status?: string;
  public service?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public trackingCompany?: string;
  public trackingNumber?: string;
  public trackingUrl?: string;
}

OrderFulfillment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
    orderId: { type: DataTypes.BIGINT, allowNull: false, field: 'order_id' },
    storeId: { type: DataTypes.BIGINT, allowNull: false, field: 'store_id' },
    shopDomain: { type: DataTypes.STRING, allowNull: false, field: 'shop_domain' },
    status: { type: DataTypes.STRING(50) },
    service: { type: DataTypes.STRING(50) },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    trackingCompany: { type: DataTypes.STRING(100), field: 'tracking_company' },
    trackingNumber: { type: DataTypes.STRING(100), field: 'tracking_number' },
    trackingUrl: { type: DataTypes.STRING(255), field: 'tracking_url' },
  },
  {
    sequelize,
    tableName: 'order_fulfillments',
    timestamps: false,
  }
);

export default OrderFulfillment;
