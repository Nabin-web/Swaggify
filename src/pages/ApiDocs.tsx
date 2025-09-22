import { memo } from "react";

const ApiDocs = memo(() => {
  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-primary">
          Tigg API Documentation
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Comprehensive guide for using the Tigg API platform
        </p>
      </div>

      {/* Documentation Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 ">
        <div className="bg-muted/30 rounded-lg p-4 text-sm">
          <h3 className="text-lg font-semibold mb-4 text-primary">Tigg API</h3>
          <p className="text-sm text-foreground mb-4">
            Tigg API is an interactive playground for exploring and testing all
            available accounting-related endpoints within the Tigg platform. It
            enables developers and partners to seamlessly integrate into their
            applications. Whether you are building a mobile app, web
            application, or backend service, our API ensures a fast and reliable
            integration experience.
          </p>

          <p className="text-sm text-foreground mb-4">
            It enables developers, partners, and integrators to:
          </p>
          <ol className="text-sm text-foreground space-y-2 ml-6 list-decimal">
            <li>Understand how each accounting API endpoint works</li>
            <li>Send live requests and view real-time responses</li>
            <li>Experiment with different parameters and payloads</li>
            <li>
              Validate integration workflows before deploying to production
            </li>
          </ol>
          <p className="mt-4">
            This environment is designed for safe experimentation, ensuring you
            can explore Tigg’s accounting capabilities — including transactions,
            reconciliations, statements, and reporting — without affecting live
            production data.
          </p>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Please note that the API Explorer uses online data from the
              production environment.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-sm">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Generating API Credentials for the Playground
          </h3>
          <p className="text-sm text-foreground mb-4">
            To use the Swaggify, you first need to generate your Client ID and
            Secret Key from the Developer Mode panel in Tigg Accountig:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="text-sm font-semibold text-primary mb-2">
                Generate Client ID
              </h4>
              <p className="text-sm text-foreground">
                Click the Generate button to create a unique identifier for your
                application.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="text-sm font-semibold text-primary mb-2">
                Generate Secret Key
              </h4>
              <p className="text-sm text-foreground mb-3">
                A corresponding Secret Key will be created automatically.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  • Keep this key confidential; it is required for API
                  authentication.
                </p>
                <p className="text-sm text-foreground">
                  • Use the Regenerate button if you need to replace it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-foreground">
              Once generated, add both your Client ID and Secret Key in the API
              Playground authentication fields. This will allow you to securely
              test all available accounting endpoints before integrating them
              into your production environment.
            </p>
          </div>
          <>
            <p className="text-sm text-foreground mt-4 mb-4">
              Once your <span className="font-medium">Client ID</span> and{" "}
              <span className="font-medium">Secret Key</span> have been
              generated, you must configure them in the API Playground before
              making any requests.
            </p>
            <ol className="text-sm text-foreground space-y-2 ml-4 list-decimal mb-4">
              <li>
                In the Playground interface, locate the{" "}
                <span className="font-medium">key icon</span> in the top-right
                corner.
              </li>
              <li>
                Click the icon to open the{" "}
                <span className="font-medium">Credentials</span> panel.
              </li>
              <li>
                Enter your <span className="font-medium">Client ID</span> and{" "}
                <span className="font-medium">Secret Key</span> in the
                respective fields, then save.
              </li>
            </ol>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-foreground mb-4">
              <p className="font-medium mb-1">How credentials are used:</p>
              <ul className="space-y-1 ml-6 list-disc">
                <li>
                  <span className="font-medium">Client ID</span> – Automatically
                  included in the request headers for every API call.
                </li>
                <li>
                  <span className="font-medium">Secret Key</span> – Used to
                  generate a{" "}
                  <span className="italic">cryptographic signature</span> for
                  each payload, ensuring the authenticity and integrity of your
                  requests.
                </li>
              </ul>
            </div>
            <p className="text-sm text-foreground">
              After saving, the Playground will apply these credentials to all
              subsequent API endpoint requests, allowing you to securely test
              and validate your integration.
            </p>
          </>
        </div>
      </div>
    </div>
  );
});

ApiDocs.displayName = "ApiDocs";

export default ApiDocs;
