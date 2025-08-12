import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Product extends Model {
  public id!: number;
  public externalProductId!: number;
  public store!: string;
  public store_id!: number;
  public name!: string;
  public price!: number;

  // New fields
  public handle?: string;
  public title?: string;
  public body_html?: string;
  public vendor?: string;
  public product_category?: string;
  public type?: string;
  public tags?: string;
  public published?: boolean;
  public option1_name?: string;
  public option1_value?: string;
  public option2_name?: string;
  public option2_value?: string;
  public option3_name?: string;
  public option3_value?: string;
  public variant_sku?: string;
  public variant_grams?: number;
  public variant_inventory_tracker?: string;
  public variant_inventory_qty?: number;
  public variant_inventory_policy?: string;
  public variant_fulfillment_service?: string;
  public variant_price?: number;
  public variant_compare_at_price?: number;
  public variant_requires_shipping?: boolean;
  public variant_taxable?: boolean;
  public variant_barcode?: string;
  public image_src?: string;
  public image_position?: number;
  public image_alt_text?: string;
  public gift_card?: boolean;
  public seo_title?: string;
  public seo_description?: string;
  public google_shopping_product_category?: string;
  public google_shopping_gender?: string;
  public google_shopping_age_group?: string;
  public google_shopping_mpn?: string;
  public google_shopping_condition?: string;
  public google_shopping_custom_product?: boolean;
  public variant_image?: string;
  public variant_weight_unit?: string;
  public variant_tax_code?: string;
  public cost_per_item?: number;
  public included_united_states?: boolean;
  public price_united_states?: number;
  public compare_at_price_united_states?: number;
  public included_international?: boolean;
  public price_international?: number;
  public compare_at_price_international?: number;
  public status?: string;
  public is_deleted?: number;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    externalProductId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
    store: { type: DataTypes.STRING, allowNull: false },
    store_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    handle: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    body_html: { type: DataTypes.TEXT },
    vendor: { type: DataTypes.STRING },
    product_category: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    tags: { type: DataTypes.TEXT },
    published: { type: DataTypes.BOOLEAN },
    option1_name: { type: DataTypes.STRING },
    option1_value: { type: DataTypes.STRING },
    option2_name: { type: DataTypes.STRING },
    option2_value: { type: DataTypes.STRING },
    option3_name: { type: DataTypes.STRING },
    option3_value: { type: DataTypes.STRING },
    variant_sku: { type: DataTypes.STRING },
    variant_grams: { type: DataTypes.INTEGER },
    variant_inventory_tracker: { type: DataTypes.STRING },
    variant_inventory_qty: { type: DataTypes.INTEGER },
    variant_inventory_policy: { type: DataTypes.STRING },
    variant_fulfillment_service: { type: DataTypes.STRING },
    variant_price: { type: DataTypes.FLOAT },
    variant_compare_at_price: { type: DataTypes.FLOAT },
    variant_requires_shipping: { type: DataTypes.BOOLEAN },
    variant_taxable: { type: DataTypes.BOOLEAN },
    variant_barcode: { type: DataTypes.STRING },
    image_src: { type: DataTypes.TEXT },
    image_position: { type: DataTypes.INTEGER },
    image_alt_text: { type: DataTypes.STRING },
    gift_card: { type: DataTypes.BOOLEAN },
    seo_title: { type: DataTypes.STRING },
    seo_description: { type: DataTypes.TEXT },
    google_shopping_product_category: { type: DataTypes.STRING },
    google_shopping_gender: { type: DataTypes.STRING },
    google_shopping_age_group: { type: DataTypes.STRING },
    google_shopping_mpn: { type: DataTypes.STRING },
    google_shopping_condition: { type: DataTypes.STRING },
    google_shopping_custom_product: { type: DataTypes.BOOLEAN },
    variant_image: { type: DataTypes.TEXT },
    variant_weight_unit: { type: DataTypes.STRING },
    variant_tax_code: { type: DataTypes.STRING },
    cost_per_item: { type: DataTypes.FLOAT },
    included_united_states: { type: DataTypes.BOOLEAN },
    price_united_states: { type: DataTypes.FLOAT },
    compare_at_price_united_states: { type: DataTypes.FLOAT },
    included_international: { type: DataTypes.BOOLEAN },
    price_international: { type: DataTypes.FLOAT },
    compare_at_price_international: { type: DataTypes.FLOAT },
    status: { type: DataTypes.STRING },
    is_deleted: { type: DataTypes.INTEGER.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    paranoid:true
  }
);

export default Product;
