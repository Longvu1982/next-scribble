import SideBar from "@/components/SideBar";
import initProfile from "@/lib/intiProfile";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const MainLayout = async ({ children }: { children: ReactNode }) => {
    const profile = await initProfile();
    if (!profile) return redirect("/sign-in");
    return (
        <div>
            <SideBar currentUser={profile} />
            {children}
        </div>
    );
};

export default MainLayout;
