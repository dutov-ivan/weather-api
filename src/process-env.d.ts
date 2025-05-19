declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      FORECAST_API: string;
      GEOCODE_API: string;

      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
    }
  }
}

export {};
