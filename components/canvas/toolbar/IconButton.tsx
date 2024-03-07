import { Button } from "@/components/ui/button";
import styles from "./IconButton.module.css";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
};

export default function IconButton({
  onClick,
  children,
  isActive,
  disabled,
}: Props) {
  return (
    <Button
      variant={isActive ? "boardActive" : "board"}
      onClick={onClick}
      size="icon"
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
