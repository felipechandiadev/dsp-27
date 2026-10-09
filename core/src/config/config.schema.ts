import * as Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5080),
  API_PREFIX: Joi.string().default('api'),
  TIMEZONE: Joi.string().default('America/Santiago'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  ENABLE_SWAGGER: Joi.boolean().default(true),
  ENABLE_CORS: Joi.boolean().default(true),

  DB_TYPE: Joi.string().valid('postgres').default('postgres'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  DB_MAX_CONNECTIONS: Joi.number().default(10),
  DB_CONNECTION_TIMEOUT: Joi.number().default(60000),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  BCRYPT_ROUNDS: Joi.number().default(12),

  CORS_ORIGIN: Joi.string().default('*'),
  CORS_CREDENTIALS: Joi.boolean().default(false),

  STORAGE_DRIVER: Joi.string().valid('local', 'r2').default('local'),
  STORAGE_LOCAL_DIR: Joi.string().default('./storage/uploads'),
  MEDIA_MAX_FILE_SIZE: Joi.number().default(20971520),
  MEDIA_ALLOWED_MIME_TYPES: Joi.string().default(
    'application/pdf,image/jpeg,image/png,image/webp',
  ),

  R2_ACCOUNT_ID: Joi.string().allow('').optional(),
  R2_ENDPOINT: Joi.string().allow('').optional(),
  R2_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  R2_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  R2_BUCKET_NAME: Joi.string().allow('').optional(),
  R2_PUBLIC_URL: Joi.string().allow('').optional(),

  DSP_SEED_ADMIN_USERNAME: Joi.string().optional(),
  DSP_SEED_ADMIN_PASSWORD: Joi.string().optional(),
  DSP_SEED_ADMIN_EMAIL: Joi.string().optional(),
  DSP_SEED_GESTOR_PASSWORD: Joi.string().optional(),
  DSP_SEED_PREVENCION_PASSWORD: Joi.string().optional(),
}).when(Joi.object({ STORAGE_DRIVER: Joi.valid('r2') }).unknown(), {
  then: Joi.object({
    R2_ACCOUNT_ID: Joi.string().required(),
    R2_ENDPOINT: Joi.string().required(),
    R2_ACCESS_KEY_ID: Joi.string().required(),
    R2_SECRET_ACCESS_KEY: Joi.string().required(),
    R2_BUCKET_NAME: Joi.string().required(),
  }),
});
