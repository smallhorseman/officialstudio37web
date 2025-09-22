export default async (request, context) => {
  // Extract analytics data
  const userAgent = request.headers.get('user-agent');
  const referer = request.headers.get('referer');
  const ip = context.ip;
  const country = context.geo?.country?.code;
  const city = context.geo?.city;

  // Send to Supabase analytics
  try {
    const analyticsData = {
      page_url: request.url,
      referrer: referer,
      user_agent: userAgent,
      ip_address: ip,
      country,
      city,
      timestamp: new Date().toISOString()
    };

    // Store in Supabase via edge function
    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY'),
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsData)
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }

  // Continue to next function/page
  return context.next();
};
