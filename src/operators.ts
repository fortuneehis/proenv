import { TokenTypes } from "./token";

const operators: {[key: string]: TokenTypes} = {
    "=": TokenTypes.ASSIGN,
    "[": TokenTypes.LBRAC,
    "]": TokenTypes.RBRAC,
    ",": TokenTypes.SEPERATOR,
}

export default operators