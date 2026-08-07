import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "MANAGER" | "EMPLOYEE";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role | null;
};

export interface Store {
  user: User;
  setUser: (user: User) => void;
}

const useStore = create<Store>()(
  persist<Store>(
    (set) => ({
      user: {
        firstName: "",
        lastName: "",
        email: "",
        role: null,
      },
      setUser: (user) => set({user})
    }),
    {
      name: "users-info",
    },
  ),
);

export default useStore;
