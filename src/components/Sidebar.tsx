import { useState, useCallback, useMemo, memo } from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Upload,
  BookOpen,
  Code,
  Activity,
} from "lucide-react";
import { Endpoint } from "../types/api";
import { HttpMethodBadge } from "./HttpMethodBadge";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  endpoints: Endpoint[];
  categories: string[];
  selectedEndpoint: Endpoint | null;
  onEndpointSelect: (endpoint: Endpoint) => void;
  loading: boolean;
  hasCredentials: boolean;
}

export const Sidebar = memo(
  ({
    endpoints,
    categories,
    selectedEndpoint,
    onEndpointSelect,
    loading,
    hasCredentials,
  }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    // State to track which tag sections are expanded
    const [expandedTags, setExpandedTags] = useState<Set<string>>(
      new Set(categories)
    );

    // Group endpoints by tags (categories)
    const endpointsByTag = useMemo(() => {
      const grouped: Record<string, Endpoint[]> = {};
      endpoints.forEach((endpoint) => {
        const tag = endpoint.category || "Uncategorized";
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(endpoint);
      });
      return grouped;
    }, [endpoints]);

    // Get sorted tags for consistent display
    const sortedTags = useMemo(() => {
      return Object.keys(endpointsByTag).sort();
    }, [endpointsByTag]);

    const clearCredentials = useCallback(() => {
      localStorage.removeItem("api-client-id");
      localStorage.removeItem("api-client-secret");
      window.location.reload();
    }, []);

    const handleDocumentationSelect = useCallback(() => {
      navigate("api-docs");
    }, [navigate]);

    const handleAPIDetailsSelect = useCallback(() => {
      navigate("api-details");
    }, [navigate]);

    const handleApiSelect = useCallback(() => {
      navigate("apis");
    }, [navigate]);

    const handleRequestLogsSelect = useCallback(() => {
      navigate("request-logs");
    }, [navigate]);

    const handleEndpointSelect = useCallback(
      (endpoint: Endpoint) => {
        onEndpointSelect(endpoint);
      },
      [onEndpointSelect]
    );

    const toggleTagExpansion = useCallback((tag: string) => {
      setExpandedTags((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(tag)) {
          newSet.delete(tag);
        } else {
          newSet.add(tag);
        }
        return newSet;
      });
    }, []);

    const totalEndpoints = useMemo(() => endpoints.length, [endpoints.length]);

    return (
      <div className="w-80 bg-sidebar-background border-r border-sidebar-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border flex-shrink-0">
          <div className=" flex gap-4 items-end">
            {/* <img
              src="https://cdn.prod.website-files.com/61d2839d3c449e856767b6de/68a6b981d3b246d0c24d1f8f_tigg_api_logo.png"
              alt="TIGG"
              width={80}
            /> */}
            <h2 className="text-lg font-bold text-sidebar-primary tracking-tight">
              Swaggify
            </h2>
            <p className="text-xs text-sidebar-muted mt-1">
              Explore API endpoints
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <div className="border-b border-sidebar-border flex-shrink-0">
          <button
            onClick={() => setOverviewExpanded(!overviewExpanded)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-sidebar-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sidebar-primary" />
              <span className="text-sm font-medium text-sidebar-foreground">
                Overview
              </span>
            </div>
            {overviewExpanded ? (
              <ChevronDown className="h-4 w-4 text-sidebar-muted" />
            ) : (
              <ChevronRight className="h-4 w-4 text-sidebar-muted" />
            )}
          </button>
          {overviewExpanded && (
            <>
              <div className="pb-2">
                <button
                  onClick={handleDocumentationSelect}
                  className={cn(
                    "w-[90%] text-left p-3 ml-6 mr-4 rounded-lg transition-colors flex items-center gap-2",
                    location.pathname === "/playground/api-docs"
                      ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Tigg API Documentation</span>
                </button>
              </div>
              <div className="pb-2">
                <button
                  onClick={handleAPIDetailsSelect}
                  className={cn(
                    "w-[90%] text-left p-3 ml-6 mr-4 rounded-lg transition-colors flex items-center gap-2",
                    location.pathname === "/playground/api-details"
                      ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                  )}
                >
                  <Code className="h-4 w-4" />
                  <span className="text-sm">API Developer Guide</span>
                </button>
              </div>
              {/* <div className="pb-2">
                <button
                  onClick={handleRequestLogsSelect}
                  className={cn(
                    "w-[90%] text-left p-3 ml-6 mr-4 rounded-lg transition-colors flex items-center gap-2",
                    location.pathname === "/playground/request-logs"
                      ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                  )}
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Request Logs</span>
                </button>
              </div> */}
            </>
          )}
        </div>

        {/* APIs Section */}
        <div className="border-b border-sidebar-border flex-shrink-0">
          <button
            onClick={handleApiSelect}
            className={cn(
              "w-full p-4 flex items-center gap-2 text-left hover:bg-sidebar-accent/50 transition-colors",
              location.pathname === "/playground/apis"
                ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary"
                : "text-sidebar-foreground"
            )}
          >
            <Upload className="h-4 w-4 text-sidebar-primary" />
            <span className="text-sm font-medium">APIs</span>
          </button>
        </div>

        {/* Endpoints by Tags */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sidebar-muted">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-primary mx-auto mb-2"></div>
              <span className="text-sm">Loading endpoints...</span>
            </div>
          ) : sortedTags.length === 0 ? (
            <div className="p-4 text-center text-sidebar-muted">
              <FileText className="h-8 w-8 mx-auto mb-2 text-sidebar-muted" />
              <span className="text-sm">No endpoints available</span>
            </div>
          ) : (
            <div className="p-2">
              {sortedTags.map((tag) => {
                const tagEndpoints = endpointsByTag[tag];
                const isExpanded = expandedTags.has(tag);

                return (
                  <div key={tag} className="mb-2">
                    {/* Tag Header */}
                    <button
                      onClick={() => toggleTagExpansion(tag)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sidebar-accent/30 transition-colors group border-l-2 border-transparent hover:border-primary"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-sidebar-foreground group-hover:text-primary capitalize">
                          {tag}
                        </span>
                        <span className="text-xs text-sidebar-muted bg-sidebar-accent/50 px-2 py-0.5 rounded-full">
                          {tagEndpoints.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-sidebar-muted group-hover:text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-sidebar-muted group-hover:text-primary" />
                      )}
                    </button>

                    {/* Tag Endpoints */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {tagEndpoints.map((endpoint) => (
                          <button
                            key={endpoint.id}
                            onClick={() => handleEndpointSelect(endpoint)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg transition-colors group border-l-2",
                              selectedEndpoint?.id === endpoint.id
                                ? "bg-sidebar-primary/10 border-sidebar-primary text-sidebar-primary"
                                : "hover:bg-sidebar-accent/20 border-transparent text-sidebar-foreground hover:text-sidebar-primary hover:border-sidebar-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <HttpMethodBadge method={endpoint.method} />
                              <span className="font-medium text-sm truncate">
                                {endpoint.title}
                              </span>
                            </div>
                            <div className="text-xs font-mono text-sidebar-muted mb-1 truncate">
                              {endpoint.path}
                            </div>
                            {endpoint.description && (
                              <div className="text-xs text-sidebar-muted line-clamp-2">
                                {endpoint.description}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-center flex-shrink-0">
          <p className="text-xs text-sidebar-muted">
            {totalEndpoints} endpoint{totalEndpoints !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>
    );
  }
);

Sidebar.displayName = "Sidebar";
