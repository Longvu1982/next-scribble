import {
  EclipseIcon,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import { CanvasMode, CanvasState, Layer, LayerType } from "../types";
import IconButton from "./IconButton";
import { useMutation } from "@/liveblocks.config";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { useClearCanvas } from "../hooks/useClearCanvas";

type Props = {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function ToolsBar({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canUndo,
  canRedo,
}: Props) {
  const { handleClearCanvas } = useClearCanvas();

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-white shadow-lg p-1 rounded-md flex items-center gap-4">
      <div className="flex gap-1">
        {/* <SelectionButton
            isActive={
              canvasState.mode === CanvasMode.None ||
              canvasState.mode === CanvasMode.Translating ||
              canvasState.mode === CanvasMode.SelectionNet ||
              canvasState.mode === CanvasMode.Pressing ||
              canvasState.mode === CanvasMode.Resizing
            }
            onClick={() => setCanvasState({ mode: CanvasMode.None })}
          /> */}

        <IconButton
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
        >
          <MousePointer2 />
        </IconButton>

        <IconButton
          isActive={canvasState.mode === CanvasMode.Pencil}
          onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
        >
          <Pencil />
        </IconButton>

        <IconButton
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
        >
          <Square />
        </IconButton>

        <IconButton
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
        >
          <EclipseIcon />
        </IconButton>
        {/* <RectangleButton
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Rectangle
            }
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Rectangle,
              })
            }
          />
          <EllipseButton
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Ellipse
            }
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Ellipse,
              })
            }
          /> */}
      </div>
      <div className="flex gap-1">
        <IconButton isActive={false} onClick={undo} disabled={!canUndo}>
          <Undo2 />
        </IconButton>

        <IconButton isActive={false} onClick={redo} disabled={!canRedo}>
          <Redo2 />
        </IconButton>

        <IconButton onClick={handleClearCanvas}>
          <Trash2 />
        </IconButton>
      </div>
    </div>
  );
}
