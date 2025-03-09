export const Logger = {
    useForwarder: false,
    logger: null,
    serviceName: "",
  
    configure: function(env) {
        this.logger = env.LOGGER;
        this.serviceName = env.WORKER_NAME || "Worker";
        this.useForwarder = env.USE_LOG_FORWARDER === "true";
    },
    log: async function(msg, hookOverride=null) {
        if (!this.useForwarder)
        {
            console.log(`${this.serviceName}: ${msg}`);
            return;
        }
        await this.logger.postLog(this.serviceName, msg, hookOverride);
    },
    error: async function(msg, hookOverride=null) {
        if (!this.useForwarder)
        {
            console.error(`${this.serviceName}: ${msg}`);
            return;
        }
        await this.logger.postError(this.serviceName, msg);
    },
    warn: async function(msg, hookOverride=null) {
          if (!this.useForwarder)
          {
              console.warn(`${this.serviceName}: ${msg}`);
              return;
          }
          await this.logger.postWarning(this.serviceName, msg);
      }
  };