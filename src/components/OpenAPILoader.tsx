import { useState } from "react";
import { Upload, Link, FileText } from "lucide-react";
import { OpenAPISpec } from "../types/openapi";

interface OpenAPILoaderProps {
  onSpecLoad: (spec: OpenAPISpec) => void;
  loading?: boolean;
}

export const OpenAPILoader = ({ onSpecLoad, loading }: OpenAPILoaderProps) => {
  const [url, setUrl] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const spec = JSON.parse(content);
        onSpecLoad(spec);
      } catch (error) {
        console.error("Error parsing OpenAPI file:", error);
        alert("Error parsing OpenAPI file. Please ensure it's valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleUrlLoad = async () => {
    if (!url.trim()) return;

    try {
      setLoadingUrl(true);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const spec = await response.json();
      onSpecLoad(spec);
      setUrl("");
    } catch (error) {
      console.error("Error loading OpenAPI from URL:", error);
      alert(
        "Error loading OpenAPI spec from URL. Please check the URL and try again."
      );
    } finally {
      setLoadingUrl(false);
    }
  };

  const loadSampleSpec = () => {
    // Sample OpenAPI spec for demonstration
    const sampleSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: {
        title: "Sample API",
        description: "A sample API for demonstration",
        version: "1.0.0",
      },
      paths: {
        "/users": {
          get: {
            summary: "List users",
            description: "Get a list of all users",
            tags: ["Users"],
            parameters: [
              {
                name: "page",
                in: "query",
                description: "Page number",
                required: false,
                schema: { type: "integer", example: 1 },
              },
              {
                name: "limit",
                in: "query",
                description: "Items per page",
                required: false,
                schema: { type: "integer", example: 10 },
              },
            ],
            responses: {
              "200": {
                description: "List of users",
                content: {
                  "application/json": {
                    example: {
                      data: [
                        { id: 1, name: "John Doe", email: "john@example.com" },
                        {
                          id: 2,
                          name: "Jane Smith",
                          email: "jane@example.com",
                        },
                      ],
                      pagination: { page: 1, limit: 10, total: 2 },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: "Create user",
            description: "Create a new user",
            tags: ["Users"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  example: {
                    name: "New User",
                    email: "newuser@example.com",
                  },
                },
              },
            },
            responses: {
              "201": {
                description: "User created",
                content: {
                  "application/json": {
                    example: {
                      id: 3,
                      name: "New User",
                      email: "newuser@example.com",
                    },
                  },
                },
              },
            },
          },
        },
        "/users/{id}": {
          get: {
            summary: "Get user",
            description: "Get a specific user by ID",
            tags: ["Users"],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                description: "User ID",
                schema: { type: "integer", example: 1 },
              },
            ],
            responses: {
              "200": {
                description: "User details",
                content: {
                  "application/json": {
                    example: {
                      id: 1,
                      name: "John Doe",
                      email: "john@example.com",
                    },
                  },
                },
              },
            },
          },
        },
        "/products": {
          get: {
            summary: "List products",
            description: "Get a list of all products",
            tags: ["Products"],
            responses: {
              "200": {
                description: "List of products",
                content: {
                  "application/json": {
                    example: {
                      data: [
                        { id: 1, name: "Laptop", price: 999.99 },
                        { id: 2, name: "Phone", price: 699.99 },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    onSpecLoad(sampleSpec);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading OpenAPI spec...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 h-screen">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Load OpenAPI Specification
          </h2>
          <p className="text-sm text-gray-500">
            Load your OpenAPI/Swagger spec to start exploring endpoints
          </p>
        </div>

        <div className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Load from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/openapi.json"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUrlLoad}
                disabled={!url.trim() || loadingUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {loadingUrl ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Link className="h-4 w-4" />
                )}
                Load
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload file
            </label>
            <label className="flex items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">
                  Drop your OpenAPI file here or click to browse
                </span>
              </div>
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Sample Data */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={loadSampleSpec}
              className="w-full px-4 py-2 text-blue-600 border border-blue-200 rounded-lg text-sm hover:bg-blue-50 transition-colors"
            >
              Try with sample data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
