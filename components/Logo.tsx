"use client";

import { cn, getRandomColor } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const nameArray = "Next Scribble".split("");

const Logo = ({ size = "home", className }: { size?: "home" | "nav"; className?: string }) => {
    const router = useRouter();
    return (
        <div onClick={() => router.push("/")} className={cn("flex items-center gap-2", className)}>
            <h1 className={cn("text-5xl lg:text-[120px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)]", size === "nav" && "text-2xl lg:text-2xl")}>
                {nameArray.map((char, i) => (
                    <span key={i} style={{ color: getRandomColor() }}>
                        {char}
                    </span>
                ))}
            </h1>
            <Pencil className={cn("drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] size-10 lg:size-20", size === "nav" && "size-5 lg:size-5")} />
        </div>
    );
};

export default Logo;
