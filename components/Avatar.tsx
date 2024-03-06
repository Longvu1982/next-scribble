import React, { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
    src: string | undefined;
    className?: string;
}

const UserAvatar: FC<UserAvatarProps> = ({ src, className }) => {
    return (
        <Avatar className={className}>
            <AvatarImage src={src ?? ""} />
            <AvatarFallback>
                <div className="w-full h-full bg-zinc-700 animate-pulse" />
            </AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar;
