export default async function handler(request) {
    const targetHost = 'atkeaiwegxztiballnlg.supabase.co';
    const url = new URL(request.url);
    const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set('host', targetHost);

    try {
        const res = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
            redirect: 'follow'
        });

        const responseHeaders = new Headers(res.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(res.body, { status: res.status, headers: responseHeaders });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export const config = { runtime: 'edge' };
