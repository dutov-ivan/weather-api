import { Subscription } from 'src/subscription/subscription.model';

export function isDue(subscription: Subscription, now = new Date()): boolean {
  if (!subscription.confirmed) return false;
  if (!subscription.lastSentAt) return true;

  const diff = now.getTime() - new Date(subscription.lastSentAt).getTime();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (subscription.frequency === 'hourly') return diff >= oneHour;
  if (subscription.frequency === 'daily') return diff >= oneDay;

  return false;
}
