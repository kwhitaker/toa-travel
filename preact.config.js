const manifest = require("./src/manifest.json");

export default function(config, env, helpers) {
  if (env.production) {
    config.output.publicPath = env.manifest.start_url;
  }
}
