import { consola } from "consola";

export const logger = consola.withTag("server");

export const dbLogger = consola.withTag("db");
export const authLogger = consola.withTag("auth");
export const storageLogger = consola.withTag("storage");
export const httpLogger = consola.withTag("http");
