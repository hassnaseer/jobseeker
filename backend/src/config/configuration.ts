export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean),

  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  tokens: {
    emailVerificationTtlMin: parseInt(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MIN ?? '1440', 10),
    passwordResetTtlMin: parseInt(process.env.PASSWORD_RESET_TOKEN_TTL_MIN ?? '30', 10),
  },

  tos: {
    currentVersion: process.env.CURRENT_TOS_VERSION ?? '1.0',
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '20', 10),
  },

  mail: {
    from: process.env.MAIL_FROM ?? 'JobLinxs <no-reply@joblinxs.com>',
    provider: process.env.MAIL_PROVIDER ?? 'console',
  },

  webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:3001',
});
