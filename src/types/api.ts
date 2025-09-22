
export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  example?: unknown;
  enum?: any[];
  items?: {
    type: 'string' | 'number' | 'boolean';
    enum?: any[];
  };
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
}

import { SchemaObject } from './openapi';

export interface ResponseExample {
  statusCode: string;
  description: string;
  example: unknown;
  schema?: SchemaObject;
}

export interface Endpoint {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: string;
  parameters?: Parameter[];
  pathParams?: Parameter[];
  requestBody?: any;
  responseExamples?: ResponseExample[];
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
}

export interface RequestHistory {
  id: string;
  endpoint: Endpoint;
  timestamp: Date;
  response?: ApiResponse;
}
