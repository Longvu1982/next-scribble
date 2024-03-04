"use client";
import { pusherClient } from "@/lib/pusherInstance";
import { signOut } from "next-auth/react";
import React, { useEffect } from "react";

const Header = () => {
    useEffect(() => {
        pusherClient.subscribe("id123456");

        pusherClient.bind("test", (data: any) => {
            console.log(data);
        });
        return () => {
            pusherClient.unsubscribe("id123456");
        };
    }, []);

    const onClickTest = async () => {
        await fetch("/api/test", { method: "POST" });
    };

    return (
        <div>
            <div onClick={() => signOut()}>Sign out</div>
            <div onClick={onClickTest}>test</div>
        </div>
    );
};

export default Header;
