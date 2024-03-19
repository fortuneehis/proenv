import Token, { TokenTypes } from "./token";

export const delimOperators: { [key: string]: TokenTypes } = {
  "=": TokenTypes.ASSIGN,
  "[": TokenTypes.LBRAC,
  "]": TokenTypes.RBRAC,
  "#": TokenTypes.COMMENT,
  "'": TokenTypes.SINGLE_QUOTES,
  ".": TokenTypes.DOT,
  '"': TokenTypes.DOUBLE_QUOTES,
};

export const operatorMap = (type: TokenTypes | string) => {
  switch (type) {
    case TokenTypes.ASSIGN:
      return "=";
    case TokenTypes.LBRAC:
      return "[";
    case TokenTypes.RBRAC:
      return "]";
    case TokenTypes.WHITE_SPACE:
      return "whitespace";
    case TokenTypes.NEWLINE:
      return "\\n";
    case TokenTypes.COMMENT:
      return "#";
    case TokenTypes.DOUBLE_QUOTES:
      return '"';
    case TokenTypes.VARS:
      return "$";
    case TokenTypes.PRIVATE_VARS:
      return ">";
    case TokenTypes.DOT:
      return ".";
    case TokenTypes.SINGLE_QUOTES:
      return "'";
    default:
      return `unexpected token of type (${type})`;
  }
};
