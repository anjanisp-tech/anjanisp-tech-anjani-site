// Shared lazy-import helpers to avoid top-level crashes in serverless

let dbModule: any;
export const getDb = async () => {
  if (!dbModule) dbModule = await import("./db.js");
  return dbModule;
};

let utilsModule: any;
export const getUtils = async () => {
  if (!utilsModule) utilsModule = await import("./utils.js");
  return utilsModule;
};

let knowledgeModule: any;
export const getKnowledge = async () => {
  if (!knowledgeModule) knowledgeModule = await import("./knowledgeService.js");
  return knowledgeModule;
};
