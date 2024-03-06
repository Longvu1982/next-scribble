import Loading from "@/components/Loading";
import React from "react";

const Room = async () => {
    await new Promise((res) => setTimeout(() => res(""), 4000));
    return <div>hihi</div>;
};

export default Room;
