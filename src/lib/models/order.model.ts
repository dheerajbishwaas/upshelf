// src/lib/models/order.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Order extends Model {
  public id!: number;
  public externalOrderId!: number;
  public store!: string;
  public totalPrice!: number;
  public createdAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalOrderId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    store: { type: DataTypes.STRING, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

export default Order;
