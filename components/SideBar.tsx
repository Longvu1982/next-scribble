"use client";

import useCurrentProfile from "@/lib/hooks/store/useCurrentProfile";
import { Profile } from "@prisma/client";
import { FC, useEffect } from "react";

interface SideBarProps {
    currentUser?: Partial<Profile>;
}

const SideBar: FC<SideBarProps> = ({ currentUser }) => {
    const setProfile = useCurrentProfile((state) => state.setProfile);
    const profile = useCurrentProfile((state) => state.profile);

    useEffect(() => {
        if (currentUser?.id) setProfile(currentUser);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    console.log("profile", profile);

    return <div>SideBar</div>;
};

export default SideBar;
