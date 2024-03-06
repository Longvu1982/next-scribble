"use client";

import useCurrentProfile from "@/lib/hooks/store/useCurrentProfile";
import { Profile } from "@prisma/client";
import { FC, useEffect } from "react";
import Logo from "./Logo";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface SideBarProps {
    currentUser?: Partial<Profile>;
}

const TopBar: FC<SideBarProps> = ({ currentUser }) => {
    const setProfile = useCurrentProfile((state) => state.setProfile);

    useEffect(() => {
        if (currentUser?.id) setProfile(currentUser);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    return (
        <div className="w-full h-14 bg-zinc-800 flex justify-between items-center px-2">
            <Logo size="nav" className="cursor-pointer" />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="size-9">
                        <AvatarImage src={currentUser?.imageUrl ?? ""} />
                        <AvatarFallback>
                            <div className="w-full h-full bg-zinc-700 animate-pulse" />
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-4">
                    <p className="text-xl">{currentUser?.name}</p>
                    <p className="opacity-75 mb-6">{currentUser?.email}</p>
                    <DropdownMenuSeparator className="h-1" />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer mt-2">
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default TopBar;
