// src/config/config.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
});

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = parseInt(value || '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 3000),
  database: {
    host: getEnvVar('DB_HOST'),
    port: parseNumber(process.env.DB_PORT, 5432),
    username: getEnvVar('DB_USERNAME'),
    password: getEnvVar('DB_PASSWORD'),
    database: getEnvVar('DB_NAME'),
  },
  redis: {
    url: getEnvVar('REDIS_URL'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    accessTokenExpiresIn: parseNumber(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, 3600), // 1 hour
    refreshTokenExpiresIn: parseNumber(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, 604800), // 7 days
  },
  throttler: {
    ttl: parseNumber(process.env.THROTTLER_TTL, 60),
    limit: parseNumber(process.env.THROTTLER_LIMIT, 10),
  },
  csrf: {
    secure: process.env.CSRF_SECURE === 'true',
    sameSite: (process.env.CSRF_SAMESITE as 'lax' | 'strict' | 'none') || 'strict',
  },
  bcrypt: {
    saltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  },
  helmet: {
    contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true',
    frameguard: process.env.HELMET_FRAMEGUARD === 'true',
    frameguardAction: (process.env.HELMET_FRAMEGUARD_ACTION as 'deny' | 'sameorigin') || 'deny',
    hidePoweredBy: process.env.HELMET_HIDE_POWERED_BY === 'true',
    hsts: process.env.HELMET_HSTS === 'true',
    hstsMaxAge: parseNumber(process.env.HELMET_HSTS_MAX_AGE, 31536000),
    hstsIncludeSubDomains: process.env.HELMET_HSTS_INCLUDE_SUBDOMAINS === 'true',
    ieNoOpen: process.env.HELMET_IE_NO_OPEN === 'true',
    noSniff: process.env.HELMET_NO_SNIFF === 'true',
    xssFilter: process.env.HELMET_XSS_FILTER === 'true',
  },
  facebook: {
    clientID: getEnvVar('FACEBOOK_CLIENT_ID'),
    clientSecret: getEnvVar('FACEBOOK_CLIENT_SECRET'),
    callbackURL: getEnvVar('FACEBOOK_CALLBACK_URL'),
  },
  google: {
    clientID: getEnvVar('GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
    callbackURL: getEnvVar('GOOGLE_CALLBACK_URL'),
  },
});
