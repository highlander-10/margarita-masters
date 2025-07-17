// Cloudflare Pages Function for tour data management
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const tourId = url.searchParams.get('id');
    
    if (!tourId) {
        return new Response(JSON.stringify({ error: 'Tour ID required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const tourData = await env.MARGARITA_DATA.get(`tour_${tourId}`);
        if (!tourData) {
            return new Response(JSON.stringify({ error: 'Tour not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(tourData, {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load tour' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const tourData = await request.json();
        const tourId = tourData.id;
        
        if (!tourId) {
            return new Response(JSON.stringify({ error: 'Tour ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        await env.MARGARITA_DATA.put(`tour_${tourId}`, JSON.stringify(tourData));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save tour' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}