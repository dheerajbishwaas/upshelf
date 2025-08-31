import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Product from './product.model';

class Variant extends Model {
  public id!: number;
  public externalVariantId!: number;
  public product_id!: number;
  public sku?: string;
  public price?: number;
  public compare_at_price?: number;
  public grams?: number;
  public inventory_tracker?: string;
  public inventory_qty?: number;
  public inventory_policy?: string;
  public fulfillment_service?: string;
  public requires_shipping?: boolean;
  public taxable?: boolean;
  public barcode?: string;
  public weight_unit?: string;
  public tax_code?: string;
  public cost_per_item?: number;
}

Variant.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalVariantId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sku: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT },
    compare_at_price: { type: DataTypes.FLOAT },
    grams: { type: DataTypes.INTEGER },
    inventory_tracker: { type: DataTypes.STRING },
    inventory_qty: { type: DataTypes.INTEGER },
    inventory_policy: { type: DataTypes.STRING },
    fulfillment_service: { type: DataTypes.STRING },
    requires_shipping: { type: DataTypes.BOOLEAN },
    taxable: { type: DataTypes.BOOLEAN },
    barcode: { type: DataTypes.STRING },
    weight_unit: { type: DataTypes.STRING },
    tax_code: { type: DataTypes.STRING },
    cost_per_item: { type: DataTypes.FLOAT },
  },
  { sequelize, tableName: 'variants', timestamps: true, paranoid: true }
);

Product.hasMany(Variant, { foreignKey: 'product_id', as: 'variants' });
Variant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export default Variant;
