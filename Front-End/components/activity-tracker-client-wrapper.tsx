"use client";

import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function ActivityTrackerClientWrapper() {
  useActivityTracker(); // Hook'u çağır

  return null; // Bu bileşen herhangi bir UI render etmez
}
