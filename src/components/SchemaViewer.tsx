import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SchemaObject } from "../types/openapi";

interface SchemaViewerProps {
  schema: SchemaObject | undefined;
  title: string;
  expanded?: boolean;
}

interface SchemaPropertyProps {
  name: string;
  schema: SchemaObject;
  required?: boolean;
  level?: number;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "string":
      return " text-green-700 bg-green-50";
    case "number":
    case "integer":
      return "text-blue-700 bg-blue-50";
    case "boolean":
      return "text-purple-700 bg-purple-50";
    case "array":
      return "text-orange-700 bg-orange-50";
    case "object":
      return "text-gray-700 bg-gray-50";
    case "null":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
};

const SchemaProperty = ({
  name,
  schema,
  required = false,
  level = 0,
}: SchemaPropertyProps) => {
  const [expanded, setExpanded] = useState(level < 2);
  const indent = level * 16;

  const hasChildren = schema.type === "object" && schema.properties;
  const isArray = schema.type === "array";

  return (
    <div className="border-l border-gray-200">
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )
        ) : (
          <div className="w-3" />
        )}

        <span className="font-mono text-sm font-medium">{name}</span>
        {required && <span className="text-red-500 text-xs">*</span>}

        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
            schema.type || "string"
          )}`}
        >
          {isArray
            ? `${schema.type}[${schema.items?.type || "any"}]`
            : schema.type || "string"}
        </span>

        {schema.format && (
          <span className="text-xs text-gray-500">({schema.format})</span>
        )}

        {schema.description && (
          <span className="text-gray-600 text-xs truncate max-w-xs">
            {schema.description}
          </span>
        )}

        {schema.example && (
          <code className="text-xs bg-gray-100 px-1 rounded font-mono text-gray-800">
            {JSON.stringify(schema.example)}
          </code>
        )}

        {schema.enum && schema.enum.length > 0 && (
          <span className="text-xs text-blue-600">
            enum: [{schema.enum.join(", ")}]
          </span>
        )}
      </div>

      {hasChildren && expanded && schema.properties && (
        <div>
          {Object.entries(schema.properties).map(([propName, propSchema]) => (
            <SchemaProperty
              key={propName}
              name={propName}
              schema={propSchema}
              required={schema.required?.includes(propName)}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {isArray && expanded && schema.items && (
        <div style={{ paddingLeft: `${8 + indent + 16}px` }}>
          <SchemaProperty
            name="items"
            schema={schema.items}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};

export const SchemaViewer = ({
  schema,
  title,
  expanded = false,
}: SchemaViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!schema) {
    return (
      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">
        No schema defined
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-medium text-sm">{title}</h4>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </div>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {schema.type === "object" && schema.properties ? (
            <div>
              {Object.entries(schema.properties).map(
                ([propName, propSchema]) => (
                  <SchemaProperty
                    key={propName}
                    name={propName}
                    schema={propSchema}
                    required={schema.required?.includes(propName)}
                  />
                )
              )}
            </div>
          ) : schema.type === "array" && schema.items ? (
            <div>
              <SchemaProperty name="items" schema={schema.items} />
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                    schema.type || "string"
                  )}`}
                >
                  {schema.type || "any"}
                </span>
                {schema.format && (
                  <span className="text-xs text-gray-500">
                    ({schema.format})
                  </span>
                )}
                {schema.enum && schema.enum.length > 0 && (
                  <span className="text-xs text-blue-600">
                    enum: [{schema.enum.join(", ")}]
                  </span>
                )}
              </div>
              {schema.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {schema.description}
                </p>
              )}
              {schema.example && (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  <code>{JSON.stringify(schema.example, null, 2)}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
