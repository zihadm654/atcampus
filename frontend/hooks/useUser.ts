import { useSession } from "@/lib/auth-client";

export function useUser() {
  const { data: session,    error } = useSession();
  
  return {
    user: session?.user || null,
 
    error,
    isAuthenticated: !!session?.user,
  };
}