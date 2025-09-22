import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Play, Plus, Minus, Hash, EyeIcon, EyeOff, X } from "lucide-react";
import { Endpoint, Parameter } from "../types/api";
import { RequestConfig } from "../services/apiService";

// Re-export for convenience
export type { RequestConfig };
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authCookies } from "@/utils/auth-cookies";
import { createSignature } from "@/lib/signature";
import { getNamespace } from "@/lib/getNamespace";
import { toast } from "sonner";

interface RequestBuilderProps {
  endpoint: Endpoint;
  onSendRequest: (config: RequestConfig) => void;
  isLoading: boolean;
  showHeader: boolean;
  setShowHeaders: (bool: boolean) => void;
  pathParams: Record<string, string>;
  setPathParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  queryParams: Record<string, string>;
  setQueryParams: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customHeaders: Array<{ key: string; value: string }>;
  setCustomHeaders: React.Dispatch<
    React.SetStateAction<Array<{ key: string; value: string }>>
  >;
  requestBody: string;
  setRequestBody: React.Dispatch<React.SetStateAction<string>>;
}

// Enum Input Component
const EnumInput = ({
  param,
  value,
  onChange,
}: {
  param: Parameter;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="font-mono text-sm">
        <SelectValue placeholder="Select a value" />
      </SelectTrigger>
      <SelectContent>
        {param.enum?.map((enumValue) => (
          <SelectItem key={enumValue} value={String(enumValue)}>
            {String(enumValue)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Array Input Component
const ArrayInput = ({
  param,
  value,
  onChange,
}: {
  param: Parameter;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  // Initialize input value from parent state
  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setInputValue(parsed.join(", "));
      } else {
        setInputValue(value);
      }
    } catch {
      setInputValue(value);
    }
  }, [value]);

  // Convert comma-separated string to array JSON and update parent
  const handleBlur = () => {
    if (!inputValue.trim()) {
      onChange("[]");
      return;
    }

    const items = inputValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (param.items?.type === "number") {
      const numbers = items.map((item) => {
        const num = Number(item);
        return isNaN(num) ? item : num;
      });
      onChange(JSON.stringify(numbers));
    } else {
      onChange(JSON.stringify(items));
    }
  };

  // If array items have enum values, show a multi-select interface
  if (param.items?.enum && param.items.enum.length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Select enum values</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {param.items.enum.map((enumValue) => {
            const stringValue = String(enumValue);
            const isSelected = value && JSON.parse(value).includes(enumValue);
            return (
              <Button
                key={enumValue}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  try {
                    const currentArray = value ? JSON.parse(value) : [];
                    const newArray = isSelected
                      ? currentArray.filter(
                          (item: unknown) => item !== enumValue
                        )
                      : [...currentArray, enumValue];
                    onChange(JSON.stringify(newArray));
                  } catch {
                    onChange(JSON.stringify([enumValue]));
                  }
                }}
                className="text-xs"
              >
                {stringValue}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {param.collectionFormat === "csv"
            ? "Comma-separated values"
            : "Array values"}
        </span>
      </div>

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={`Enter ${
          param.items?.type || "string"
        } values separated by commas`}
        className="font-mono text-sm"
      />
    </div>
  );
};

// Utility function for nonce generation
const generateNonce = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const RequestBuilder = memo(
  ({
    endpoint,
    onSendRequest,
    isLoading,
    showHeader,
    setShowHeaders,
    pathParams,
    setPathParams,
    queryParams,
    setQueryParams,
    customHeaders,
    setCustomHeaders,
    requestBody,
    setRequestBody,
  }: RequestBuilderProps) => {
    const defaultHeaders = [
      { key: "namespace", value: "pos" },
      { key: "nonce", value: "<NONCE_TIME>" },
      { key: "timestamp", value: "<TIMESTAMP>" },
    ];

    // Memoize default parameters calculation
    const defaultParams = useMemo(() => {
      const defaultPathParams: Record<string, string> = {};
      endpoint.pathParams?.forEach((param) => {
        defaultPathParams[param.name] = param.example?.toString() || "";
      });

      const defaultQueryParams: Record<string, string> = {};
      endpoint.parameters?.forEach((param) => {
        if (param.example !== undefined) {
          if (param.type === "array" && Array.isArray(param.example)) {
            // Handle array examples - always store as JSON array
            defaultQueryParams[param.name] = JSON.stringify(param.example);
          } else {
            defaultQueryParams[param.name] = String(param.example);
          }
        }
      });

      return { defaultPathParams, defaultQueryParams };
    }, [endpoint.pathParams, endpoint.parameters]);

    // Save API key to localStorage

    const addCustomHeader = useCallback(() => {
      setCustomHeaders((prev) => [...prev, { key: "", value: "" }]);
    }, [setCustomHeaders]);

    const removeCustomHeader = useCallback(
      (index: number) => {
        setCustomHeaders((prev) => prev.filter((_, i) => i !== index));
      },
      [setCustomHeaders]
    );

    const updateCustomHeader = useCallback(
      (index: number, field: "key" | "value", value: string) => {
        setCustomHeaders((prev) => {
          const updated = [...prev];
          updated[index][field] = value;
          return updated;
        });
      },
      [setCustomHeaders]
    );

    // const generateNonceHeader = useCallback(() => {
    //   const nonce = generateNonce();
    //   setCustomHeaders((prev) => {
    //     // Check if X-Nonce already exists
    //     const existingIndex = prev.findIndex((h) => h.key === "X-Nonce");
    //     if (existingIndex >= 0) {
    //       // Update existing nonce
    //       const updated = [...prev];
    //       updated[existingIndex].value = nonce;
    //       return updated;
    //     } else {
    //       // Add new nonce header
    //       return [...prev, { key: "X-Nonce", value: nonce }];
    //     }
    //   });
    // }, []);

    const updatePathParam = useCallback(
      (name: string, value: string) => {
        setPathParams((prev) => ({ ...prev, [name]: value }));
      },
      [setPathParams]
    );

    const updateQueryParam = useCallback(
      (name: string, value: string) => {
        setQueryParams((prev) => ({ ...prev, [name]: value }));
      },
      [setQueryParams]
    );

    const handleSendRequest = useCallback(async () => {
      if (!authCookies.getCredentials()?.clientId) {
        toast.error("Please set API Key");
        return;
      }

      // Build URL with path params
      let url = endpoint.path;
      Object.entries(pathParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      });

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const nonce = generateNonce();
      headers["X-Nonce"] = nonce;
      headers["X-API-Key"] = authCookies.getCredentials()?.clientId;
      headers["namespace"] = getNamespace();

      // Add custom headers
      customHeaders.forEach(({ key, value }) => {
        if (key && value) {
          headers[key] = value;
        }
      });

      // Automatically add timestamp header
      const timestamp = Math.floor(Date.now() / 1000);
      headers["X-Timestamp"] = timestamp.toString();

      const config: RequestConfig = {
        url,
        method: endpoint.method,
        headers,
        pathParams,
        queryParams,
      };

      if (endpoint.method !== "GET" && requestBody.trim()) {
        if (!isValidJSON(requestBody)) {
          toast.error("Request body is not valid JSON");
          return;
        }
        const secretKey = authCookies.getCredentials()?.clientSecret;
        const updatedPayload = { ...JSON.parse(requestBody) };
        // Convert empty strings to null in a single pass
        const processedPayload = Object.fromEntries(
          Object.entries(endpoint?.requestBody?.properties).map(([key, _]) => [
            key,
            updatedPayload[key] === ""
              ? null
              : updatedPayload[key] !== ""
              ? updatedPayload[key]
              : null,
          ])
        );

        delete processedPayload.signature;

        const signature = await createSignature(
          processedPayload,
          secretKey || "",
          nonce,
          timestamp
        );

        config.body = JSON.stringify(
          { ...processedPayload, signature },
          null,
          2
        );
      }

      onSendRequest(config);
    }, [
      endpoint,
      pathParams,
      queryParams,
      customHeaders,
      requestBody,
      onSendRequest,
    ]);

    return (
      <div className="space-y-6">
        {/* Path Parameters */}
        {endpoint.pathParams && endpoint.pathParams.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Path Parameters
            </Label>
            <div className="space-y-3">
              {endpoint.pathParams.map((param) => (
                <div key={param.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-700">
                      {param.name}
                    </Label>
                    {param.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  {param.enum && param.enum.length > 0 ? (
                    <EnumInput
                      param={param}
                      value={pathParams[param.name] || ""}
                      onChange={(value) => updatePathParam(param.name, value)}
                    />
                  ) : (
                    <Input
                      value={pathParams[param.name] || ""}
                      onChange={(e) =>
                        updatePathParam(param.name, e.target.value)
                      }
                      placeholder={
                        param.example?.toString() || param.description
                      }
                      className="font-mono text-sm"
                    />
                  )}
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Headers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-900">
                Headers
              </Label>
              <div
                className="flex items-center gap-2 text-xs text-gray-700 bg-gray-200 rounded-full px-2 py-1 font-semibold cursor-pointer"
                onClick={() => {
                  if (showHeader) {
                    setShowHeaders(false);
                    const keysToRemove = new Set(
                      defaultHeaders.map((h) => h.key)
                    );
                    const filtered = customHeaders.filter(
                      (e) => !keysToRemove.has(e.key)
                    );
                    setCustomHeaders([...filtered]);
                  } else {
                    setShowHeaders(true);
                    setCustomHeaders((prev) => [...defaultHeaders, ...prev]);
                  }
                }}
              >
                {!showHeader ? (
                  <>
                    <EyeIcon size={14} /> 3 hidden
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> Hide auto generated headers
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={generateNonceHeader}
                className="text-xs"
              >
                <Hash className="h-3 w-3 mr-1" />
                Add Nonce
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomHeader}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Header
              </Button>
            </div>
          </div>
          {customHeaders.map((header, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Header name"
                value={header.key}
                onChange={(e) =>
                  updateCustomHeader(index, "key", e.target.value)
                }
                className="font-mono bg-gray-200"
                disabled={["namespace", "nonce", "timestamp"].includes(
                  header.key
                )}
              />
              <Input
                placeholder="Header value"
                value={header.value}
                onChange={(e) =>
                  updateCustomHeader(index, "value", e.target.value)
                }
                className="font-mono bg-gray-200"
                disabled={["namespace", "nonce", "timestamp"].includes(
                  header.key
                )}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCustomHeader(index)}
                className="px-2"
                disabled={["namespace", "nonce", "timestamp"].includes(
                  header.key
                )}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-gray-500">
            💡 Timestamp (X-Timestamp) is automatically added to every request
          </p>
        </div>

        {/* Query Parameters */}
        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Query Parameters
            </Label>
            <div className="space-y-3">
              {endpoint.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-700">
                      {param.name}
                    </Label>
                    {param.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  {param.type === "array" && param.items ? (
                    <ArrayInput
                      param={param}
                      value={queryParams[param.name] || ""}
                      onChange={(value) => updateQueryParam(param.name, value)}
                    />
                  ) : param.enum && param.enum.length > 0 ? (
                    <EnumInput
                      param={param}
                      value={queryParams[param.name] || ""}
                      onChange={(value) => updateQueryParam(param.name, value)}
                    />
                  ) : (
                    <Input
                      type={param.type === "number" ? "number" : "text"}
                      value={queryParams[param.name] || ""}
                      onChange={(e) => {
                        updateQueryParam(param.name, e.target.value);
                      }}
                      placeholder={
                        param.example?.toString() || param.description
                      }
                      className="font-mono text-sm"
                    />
                  )}
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Body */}
        {endpoint.method !== "GET" && endpoint.requestBody && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Request Body
            </Label>

            {/* POST Parameters - Show structured form for POST requests */}
            {endpoint.method === "POST" &&
              endpoint.parameters &&
              endpoint.parameters.length > 0 && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      POST Parameters
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Auto-generate JSON from form values
                          const bodyObj: Record<
                            string,
                            string | number | boolean | string[] | number[]
                          > = {};
                          endpoint.parameters.forEach((param) => {
                            const value = queryParams[param.name];
                            if (value !== undefined && value !== "") {
                              // Convert value based on parameter type
                              switch (param.type) {
                                case "number":
                                  bodyObj[param.name] = Number(value);
                                  break;
                                case "boolean":
                                  bodyObj[param.name] =
                                    value === "true" || value === "1";
                                  break;
                                case "array":
                                  try {
                                    const parsed = JSON.parse(value);
                                    if (Array.isArray(parsed)) {
                                      bodyObj[param.name] = parsed;
                                    } else {
                                      bodyObj[param.name] = [];
                                    }
                                  } catch {
                                    // If parsing fails, treat as empty array
                                    bodyObj[param.name] = [];
                                  }
                                  break;
                                default:
                                  bodyObj[param.name] = value;
                              }
                            } else if (param.example !== undefined) {
                              // Use example from OpenAPI spec if no user input
                              bodyObj[param.name] = String(param.example);
                            }
                          });
                          setRequestBody(JSON.stringify(bodyObj, null, 2));
                        }}
                        className="text-xs"
                      >
                        Generate JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset to original OpenAPI spec values
                          if (endpoint.requestBody) {
                            setRequestBody(
                              JSON.stringify(endpoint.requestBody, null, 2)
                            );
                          } else {
                            // Reset form values to examples
                            const newQueryParams: Record<string, string> = {};
                            endpoint.parameters.forEach((param) => {
                              if (param.example !== undefined) {
                                newQueryParams[param.name] = String(
                                  param.example
                                );
                              }
                            });
                            setQueryParams(newQueryParams);
                          }
                        }}
                        className="text-xs"
                      >
                        Reset to Default
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {endpoint.parameters.map((param) => (
                      <div key={param.name} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-700">
                            {param.name}
                          </Label>
                          {param.required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {param.type === "array" && param.items
                              ? `${param.type}[${param.items.type}]`
                              : param.type}
                          </span>
                        </div>
                        {param.type === "array" && param.items ? (
                          <ArrayInput
                            param={param}
                            value={queryParams[param.name] || ""}
                            onChange={(value) =>
                              updateQueryParam(param.name, value)
                            }
                          />
                        ) : param.enum && param.enum.length > 0 ? (
                          <EnumInput
                            param={param}
                            value={queryParams[param.name] || ""}
                            onChange={(value) =>
                              updateQueryParam(param.name, value)
                            }
                          />
                        ) : (
                          <Input
                            type={param.type === "number" ? "number" : "text"}
                            value={queryParams[param.name] || ""}
                            onChange={(e) =>
                              updateQueryParam(param.name, e.target.value)
                            }
                            placeholder={
                              param.example?.toString() || param.description
                            }
                            className="font-mono text-sm"
                          />
                        )}
                        <p className="text-xs text-gray-500">
                          {param.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Raw JSON Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    JSON Body
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {endpoint.requestBody
                      ? "Prefilled with required parameters from OpenAPI spec"
                      : "Generated from POST parameters above"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isValidJSON(requestBody)) {
                      toast.error("Request body is not valid JSON");
                      return;
                    }

                    try {
                      const parsed = JSON.parse(requestBody);
                      setRequestBody(JSON.stringify(parsed, null, 2));
                    } catch (e) {
                      // If invalid JSON, just format what we have
                      setRequestBody(requestBody);
                    }
                  }}
                  className="text-xs"
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="Enter JSON request body..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {isLoading ? "Sending..." : "Send Request"}
        </Button>
      </div>
    );
  }
);
