import axios, { AxiosResponse } from "axios";
import { OpenAPISpec } from "../types/openapi";
import { ApiResponse } from "../types/api";
import { getNamespace } from "@/lib/getNamespace";

export const API_BASE_URL =
  localStorage.getItem("url") || "https://tigg-uat-api.tiggapp.com";
// export const API_BASE_URL = "https://tigg-uat-api.tiggapp.com"
// import.meta.env.VITE_API_BASE_URL
// export const API_BASE_URL = 'https://allowed-kingfish-enabled.ngrok-free.app';

export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
}

export const apiService = {
  /**
   * Fetch OpenAPI specification from the swagger endpoint
   */
  async fetchOpenAPISpec(): Promise<OpenAPISpec> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/swagger/index.json/doc.json`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error("No data received from API");
      }

      return response.data as OpenAPISpec;
    } catch (error) {
      console.error("Error fetching OpenAPI spec:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            "Connection refused. Please check if the API server is running."
          );
        } else if (error.code === "ETIMEDOUT") {
          throw new Error("Request timeout. The server is not responding.");
        } else if (error.response) {
          throw new Error(
            `Server error: ${error.response.status} ${error.response.statusText}`
          );
        } else if (error.request) {
          throw new Error(
            "Network error. Please check your internet connection."
          );
        }
      }

      throw new Error(
        "Failed to fetch OpenAPI specification. Please try again."
      );
    }
  },

  /**
   * Make actual API request to the backend
   */
  async makeRequest(config: RequestConfig): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      // Build full URL with the backend base URL and the endpoint path
      let fullUrl = `${API_BASE_URL}/api/v1/tigg${config.url}`;

      // Add query parameters
      const queryString = Object.entries(config.queryParams)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      if (queryString) {
        fullUrl += `?${queryString}`;
      }

      // Prepare axios request configuration
      const axiosConfig: {
        method: string;
        url: string;
        headers: Record<string, string>;
        timeout: number;
        data?: unknown;
      } = {
        method: config.method.toLowerCase(),
        url: fullUrl,
        headers: {
          ...config.headers,
          namespace: getNamespace(),
          Accept: "application/json",
        },
        timeout: 30000, // 30 second timeout
      };

      // Add request body for non-GET requests
      if (config.method !== "GET" && config.body) {
        try {
          axiosConfig.data = JSON.parse(config.body);
          axiosConfig.headers["Content-Type"] = "application/json";
        } catch (e) {
          // If body is not valid JSON, send as raw string
          axiosConfig.data = config.body;
          axiosConfig.headers["Content-Type"] = "text/plain";
        }
      }

      // Make the actual request
      const response: AxiosResponse = await axios(axiosConfig);
      const duration = Date.now() - startTime;

      // Transform axios response to our ApiResponse format
      return {
        status: response.status,
        headers: response.headers as Record<string, string>,
        data: response.data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("API request failed:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          return {
            status: error.response.status,
            headers: error.response.headers as Record<string, string>,
            data: error.response.data || {
              error: "Server Error",
              message: `HTTP ${error.response.status}: ${error.response.statusText}`,
            },
            duration,
          };
        } else if (error.request) {
          // Request was made but no response received
          return {
            status: 0,
            headers: {},
            data: {
              error: "Network Error",
              message:
                "No response received from server. Please check if the API server is running.",
              details: error.message,
            },
            duration,
          };
        }
      }

      // Other errors
      return {
        status: 0,
        headers: {},
        data: {
          error: "Request Failed",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        duration,
      };
    }
  },
};
