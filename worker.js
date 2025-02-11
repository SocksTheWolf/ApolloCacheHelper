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
  const apolloGalleryResponse = await env.GALLERY.fetch("/cf-worker", init);
  if (apolloGalleryResponse.ok) {
    const jsonBlob = await apolloGalleryResponse.json();
    console.log(jsonBlob);
    return jsonBlob;
  } else {
    console.error(apolloGalleryResponse.status);
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
      const {pathname} = new URL(request.url);
      if (pathname === "/test") {
        return new Response(await ClearGalleryCache(env));
      }
      return new Response('Hello World!');
  },
  async scheduled(event, env, ctx) {
    await ClearGalleryCache(env);
  }
};