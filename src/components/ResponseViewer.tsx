import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { ApiResponse } from "../types/api";
import { cn } from "@/lib/utils";
import ReactJsonViewer from "./ReactJsonViewer";

interface ResponseViewerProps {
  response: ApiResponse | null;
}

export const ResponseViewer = ({ response }: ResponseViewerProps) => {
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No response yet</p>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(response.data, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-green-600 bg-green-50 border-green-200";
    if (status >= 400 && status < 500)
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (status >= 500) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="space-y-4">
      {/* Status and Meta Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold border",
              getStatusColor(response.status)
            )}
          >
            {response.status}
          </span>
          <span className="text-sm text-gray-600">{response.duration}ms</span>
        </div>
        <button
          onClick={copyResponse}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Headers */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900 text-sm">
            Response Headers
          </span>
          {showHeaders ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {showHeaders && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex gap-3 text-sm">
                  <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">
                    {key}:
                  </span>
                  <span className="text-gray-900 font-mono break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response Body */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="font-medium text-gray-900 text-sm">
            Response Body
          </span>
        </div>
        <div className="p-4">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
            <ReactJsonViewer json={response.data || {}} />
          </pre>
        </div>
      </div>
    </div>
  );
};
