import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const getServerAuth = async () => {
    const session = await getServerSession();
    console.log(session);
    if (session?.user) return session;
    if (!session?.user) return redirect("/sign-in");
};
