// OpenAPI 2.0 & 3.0 Schema Types
export interface OpenAPISpec {
  // OpenAPI 3.0
  openapi?: string;
  // Swagger 2.0
  swagger?: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  paths: Record<string, PathItem>;
  // OpenAPI 3.0
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, ParameterObject>;
    responses?: Record<string, ResponseObject>;
  };
  // Swagger 2.0
  definitions?: Record<string, SchemaObject>;
  parameters?: Record<string, ParameterObject>;
  responses?: Record<string, ResponseObject>;
}

export interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
  head?: OperationObject;
  options?: OperationObject;
  trace?: OperationObject;
  parameters?: ParameterObject[];
}

export interface OperationObject {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
}

export interface ParameterObject {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie' | 'body' | 'formData';
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
  example?: any;
  // Swagger 2.0 specific
  type?: string;
  format?: string;
  items?: SchemaObject;
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
}

export interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
  example?: any;
  examples?: Record<string, ExampleObject>;
}

export interface ResponseObject {
  description: string;
  content?: Record<string, MediaTypeObject>;
  headers?: Record<string, HeaderObject>;
}

export interface SchemaObject {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  example?: any;
  examples?: any[];
  enum?: any[];
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  $ref?: string;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  email?:string;
  password?:string;
}

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
}

export interface HeaderObject {
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
}