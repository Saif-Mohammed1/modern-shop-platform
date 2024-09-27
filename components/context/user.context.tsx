"use client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import tokenManager from "@/components/util/TokenManager";
import { UserType } from "@/@types/next-auth";
type User = UserType | null;
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
    if (session && session?.user) {
      updateUser(session.user);
      tokenManager.setAccessToken(session.user.accessToken);
    } else {
      updateUser(null);
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
