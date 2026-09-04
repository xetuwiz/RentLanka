import { useQuery } from "@tanstack/react-query";
import { spatialApi } from "../api/endpoints";
import { useDebounce } from "./useDebounce";

export function useSpatialSearch(query) {
    const debounced = useDebounce(query, 300);

    return useQuery({
        queryKey: ["spatialSearch", debounced],
        queryFn: () => spatialApi.search(debounced).then((res) => res.data),
        enabled: typeof debounced === "string" && debounced.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 min – spatial data rarely changes
    });
}
