declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      FORECAST_API: string;
      GEOCODE_API: string;
    }
  }
}

export {};
