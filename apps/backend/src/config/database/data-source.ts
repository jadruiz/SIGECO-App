// src/config/database/data-source.ts
import { config as loadEnvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import config from '../config';

// Importar entidades
import { User } from '../../modules/users/entities/user.entity';
import { OAuthProvider } from '../../modules/users/entities/oauth-provider.entity';

// Cargar variables de entorno
const envPath = `.env.${process.env.NODE_ENV || 'development'}`;
loadEnvConfig({ path: envPath });
loadEnvConfig();

const dbConfig = config().database;
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [User, OAuthProvider],
  migrations: [__dirname + `/migrations/*${isProduction ? '.js' : '.ts'}`],
  synchronize: false, 
  logging: process.env.DB_LOGGING === 'true' || false,
  extra: {
    connectionTimeoutMillis: 5000, // Timeout de conexión
    max: 10, // Máximo de conexiones en el pool
  },
});
