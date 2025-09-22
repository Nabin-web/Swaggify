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

const App = () => {
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
