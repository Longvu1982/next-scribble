"use client";

import styles from "./index.module.css";

import { pusherClient } from "@/lib/pusherInstance";
import { PlayerExtend, RoomExtend } from "@/lib/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import LayerComponent from "./LayerComponent";
import Path from "./Path";
import { useCanvasLogic } from "./hooks/useCanvasLogic";
import ToolsBar from "./toolbar";
import { CanvasMode } from "./types";
import { colorToCss, getRandomStrings } from "./utils";
import { stringSimilarity } from "string-similarity-js";
import { cn } from "@/lib/utils";

interface CanvasProps {
    currentRoom: RoomExtend;
    currentPlayer: PlayerExtend | undefined;
}

export function Canvas({ currentRoom, currentPlayer = {} as PlayerExtend }: CanvasProps) {
    console.log(stringSimilarity("con lợn", "con lợm"));
    const {
        ref,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        canvasState,
        layerIds,
        onLayerPointerDown,
        layerIdsToColorSelection,
        pencilDraft,
        canRedo,
        canUndo,
        lastUsedColor,
        history,
        setCanvasState,
    } = useCanvasLogic({
        currentRoom,
        currentPlayer,
    });

    const [isShowWordSelect, setShowWordSelect] = useState<boolean>(false);
    const [currentWord, setCurrentWord] = useState<string>("");
    const router = useRouter();
    useEffect(() => {
        setCurrentWord(currentRoom.currentWord ?? "");

        pusherClient.bind("select-word", (word: string) => {
            console.log("here");
            setShowWordSelect(false);
            setCurrentWord(word);
        });
    }, [currentRoom.currentWord]);

    useEffect(() => {
        if (!currentRoom.isDrawing && currentRoom.timeLeft > 0) setShowWordSelect(true);
    }, [currentRoom, currentPlayer]);

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 right-0 flex items-end gap-3 justify-center text-zinc-600 font-semibold text-xl p-2">
                {currentWord.split("").map((char, index) => (
                    <div key={index}>
                        <div className="-mb-4">{char}</div>
                        <div className={cn(!char.trim() && "opacity-0")}>_</div>
                    </div>
                ))}
            </div>
            {isShowWordSelect &&
                (currentRoom.currentDrawingId === currentPlayer.id ? (
                    <div className="absolute inset-0 bg-gray-900/60 z-30 flex flex-col items-center justify-center">
                        <p className="text-3xl mb-6">CHOOSE A WORD</p>
                        <div className="flex gap-4">
                            {getRandomStrings(currentRoom.words).map((word) => (
                                <Button
                                    onClick={async () => {
                                        const copyArray = [...currentRoom.words];
                                        copyArray.splice(copyArray.indexOf(word), 1);
                                        const payload = {
                                            roomId: currentRoom.id,
                                            currentWord: word,
                                            words: copyArray,
                                        };
                                        await axios.post("/api/room/word-select", payload);
                                        setShowWordSelect(false);
                                    }}
                                    size="lg"
                                    className="text-xl"
                                    variant="secondary"
                                    key={word}
                                >
                                    {word}
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gray-900/60 z-30 flex flex-col items-center justify-center">
                        <span className="animate-bounce text-3xl">Player is choosing a word...</span>
                    </div>
                ))}
            <div className={styles.canvas}>
                {/* <SelectionTools
          isAnimated={
            canvasState.mode !== CanvasMode.Translating &&
            canvasState.mode !== CanvasMode.Resizing
          }
          camera={camera}
          setLastUsedColor={setLastUsedColor}
        /> */}
                <svg ref={ref as A} className={styles.renderer_svg} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                    <g>
                        {layerIds.map((layerId: string) => (
                            <LayerComponent
                                key={layerId}
                                id={layerId}
                                mode={canvasState.mode}
                                onLayerPointerDown={onLayerPointerDown}
                                selectionColor={layerIdsToColorSelection[layerId]}
                            />
                        ))}
                        {/* <SelectionBox
              onResizeHandlePointerDown={onResizeHandlePointerDown}
            /> */}
                        {/* Selection net that appears when the user is selecting multiple layers at once */}
                        {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                            <rect
                                className={styles.selection_net}
                                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                            />
                        )}
                        {/* <MultiplayerGuides /> */}
                        {/* Drawing in progress. Still not commited to the storage. */}
                        {pencilDraft != null && pencilDraft.length > 0 && <Path points={pencilDraft} fill={colorToCss(lastUsedColor)} x={0} y={0} />}
                    </g>
                </svg>
            </div>
            {currentRoom.currentDrawingId === currentPlayer.id && (
                <ToolsBar
                    canvasState={canvasState}
                    setCanvasState={setCanvasState}
                    undo={history.undo}
                    redo={history.redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            )}
        </div>
    );
}
