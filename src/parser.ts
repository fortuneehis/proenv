import Token, { TokenTypes } from "./token";

export type ParserOptions = {
    keysToLowercase: boolean
    debug: boolean
}

export default class Parser {
    private currentIndex: number = 0
    
    private lineNumber: number = 1

    private variables: { [key: string]: any } = {}

    output: { [key: string]: any } = {
        ...process.env
    }

    private options: ParserOptions = {
        keysToLowercase: false,
        debug: false
    }

    constructor(private tokens: Token[], options?: ParserOptions) {
        if(options) {
            this.options = {
                ...this.options,
                ...options
            }    
        }

        try {
            this.output = {
                ...(this.parse(true))
            }
        } catch(err) {
            if(options?.debug) console.log((err as Error).message)
        } 
    }

    private parse(init: boolean, runUntil?: ()=> boolean) {
        
        let result: {[key: string]: unknown} = {}
        let parsingPrivatePairs = init

        while(!this.isEOT()) {
            const token = this.peek()
            if(token.type === TokenTypes.NEWLINE) {
                this.nextLine()
                this.currentIndex++
                continue
            }

            if(token.type === TokenTypes.WHITE_SPACE) {
                this.currentIndex++
                continue
            }

            if(token.type === TokenTypes.COMMENT) {
                this.currentIndex++
                continue
            }

            if(parsingPrivatePairs && token.type === TokenTypes.PRIVATE_VARS) {
                const {key, value} = this.parsePrivatePairs()
                
                this.variables = {
                    ...this.variables,
                    [key]: value
                }
                continue
            } 
            

            if(this.peek().type === TokenTypes.PRIVATE_VARS) {
                throw new Error("Private key-value pairs should be declared before the public key-value pairs")
            }

            if(runUntil?.()) break
            const {key, value} = this.parseExpression()
            
            parsingPrivatePairs = false

            this.variables = {
                ...this.variables,
                [key]: value
            }

        
            result = {
                ...result,
                ...this.addToMap(key, value) 
            }

        }
        return result
    }

    private peek() {
        return this.tokens[this.currentIndex]
    }

    private seek() {
        return this.tokens[this.currentIndex++]
    }


    private getValue(): Token | {[key: string]: any} | string | undefined {
        const token = this.peek()


        switch(token.type) {
            case TokenTypes.NEWLINE:
            case TokenTypes.COMMENT:
                return undefined
            
            case TokenTypes.DOUBLE_QUOTES:
                this.expect(TokenTypes.DOUBLE_QUOTES)
                const doubleQuotesString = this.expect(TokenTypes.MULTI_LINE_STRING)
                this.expect(TokenTypes.DOUBLE_QUOTES)
                return doubleQuotesString as Token

            case TokenTypes.SINGLE_QUOTES:
                this.expect(TokenTypes.SINGLE_QUOTES)
                const singleQuotesString = this.expect(TokenTypes.MULTI_LINE_STRING)
                this.expect(TokenTypes.SINGLE_QUOTES)
                return singleQuotesString as Token
            
            case TokenTypes.VARS:
                const value = this.parseVariables()
                return value as Token

            case TokenTypes.LBRAC:
                this.seek()
                const result = this.parse(false, ()=> this.peek().type === TokenTypes.RBRAC)
                this.expect(TokenTypes.RBRAC)
                return result
        }

        const value = this.expect(TokenTypes.ATOM) as Token
        return value
    }

    private expect(type: TokenTypes, strict: boolean = true): Token | false {
        const token = this.seek()

        if(!token) {
            throw new Error(`[Parse Error] 
            Unexpected Token
            Line ${this.lineNumber}.
            Expected: ${type}`)
        }

        if(token.type === TokenTypes.COMMENT) {
            return this.expect(type, strict)
        }
        if(token.type !== type) {
            if(strict) throw new Error(`[Parse Error] 
            Unexpected Token
            Line ${this.lineNumber}.
            Got: ${token.value}`)
            return false
        }
        return token
    }

    private addToMap(key: string, value: unknown) {
        const  {keysToLowercase} = this.options
        return {
            [keysToLowercase ? key.toLowerCase() : key]: value
        }
    }

    private parsePrivatePairs() {
        this.expect(TokenTypes.PRIVATE_VARS)
        const {key, value} = this.parseExpression()
        return {
            key,
            value
        }
    }

    parseVariables() {
        this.expect(TokenTypes.VARS)
        const token = this.expect(TokenTypes.ATOM) as Token
        const variables = {...this.variables, ...this.output}
        
        if(!(token.value in variables)) {
            console.log(token.value, " value")
            throw new Error(`Variable is not defined on line ${this.lineNumber}`)
        }
        let variable = variables[token.value]
        if(this.peek().type === TokenTypes.DOT) { 

            while(this.peek().type !== TokenTypes.NEWLINE) {
                this.expect(TokenTypes.DOT)
                if(typeof variable !== "object") {
                    throw new Error(`[Parse Error]
                    ${variable} is not a valid object.
                    Line: ${this.lineNumber}`)
                }
                const childToken = this.expect(TokenTypes.ATOM) as Token
                variable = variable[childToken.value]
                
            }
        }
        
        this.expect(TokenTypes.NEWLINE)
        this.nextLine()
        return variable
    }

    private parseExpression() {
        const key = this.expect(TokenTypes.ATOM) as Token
        //if(!/^[a-zA-Z_-]+$/ig.test(key.value)) throw new Error(`Keys should on contain alphabets at line ${this.lineNumber}`) 
        this.expect(TokenTypes.ASSIGN)
        const value = this.getValue()
        this.expect(TokenTypes.NEWLINE)
        this.nextLine()

        return {
            key: key.value,
            value: typeof value === "string" ? value : (value && value.value ? value.value : value)
        }
    }

    
    private isEOT() {
        return this.currentIndex > this.tokens.length - 1
    }

    private nextLine() {
        this.lineNumber++
    }
}

