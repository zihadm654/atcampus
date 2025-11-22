import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router - UploadThing v7+ automatically detects configuration from UPLOADTHING_TOKEN env var
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
