import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    apiRequest(path)
      .then((res) => setData(res.data ?? res))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [path]);

  return { data, loading, error };
}
