import { memo, useEffect, useState } from "react";
import { OpenAPILoader } from "../components/OpenAPILoader";
import { MainContent } from "../components/MainContent";
import { useApiContext } from "../contexts/ApiContext";
import { apiService } from "../services/apiService";
import { toast } from "sonner";
import { CodeXml, FileText } from "lucide-react";
import { Endpoint } from "../types/api";

const Apis = memo(() => {
  const {
    endpoints,
    categories,
    selectedEndpoint,
    setSelectedEndpoint,
    handleSpecLoad,
    loading: contextLoading,
  } = useApiContext();
  const [autoLoading, setAutoLoading] = useState(false);
  useEffect(() => {
    // Auto-fetch API spec when component mounts
    const fetchApiSpec = async () => {
      setAutoLoading(true);
      try {
        const spec = await apiService.fetchOpenAPISpec();
        handleSpecLoad(spec);
        toast.success("API specification loaded successfully!");
      } catch (error) {
        console.error("Failed to auto-load API spec:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load API specification"
        );
      } finally {
        setAutoLoading(false);
      }
    };

    if (!endpoints || endpoints.length === 0) {
      fetchApiSpec();
    }
  }, [handleSpecLoad]);

  // Group endpoints by tags (categories) for display info
  const endpointsByTag = endpoints.reduce(
    (grouped: Record<string, Endpoint[]>, endpoint) => {
      const tag = endpoint.category || "Uncategorized";
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push(endpoint);
      return grouped;
    },
    {}
  );

  // Get sorted tags for consistent display
  const sortedTags = Object.keys(endpointsByTag).sort();

  const loading = contextLoading || autoLoading;

  // Show OpenAPILoader if no endpoints are loaded
  if (endpoints.length === 0) {
    return <OpenAPILoader onSpecLoad={handleSpecLoad} loading={loading} />;
  }

  // Show MainContent if an endpoint is selected
  if (selectedEndpoint) {
    return (
      <MainContent
        endpoint={selectedEndpoint}
        showDocumentation={false}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-6 flex-shrink-0">
        <h1 className="text-lg font-semibold text-primary">
          Welcome to Tigg API
        </h1>
        {/* <p className="text-muted-foreground mt-2">
          Select an endpoint from the sidebar to start testing
        </p> */}
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Loading API specification...
            </p>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CodeXml className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Welcome to Swaggify
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your API specification has been loaded successfully. Browse the
              available endpoints in the sidebar and select one to start
              testing.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="text-sm font-medium mb-2">
                Available endpoints: {endpoints.length}
              </p>
              <p className="text-sm capitalize">
                Categories: {sortedTags.join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Apis.displayName = "Apis";

export default Apis;
