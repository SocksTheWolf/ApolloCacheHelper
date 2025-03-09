import { v4 as uuidv4 } from 'uuid';
import { Logger } from "./logger";

async function ClearGalleryCache(env) {
  const transportKey = "WORKERID_KEY";
  const helperKey = uuidv4();
  await env.CACHE_KV.put(transportKey, helperKey);

  const init = {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
      "Action": "slider",
      "WorkerKey": helperKey
    },
  };
  const galleryResponse = await fetch(`https://${env.GALLERY_HOSTNAME}/cf-worker`, init);
  if (galleryResponse.ok) {
    const jsonBlob = await galleryResponse.text();
    await Logger.log(`Updated gallery with result ${jsonBlob}`);
    return jsonBlob;
  } else {
    await Logger.error(`Failed to update gallery: ${galleryResponse.status}`);
    return "{'handled': false}";
  }
}

export default {
  async fetch(request, env, ctx) {
      const {pathname} = new URL(request.url);
      if (pathname === "/test") {
        Logger.configure(env);
        const testReturn = await ClearGalleryCache(env);
        return new Response(testReturn, {status: 200, headers: new Headers({"content-type": "application/json"})});
      }
      return new Response('Hello World!');
  },
  async scheduled(event, env, ctx) {
    Logger.configure(env);
    await ClearGalleryCache(env);
  }
};