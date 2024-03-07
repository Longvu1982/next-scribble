import React from "react";
import IconButton from "../IconButton";
import { Pencil } from "lucide-react";

type Props = {
  isActive: boolean;
  onClick: () => void;
};

export default function PencilButton({ isActive, onClick }: Props) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <Pencil />
    </IconButton>
  );
}
