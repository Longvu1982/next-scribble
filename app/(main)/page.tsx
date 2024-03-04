import RedirectWrapper from "@/components/RedirectWrapper";
import initProfile from "@/lib/intiProfile";
import { redirect } from "next/navigation";
import Header from "./_component/Header";

export default async function Home() {
    const profile = await initProfile();
    if (!profile) return redirect("/sign-in");
    return (
        <main>
            <RedirectWrapper>Main Content</RedirectWrapper>
            <div>{profile.id}</div>
            <Header />
        </main>
    );
}
















