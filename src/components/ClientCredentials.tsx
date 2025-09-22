import { useState, useEffect } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authCookies } from "@/utils/auth-cookies";

interface ClientCredentialsProps {
  onCredentialsSet: (hasCredentials: boolean) => void;
  hasCredentials: boolean;
  isModal?: boolean;
}

export const ClientCredentials = ({
  onCredentialsSet,
  hasCredentials,
  isModal = false,
}: ClientCredentialsProps) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [hasValidCredentials, setHasValidCredentials] = useState(false);

  useEffect(() => {
    // Load saved credentials from cookies
    const { clientId: savedClientId, clientSecret: savedClientSecret } =
      authCookies.getCredentials();

    if (savedClientId && savedClientSecret) {
      setClientId(savedClientId);
      setClientSecret(savedClientSecret);
      setHasValidCredentials(true);
      onCredentialsSet(true);
    }
  }, [onCredentialsSet]);

  const handleSaveCredentials = () => {
    if (clientId.trim() && clientSecret.trim()) {
      authCookies.setCredentials(clientId.trim(), clientSecret.trim());
      setHasValidCredentials(true);
      onCredentialsSet(true);
    }
  };

  const handleClearCredentials = () => {
    authCookies.clearCredentials();
    setClientId("");
    setClientSecret("");
    setHasValidCredentials(false);
    onCredentialsSet(false);
  };

  if (isModal) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 rounded-full ${
          hasCredentials ? "text-primary" : "text-muted-foreground"
        }`}
        onClick={() => {
          /* Modal logic will be added */
        }}
      >
        <Key className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold">
            API Credentials Required
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your API client credentials to access the endpoints
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Enter your client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? "text" : "password"}
                placeholder="Enter your client secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="font-mono text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="mb-1">
              🔒 Your credentials are stored securely in cookies and never sent
              to our servers.
            </p>
            <p>They will be included in API requests for authentication.</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveCredentials}
              disabled={!clientId.trim() || !clientSecret.trim()}
              className="flex-1"
            >
              {hasValidCredentials ? "Update Credentials" : "Save Credentials"}
            </Button>

            {hasValidCredentials && (
              <Button
                variant="outline"
                onClick={handleClearCredentials}
                className="px-3"
              >
                Clear
              </Button>
            )}
          </div>

          {hasValidCredentials && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              <span className="text-sm">✅ Credentials saved successfully</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
