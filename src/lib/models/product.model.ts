import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Product extends Model {
  public id!: number;
  public externalProductId!: number;
  public store!: string;
  public name!: string;
  public price!: number;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalProductId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    store: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
  }
);

export default Product;
