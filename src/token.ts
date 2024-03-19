export enum TokenTypes {
  NEWLINE = "NEWLINE",
  ASSIGN = "ASSIGN",
  LBRAC = "LBRAC",
  RBRAC = "RBRAC",
  SEPERATOR = "SEPERATOR",
  PRIVATE_VARS = "PRIVATE_VARS",
  MULTI_LINE_STRING = "MULTI_LINE_STRING",
  ATOM = "ATOM",
  DOT = "DOT",
  VARS = "VARS",
  COMMENT = "COMMENT",
  SINGLE_QUOTES = "SINGLE_QUOTES",
  DOUBLE_QUOTES = "DOUBLE_QUOTES",
  WHITE_SPACE = "WHITE_SPACE",
  EOF = "EOF",
}

export default class Token {
  constructor(
    public type: string,
    public value: string
  ) {}
}
