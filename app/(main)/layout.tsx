import Loading from "@/components/Loading";
import TopBar from "@/components/TopBar";
import initProfile from "@/lib/intiProfile";
import { redirect } from "next/navigation";
import React, { ReactNode, Suspense } from "react";

const MainLayout = async ({ children }: { children: ReactNode }) => {
    const profile = await initProfile();
    if (!profile) return redirect("/sign-in");
    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-col h-screen">
                <TopBar currentUser={profile} />
                {children}
            </div>
        </Suspense>
    );
};

export default MainLayout;
