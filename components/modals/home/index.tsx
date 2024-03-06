"use client";

import { useIsMounted } from "@/lib/hooks/mount";
import { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";
import InitHomeModal from "./InitHomeModal";
import useCurrentProfile from "@/lib/hooks/store/useCurrentProfile";
import JoinRoomModal from "./JoinRoomModal";

const InitModal = () => {
    const isMounted = useIsMounted();
    const profile = useCurrentProfile((state) => state.profile);
    const [openType, setOpenType] = useState<"init" | "create" | "join">("init");

    return isMounted ? (
        <div>
            <InitHomeModal openType={openType} setOpenType={setOpenType} />
            <CreateRoomModal openType={openType} setOpenType={setOpenType} profile={profile} />
            <JoinRoomModal openType={openType} setOpenType={setOpenType} profile={profile} />
        </div>
    ) : (
        <></>
    );
};

export default InitModal;
