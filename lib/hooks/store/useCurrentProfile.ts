import { Profile } from "@prisma/client";
import { create } from "zustand";

interface CurrentProfileStore {
    profile: Partial<Profile>;
    setProfile: (profile: Partial<Profile>) => void;
}

const useCurrentProfile = create<CurrentProfileStore>((set) => ({
    profile: {},
    setProfile: (profile: Partial<Profile>) => set({ profile }),
}));

export default useCurrentProfile;
