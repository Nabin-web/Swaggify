import { useState } from "react";
import { Copy, Check } from "lucide-react";

const ApiMoreDetails = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const codeText = `export async function createSignature(
  payload: {
    [key: string]: string | number | boolean;
  },
  secretKey: string,
  nonce: string,
  timestamp: string
) {
  const sortedKey = Object.keys(payload).sort();
  const payloadArray = sortedKey.map((each) => \`\${payload[each] || ""}\`);

  const payloadString = [...payloadArray, timestamp, nonce].join(":");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadString)
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}`;

    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden ">
      {/* Header */}
      <div className="border-b border-border p-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-primary">Reference Guide</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Reference for developers and integrators
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div>
          <h3 className="text-lg font-semibold my-4 text-primary">
            Common Parameters
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Required</th>
                  <th className="text-left p-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">CLIENT_ID</td>
                  <td className="p-4 text-sm">String</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Yes
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    Unique identifier for the client application
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">CLIENT_SECRET</td>
                  <td className="p-4 text-sm">String</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Yes
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    Secret key for client authentication
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">timestamp</td>
                  <td className="p-4 text-sm">Integer</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Yes
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    Current Unix timestamp in seconds
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">nonce</td>
                  <td className="p-4 text-sm">String</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Yes
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    Unique random string to prevent replay attacks
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">api_key</td>
                  <td className="p-4 text-sm">String</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      No
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    Optional API key for additional authentication
                  </td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-4 font-mono text-sm">signature</td>
                  <td className="p-4 text-sm">String</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Yes
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    HMAC signature for request verification
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold my-6 text-primary">
            Signature Generation
          </h3>
          <div className="bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              The signature is generated using HMAC-SHA256 to ensure request
              authenticity and integrity.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Steps to generate signature:
                </h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                  <li>Sort all payload parameters alphabetically by key</li>
                  <li>
                    Extract values in sorted order and join with colon:{" "}
                    <code className="bg-background px-1 rounded text-xs">
                      value1:value2:value3:timestamp:nonce
                    </code>
                  </li>
                  <li>Use HMAC-SHA256 with CLIENT_SECRET as the key</li>
                  <li>Encode the result in hexadecimal format</li>
                </ol>
              </div>

              <div className="relative group">
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors z-10"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                  <code>{`export async function createSignature(
  payload: {
    [key: string]: unknown;
  },
  secretKey: string,
  nonce: string,
  timestamp: number
) {
  // Extend payload with required fields
  const updatedPayload = { ...payload, timestamp, nonce };

  // Convert payload to Base64
  const payloadString = btoa(JSON.stringify(updatedPayload));

  // Encode secret key
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Sign payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadString)
  );

  // Convert ArrayBuffer → hex string
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold my-6 text-primary">
            HTTP Status Codes
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Status Code</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      200
                    </span>
                  </td>
                  <td className="p-4 font-medium text-green-700">OK</td>
                  <td className="p-4 text-sm">Request successful</td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      400
                    </span>
                  </td>
                  <td className="p-4 font-medium text-yellow-700">
                    Bad Request
                  </td>
                  <td className="p-4 text-sm">Invalid request parameters</td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      401
                    </span>
                  </td>
                  <td className="p-4 font-medium text-orange-700">
                    Unauthorized
                  </td>
                  <td className="p-4 text-sm">Authentication required</td>
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      404
                    </span>
                  </td>
                  <td className="p-4 font-medium text-red-700">Not Found</td>
                  <td className="p-4 text-sm">Resource not found</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      500
                    </span>
                  </td>
                  <td className="p-4 font-medium text-red-700">
                    Internal Server Error
                  </td>
                  <td className="p-4 text-sm">Server error occurred</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiMoreDetails;
