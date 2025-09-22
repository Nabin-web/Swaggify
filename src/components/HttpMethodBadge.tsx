import { cn } from "@/lib/utils";

interface HttpMethodBadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  className?: string;
}

export const HttpMethodBadge = ({
  method,
  className,
}: HttpMethodBadgeProps) => {
  const getMethodStyles = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-50 text-green-700 border-green-200";
      case "POST":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PUT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        getMethodStyles(method),
        className
      )}
    >
      {method}
    </span>
  );
};
