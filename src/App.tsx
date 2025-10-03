import { AppRouter } from './routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { authApi } from './api/endpoints';

function AuthBootstrap() {
  const { setUser, setLoading } = useAuthStore();
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await authApi.me(); // va include cookie-urile
        if (mounted) setUser(data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return null;
}

function App() {
  return (
    <>
      <AuthBootstrap />
      <AppRouter />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
