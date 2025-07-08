"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { updateUserStreak } from '@/actions/activity-actions';

const ACTIVITY_PING_INTERVAL = 60000; // 60 saniye
const API_ENDPOINT = '/api/user/activity-log';

async function sendActivityPing(durationInSeconds: number) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationInSeconds }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Aktivite ping gönderme hatası:', response.status, errorData.error);
    }
  } catch (error) {
    console.error('Aktivite ping gönderme sırasında ağ hatası:', error);
  }
}

export function useActivityTracker() {
  const { user, isLoading, mutate } = useAuth();
  const { toast } = useToast();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const [isInitialStreakCheckDone, setIsInitialStreakCheckDone] = useState(false);

  // Streak kontrolünü yapan ve sonucu bildiren fonksiyon
  const checkStreak = useCallback(async () => {
    if (!user || isInitialStreakCheckDone) return;

    setIsInitialStreakCheckDone(true); // Bu fonksiyonun tekrar çalışmasını engelle
    
    const result = await updateUserStreak();
    
    if (result.success && result.message && result.message !== "Bugünkü girişiniz zaten sayıldı.") {
      toast({
        title: "Seri Güncellendi!",
        description: result.message,
      });
      mutate(); // SWR cache'ini ve kullanıcı verisini yenile
    } else if (result.error) {
      console.error("Streak güncelleme hatası:", result.error);
    }
  }, [user, isInitialStreakCheckDone, toast, mutate]);


  const flushAccumulatedTime = useCallback(async (isUnloading = false) => {
    if (accumulatedTimeRef.current > 0 && user) {
      const durationToSend = Math.round(accumulatedTimeRef.current / 1000);
      if (durationToSend > 0) {
        if (isUnloading && navigator.sendBeacon) {
          const data = JSON.stringify({ durationInSeconds: durationToSend });
          navigator.sendBeacon(API_ENDPOINT, new Blob([data], { type: 'application/json' }));
        } else {
          await sendActivityPing(durationToSend);
        }
      }
      accumulatedTimeRef.current = 0;
    }
    lastPingTimeRef.current = Date.now();
  }, [user]);

  useEffect(() => {
    if (isLoading || !user) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Sayfa yüklendiğinde veya kullanıcı bilgisi geldiğinde ilk streak kontrolünü yap
    checkStreak();

    lastPingTimeRef.current = Date.now();

    const handleInterval = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        accumulatedTimeRef.current += (now - lastPingTimeRef.current);
        lastPingTimeRef.current = now;
        
        if (accumulatedTimeRef.current >= ACTIVITY_PING_INTERVAL) {
            flushAccumulatedTime();
        }
      } else {
        const now = Date.now();
        accumulatedTimeRef.current += (now - lastPingTimeRef.current);
        lastPingTimeRef.current = now;
      }
    };
    
    intervalIdRef.current = setInterval(handleInterval, ACTIVITY_PING_INTERVAL / 2);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastPingTimeRef.current = Date.now();
        // Sekme tekrar görünür olduğunda da streak kontrolü yapılabilir,
        // ancak bu çok sık bildirimlere neden olabilir. Şimdilik sadece ilk girişte yapıyoruz.
        // checkStreak(); 
      } else {
        const now = Date.now();
        accumulatedTimeRef.current += (now - lastPingTimeRef.current);
        lastPingTimeRef.current = now;
        flushAccumulatedTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => flushAccumulatedTime(true));

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', () => flushAccumulatedTime(true));
      flushAccumulatedTime();
    };
  }, [user, isLoading, flushAccumulatedTime, checkStreak]);
}
