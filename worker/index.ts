/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  OWNER_USERNAME?: string;
  OWNER_PASSWORD?: string;
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
    const url = new URL(request.url);
    if(url.pathname==="/owner"||url.pathname.startsWith("/owner/")||url.pathname.startsWith("/api/owner/")){
      if(!env.OWNER_USERNAME||!env.OWNER_PASSWORD)return new Response("Atur OWNER_USERNAME dan OWNER_PASSWORD di Cloudflare Secrets.",{status:503});
      let supplied="";try{const h=request.headers.get("authorization")||"";if(h.startsWith("Basic "))supplied=atob(h.slice(6))}catch{}
      const digest=async(v:string)=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
      const [a,b]=await Promise.all([digest(supplied),digest(env.OWNER_USERNAME+":"+env.OWNER_PASSWORD)]);
      let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
      if(diff)return new Response("Login owner diperlukan.",{status:401,headers:{"WWW-Authenticate":'Basic realm="Owner Undangan", charset="UTF-8"',"Cache-Control":"no-store"}});
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
