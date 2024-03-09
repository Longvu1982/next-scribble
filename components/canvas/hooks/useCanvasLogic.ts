import { PlayerExtend, RoomExtend } from "@/lib/types";
import { useCanRedo, useCanUndo, useHistory, useMutation, useOthers, useOthersMapped, useSelf, useStorage } from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useRef, useState } from "react";
import { CanvasMode, CanvasState, Color, LayerType, Point } from "../types";
import { connectionIdToColor, findIntersectingLayersWithRectangle, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "../utils";

const MAX_LAYERS = 100;

export const useCanvasLogic = ({ currentRoom, currentPlayer }: { currentRoom: RoomExtend; currentPlayer: PlayerExtend }) => {
    const others = useOthers();
    const userCount = others.length;
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 252,
        g: 142,
        b: 42,
    });
    const pencilDraft = useSelf((me) => (me.presence as A).pencilDraft);

    const layerIds = useStorage((root: A) => root.layerIds);

    const ref = useRef<HTMLOrSVGElement>(null);

    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                penColor: lastUsedColor,
            });
        },
        [lastUsedColor]
    );

    const unselectLayers = useMutation(({ self, setMyPresence }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);

    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get("layers");
            const { pencilDraft } = self.presence;
            if (pencilDraft == null || pencilDraft.length < 2 || liveLayers.size >= MAX_LAYERS) {
                setMyPresence({ pencilDraft: null });
                return;
            }

            const id = nanoid();
            liveLayers.set(id, new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor)));

            const liveLayerIds = storage.get("layerIds");
            liveLayerIds.push(id);
            setMyPresence({ pencilDraft: null });
            setCanvasState({ mode: CanvasMode.Pencil });
        },
        [lastUsedColor]
    );

    const insertLayer = useMutation(
        ({ storage, setMyPresence }, layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text, position: Point) => {
            const liveLayers: A = storage.get("layers");
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            const liveLayerIds: A = storage.get("layerIds");
            const layerId = nanoid();
            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });
            liveLayerIds.push(layerId);
            liveLayers.set(layerId, layer);

            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor]
    );

    const onPointerUp = useMutation(
        (_, e) => {
            const point = pointerEventToCanvasPoint(e, ref);

            if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
                unselectLayers();
                setCanvasState({
                    mode: CanvasMode.None,
                });
            } else if (canvasState.mode === CanvasMode.Pencil) {
                insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
            } else {
                setCanvasState({
                    mode: CanvasMode.None,
                });
            }
            history.resume();
        },
        [canvasState, history, insertLayer, insertPath, setCanvasState, unselectLayers]
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (currentRoom.currentDrawingId !== currentPlayer.id) return;
            const point = pointerEventToCanvasPoint(e, ref);

            if (canvasState.mode === CanvasMode.Inserting) {
                return;
            }

            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure);
                return;
            }

            setCanvasState({ origin: point, mode: CanvasMode.Pressing });
        },
        [canvasState.mode, setCanvasState, startDrawing, currentRoom.currentDrawingId, currentPlayer.id]
    );

    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting || currentRoom.currentDrawingId !== currentPlayer.id) {
                return;
            }

            history.pause();
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, ref);
            if (!self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [setCanvasState, history, canvasState.mode, currentRoom.currentDrawingId, currentPlayer.id]
    );

    const selections = useOthersMapped((other) => other.presence.selection);

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selections) {
            const [connectionId, selection] = user;
            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
        }

        return layerIdsToColorSelection;
    }, [selections]);

    const startMultiSelection = useCallback((current: Point, origin: Point) => {
        // If the distance between the pointer position and the pointer position when it was pressed
        if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
            // Start multi selection
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, []);

    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            const layers = (storage as A).get("layers").toImmutable();
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin: origin,
                current,
            });
            const ids = findIntersectingLayersWithRectangle(layerIds, layers, origin, current);
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
                x: 0,
                y: 0,
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

            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState]
    );

    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) {
                return;
            }

            const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);

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
            if (canvasState.mode !== CanvasMode.Pencil || e.buttons !== 1 || pencilDraft == null) {
                return;
            }

            setMyPresence({
                cursor: point,
                pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
            });
        },
        [canvasState.mode]
    );

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            e.preventDefault();
            if (currentRoom.currentDrawingId !== currentPlayer.id) return;
            const current = pointerEventToCanvasPoint(e, ref);
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
            canvasState,
            continueDrawing,
            resizeSelectedLayer,
            startMultiSelection,
            translateSelectedLayers,
            updateSelectionNet,
            currentRoom.currentDrawingId,
            currentPlayer.id,
        ]
    );

    return {
        ref,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        canvasState,
        layerIds,
        onLayerPointerDown,
        layerIdsToColorSelection,
        lastUsedColor,
        pencilDraft,
        canRedo,
        canUndo,
        history,
        setCanvasState,
    };
};
