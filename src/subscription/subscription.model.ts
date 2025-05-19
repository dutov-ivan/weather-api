export type Subscription = {
  email: string;
  city: string;
  frequency: 'hourly' | 'daily';
  confirmed: boolean;
};
