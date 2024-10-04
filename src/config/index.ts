import dotenv from 'dotenv';
import { Options } from 'sequelize';

dotenv.config();

export default {
  port: process.env.PORT || '3000',
  db: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    dialect: 'postgres',
  } as Options,
};
