import { operatorMap } from "./operators";
import Token, { TokenTypes } from "./token";

export default class Parser {
  private currentIndex: number = 0;

  private lineNumber: number = 1;

  private variables: { [key: string]: any } = {};

  private error = "";

  output: { [key: string]: any } = {};

  constructor(private readonly tokens: Token[]) {
    try {
      const result = this.parse(true);
      this.output = { ...result };
    } catch (err: unknown) {
      this.error = "\n[Parse Error] \n" + (err as SyntaxError).message + "\n\n";
    }
  }

  private parse(init: boolean, runUntil?: () => boolean) {
    let result: { [key: string]: unknown } = {};
    let parsingPrivatePairs = init;

    while (!this.isEOT()) {
      const token = this.peek();
      if (token.type === TokenTypes.NEWLINE) {
        this.nextLine();
        this.currentIndex++;
        continue;
      }

      if (token.type === TokenTypes.WHITE_SPACE) {
        this.currentIndex++;
        continue;
      }

      if (token.type === TokenTypes.COMMENT) {
        this.currentIndex++;
        continue;
      }

      if (parsingPrivatePairs && token.type === TokenTypes.PRIVATE_VARS) {
        const { key, value } = this.parsePrivatePairs();

        this.variables = {
          ...this.variables,
          [key]: value,
        };
        continue;
      }

      if (this.peek().type === TokenTypes.PRIVATE_VARS) {
        throw new SyntaxError(
          "Private key-value pairs should be declared before the public key-value pairs"
        );
      }

      if (!init) {
        if (this.peek().type === TokenTypes.DOT) {
          this.expect(TokenTypes.DOT);
          this.expect(TokenTypes.DOT);
          this.expect(TokenTypes.DOT);
          const { key, value } = this.parseVariables();

          if (typeof value !== "object") {
            throw new SyntaxError(`${key} is not an object`);
          }
          result = {
            ...result,
            ...value,
          };
          continue;
        }
      }

      if (runUntil?.()) break;
      const { key, value } = this.parseExpression();

      parsingPrivatePairs = false;

      this.variables = {
        ...this.variables,
        [key]: value,
      };

      result = {
        ...result,
        [key]:
          init && typeof value === "object" ? JSON.stringify(value) : value,
      };
    }
    return result;
  }

  private peek() {
    return this.tokens[this.currentIndex];
  }

  private seek() {
    return this.tokens[this.currentIndex++];
  }

  private getValue():
    | Token
    | { [key: string]: any }
    | string
    | number
    | boolean
    | undefined {
    this.skipWhiteSpace();
    this.expect(TokenTypes.ASSIGN);
    this.skipWhiteSpace();
    const token = this.peek();
    let value: Token | { [key: string]: any } | string | boolean | undefined;

    switch (token.type) {
      case TokenTypes.NEWLINE:
      case TokenTypes.COMMENT:
        value = undefined;
        break;

      case TokenTypes.DOUBLE_QUOTES:
        this.expect(TokenTypes.DOUBLE_QUOTES);
        const doubleQuotesString = this.expect(
          TokenTypes.MULTI_LINE_STRING
        ) as Token;
        this.expect(TokenTypes.DOUBLE_QUOTES);
        value = doubleQuotesString.value;
        break;

      case TokenTypes.SINGLE_QUOTES:
        this.expect(TokenTypes.SINGLE_QUOTES);
        const singleQuotesString = this.expect(
          TokenTypes.MULTI_LINE_STRING
        ) as Token;
        this.expect(TokenTypes.SINGLE_QUOTES);
        value = singleQuotesString.value;
        break;

      case TokenTypes.VARS:
        const variable = this.parseVariables();
        value = variable.value;
        break;

      case TokenTypes.LBRAC:
        this.seek();
        const result = this.parse(
          false,
          () => this.peek().type === TokenTypes.RBRAC
        );
        this.expect(TokenTypes.RBRAC);
        value = result;
        break;
      default:
        value = this.parseBool((this.expect(TokenTypes.ATOM) as Token).value);
        break;
    }

    this.skipWhiteSpace();
    this.expect(TokenTypes.NEWLINE);
    this.nextLine();

    return (() => {
      const number = Number(value);
      return typeof value === "boolean"
        ? value
        : Number.isNaN(number)
          ? value
          : number;
    })();
  }

