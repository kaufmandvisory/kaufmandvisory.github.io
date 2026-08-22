import { MarketStreamSession } from '../server/market-stream-session.js';

const headers = {
  'access-control-allow-origin': '*',
  'cache-control': 'no-cache, no-store, no-transform',
  'content-type': 'text/event-stream; charset=utf-8',
  'x-accel-buffering': 'no',
  'x-content-type-options': 'nosniff'
};

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });

  const encoder = new TextEncoder();
  let session;
  let heartbeat;
  let rotation;
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(rotation);
        session?.stop();
        try { controller.close(); } catch {}
      };
      controller.enqueue(encoder.encode('retry: 750\n\n'));
      session = new MarketStreamSession({
        onSnapshot(snapshot) {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`)); } catch { close(); }
        }
      });
      session.start();
      heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
      }, 10_000);
      // Netlify limita la ejecución continua. EventSource renueva esta ventana
      // automáticamente y el cliente conserva únicamente cotizaciones < 5 s.
      rotation = setTimeout(close, 52_000);
      request.signal.addEventListener('abort', close, { once: true });
    },
    cancel() {
      closed = true;
      clearInterval(heartbeat);
      clearTimeout(rotation);
      session?.stop();
    }
  });
  return new Response(stream, { status: 200, headers });
};

export const config = { path: '/api/market/stream' };
