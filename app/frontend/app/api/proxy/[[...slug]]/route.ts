import { type NextRequest, NextResponse } from 'next/server';

// Get the backend API URL from environment variables (set in docker-compose.yml)
const backendApiUrl = process.env.BACKEND_API_URL; // Should be http://backend:5000/api

// Define the core proxy logic in a reusable function
async function proxyRequest(req: NextRequest): Promise<NextResponse> {
    if (!backendApiUrl) {
        console.error('FATAL: BACKEND_API_URL environment variable is not set.');
        return NextResponse.json(
            { message: 'Internal Server Error: API proxy configuration missing.' },
            { status: 500 }
        );
    }

    let targetUrl: string = ''; // Define targetUrl here to potentially log it in catch

    try {
        // 1. Construct the target URL for the backend
        const requestPath = req.nextUrl.pathname.replace(/^\/api\/proxy/, '');
        targetUrl = `${backendApiUrl}${requestPath}${req.nextUrl.search}`; // Assign value

        console.log(`Proxying [${req.method}] request from ${req.nextUrl.pathname} to ${targetUrl}`); // Optional: for debugging

        // 2. Prepare the request headers to the backend
        const headers = new Headers(); // Use constructor 'Headers'
        req.headers.forEach((value, key) => {
            // Filter out hop-by-hop headers and others that might cause issues
            const lowerKey = key.toLowerCase();
            if (!['host', 'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers'].includes(lowerKey)) {
                headers.append(key, value);
            }
        });

        // Add/Update X-Forwarded-For (Rely on header, remove req.ip)
        const forwardedFor = req.headers.get('x-forwarded-for');
        const clientIp = forwardedFor?.split(',')[0].trim(); // Get the first IP if list exists

        if (clientIp) {
            headers.set('X-Forwarded-For', clientIp); // Use set to ensure only one header
        }

        // Add X-Forwarded-Proto and X-Forwarded-Host
        headers.set('X-Forwarded-Proto', req.nextUrl.protocol.replace(':', ''));
        // Corrected header name below and use host header primarily
        headers.set('X-Forwarded-Host', req.headers.get('host') || req.nextUrl.host);

        // 3. Prepare fetch options
        const fetchOptions: RequestInit = {
            method: req.method,
            headers: headers, // Pass the constructed Headers object
            body: (req.method !== 'GET' && req.method !== 'HEAD') ? req.body : undefined,
            redirect: 'manual',
            cache: 'no-store', // Recommended for proxies to avoid caching issues
        };

        // Add duplex conditionally using type assertion for runtime compatibility
        if (fetchOptions.body) {
            (fetchOptions as any).duplex = 'half';
        }

        // Make the actual request to the backend using fetch
        const backendResponse = await fetch(targetUrl, fetchOptions);

        // 4. Process the response from the backend
        const responseHeaders = new Headers(backendResponse.headers);
        // Clean up hop-by-hop headers from the backend response
        responseHeaders.delete('transfer-encoding');
        responseHeaders.delete('connection');
        // Allow browser to handle decompression if needed
        responseHeaders.delete('content-encoding');

        // Return the response from the backend, including its body stream
        return new NextResponse(backendResponse.body, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error: any) {
        // Log the error with more context if possible
        console.error(`API Proxy Error for ${req.method} ${targetUrl || req.nextUrl.pathname}: ${error.message}`, error);

        // Handle specific network errors
        if (error.cause?.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { message: `API Proxy Error: Could not connect to backend service at ${backendApiUrl}.` },
                { status: 503 } // Service Unavailable
            );
        }
        if (error.message?.includes('fetch failed') || error.name === 'TypeError') {
            // General fetch error (could be DNS, network unreachable, etc.)
            return NextResponse.json(
                { message: 'API Proxy Error: Network error while connecting to backend.', error: error.message },
                { status: 502 } // Bad Gateway often appropriate here
            );
        }

        // Generic fallback error
        return NextResponse.json(
            { message: 'API Proxy Error', error: error.message },
            { status: 500 } // Internal Server Error
        );
    }
}

// Export functions named after the HTTP methods
// Each function simply calls the core proxy logic
export async function GET(req: NextRequest) {
    return proxyRequest(req);
}

export async function POST(req: NextRequest) {
    return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
    return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
    return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
    return proxyRequest(req);
}

export async function OPTIONS(req: NextRequest) {
    // You might want specific OPTIONS handling depending on CORS needs,
    // but proxying is often sufficient if the backend handles CORS correctly.
    return proxyRequest(req);
}

export async function HEAD(req: NextRequest) {
    return proxyRequest(req);
}