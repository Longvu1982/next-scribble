import { useMutation } from "@/liveblocks.config";

export const useClearCanvas = () => {
  const handleClearCanvas = useMutation(({ storage }) => {
    const liveLayers = storage.get("layers");
    const layerIds = storage.get("layerIds");
    layerIds.forEach((id) => {
      liveLayers.delete(id);
    });
    layerIds.clear();
  }, []);

  return { handleClearCanvas };
};
