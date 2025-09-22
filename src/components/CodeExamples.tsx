import { useState, useEffect } from "react";
import { CodeBlock } from "./CodeBlock";
import { RequestConfig } from "./RequestBuilder";
import { Endpoint } from "../types/api";
import { API_BASE_URL } from "@/services/apiService";

interface CodeExamplesProps {
  endpoint: Endpoint;
  requestConfig?: RequestConfig;
}

export const CodeExamples = ({
  endpoint,
  requestConfig,
}: CodeExamplesProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<
    "curl" | "javascript" | "python"
  >(() => {
    const savedLanguage = localStorage.getItem("language");
    if (
      savedLanguage &&
      ["curl", "javascript", "python"].includes(savedLanguage)
    ) {
      return savedLanguage as "curl" | "javascript" | "python";
    }
    return "curl";
  });

  useEffect(() => {
    localStorage.setItem("language", selectedLanguage);
  }, [selectedLanguage]);

  const generateCurlExample = () => {
    if (!requestConfig)
      return `curl -X ${endpoint.method} "${API_BASE_URL}/api/v1/tigg${endpoint.path}"`;

    let url = requestConfig.url;
    const queryString = Object.entries(requestConfig.queryParams)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    if (queryString) {
      url += `?${queryString}`;
    }

    let curlCommand = `curl -X ${requestConfig.method} "${url}"`;

    // Add headers
    Object.entries(requestConfig.headers).forEach(([key, value]) => {
      curlCommand += ` \\\n  -H "${key}: ${value}"`;
    });

    // Add body
    if (requestConfig.body) {
      curlCommand += ` \\\n  -d '${requestConfig.body}'`;
    }

    return curlCommand;
  };

  const generateJavaScriptExample = () => {
    if (!requestConfig) {
      return `const response = await fetch('${API_BASE_URL}/api/v1/tigg${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);`;
    }

    let url = requestConfig.url;
    const queryString = Object.entries(requestConfig.queryParams)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    if (queryString) {
      url += `?${queryString}`;
    }

    let code = `const response = await fetch('${url}', {\n  method: '${requestConfig.method}',\n  headers: {\n`;

    Object.entries(requestConfig.headers).forEach(([key, value]) => {
      code += `    '${key}': '${value}',\n`;
    });

    code += `  },`;

    if (requestConfig.body) {
      code += `\n  body: ${JSON.stringify(requestConfig.body, null, 2).replace(
        /\n/g,
        "\n  "
      )},`;
    }

    code += `\n});\n\nconst data = await response.json();\nconsole.log(data);`;

    return code;
  };

  const generatePythonExample = () => {
    if (!requestConfig) {
      return `import requests

response = requests.${endpoint.method.toLowerCase()}('${API_BASE_URL}/api/v1/tigg${
        endpoint.path
      }')
print(response.json())`;
    }

    const url = requestConfig.url;
    const params = Object.entries(requestConfig.queryParams)
      .filter(([_, value]) => value)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    let code = `import requests\n\n`;

    // Headers
    if (Object.keys(requestConfig.headers).length > 0) {
      code += `headers = {\n`;
      Object.entries(requestConfig.headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `}\n\n`;
    }

    // Parameters
    if (Object.keys(params).length > 0) {
      code += `params = {\n`;
      Object.entries(params).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `}\n\n`;
    }

    // Request
    code += `response = requests.${requestConfig.method.toLowerCase()}('${url}'`;

    const args = [];
    if (Object.keys(requestConfig.headers).length > 0)
      args.push("headers=headers");
    if (Object.keys(params).length > 0) args.push("params=params");
    if (requestConfig.body) args.push(`json=${requestConfig.body}`);

    if (args.length > 0) {
      code += `, ${args.join(", ")}`;
    }

    code += `)\nprint(response.json())`;

    return code;
  };

  const examples = {
    curl: generateCurlExample(),
    javascript: generateJavaScriptExample(),
    python: generatePythonExample(),
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {Object.keys(examples).map((lang) => (
          <button
            key={lang}
            onClick={() =>
              setSelectedLanguage(lang as "curl" | "javascript" | "python")
            }
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
              selectedLanguage === lang
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Code Example */}
      <CodeBlock
        code={examples[selectedLanguage]}
        language={selectedLanguage}
      />
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
