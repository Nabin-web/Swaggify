import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import { Endpoint, ApiResponse } from "../types/api";
import { SchemaObject } from "../types/openapi";
import { HttpMethodBadge } from "./HttpMethodBadge";
import { RequestBuilder } from "./RequestBuilder";
import { RequestConfig } from "../services/apiService";
import { ResponseViewer } from "./ResponseViewer";
import { CodeExamples } from "./CodeExamples";
import { SchemaViewer } from "./SchemaViewer";
import { apiService } from "../services/apiService";
import { cn } from "@/lib/utils";
import { useApiContext } from "../contexts/ApiContext";

interface MainContentProps {
  endpoint: Endpoint | null;
  showDocumentation?: boolean;
  showBackButton?: boolean;
}

type TabType = "request" | "response" | "code" | "docs";

const tabs = [
  { id: "docs", label: "Docs" },
  { id: "request", label: "Request" },
  { id: "response", label: "Response" },
  { id: "code", label: "Code" },
] as const;

// Memoized documentation component
const DocumentationContent = memo(() => (
  <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
    {/* Header */}
    <div className="border-b border-border p-6 flex-shrink-0">
      <h1 className="text-l font-semibold text-primary">Documentation</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Comprehensive guide for using the Swaggify platform
      </p>
    </div>

    {/* Documentation Content */}
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Swaggify</h3>
        <p className="text-sm text-foreground mb-4">
          Tigg Open Platform provides an API testing tool named "API Explorer"
          for you to test the APIs on the platform.
        </p>
        <p className="text-sm text-foreground mb-4">
          Take the following steps to start the API Explorer:
        </p>
        <ol className="text-sm text-foreground space-y-2 ml-6 list-decimal">
          <li>
            Open the APP Console and click <strong>Manage</strong> for your
            application.
          </li>
          <li>
            On the App Management page, click <strong>API Explorer</strong> from
            the left navigation panel.
          </li>
          <li>
            On the API Explorer page, enter the marketplace and API name, and
            specify the parameters to test APIs.
          </li>
        </ol>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary font-medium">
            Please note that the API Explorer uses online data from the
            production environment.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">
          Parameter Description
        </h3>
        <p className="text-sm text-foreground mb-4">
          Description of the API Explorer parameters is as follows:
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Description</th>
                <th className="text-left p-4 font-medium">Sample value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">API Path</td>
                <td className="p-4 text-sm">
                  Path of the API to be tested. For the list of API path, see
                  API name mapping.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  /brands/get
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">
                  HTTP Method
                </td>
                <td className="p-4 text-sm">
                  Most APIs are called via GET, some calls that get additional
                  request data are sent via POST.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  GET or POST
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">App Key</td>
                <td className="p-4 text-sm">
                  The unique identity of your application on Tigg Open Platform,
                  which is generated when the application is created.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  100126
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">
                  Access Token
                </td>
                <td className="p-4 text-sm">
                  The token that is required for your application to access
                  sensitive data of sellers. For details, see Configure seller
                  authorization.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  -
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">
                  Business parameters
                </td>
                <td className="p-4 text-sm">
                  The business parameters for the API that is to be tested.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  -
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">Request</td>
                <td className="p-4 text-sm">
                  When the parameters are specified, click the Start Test
                  button, the request URL is generated and displayed in the
                  Request field.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground break-all">
                  https://api.tigg.pk/rest/brands/get?offset=100&limit=1&app_key=100126&sign_method=hmac×tamp=1520045034634&sign=0CBC5F17611DB5B3A9D66926A3D1C3CF
                </td>
              </tr>
              <tr className="hover:bg-muted/20">
                <td className="p-4 font-mono text-sm font-medium">Response</td>
                <td className="p-4 text-sm">
                  The API response body for the specified parameters.
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(
                      {
                        data: [
                          {
                            name: "Cold Mountain",
                            brand_id: 23980,
                            global_identifier: "cold_mountain",
                          },
                        ],
                        code: "0",
                        request_id: "0be6fdce15200450346451004",
                      },
                      null,
                      2
                    )}
                  </pre>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">
          External Documentation
        </h3>
        <p className="text-foreground mb-4">
          For more detailed information and additional resources, visit the
          official documentation:
        </p>
        <a
          href="https://open.daraz.com/doc/doc.htm?spm=a2o9m.11193535.0.0.c9f45d6eWGganr#/?docId=489"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline"
        >
          <FileText className="h-4 w-4" />
          View Full Swaggifyocumentation
        </a>
      </div>
    </div>
  </div>
));

DocumentationContent.displayName = "DocumentationContent";

