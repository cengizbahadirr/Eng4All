import useSWR from 'swr';
import { IUser } from '@/models/User'; // User modelimizdeki IUser arayüzü

// API'den veri çekmek için genel bir fetcher fonksiyonu
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' }); // credentials: 'include' eklendi

  // Eğer status code başarılı değilse (2xx dışında bir şeyse)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Bilinmeyen bir hata oluştu.' }));
    const error = new Error(errorData.message || 'Veri çekilirken bir hata oluştu.');
    // @ts-ignore Hata nesnesine ek bilgi ekleyebiliriz
    error.info = errorData;
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.user; // API rotamız { user: userData } şeklinde dönüyor
};

export interface AuthHookResult {
  user: Partial<IUser> | null | undefined; // undefined: yükleniyor, null: giriş yapılmamış, IUser: giriş yapılmış
  isLoading: boolean;
  isError: Error | undefined;
  // SWR'dan gelen mutate fonksiyonunun tipini doğrudan kullanalım
  // Data tipimiz Partial<IUser> | null
  mutate: import('swr').KeyedMutator<Partial<IUser> | null>;
}

export function useAuth(): AuthHookResult {
  const { data, error, isLoading, mutate } = useSWR<Partial<IUser> | null>('/api/auth/me', fetcher, {
    shouldRetryOnError: false, // 401 gibi hatalarda sürekli denemesini engelle
    revalidateOnFocus: false, // Alt+tab yapıldığında otomatik yeniden doğrulamayı kapat
  });

  return {
    user: data, // data undefined olabilir (yüklenirken) veya null (giriş yapılmamışsa) veya IUser objesi
    isLoading,
    isError: error,
    mutate,
  };
}
