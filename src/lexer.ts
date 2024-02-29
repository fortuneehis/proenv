import operators from "./operators"
import Token, { TokenTypes } from "./token"


export default class Lexer {
    index: number = 0
    lastIndex: number = this.source.length - 1
    tokens: Token[] = []

    constructor(private source: string) {
        this.tokenize()
    } 

    peek() {
        return this.source[this.index]
    }
    
    seek() {
        return this.source[this.index++]
    }

    isEOF() {
        return this.index > this.lastIndex
    }

    tokenize() {

        while(!this.isEOF()) {
            const char = this.seek()
            if(this.isWhitespace(char)) continue
            let token: Token | undefined
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
                case "\n": 
                    token = new Token(TokenTypes.NEWLINE, char)
                    break
                default: 
                    const atom = this.readAtom()
                    token = new Token(TokenTypes.ATOM, atom)
            }

            this.tokens.push(token)

        }

        if(!this.isNewline(this.source[this.lastIndex])) {
            const autoNewLineToken = new Token(TokenTypes.NEWLINE, "\n")
            this.tokens.push(autoNewLineToken)
        }
    }

    isWhitespace(char: string) {
        return char === " "
    }

    isNewline(char: string) {
        return char === "\n"
    }

    readAtom() {
        this.index--
        let atom = ""

        while(!this.isEOF()) {
            const char = this.seek()

            if(this.isWhitespace(char) 
            || operators[char] !== undefined 
            || char === "\n") {

                this.index--
                break
            }

            atom += char
        }
        return atom
    }
}