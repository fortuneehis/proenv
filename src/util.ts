import * as fs from "fs";
import { resolve } from "path";

const ENV_REGEXP = /^.env.*/;

export const getEnvData = (path: string | string[]) => {
  const tempPath = Array.isArray(path) ? [...new Set<string>(path)] : [path];

  if (tempPath.length === 0) throw new Error();

  let accumulatedData = "";

  tempPath.forEach((path) => {
    if (typeof path !== "string")
      throw new Error(`[File Error]: 
        Expected string
        Got ${typeof path}`);

    if (!fileExists(path)) throw new Error("[File Error]: File does not exist");
    if (!isEnv(path))
      throw new Error("[File Error]: File is not environment file");
    const data = fs.readFileSync(path).toString("utf-8");
    accumulatedData += data + "\n";
  });
  return accumulatedData;
};

const isEnv = (path: string) => {
  const pathAsArray = resolve(path).split("/");
  const filename = pathAsArray[pathAsArray.length - 1];
  return ENV_REGEXP.test(filename);
};

const fileExists = (path: string) => {
  return fs.existsSync(path) && fs.statSync(path).isFile();
};
