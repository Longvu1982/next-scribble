import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const RedirectWrapper = async ({ children }: { children: ReactNode }) => {
    const session = await getServerSession();
    if (session?.user) return <>{children}</>;
    return redirect("/sign-in");
};

export default RedirectWrapper;
