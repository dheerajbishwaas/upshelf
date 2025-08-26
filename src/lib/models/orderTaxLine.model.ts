import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface OrderTaxLineAttributes {
  id: number;
  orderId: number;
  storeId: number;
  shopDomain: string;
  title?: string;
  rate?: number;
  price?: number;
}

type OrderTaxLineCreationAttributes = Optional<OrderTaxLineAttributes, 'id'>;

class OrderTaxLine extends Model<OrderTaxLineAttributes, OrderTaxLineCreationAttributes>
  implements OrderTaxLineAttributes {
  public id!: number;
  public orderId!: number;
  public storeId!: number;
  public shopDomain!: string;
  public title?: string;
  public rate?: number;
  public price?: number;
}

OrderTaxLine.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.BIGINT, allowNull: false, field: 'order_id' },
    storeId: { type: DataTypes.BIGINT, allowNull: false, field: 'store_id' },
    shopDomain: { type: DataTypes.STRING, allowNull: false, field: 'shop_domain' },
    title: { type: DataTypes.STRING(100) },
    rate: { type: DataTypes.FLOAT },
    price: { type: DataTypes.FLOAT },
  },
  {
    sequelize,
    tableName: 'order_tax_lines',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['order_id', 'title', 'rate'],
      },
    ],
  }
);

export default OrderTaxLine;
