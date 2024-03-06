"use client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useBoolean } from "@/lib/hooks/useBoolean";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";

const Page = () => {
    const session = useSession();
    const [isLoading, showLoading] = useBoolean(false);
    if (session.data?.user) return redirect("/");

    const handleSignIn = async () => {
        showLoading();
        const profile = await signIn("google");
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center transition-all">
            <Logo className="mb-10" />
            <Button onClick={handleSignIn} variant="secondary" size="lg" className="transition-all bg-blue-300">
                <Image src="/assets/google.png" alt="google icon" width={20} height={20} className="mr-2" />
                <span className="drop-shadow-md text-sm text-zinc-300">Sign in with GOOGLE</span>
                {isLoading && <Loader2 className="animate-spin ml-2 size-6" />}
            </Button>
        </div>
    );
};

export default Page;
