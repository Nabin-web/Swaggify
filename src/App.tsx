import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ApiProvider } from "./contexts/ApiContext";
import Layout from "./components/Layout";
import axios from "axios";
import { getNamespace } from "./lib/getNamespace";
import { API_BASE_URL } from "./services/apiService";
import { Button } from "./components/ui/button";
// Lazy load page components only
const APIDetails = lazy(() => import("./pages/ApiMoreDetails"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Apis = lazy(() => import("./pages/Apis"));
const RequestLogs = lazy(() => import("./pages/RequestLogs"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Loading component for individual page Suspense
const PageLoader = () => {
  const url = window.location.hostname;

  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

// Unauthorized component
const UnauthorizedUI = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            {errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}
          </h1>
          <p className="text-gray-500 leading-relaxed">
            You don't have permission to view this page. Please check your
            credentials.
          </p>
        </div>

        {/* Action */}
        <Button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useEffect(() => {
  //   const checkNamespaceAuth = async () => {
  //     try {
  //       const namespace = getNamespace();
  //       const response = await axios.get(
  //         `${API_BASE_URL}/api/v1/public/validate-namespace`,
  //         {
  //           headers: {
  //             Accept: "application/json",
  //             "Content-Type": "application/json",
  //             namespace: namespace,
  //           },
  //           timeout: 10000,
  //         }
  //       );

  //       if (response.status === 200) {
  //         setIsAuthenticated(true);
  //       } else {
  //         console.log({ response });
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       console.error("Namespace authentication failed:", error);
  //       setErrorMessage(error?.response?.data?.message || "Access Denied");

  //       setIsAuthenticated(false);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkNamespaceAuth();
  // }, []);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
  //         <p className="text-muted-foreground">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <UnauthorizedUI errorMessage={errorMessage} />;
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ApiProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/playground" replace />} />

              <Route path="/playground" element={<Layout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Apis />
                    </Suspense>
                  }
                />
                <Route
                  path="api-docs"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ApiDocs />
                    </Suspense>
                  }
                />
                <Route
                  path="api-details"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <APIDetails />
                    </Suspense>
                  }
                />
                <Route
                  path="apis"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Apis />
                    </Suspense>
                  }
                />
                <Route
                  path="request-logs"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <RequestLogs />
                    </Suspense>
                  }
                />
              </Route>

              {/* Catch-all route for any unmatched paths */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                }
              />
            </Routes>
          </ApiProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
