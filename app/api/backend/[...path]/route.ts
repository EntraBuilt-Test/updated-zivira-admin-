import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, params);
}

async function handleRequest(request: NextRequest, paramsPromise: Promise<{ path: string[] }>) {
  try {
    const params = await paramsPromise;
    const pathParams = params.path || [];
    const pathString = pathParams.join("/");
    
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    
    // Client's Render dashboard shows the ACTUAL live backend service is
    // "Zivira-Backend-swagger-ui" (zivira-backend-swagger-ui.onrender.com,
    // README: "this one service is the single source of truth") — this
    // proxy was still pointed at an older, no-longer-updated service
    // (zivira-backend-7qkt.onrender.com), which is why new backend code
    // (Territory Code, the Sales-tab clear-all endpoint, and any other
    // recent fix) never showed up on the deployed admin app: every request
    // was silently being served by the stale service instead.
    const backendUrl = `https://zivira-backend-swagger-ui.onrender.com/api/${pathString}${queryString}`;
    
    // Create new headers, omitting Origin and Referer to bypass strict CORS on the backend
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip headers that could trigger CORS blocks or host mismatch
      if (lowerKey !== 'origin' && lowerKey !== 'referer' && lowerKey !== 'host') {
        headers.set(key, value);
      }
    });

    // We can't read the body for GET/HEAD requests
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      // Pass along cache-control behavior
      cache: 'no-store'
    });

    const responseData = await response.arrayBuffer();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Don't pass back CORS headers from backend, let Next.js handle it
      const lowerKey = key.toLowerCase();
      if (
        !lowerKey.startsWith('access-control-') &&
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length'
      ) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: { message: "Failed to proxy request to backend" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
