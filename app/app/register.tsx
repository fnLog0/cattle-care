import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Registration is now handled automatically via OTP verification (phone-first, no separate register flow)
export default function RegisterScreen() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, []);
  return null;
}
