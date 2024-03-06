import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { FC } from "react";

interface InitHomeModalProps {
    openType: "create" | "join" | "init";
    setOpenType: (type: "create" | "join" | "init") => void;
}

const InitHomeModal: FC<InitHomeModalProps> = ({ openType, setOpenType }) => {
    return (
        <Dialog open={openType === "init"}>
            <DialogContent className="dark:bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-zinc-600">Welcome to NEXT-SCRIBBLE</DialogTitle>
                    <DialogDescription>Create a new server or join an existing one!</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Button variant="primary" onClick={() => setOpenType("create")} className="text-xl">
                        Create a new room
                    </Button>
                    <Button variant="secondary" onClick={() => setOpenType("join")} className="text-xl">
                        Join an existing room
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InitHomeModal;
