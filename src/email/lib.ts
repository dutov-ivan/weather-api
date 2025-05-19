import { Subscription } from 'src/subscription/subscription.model';

export function isDue(subscription: Subscription, now = new Date()): boolean {
  if (!subscription.confirmed) return false;
  if (!subscription.lastSentAt) return true;

  const diff = now.getTime() - new Date(subscription.lastSentAt).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  if (subscription.frequency === 'daily') return diff >= oneDay;
  if (subscription.frequency === 'weekly') return diff >= oneWeek;

  return false;
}
