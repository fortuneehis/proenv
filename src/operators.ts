import { TokenTypes } from "./token";

const operators: {[key: string]: TokenTypes} = {
    "=": TokenTypes.ASSIGN,
    "[": TokenTypes.LBRAC,
    "]": TokenTypes.RBRAC,
    "#": TokenTypes.COMMENT,
    "'": TokenTypes.SINGLE_QUOTES,
    ".": TokenTypes.DOT,
    '"': TokenTypes.DOUBLE_QUOTES,
}

export default operators