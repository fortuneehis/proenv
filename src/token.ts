
export enum TokenTypes {
    NEWLINE = "NEWLINE",
    ASSIGN  = "ASSIGN",
    LBRAC = "LBRAC",
    RBRAC = "RBRAC",
    SEPERATOR = "SEPERATOR",
    PRIVATE_VARS = "PRIVATE_VARS",
    ATOM = "ATOM",
    VAR = "VAR",
    COMMENT = "COMMENT",
    EOF = "EOF"
}


export default class Token {
    constructor(
        public type: string, 
        public value: string, 
        ) {

    }
}