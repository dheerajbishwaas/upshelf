import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface OrderLineItemAttributes {
  id: number;
  orderId: number;
  storeId: number;
  shopDomain: string;
  productId?: number;
  variantId?: number;
  sku?: string;
  title?: string;
  variantTitle?: string;
  vendor?: string;
  quantity?: number;
  price?: number;
  grams?: number;
  fulfillmentStatus?: string;
  giftCard?: boolean;
  taxable?: boolean;
  totalDiscount?: number;
}

type OrderLineItemCreationAttributes = Optional<OrderLineItemAttributes, 'id'>;

class OrderLineItem extends Model<OrderLineItemAttributes, OrderLineItemCreationAttributes>
  implements OrderLineItemAttributes {
  public id!: number;
  public orderId!: number;
  public storeId!: number;
  public shopDomain!: string;
  public productId?: number;
  public variantId?: number;
  public sku?: string;
  public title?: string;
  public variantTitle?: string;
  public vendor?: string;
  public quantity?: number;
  public price?: number;
  public grams?: number;
  public fulfillmentStatus?: string;
  public giftCard?: boolean;
  public taxable?: boolean;
  public totalDiscount?: number;
}

OrderLineItem.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
    orderId: { type: DataTypes.BIGINT, allowNull: false, field: 'order_id' },
    storeId: { type: DataTypes.BIGINT, allowNull: false, field: 'store_id' },
    shopDomain: { type: DataTypes.STRING, allowNull: false, field: 'shop_domain' },
    productId: { type: DataTypes.BIGINT, field: 'product_id' },
    variantId: { type: DataTypes.BIGINT, field: 'variant_id' },
    sku: { type: DataTypes.STRING(100) },
    title: { type: DataTypes.STRING },
    variantTitle: { type: DataTypes.STRING, field: 'variant_title' },
    vendor: { type: DataTypes.STRING(100) },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    grams: { type: DataTypes.INTEGER },
    fulfillmentStatus: { type: DataTypes.STRING(50), field: 'fulfillment_status' },
    giftCard: { type: DataTypes.BOOLEAN, field: 'gift_card' },
    taxable: { type: DataTypes.BOOLEAN },
    totalDiscount: { type: DataTypes.FLOAT, field: 'total_discount' },
  },
  {
    sequelize,
    tableName: 'order_line_items',
    timestamps: false,
  }
);

export default OrderLineItem;