// Memoized welcome component
const WelcomeContent = memo(() => (
  <div className="flex-1 flex items-center justify-center bg-muted/20 h-screen">
    <div className="text-center">
      <h3 className="text-lg font-medium text-foreground mb-2">
        Welcome to API Playground
      </h3>
      <p className="text-muted-foreground">
        Select an endpoint from the sidebar to get started
      </p>
    </div>
  </div>
));

WelcomeContent.displayName = "WelcomeContent";

export const MainContent = memo(
  ({
    endpoint,
    showDocumentation,
    showBackButton = false,
  }: MainContentProps) => {
    const { setSelectedEndpoint } = useApiContext();
    const [activeTab, setActiveTab] = useState<TabType>("docs");
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<RequestConfig | null>(
      null
    );

    //requestbuilder states
    const [showHeader, setShowHeaders] = useState(false);
    const [pathParams, setPathParams] = useState<Record<string, string>>({});
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [customHeaders, setCustomHeaders] = useState<
      Array<{ key: string; value: string }>
    >([]);
    const [requestBody, setRequestBody] = useState("");

    // Clear response and reset to request tab when endpoint changes
    useEffect(() => {
      setResponse(null);
      setCurrentRequest(null);
      setActiveTab("docs");
      setPathParams({});
      setQueryParams({});
      setCustomHeaders([]);
      setShowHeaders(false);
      setRequestBody("");
    }, [endpoint?.id]); //
    //
    //  Use endpoint.id to detect changes

    useEffect(() => {
      if (endpoint?.requestBody) {
        handleGenerate(endpoint);
      }
    }, [endpoint?.requestBody]);

    const generateExampleFromSchema = (schema: SchemaObject): unknown => {
      if (schema.example !== undefined) {
        return schema.example;
      }

      switch (schema.type) {
        case "object": {
          const obj: Record<string, unknown> = {};
          if (schema.properties) {
            Object.entries(schema.properties).forEach(([key, propSchema]) => {
              obj[key] = generateExampleFromSchema(propSchema);
            });
          }
          return obj;
        }

        case "array":
          if (schema.items) {
            return [generateExampleFromSchema(schema.items)];
          }
          return [];

        case "string":
          if (schema.format === "date") return "2024-01-01";
          if (schema.format === "date-time") return "2024-01-01T00:00:00Z";
          if (schema.format === "email") return "user@example.com";
          if (schema.enum?.length) return schema.enum[0];
          return "string";

        case "number":
        case "integer":
          return schema.enum?.length ? schema.enum[0] : 0;

        case "boolean":
          return false;

        default:
          return null;
      }
    };

    const handleGenerate = async (endpoint: Endpoint) => {
      if (endpoint.requestBody) {
        // Generate example data from the schema
        const exampleData = generateExampleFromSchema(endpoint.requestBody);
        setRequestBody(JSON.stringify(exampleData, null, 2));
      } else if (
        endpoint.method !== "GET" &&
        endpoint.parameters &&
        endpoint.parameters.length > 0
      ) {
        // For POST requests with parameters, create a basic structure
        const bodyObj: Record<string, string | number | boolean> = {};
        endpoint.parameters.forEach((param) => {
          if (param.example !== undefined) {
            bodyObj[param.name] = String(param.example);
          } else {
            // Set default values based on type
            switch (param.type) {
              case "string":
                bodyObj[param.name] = param.description || "string";
                break;
              case "number":
                bodyObj[param.name] = 0;
                break;
              case "boolean":
                bodyObj[param.name] = false;
                break;
            }
          }
        });
        setRequestBody(JSON.stringify(bodyObj, null, 2));
      } else {
        setRequestBody("");
      }
    };
    const handleSendRequest = useCallback(async (config: RequestConfig) => {
      setIsLoading(true);
      setCurrentRequest(config);

      try {
        // Add client credentials to headers if available
        const clientId = localStorage.getItem("api-client-id");
        const clientSecret = localStorage.getItem("api-client-secret");

        if (clientId && clientSecret) {
          config.headers["X-Client-ID"] = clientId;
          config.headers["X-Client-Secret"] = clientSecret;
        }

        // Make the actual API request to the backend
        const response = await apiService.makeRequest(config);

        setResponse(response);
        setActiveTab("response");
      } catch (error) {
        console.error("Request failed:", error);

        // Fallback error response
        const errorResponse: ApiResponse = {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            error: "Request Failed",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
          duration: 0,
        };
        setResponse(errorResponse);
        setActiveTab("response");
      } finally {
        setIsLoading(false);
      }
    }, []);

    const handleTabChange = useCallback((tab: TabType) => {
      setActiveTab(tab);
    }, []);

    // Memoize tab content rendering
    const tabContent = useMemo(() => {
      if (!endpoint) return null;

      switch (activeTab) {
        case "request":
          return (
            <RequestBuilder
              endpoint={endpoint}
              onSendRequest={handleSendRequest}
              isLoading={isLoading}
              showHeader={showHeader}
              setShowHeaders={(bool: boolean) => setShowHeaders(bool)}
              pathParams={pathParams}
              setPathParams={setPathParams}
              queryParams={queryParams}
              setQueryParams={setQueryParams}
              customHeaders={customHeaders}
              setCustomHeaders={setCustomHeaders}
              requestBody={requestBody}
              setRequestBody={setRequestBody}
            />
          );
        case "response":
          return <ResponseViewer response={response} />;
        case "code":
          return (
            <CodeExamples endpoint={endpoint} requestConfig={currentRequest} />
          );
        case "docs":
          return (
            <div className="space-y-8 max-w-none">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Endpoint Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Method
                    </span>
                    <div className="mt-1">
                      <HttpMethodBadge method={endpoint.method} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Path
                    </span>
                    <p className="mt-1 font-mono text-sm">{endpoint.path}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Description
                    </span>
                    <p className="mt-1 text-sm">
                      {endpoint.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authentication Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Client Credentials
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Required in request headers
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Include your client credentials in the request headers:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
                      <div>X-Api-Key : YOUR_CLIENT_ID</div>
                      <div>X-Nonce : YOUR_REQUEST_NONCE_TIMESTAMP</div>
                      <div>X-Timestamp : YOUR_REQUEST_TIMESTAMP</div>
                      <div>Namespace : YOUR_ORGANIZATION_SLUG</div>
                      {/* <div>X-Client-Secret: YOUR_CLIENT_SECRET</div> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Schema */}
              {endpoint.requestBody && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Request Schema</h3>
                  <SchemaViewer
                    schema={endpoint.requestBody}
                    title="Request Body"
                    expanded={true}
                  />
                </div>
              )}

              {/* Path Parameters */}
              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Path Parameters
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">
                            Parameter
                          </th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">
                            Required
                          </th>
                          <th className="text-left p-4 font-medium">
                            Description
                          </th>
                          <th className="text-left p-4 font-medium">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.pathParams.map((param) => (
                          <tr
                            key={param.name}
                            className="border-b last:border-b-0 hover:bg-muted/20"
                          >
                            <td className="p-4 font-mono text-sm font-medium">
                              {param.name}
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {param.type}
                                </span>
                                {param.enum && param.enum.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    enum: [{param.enum.slice(0, 3).join(", ")}
                                    {param.enum.length > 3 ? "..." : ""}]
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  param.required
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {param.required ? "Required" : "Optional"}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              {param.description || "-"}
                            </td>
                            <td className="p-4 font-mono text-xs text-muted-foreground">
                              {param.example ? String(param.example) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Query Parameters */}
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Query Parameters
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">
                            Parameter
                          </th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">
                            Required
                          </th>
                          <th className="text-left p-4 font-medium">
                            Description
                          </th>
                          <th className="text-left p-4 font-medium">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.parameters.map((param) => (
                          <tr
                            key={param.name}
                            className="border-b last:border-b-0 hover:bg-muted/20"
                          >
                            <td className="p-4 font-mono text-sm font-medium">
                              {param.name}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 items-center space-y-1">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {param.type}
                                </span>
                                {param.enum && param.enum.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    enum: [{param.enum.join(", ")}
                                    {/* {param.enum.length > 3 ? "..." : ""} */}
                                    ]
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  param.required
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {param.required ? "Required" : "Optional"}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              {param.description || "-"}
                            </td>
                            <td className="p-4 font-mono text-xs text-muted-foreground">
                              {param.example ? String(param.example) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Response Schema */}
              {endpoint.responseExamples &&
                endpoint.responseExamples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Response Schema
                    </h3>
                    {endpoint.responseExamples.map((example, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="text-md font-medium mb-2">
                          {example.statusCode} - {example.description}
                        </h4>
                        <SchemaViewer
                          schema={example.schema}
                          title={`Response (${example.statusCode})`}
                          expanded={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          );
        default:
          return null;
      }
    }, [
      activeTab,
      endpoint,
      handleSendRequest,
      isLoading,
      response,
      currentRequest,
      queryParams,
      pathParams,
      customHeaders,
      requestBody,
    ]);

    if (showDocumentation) {
      return <DocumentationContent />;
    }

    if (!endpoint) {
      return <WelcomeContent />;
    }

    return (
      <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0">
          {showBackButton && (
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Endpoints</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <HttpMethodBadge method={endpoint.method} />
            <h1 className="text-lg font-semibold text-gray-900">
              {endpoint.title}
            </h1>
          </div>
          <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
          <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
            {endpoint.path}
          </code>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{tabContent}</div>
        </div>
      </div>
    );
  }
);
