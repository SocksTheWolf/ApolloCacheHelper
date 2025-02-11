import { v4 as uuidv4 } from 'uuid';

async function ClearGalleryCache(env) {
  const transportKey = "WORKERID_KEY";
  let helperKey = null;
  try {
    helperKey = env.CACHE_KV.get(transportKey);
  } catch {
    helperKey = uuidv4();
    await env.CACHE_KV.put(transportKey, helperKey);
  }
  
  const init = {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
      "Action": "slider",
      "WorkerKey": helperKey
    },
  };
  const apolloGalleryResponse = await env.GALLERY.fetch("https://apollogallery.pages.dev/cf-worker", init);
  if (apolloGalleryResponse.ok) {
    const jsonBlob = await apolloGalleryResponse.text();
    return jsonBlob;
  } else {
    console.error(apolloGalleryResponse.status);
    return "{'handled': false}";
  }
}

export default {
  async fetch(request, env, ctx) {
      const {pathname} = new URL(request.url);
      if (pathname === "/test") {
        const testReturn = await ClearGalleryCache(env);
        return new Response(testReturn, {status: 200, headers: new Headers({"content-type": "application/json"})});
      }
      return new Response('Hello World!');
  },
  async scheduled(event, env, ctx) {
    await ClearGalleryCache(env);
  }
};