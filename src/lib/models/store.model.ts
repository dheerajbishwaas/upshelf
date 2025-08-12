import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Store extends Model {
  public id!: number;
  public shop!: string;
  public domain?: string;
  public access_token!: string;
  public refresh_token?: string;
  public installed_at?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Store.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shop: { type: DataTypes.STRING, allowNull: false, unique: true },
    domain: { type: DataTypes.STRING },
    access_token: { type: DataTypes.TEXT, allowNull: false },
    refresh_token: { type: DataTypes.TEXT , defaultValue: null,},
    installed_at: { type: DataTypes.DATE },
    expires_at: { type: DataTypes.DATE }, 
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    sequelize,
    tableName: 'stores',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

export default Store;
