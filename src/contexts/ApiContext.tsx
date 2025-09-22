import {
  createContext,
  useContext,
  useState,
  useCallback,
  memo,
  ReactNode,
  useMemo,
} from "react";
import { Endpoint } from "../types/api";
import { OpenAPISpec } from "../types/openapi";
import { parseOpenAPISpec } from "../utils/openapi-parser";

interface ApiContextType {
  endpoints: Endpoint[];
  categories: string[];
  selectedEndpoint: Endpoint | null;
  loading: boolean;
  hasCredentials: boolean;
  setHasCredentials: (value: boolean) => void;
  handleSpecLoad: (spec: OpenAPISpec) => void;
  setSelectedEndpoint: (endpoint: Endpoint | null) => void;
  clearCredentials: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = memo(({ children }: ApiProviderProps) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(() => {
    return Boolean(
      localStorage.getItem("api-client-id") &&
        localStorage.getItem("api-client-secret")
    );
  });

  const handleSpecLoad = useCallback((spec: OpenAPISpec) => {
    try {
      setLoading(true);
      const parsed = parseOpenAPISpec(spec);
      setEndpoints(parsed.endpoints);
      setCategories(parsed.categories);
      setSelectedEndpoint(null);
    } catch (error) {
      console.error("Error parsing OpenAPI spec:", error);
      alert("Error parsing OpenAPI specification");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCredentials = useCallback(() => {
    localStorage.removeItem("api-client-id");
    localStorage.removeItem("api-client-secret");
    setHasCredentials(false);
    setEndpoints([]);
    setCategories([]);
    setSelectedEndpoint(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      endpoints,
      categories,
      selectedEndpoint,
      loading,
      hasCredentials,
      setHasCredentials,
      handleSpecLoad,
      setSelectedEndpoint,
      clearCredentials,
    }),
    [
      endpoints,
      categories,
      selectedEndpoint,
      loading,
      hasCredentials,
      handleSpecLoad,
      clearCredentials,
    ]
  );

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
});

ApiProvider.displayName = "ApiProvider";

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApiContext must be used within an ApiProvider");
  }
  return context;
};
