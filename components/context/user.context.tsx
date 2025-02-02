"use client";
import { signOut, useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import tokenManager from "@/components/util/TokenManager";
import { UserAuthType } from "@/app/_types/users";

type User = UserAuthType | null;
type UserContextType = {
  user: User;
  updateUser: (newUser: User) => void;
};
// Create the user context
export const UserContext = createContext<UserContextType>({
  user: null,
  updateUser: () => {},
});

// Create a UserProvider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Define the state for the user
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User>(null);

  // Function to update the user
  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  useEffect(() => {
    const logOutUser = async () => {
      await signOut();
      updateUser(null);
      tokenManager.clearAccessToken();
    };
    if (session && session?.user) {
      updateUser(session.user);
      if (session?.user?.accessToken)
        tokenManager.setAccessToken(session?.user?.accessToken);
    } else {
      updateUser(null);
    }
    if (session?.error === "RefreshAccessTokenError") {
      logOutUser();
    }
  }, [session, status]);

  // Provide the user context value to the children components
  return status === "loading" ? (
    <div className="flex justify-center items-center h-screen">
      <div className="border-t-4 border-blue-500 rounded-full animate-spin h-12 w-12"></div>
    </div>
  ) : (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
