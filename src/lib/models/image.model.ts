import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Product from './product.model';

class Image extends Model {
  public id!: number;
  public externalImageId!: number;
  public product_id!: number;
  public src?: string;
  public alt_text?: string;
  public position?: number;
}

Image.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalImageId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    src: { type: DataTypes.TEXT },
    alt_text: { type: DataTypes.STRING },
    position: { type: DataTypes.INTEGER },
  },
  { sequelize, tableName: 'images', timestamps: true, paranoid: true }
);

Product.hasMany(Image, { foreignKey: 'product_id', as: 'images' });
Image.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export default Image;
