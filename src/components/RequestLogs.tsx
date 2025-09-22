import { useState, useMemo, useEffect } from "react";
import { Search, Calendar, Filter, Clock, ExternalLink } from "lucide-react";
import { RequestHistory } from "../types/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/apiService";

interface RequestLogsProps {
  requestHistory: RequestHistory[];
}

export const RequestLogs = () => {
  const [apiPathFilter, setApiPathFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filteredHistory, setFilteredHistory] = useState<RequestHistory[]>([]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case "apiPath":
        setApiPathFilter(value);
        break;
      case "time":
        setTimeFilter(value);
        break;
      case "status":
        setStatusFilter(value);
        break;
    }
  };

  useEffect(() => {
    fetchRequestLogs();
  }, []);

  const fetchRequestLogs = async () => {
    const response = await apiService.makeRequest({
      url: "/request-logs",
      method: "GET",
      headers: {},
      pathParams: {},
      queryParams: {},
    });
    console.log(response);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-muted/30 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* API Path Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              API Path
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search API path..."
                value={apiPathFilter}
                onChange={(e) => handleFilterChange("apiPath", e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Time Range
            </label>
            <Select
              value={timeFilter}
              onValueChange={(value) => handleFilterChange("time", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success (2xx)</SelectItem>
                <SelectItem value="redirect">Redirect (3xx)</SelectItem>
                <SelectItem value="error">Error (4xx/5xx)</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredHistory.length)} of{" "}
          {filteredHistory.length} requests
        </div>
        {filteredHistory.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Request Logs Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="w-[120px] font-semibold">
                  Request ID
                </TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Request Time
                </TableHead>
                <TableHead className="w-[300px] font-semibold">
                  API Path
                </TableHead>
                <TableHead className="font-semibold">Error Logs</TableHead>
                <TableHead className="w-[150px] font-semibold">
                  Status Code
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-muted rounded-full">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          No requests found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or check back later
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((req) => (
                  <TableRow
                    key={req.id}
                    className="hover:bg-muted/20 border-b border-border"
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground py-4">
                      <span className="bg-muted px-2 py-1 rounded text-xs">
                        {Math.random().toString(12).substring(2, 10)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">
                      {formatTimestamp(req.timestamp)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-border bg-muted"
                        >
                          {req.endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm text-foreground">
                          {truncateText(req.endpoint.path, 40)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <pre className="text-xs text-muted-foreground">
                        Error logs
                      </pre>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={` bg-red-600 px-2 py-1 rounded-full text-white text-xs`}
                      >
                        500
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page as number);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={cn(
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
