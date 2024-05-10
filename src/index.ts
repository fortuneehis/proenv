import { resolve } from "path";
import Lexer from "./lexer";
import Parser from "./parser";
import { getEnvData } from "./util";

export function config(path?: string | string[], noEnv?: boolean) {
  const data = getEnvData(path ?? resolve(process.cwd(), ".env"), noEnv);

  const lexer = new Lexer(data);
  const parser = new Parser(lexer.tokens);

  const error = parser.getError();

  if (error.length > 0) return error;

  process.env = new Proxy(
    { ...process.env, ...parser.output },
    {
      get: (target, prop: string) => {
        try {
          const value = JSON.parse(target[prop] as string);
          return value;
        } catch (err) {
          return target[prop];
        }
      },
    }
  ) as {
    [key: keyof typeof parser.output]: any;
  };
}
