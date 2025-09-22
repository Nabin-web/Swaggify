import { useState, useEffect } from 'react';
import { OpenAPISpec } from '../types/openapi';
import { Endpoint } from '../types/api';
import { parseOpenAPISpec } from '../utils/openapi-parser';

interface UseOpenAPIResult {
  endpoints: Endpoint[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseOpenAPIOptions {
  apiUrl?: string;
  autoFetch?: boolean;
}

export const useOpenAPI = (options: UseOpenAPIOptions = {}): UseOpenAPIResult => {
  const { apiUrl = '/api/docs/openapi.json', autoFetch = true } = options;
  
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpenAPISpec = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let spec: OpenAPISpec;

      if (contentType?.includes('application/json')) {
        spec = await response.json();
      } else if (contentType?.includes('application/yaml') || contentType?.includes('text/yaml')) {
        const yamlText = await response.text();
        // For YAML parsing, you'd need a YAML parser like js-yaml
        // For now, assuming JSON response
        throw new Error('YAML parsing not implemented. Please provide JSON format.');
      } else {
        // Try parsing as JSON anyway
        spec = await response.json();
      }

      const parsed = parseOpenAPISpec(spec);
      setEndpoints(parsed.endpoints);
      setCategories(parsed.categories);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching OpenAPI spec:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchOpenAPISpec();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchOpenAPISpec();
    }
  }, [apiUrl, autoFetch]);

  return {
    endpoints,
    categories,
    loading,
    error,
    refetch
  };
};