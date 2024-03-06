"use client";

import styles from "./index.module.css";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useOthers,
  useSelf,
  useStorage,
} from "@/liveblocks.config";
import ToolsBar from "./toolbar";
import { useCallback, useState } from "react";
import { Camera, CanvasMode, CanvasState, Color, Point } from "./types";
import {
  colorToCss,
  findIntersectingLayersWithRectangle,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "./utils";
import Path from "./Path";

export function Canvas() {
  const others = useOthers();
  const userCount = others.length;
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 100, y: 100 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 252,
    g: 142,
    b: 42,
  });
  const pencilDraft = useSelf((me) => (me.presence as A).pencilDraft);

  const layerIds = useStorage((root: A) => root.layerIds);

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x - 350, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Pan the camera based on the wheel delta
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setState, startDrawing]
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // If the distance between the pointer position and the pointer position when it was pressed
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      // Start multi selection
      setState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = (storage as A).get("layers").toImmutable();
      setState({
        mode: CanvasMode.SelectionNet,
        origin: origin,
        current,
      });
      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );
      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = (storage as A).get("layers");
      for (const id of (self.presence as A).selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const liveLayers = (storage as A).get("layers");
      const layer = liveLayers.get((self.presence as A).selection[0]);
      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence as A;
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x - 350, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      console.log("move");
      const current = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }
      setMyPresence({ cursor: current });
    },
    [
      camera,
      canvasState,
      continueDrawing,
      resizeSelectedLayer,
      startMultiSelection,
      translateSelectedLayers,
      updateSelectionNet,
    ]
  );

  console.log(pencilDraft);
  return (
    <div className="relative w-full h-full">
      <div className={styles.canvas}>
        {/* <SelectionTools
          isAnimated={
            canvasState.mode !== CanvasMode.Translating &&
            canvasState.mode !== CanvasMode.Resizing
          }
          camera={camera}
          setLastUsedColor={setLastUsedColor}
        /> */}
        <svg
          className={styles.renderer_svg}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          // onPointerLeave={onPointerLeave}
          // onPointerUp={onPointerUp}
        >
          <g
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px)`,
            }}
          >
            {/* {layerIds.map((layerId) => (
              <LayerComponent
                key={layerId}
                id={layerId}
                mode={canvasState.mode}
                onLayerPointerDown={onLayerPointerDown}
                selectionColor={layerIdsToColorSelection[layerId]}
              />
            ))} */}
            {/* Blue square that show the selection of the current users. Also contains the resize handles. */}
            {/* <SelectionBox
              onResizeHandlePointerDown={onResizeHandlePointerDown}
            /> */}
            {/* Selection net that appears when the user is selecting multiple layers at once */}
            {canvasState.mode === CanvasMode.SelectionNet &&
              canvasState.current != null && (
                <rect
                  className={styles.selection_net}
                  x={Math.min(canvasState.origin.x, canvasState.current.x)}
                  y={Math.min(canvasState.origin.y, canvasState.current.y)}
                  width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                  height={Math.abs(
                    canvasState.origin.y - canvasState.current.y
                  )}
                />
              )}
            {/* <MultiplayerGuides /> */}
            {/* Drawing in progress. Still not commited to the storage. */}
            {pencilDraft != null && pencilDraft.length > 0 && (
              <Path
                points={pencilDraft}
                fill={colorToCss(lastUsedColor)}
                x={0}
                y={0}
              />
            )}
          </g>
        </svg>
      </div>
      <ToolsBar
        canvasState={canvasState}
        setCanvasState={setState}
        undo={history.undo}
        redo={history.redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}
