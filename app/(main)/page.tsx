import RedirectWrapper from "@/components/RedirectWrapper";
import Header from "./_component/Header";

export default async function Home() {
    return (
        <main>
            <RedirectWrapper>Main Content</RedirectWrapper>
            <Header />
        </main>
    );
}

