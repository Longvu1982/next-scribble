import { pusherClient } from "@/lib/pusherInstance";
import { PlayerExtend, RoomExtend } from "@/lib/types";
import axios from "axios";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { MutableRefObject, useEffect, useLayoutEffect, useState } from "react";

interface TimerProps {
  isCurrent: boolean;
  currentRoom: RoomExtend;
  currentPlayer: PlayerExtend;
  timeStamp: dayjs.Dayjs | undefined;
  currentWord: string;
  setCurrentWord: (word: string) => void;
  setShowResult: (isShow: boolean) => void;
  shouldShowResult: MutableRefObject<boolean>;
}

const Timer = ({
  isCurrent,
  currentPlayer,
  currentRoom,
  timeStamp,
  currentWord,
  setShowResult,
  shouldShowResult,
}: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    let timerId: A;
    if (currentRoom.drawDuration) {
      timerId = setInterval(() => {
        const time = Math.max(
          0,
          //   currentRoom.drawDuration -
          50 -
            Math.abs(
              dayjs(timeStamp ?? currentRoom.updatedAt).diff(dayjs(), "seconds")
            )
        );
        if (time === 0 && shouldShowResult.current) {
          setShowResult(true);
          shouldShowResult.current = false;
        } else if (time !== 0) {
          console.log("rime here", time);
          shouldShowResult.current = true;
          setShowResult(false);
        }
        setTimeLeft(time);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timeStamp, currentRoom.drawDuration]);

  // announce join in after load the room info
  useEffect(() => {
    (async () => {
      if (currentRoom.id) {
        axios.post("/api/room/connect", {
          roomId: currentRoom.id,
          playerId: currentPlayer.id,
        });
      }
    })();
  }, [currentRoom.id]);

  useEffect(() => {
    pusherClient.bind("update-time", (time: number) => {
      if (!isCurrent) setTimeLeft(time);
    });
  }, [isCurrent]);

  useEffect(() => {
    pusherClient.bind("connect", async (playerId: string) => {
      if (isCurrent) {
        await axios.post("/api/room/update-time", {
          roomId: currentRoom.id,
          timeLeft: timeLeft,
          socketOnly: true,
        });
      }
    });
  }, [isCurrent]);

  return (
    <div className="absolute right-2 top-2 z-10 text-zinc-600 text-2xl flex items-center gap-1">
      <Clock />
      {currentWord && <span>{timeLeft}</span>}
    </div>
  );
};

export default Timer;
