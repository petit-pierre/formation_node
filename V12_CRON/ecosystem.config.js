// config pour le demmarage des service
// ajout dans package.json de :
//   "scripts": {
//     "test": "echo \"Error: no test specified\" && exit 1",
//     "start": "pm2 start V12_CRON/ecosystem.config.js",
//     "stop": "pm2 stop V12_CRON/ecosystem.config.js",
//     "api:logs": "pm2 logs"
//   },

module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./V12_CRON/server.js", // Si server.js est dans V12_CRON
      watch: true,
      ignore_watch: ["node_modules", "logs", "public"],
    },
    {
      name: "worker-bullmq",
      script: "./V12_CRON/workers/mediaWorker.js", // Ton worker pour S3/YouTube
      watch: true,
    },
    {
      name: "cron-jobs",
      script: "./V12_CRON/utils/cron.js", // Ton fichier avec node-cron
      watch: true,
    },
  ],
};
