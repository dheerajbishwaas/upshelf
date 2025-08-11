import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; // Explicit import

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        dialectModule: mysql2, // Force sequelize to use this module
        logging: false
    }
);

export default sequelize;
