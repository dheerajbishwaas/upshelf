import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Product extends Model {
  public id!: number; // internal ID
  public externalProductId!: number; // Shopify product ID
  public store!: string;
  public store_id!: number;
  public title?: string;
  public handle?: string;
  public vendor?: string;
  public product_type?: string;
  public description_html?: string;
  public tags?: string;
  public status?: string;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalProductId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    store: { type: DataTypes.STRING, allowNull: false },
    store_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING },
    handle: { type: DataTypes.STRING },
    vendor: { type: DataTypes.STRING },
    product_type: { type: DataTypes.STRING },
    description_html: { type: DataTypes.TEXT },
    tags: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING }
  },
  { sequelize, tableName: 'products', timestamps: true, paranoid: true }
);

export default Product;
