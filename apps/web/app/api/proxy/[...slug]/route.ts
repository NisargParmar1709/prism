import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handleRequest(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  // Construct the destination URL
  const slugPath = params.slug ? params.slug.join('/') : '';
  const searchParams = request.nextUrl.search;
  
  // Base FastAPI URL from environment (default to localhost for dev)
  // In production, NEXT_PUBLIC_API_URL should NOT point to /api/proxy, 
  // but we can use an internal BACKEND_API_URL if needed.
  // For simplicity, we assume FASTAPI_URL or default.
  const backendUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
  const url = `${backendUrl}/${slugPath}${searchParams}`;

  // 1. Extract the secure first-party cookie
  let accessToken = null;
  const authCookie = request.cookies.get('prism-auth-token');
  
  if (authCookie && authCookie.value) {
    accessToken = authCookie.value;
  }

  // 2. Prepare headers
  const headers = new Headers(request.headers);
  // Remove host header to avoid conflicts with backend host
  headers.delete('host');
  
  if (accessToken) {
    console.log(`[Proxy] Forwarding request to FastAPI with token (length: ${accessToken.length})`);
    headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    console.log('[Proxy] No access token found in cookies');
  }

  // 3. Proxy the request
  try {
    const options: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    // Include body for requests that have one
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      options.body = request.body;
      // Note: request.body is a ReadableStream which fetch supports directly in Edge/Node
      // Requires duplex: 'half' in some fetch implementations, but Next.js handles it.
      (options as any).duplex = 'half';
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      const errorText = await response.clone().text();
      console.log(`[Proxy] 401 Response from FastAPI:`, errorText);
    }

    // 4. Return the response back to the client
    const responseHeaders = new Headers(response.headers);
    // Remove headers that shouldn't be proxied back
    responseHeaders.delete('content-encoding');
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

// Map all common HTTP methods to the handleRequest handler
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
