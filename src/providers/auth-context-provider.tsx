import {
  type AuthProvider,
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { auth } from '../firebase/config';
import { useAuthStore } from '../stores/use-auth-store';

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean; 
  signIn: (provider: AuthProvider) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(
    'AuthContext provider, is currently is authenticated: ',
    useAuthStore.getState().isAuthenticated
  );
  const [user, setUser] = useState<User | null>(useAuthStore.getState().user);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) {
      setUser(user);
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAuthStore.getState().setUser(user);
      flushSync(() => {
        setUser(user);
        setIsInitialLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (provider: AuthProvider) => {
    const result = await signInWithPopup(auth, provider);
    useAuthStore.getState().setUser(result.user);
    flushSync(() => {
      setUser(result.user);
      setIsInitialLoading(false);
    });
  }, []);

  const logOut = async () => {
    console.log('Logging out...');
    await signOut(auth);
    setUser(null);
    setIsInitialLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isInitialLoading, signIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
