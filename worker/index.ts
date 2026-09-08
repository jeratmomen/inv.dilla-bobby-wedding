import {adminAccess} from "../lib/admin-link";
/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ADMIN_LINK_KEY?: string;
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
   // Redirect URL lama workers.dev ke custom domain baru.
if (url.hostname === "dilla-bobby-wedding-inv.jeratmomen.workers.dev") {
  let targetPath = "/dilla-bobby/";

  // Link admin lama
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    targetPath = "/dilla-bobby/admin";
  }

  // Link owner lama
  else if (url.pathname === "/owner" || url.pathname.startsWith("/owner/")) {
    targetPath = "/dilla-bobby/owner/";
  }

  const destination = new URL(
    `https://inv.jeratmomen.my.id${targetPath}`
  );

  // Pertahankan query string seperti ?to=Nama
  destination.search = url.search;

  return Response.redirect(destination.toString(), 301);
}

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
