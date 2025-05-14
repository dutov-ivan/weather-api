export type ExternalForecastApiResponse = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
};

export type ExternalGeocodeApiResponse = {
  results: {
    latitude: number;
    longitude: number;
  }[];
};

export type WeatherApiResponse = {
  temperature: number;
  humidity: number;
  description: string;
};