  private expect(type: TokenTypes, strict: boolean = true): Token | false {
    const token = this.seek();

    if (!token) {
      throw new SyntaxError(
        `Unexpected Token \nLine: ${this.lineNumber}. \nExpected: ${operatorMap(type)}`
      );
    }

    if (token.type === TokenTypes.COMMENT) {
      return this.expect(type, strict);
    }
    if (token.type !== type) {
      if (strict)
        throw new SyntaxError(
          `Unexpected Token \nLine: ${this.lineNumber} \nExpected: ${operatorMap(type)} \nGot: ${operatorMap(token.type) || token.value}`
        );
      return false;
    }
    return token;
  }

  private parsePrivatePairs() {
    this.expect(TokenTypes.PRIVATE_VARS);
    const { key, value } = this.parseExpression();
    return {
      key,
      value,
    };
  }

  parseVariables() {
    this.expect(TokenTypes.VARS);
    const token = this.expect(TokenTypes.ATOM) as Token;
    const variables = { ...this.variables, ...this.output };

    if (!(token.value in variables)) {
      throw new SyntaxError(
        `Variable is not defined on line ${this.lineNumber}`
      );
    }

    let variable = { key: token.value, value: variables[token.value] };
    if (this.peek().type === TokenTypes.DOT) {
      while (this.peek().type === TokenTypes.DOT) {
        this.expect(TokenTypes.DOT);
        if (typeof variable.value !== "object") {
          throw new SyntaxError(
            `${variable.value} is not a valid object. \nLine: ${this.lineNumber}`
          );
        }
        const objectToken = this.expect(TokenTypes.ATOM) as Token;

        const object = variable.value[objectToken.value];

        if (!object) {
          throw new SyntaxError(
            `Variable is not defined on line ${this.lineNumber}`
          );
        }

        variable = {
          key: objectToken.value,
          value: variable.value[objectToken.value],
        };
      }
    }
    this.skipWhiteSpace();
    return variable;
  }

  private parseExpression() {
    const { value: topLevelKey } = this.expect(TokenTypes.ATOM) as Token;
    if (this.peek().type === TokenTypes.DOT) {
      let temp = { ...this.output, ...this.variables };
      if (temp[topLevelKey] && typeof temp[topLevelKey] !== "object") {
        throw new SyntaxError(`${topLevelKey} is not an object`);
      }
      temp[topLevelKey] = {
        ...temp[topLevelKey],
      };
      let current = temp[topLevelKey];
      const precedingKeys = [topLevelKey];
      while (this.peek().type === TokenTypes.DOT) {
        this.expect(TokenTypes.DOT);
        const { value: key } = this.expect(TokenTypes.ATOM) as Token;
        precedingKeys.push(key);
        if (this.peek().type !== TokenTypes.DOT) {
          (current[key] as ReturnType<typeof this.getValue>) = this.getValue();
          return {
            key: topLevelKey,
            value: temp[topLevelKey],
          };
        }
        if (current[key] && typeof current[key] !== "object") {
          throw new SyntaxError(`${precedingKeys.join(".")} is not an object`);
        }
        current = current[key] = {
          ...current[key],
        };
      }
    }

    const value = this.getValue();

    return {
      key: topLevelKey,
      value,
    };
  }

  skipWhiteSpace() {
    if (this.peek().type === TokenTypes.WHITE_SPACE) {
      while (this.peek().type === TokenTypes.WHITE_SPACE) {
        this.expect(TokenTypes.WHITE_SPACE);
      }
    }
  }

  private isEOT() {
    return this.currentIndex > this.tokens.length - 1;
  }

  private parseBool(value: string) {
    return value === "true" ? true : value === "false" ? false : value;
  }

  getError() {
    return this.error;
  }

  private nextLine() {
    this.lineNumber++;
  }
}
