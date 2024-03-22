import { resolve } from "path";
import Lexer from "./lexer";
import Parser, { ParserOptions } from "./parser";
import { getEnvData } from "./util";

export function config(path?: string | string[], options?: ParserOptions) {
  const data = getEnvData(path ?? resolve(process.cwd(), ".env"));

  const lexer = new Lexer(data);
  const parser = new Parser(lexer.tokens, options);

  const error = parser.getError();

  if (error.length > 0) return error;

  process.env = Object.freeze({
    ...process.env,
    ...parser.output,
  }) as Readonly<{
    [key: keyof typeof parser.output]: any;
  }>;
}
