import { RequestLogs } from "../components/RequestLogs";

const RequestLogsPage = () => {
  return (
    <div className="min-h-screen bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">
            Request Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Monitor and analyze your API requests in real-time
          </p>
        </div>
      </div>

      {/* Request Logs Component */}
      <div className="bg-white rounded-xl shadow-sm px-6 pb-6 ">
        <RequestLogs />
      </div>
    </div>
  );
};

export default RequestLogsPage;
