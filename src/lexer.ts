import operators from "./operators"
import Token, { TokenTypes } from "./token"


export default class Lexer {
    private index: number = 0
    private lastIndex: number = this.source.length - 1
    tokens: Token[] = []

    constructor(private source: string) {
        this.tokenize()
    } 
    
    private seek() {
        return this.source[this.index++]
    }

    private peek() {
        return this.source[this.index]
    }

    private isEOF() {
        return this.index > this.lastIndex
    }

    private tokenize() {
        while(!this.isEOF()) {
            const char = this.seek()
            let token: Token | Token[] | undefined

            switch(char) {
                case "=": 
                    token = new Token(TokenTypes.ASSIGN, char)
                    break
                case "[":
                    token = new Token(TokenTypes.LBRAC, char)
                    break
                case "]": 
                    token = new Token(TokenTypes.RBRAC, char)
                    break
                case ">":
                    token = new Token(TokenTypes.PRIVATE_VARS, char)
                    break
                case "$": 
                    token = new Token(TokenTypes.VARS, char)
                    break
                case '"':
                    token = this.readString(char, (char)=> char === '"', TokenTypes.DOUBLE_QUOTES)
                    break
                case "'":
                    token = this.readString(char, (char)=> char === "'", TokenTypes.SINGLE_QUOTES)
                    break
                case ".":
                    token = new Token(TokenTypes.DOT, char)
                    break
                case " ":
                    token = new Token(TokenTypes.WHITE_SPACE, char)
                    break
                case "#":
                    const comment = this.readAtom((char)=> char === "\n")
                    token = new Token(TokenTypes.COMMENT, comment)
                    break
                case "\n": 
                    token = new Token(TokenTypes.NEWLINE, char)
                    break
                default: 
                    const atom = this.readAtom((char)=> this.isWhitespace(char) 
                    || operators[char] !== undefined 
                    || char === "\n")

                    token = new Token(TokenTypes.ATOM, atom)
            }

            this.tokens.push(...(Array.isArray(token) ? token  : [token]))

        }

        if(!this.isNewline(this.source[this.lastIndex])) {
            const autoNewLineToken = new Token(TokenTypes.NEWLINE, "\n")
            this.tokens.push(autoNewLineToken)
        }
    }

    readString(char: string, until: (char: string)=> boolean, quote: TokenTypes.SINGLE_QUOTES | TokenTypes.DOUBLE_QUOTES) {
        let token = []       
        const quotesStartToken = new Token(quote, char)
        this.seek()
        const string = this.readAtom(until)
        const stringToken = new Token(TokenTypes.MULTI_LINE_STRING, string)
        const nextChar = this.seek()
        token = [quotesStartToken, stringToken]
        if(nextChar === char) {
            const quotesEndToken = new Token(quote, nextChar)
            token.push(quotesEndToken)
        }
        return token
    }

    private isWhitespace(char: string) {
        return char === " "
    }

    private isNewline(char: string) {
        return char === "\n"
    }

    private readAtom(until: (char: string)=> boolean) {
        this.index--
        let atom = ""


        while(!this.isEOF()) {
            const char = this.seek()

            if(until(char)) {
                this.index--
                break
            }
            atom += char
        }
        return atom
    }
}