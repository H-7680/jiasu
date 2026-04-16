export default async function handler(req) {
  // 1. 立即处理 OPTIONS 预检请求（这是解决 CORS 的关键）
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey, x-client-info, Authorization, Prefer',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const targetHost = 'atkeaiwegxztiballnlg.supabase.co';
    const url = new URL(req.url);
    
    // 修复路径转发逻辑
    const path = url.pathname.replace('/api/proxy', '');
    const targetUrl = `https://${targetHost}${path}${url.search}`;

    // 复制并过滤请求头
    const newHeaders = new Headers(req.headers);
    newHeaders.set('host', targetHost);
    newHeaders.delete('connection');
    newHeaders.delete('referer');

    const fetchOptions = {
      method: req.method,
      headers: newHeaders,
      redirect: 'follow',
    };

    // 处理请求体
    if (!['GET', 'HEAD'].includes(req.method)) {
      const bodyText = await req.text();
      if (bodyText) fetchOptions.body = bodyText;
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // 构造最终响应头，强制合并 CORS 头
    const finalHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(key => {
      finalHeaders.set(key, corsHeaders[key]);
    });

    return new Response(response.body, {
      status: response.status,
      headers: finalHeaders,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
