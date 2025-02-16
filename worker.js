import { v4 as uuidv4 } from 'uuid';

const Logger = {
  useForwarder: false,
  logger: null,
  serviceName: "",

  configure: function(env) {
      this.logger = env.LOGGER;
      this.serviceName = env.WORKER_NAME;
      this.useForwarder = env.USE_LOG_FORWARDER === "true";
  },
  log: async function(msg) {
      if (!this.useForwarder)
      {
          console.log(`${this.serviceName}: ${msg}`);
          return;
      }
      await this.logger.postLog(this.serviceName, msg);
  },
  error: async function(msg) {
      if (!this.useForwarder)
      {
          console.error(`${this.serviceName}: ${msg}`);
          return;
      }
      await this.logger.postError(this.serviceName, msg);
  },
  warn: async function(msg) {
        if (!this.useForwarder)
        {
            console.warn(`${this.serviceName}: ${msg}`);
            return;
        }
        await this.logger.postWarning(this.serviceName, msg);
    }
};

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