import { OpenAPISpec, OperationObject, ParameterObject, SchemaObject, RequestBodyObject, ResponseObject } from '../types/openapi';
import { Endpoint, Parameter, ResponseExample } from '../types/api';

export class OpenAPIParser {
  private spec: OpenAPISpec;
  private resolutionStack: Set<string> = new Set();
  private maxDepth: number = 10;

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
  }

  /**
   * Parse all endpoints from the OpenAPI spec
   */
  parseEndpoints(): Endpoint[] {
    const endpoints: Endpoint[] = [];

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
      
      methods.forEach(method => {
        const operation = pathItem[method] as OperationObject;
        if (operation) {
          const endpoint = this.parseEndpoint(path, method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE', operation);
          endpoints.push(endpoint);
        }
      });
    });

    return endpoints;
  }

  /**
   * Get unique categories from tags
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    
    Object.values(this.spec.paths).forEach(pathItem => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
      methods.forEach(method => {
        const operation = pathItem[method] as OperationObject;
        if (operation?.tags?.length) {
          operation.tags.forEach(tag => categories.add(tag));
        }
      });
    });

    return Array.from(categories).sort();
  }

  private parseEndpoint(path: string, method: string, operation: OperationObject): Endpoint {
    const category = operation.tags?.[0] || 'General';
    const id = `${method.toLowerCase()}-${path.replace(/[{}//]/g, '-')}`;

    return {
      id,
      title: operation.summary || `${method} ${path}`,
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      path,
      description: operation.description || '',
      category,
      parameters: this.parseQueryParameters(operation.parameters),
      pathParams: this.parsePathParameters(operation.parameters),
      requestBody: this.parseRequestBody(operation.requestBody, operation.parameters),
      responseExamples: this.parseResponseExamples(operation.responses)
    };
  }

  private parseQueryParameters(parameters?: ParameterObject[]): Parameter[] {
    if (!parameters) return [];
    
    return parameters
      .filter(param => param.in === 'query')
      .map(param => this.convertParameter(param));
  }

  private parsePathParameters(parameters?: ParameterObject[]): Parameter[] {
    if (!parameters) return [];
    
    return parameters
      .filter(param => param.in === 'path')
      .map(param => this.convertParameter(param));
  }

  private convertParameter(param: ParameterObject): Parameter {
    // Handle both OpenAPI 3.0 (schema-based) and Swagger 2.0 (type-based) parameters
    const type = param.schema ? this.getParameterType(param.schema) : this.getSwagger2ParameterType(param);
    
    // Resolve schema to get enum values
    const resolvedSchema = param.schema ? this.resolveSchemaReferences(param.schema) : null;
    
    return {
      name: param.name,
      type,
      required: param.required || false,
      description: param.description || '',
      example: param.example || param.schema?.example,
      enum: resolvedSchema?.enum || param.enum,
      items: param.schema?.items ? this.getParameterItems(param.schema.items) : param.items ? this.getParameterItems(param.items) : undefined,
      collectionFormat: param.collectionFormat
    };
  }

  private getParameterItems(items: SchemaObject): { type: 'string' | 'number' | 'boolean'; enum?: any[] } {
    const resolvedItems = this.resolveSchemaReferences(items);
    return {
      type: this.getBasicType(resolvedItems.type || 'string'),
      enum: resolvedItems.enum
    };
  }

  private getBasicType(type: string): 'string' | 'number' | 'boolean' {
    switch (type) {
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string';
    }
  }

  private getSwagger2ParameterType(param: ParameterObject): 'string' | 'number' | 'boolean' | 'array' {
    if (!param.type) return 'string';
    
    switch (param.type) {
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      default:
        return 'string';
    }
  }

  private getParameterType(schema?: SchemaObject): 'string' | 'number' | 'boolean' | 'array' {
    if (!schema) return 'string';
    
    switch (schema.type) {
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      default:
        return 'string';
    }
  }

  private parseRequestBody(requestBody?: RequestBodyObject, parameters?: ParameterObject[]): SchemaObject | undefined {
    // Handle OpenAPI 3.0 format
    if (requestBody?.content) {
      const jsonContent = requestBody.content['application/json'];
      if (jsonContent?.schema) {
        return this.resolveSchemaReferences(jsonContent.schema);
      }
    }

    // Handle body parameters from OpenAPI 3.0 or Swagger 2.0
    const bodyParameters = parameters?.filter(param => param.in === 'body');
    if (bodyParameters && bodyParameters.length > 0) {
      const firstBodyParam = bodyParameters[0];
      if (firstBodyParam.schema) {
        return this.resolveSchemaReferences(firstBodyParam.schema);
      }
    }

    return undefined;
  }

  private parseResponseExamples(responses: Record<string, ResponseObject>): ResponseExample[] {
    const responseExamples: ResponseExample[] = [];

    Object.entries(responses).forEach(([statusCode, response]) => {
      const example = this.extractResponseExample(response, statusCode);
      if (example) {
        responseExamples.push({
          statusCode,
          description: response.description || '',
          example: example.example,
          schema: example.schema
        });
      }
    });

    return responseExamples.sort((a, b) => {
      // Sort by status code: 2xx first, then 4xx, then 5xx, then others
      const aNum = parseInt(a.statusCode);
      const bNum = parseInt(b.statusCode);
      
      if (aNum >= 200 && aNum < 300 && (bNum < 200 || bNum >= 300)) return -1;
      if (bNum >= 200 && bNum < 300 && (aNum < 200 || aNum >= 300)) return 1;
      if (aNum >= 400 && aNum < 500 && bNum >= 500) return -1;
      if (bNum >= 400 && bNum < 500 && aNum >= 500) return 1;
      
      return aNum - bNum;
    });
  }

  private extractResponseExample(response: ResponseObject, statusCode: string): { example: unknown; schema?: SchemaObject } | null {
    // Handle OpenAPI 3.0 format
    if (response.content) {
      const jsonContent = response.content['application/json'];
      if (jsonContent) {
        if (jsonContent.example) {
          return { example: jsonContent.example };
        }
        if (jsonContent.schema) {
          const resolvedSchema = this.resolveSchemaReferences(jsonContent.schema);
          return {
            example: this.generateExampleFromSchema(resolvedSchema),
            schema: resolvedSchema
          };
        }
      }
    }

    // Handle Swagger 2.0 format - check if response has a schema
    if ('schema' in response && response.schema) {
      const resolvedSchema = this.resolveSchemaReferences(response.schema);
      return {
        example: this.generateExampleFromSchema(resolvedSchema),
        schema: resolvedSchema
      };
    }

    // Generate a basic example based on status code
    const basicExample = this.generateBasicExample(statusCode);
    if (basicExample) {
      return { example: basicExample };
    }

    return null;
  }

  private generateBasicExample(statusCode: string): unknown {
    const statusNum = parseInt(statusCode);
    
    if (statusNum >= 200 && statusNum < 300) {
      return {
        data: "Success response data",
        error: false,
        message: "Operation completed successfully"
      };
    } else if (statusNum >= 400 && statusNum < 500) {
      return {
        error: true,
        message: "Client error occurred",
        validation_errors: {
          field: "Error description"
        }
      };
    } else if (statusNum >= 500) {
      return {
        error: true,
        message: "Internal server error occurred"
      };
    }
    
    return null;
  }

  private generateExampleFromSchema(schema: SchemaObject, depth: number = 0): unknown {
    // Prevent infinite recursion
    if (depth > this.maxDepth) {
      return "Example data (depth limit reached)";
    }

    if (schema.$ref) {
      const refSchema = this.resolveRef(schema.$ref);
      return refSchema ? this.generateExampleFromSchema(refSchema, depth + 1) : {};
    }

    if (schema.example !== undefined) {
      return schema.example;
    }

    // Handle allOf, oneOf, anyOf
    if (schema.allOf && schema.allOf.length > 0) {
      const mergedSchema = this.mergeAllOfSchemas(schema.allOf);
      return this.generateExampleFromSchema(mergedSchema, depth + 1);
    }

    switch (schema.type) {
      case 'object': {
        const obj: Record<string, unknown> = {};
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, propSchema]) => {
            const resolvedPropSchema = this.resolveSchemaReferences(propSchema);
            obj[key] = this.generateExampleFromSchema(resolvedPropSchema, depth + 1);
          });
        }
        return obj;
      }

      case 'array':
        if (schema.items) {
          const resolvedItems = this.resolveSchemaReferences(schema.items);
          return [this.generateExampleFromSchema(resolvedItems, depth + 1)];
        }
        return [];

      case 'string':
        if (schema.format === 'date') return '2024-01-01';
        if (schema.format === 'date-time') return '2024-01-01T00:00:00Z';
        if (schema.format === 'email') return 'user@example.com';
        if (schema.enum?.length) return schema.enum[0];
        return 'string';

      case 'number':
      case 'integer':
        return schema.enum?.length ? schema.enum[0] : 0;

      case 'boolean':
        return false;

      default:
        return null;
    }
  }

  private mergeAllOfSchemas(schemas: SchemaObject[]): SchemaObject {
    const merged: SchemaObject = { type: 'object', properties: {} };
    
    schemas.forEach(schema => {
      const resolvedSchema = this.resolveSchemaReferences(schema);
      
      // Merge properties
      if (resolvedSchema.properties) {
        merged.properties = { ...merged.properties, ...resolvedSchema.properties };
      }
      
      // Merge other important fields from the first schema (like enum, type, etc.)
      if (!merged.type && resolvedSchema.type) {
        merged.type = resolvedSchema.type;
      }
      if (!merged.enum && resolvedSchema.enum) {
        merged.enum = resolvedSchema.enum;
      }
      if (!merged.format && resolvedSchema.format) {
        merged.format = resolvedSchema.format;
      }
      if (!merged.description && resolvedSchema.description) {
        merged.description = resolvedSchema.description;
      }
      if (!merged.example && resolvedSchema.example) {
        merged.example = resolvedSchema.example;
      }
    });
    
    return merged;
  }

  private resolveSchemaReferences(schema: SchemaObject, depth: number = 0): SchemaObject {
    // Prevent infinite recursion
    if (depth > this.maxDepth) {
      return { type: 'object', description: 'Schema resolution depth limit reached' };
    }

    if (schema.$ref) {
      const refKey = schema.$ref;
      
      // Check for circular references
      if (this.resolutionStack.has(refKey)) {
        return { type: 'object', description: 'Circular reference detected' };
      }
      
      this.resolutionStack.add(refKey);
      const resolvedSchema = this.resolveRef(schema.$ref);
      this.resolutionStack.delete(refKey);
      
      if (resolvedSchema) {
        return this.resolveSchemaReferences(resolvedSchema, depth + 1);
      }
      return schema;
    }

    // Handle allOf, oneOf, anyOf
    if (schema.allOf && schema.allOf.length > 0) {
      const merged = this.mergeAllOfSchemas(schema.allOf);
      // Preserve any enum values that are directly on the schema
      if (schema.enum) {
        merged.enum = schema.enum;
      }
      return merged;
    }

    // Handle nested properties
    if (schema.properties) {
      const resolvedProperties: Record<string, SchemaObject> = {};
      Object.entries(schema.properties).forEach(([key, propSchema]) => {
        resolvedProperties[key] = this.resolveSchemaReferences(propSchema, depth + 1);
      });
      return { ...schema, properties: resolvedProperties };
    }

    // Handle array items
    if (schema.items) {
      return { ...schema, items: this.resolveSchemaReferences(schema.items, depth + 1) };
    }

    return schema;
  }

  private resolveRef(ref: string): SchemaObject | undefined {
    // Handle OpenAPI 3.0 format: #/components/schemas/SchemaName
    if (ref.startsWith('#/components/schemas/')) {
      const schemaName = ref.replace('#/components/schemas/', '');
      return this.spec.components?.schemas?.[schemaName];
    }
    // Handle Swagger 2.0 format: #/definitions/SchemaName
    if (ref.startsWith('#/definitions/')) {
      const schemaName = ref.replace('#/definitions/', '');
      return this.spec.definitions?.[schemaName];
    }
    return undefined;
  }

  /**
   * Check if this is a Swagger 2.0 spec
   */
  private isSwagger2(): boolean {
    return !!this.spec.swagger && this.spec.swagger.startsWith('2.');
  }
}

export const parseOpenAPISpec = (spec: OpenAPISpec) => {
  const parser = new OpenAPIParser(spec);
  return {
    endpoints: parser.parseEndpoints(),
    categories: parser.getCategories(),
    info: spec.info
  };
};