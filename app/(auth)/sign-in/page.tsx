"use client";
import { Button } from "@/components/ui/button";
import { useBoolean } from "@/lib/hooks/useBoolean";
import { getRandomColor } from "@/lib/utils";
import { Loader2, Pencil } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import axios from "axios";
import React from "react";

const nameArray = "Next Scribble".split("");

const Page = () => {
    const session = useSession();
    const [isLoading, showLoading] = useBoolean(false);
    if (session.data?.user) return redirect("/");

    const handleSignIn = async () => {
        showLoading();
        const profile = await signIn("google");
        console.log(profile);
        // await axios.post("/api/profile/create", profile?.);
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center transition-all">
            <div className="flex items-center gap-2  mb-10">
                <h1 className="text-5xl lg:text-[120px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)]">
                    {/* Next Scribble */}
                    {nameArray.map((char, i) => (
                        <span key={i} style={{ color: getRandomColor() }} className="">
                            {char}
                        </span>
                    ))}
                </h1>
                <Pencil className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] size-10 lg:size-20" />
            </div>
            <Button onClick={handleSignIn} variant="secondary" size="lg" className="transition-all bg-blue-300">
                <Image src="/assets/google.png" alt="google icon" width={20} height={20} className="mr-2" />
                <span className="drop-shadow-md text-sm text-zinc-300">Sign in with GOOGLE</span>
                {isLoading && <Loader2 className="animate-spin ml-2 size-6" />}
            </Button>
        </div>
    );
};

export default Page;
