import React from "react";
import { Room } from "./Room";
import { Canvas } from "@/components/canvas/Canvas";

const RoomPage = async () => {
  await new Promise((res) => setTimeout(() => res(""), 4000));
  return (
    <Room>
      <Canvas />
    </Room>
  );
};

export default RoomPage;
