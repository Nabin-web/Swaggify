import { useState, useEffect } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authCookies } from "@/utils/auth-cookies";

interface CredentialsModalProps {
  onCredentialsSet: (hasCredentials: boolean) => void;
  hasCredentials: boolean;
}

export const CredentialsModal = ({
  onCredentialsSet,
  hasCredentials,
}: CredentialsModalProps) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Load saved credentials from cookies
    const { clientId: savedClientId, clientSecret: savedClientSecret } =
      authCookies.getCredentials();

    if (savedClientId && savedClientSecret) {
      setBaseUrl(localStorage.getItem("base_url"));
      onCredentialsSet(true);
    }
  }, [onCredentialsSet]);

  const handleSaveCredentials = () => {
    if (clientId.trim() && clientSecret.trim()) {
      authCookies.setCredentials(clientId.trim(), clientSecret.trim());
      localStorage.setItem("base_url", baseUrl);
      onCredentialsSet(true);
      setOpen(false);
    }
  };

  const handleClearCredentials = () => {
    authCookies.clearCredentials();
    setBaseUrl("");
    onCredentialsSet(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 rounded-full ${
            hasCredentials ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Key className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Base Url</Label>
            <Input
              id="baseUrl"
              type="text"
              placeholder="Enter your base url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveCredentials}
              disabled={!clientId.trim() || !clientSecret.trim()}
              className="flex-1"
            >
              {baseUrl ? "Update" : "Save"}
            </Button>

            {baseUrl && (
              <Button
                variant="outline"
                onClick={handleClearCredentials}
                className="px-3"
              >
                Clear
              </Button>
            )}
          </div>

          {baseUrl && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              Credentials saved successfully
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
