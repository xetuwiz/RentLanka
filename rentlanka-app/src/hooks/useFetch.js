import { useState, useEffect, useCallback } from "react";
import api from "../api/endpoints";

export function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(url, options);
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.title || err.message || "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (url) fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}
