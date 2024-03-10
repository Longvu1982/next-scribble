import { pusherClient } from "@/lib/pusherInstance";
import { PlayerExtend, RoomExtend } from "@/lib/types";
import axios from "axios";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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

  const timerRef = useRef<A>(null);

  useLayoutEffect(() => {
    // if (timerRef.current) return;
    if (currentRoom.drawDuration && (currentRoom.wordTimeStamp || timeStamp)) {
      timerRef.current = setInterval(() => {
        const time = Math.max(
          0,
          //   currentRoom.drawDuration -
          50 -
            Math.abs(
              dayjs(timeStamp ?? currentRoom.wordTimeStamp).diff(
                dayjs(),
                "seconds"
              )
            )
        );
        if (time === 0 && shouldShowResult.current) {
          setShowResult(true);
          shouldShowResult.current = false;
          clearInterval(timerRef.current);
        } else if (time !== 0) {
          console.log("rime here", time);
          shouldShowResult.current = true;
          setShowResult(false);
        }
        setTimeLeft(time);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeStamp, currentRoom.drawDuration, currentRoom.wordTimeStamp]);

  // announce join in after load the room info
  // useEffect(() => {
  //   (async () => {
  //     if (currentRoom.id) {
  //       axios.post("/api/room/connect", {
  //         roomId: currentRoom.id,
  //         playerId: currentPlayer.id,
  //       });
  //     }
  //   })();
  // }, [currentRoom.id]);

  // console.log(timeLeft);

  // useEffect(() => {
  //   pusherClient.bind("update-time", (time: number) => {
  //     if (!isCurrent) setTimeLeft(time);
  //   });
  // }, [isCurrent]);

  // useEffect(() => {
  //   pusherClient.bind("connect", async (playerId: string) => {
  //     if (isCurrent) {
  //       await axios.post("/api/room/update-time", {
  //         roomId: currentRoom.id,
  //         timeLeft: timeLeft,
  //         socketOnly: true,
  //       });
  //     }
  //   });
  // }, [isCurrent]);

  return (
    <div className="absolute right-2 top-2 z-10 text-zinc-600 text-2xl flex items-center gap-1">
      <Clock />
      {currentWord && <span>{timeLeft}</span>}
    </div>
  );
};

export default Timer;
