import { memo, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { CredentialsModal } from "./CredentialsModal";
import { LogoutDropdown } from "./LogoutDropdown";
import { useApiContext } from "../contexts/ApiContext";
import { Endpoint } from "../types/api";

const Layout = memo(() => {
  const {
    endpoints,
    categories,
    selectedEndpoint,
    setSelectedEndpoint,
    loading,
    hasCredentials,
    setHasCredentials,
    clearCredentials,
  } = useApiContext();

  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    clearCredentials();
  }, [clearCredentials]);

  const handleEndpointSelect = useCallback(
    (endpoint: Endpoint) => {
      setSelectedEndpoint(endpoint);
      // Navigate to apis route when an endpoint is selected
      navigate("apis");
    },
    [setSelectedEndpoint, navigate]
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Global action buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <CredentialsModal
          onCredentialsSet={setHasCredentials}
          hasCredentials={hasCredentials}
        />
        {hasCredentials && <LogoutDropdown onLogout={handleLogout} />}
      </div>

      {/* Sidebar - sticky with 100vh height */}
      <div className="sticky top-0 h-screen flex-shrink-0">
        <Sidebar
          endpoints={endpoints}
          categories={categories}
          selectedEndpoint={selectedEndpoint}
          onEndpointSelect={handleEndpointSelect}
          loading={loading}
          hasCredentials={hasCredentials}
        />
      </div>

      {/* Main content area - renders the current route */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
