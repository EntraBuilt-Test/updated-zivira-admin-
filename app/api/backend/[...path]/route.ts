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
    
    const backendUrl = `https://zivira-backend-7qkt.onrender.com/api/${pathString}${queryString}`;
    
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
      if (!lowerKey.startsWith('access-control-')) {
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
