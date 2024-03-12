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
            if(options?.debug) console.error((err as Error).message)
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

            if(!init) {
                if(this.peek().type === TokenTypes.DOT) {
                    this.expect(TokenTypes.DOT)
                    this.expect(TokenTypes.DOT)
                    this.expect(TokenTypes.DOT)
                    const {key, value}= this.parseVariables()

                    if(typeof value !== "object") {
                        throw new Error(`${key} is not an object`)
                    }
                    result = {
                        ...result,
                       ...value
                    }
                    continue
                }
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
                const {value} = this.parseVariables()
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
            Expected ${type}.
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
            throw new Error(`Variable is not defined on line ${this.lineNumber}`)
        }
        
        let variable = {key: token.value, value: variables[token.value]}
        if(this.peek().type === TokenTypes.DOT) { 
            while(this.peek().type === TokenTypes.DOT) {
                this.expect(TokenTypes.DOT)
                if(typeof variable.value !== "object") {
                    throw new Error(`[Parse Error]
                    ${variable.value} is not a valid object.
                    Line: ${this.lineNumber}`)
                }
                const objectToken = this.expect(TokenTypes.ATOM) as Token

                const object = variable.value[objectToken.value] 

                if(!object) {
                    throw new Error(`Variable is not defined on line ${this.lineNumber}`)
                }

                variable = {
                    key: objectToken.value,
                    value: variable.value[objectToken.value]
                }
            }
        }
        this.skipWhiteSpace()
        return variable
    }

    private parseExpression() {
        const key = this.expect(TokenTypes.ATOM) as Token
        this.expect(TokenTypes.ASSIGN)
        const value = this.getValue()
        this.skipWhiteSpace()
        this.expect(TokenTypes.NEWLINE)
        this.nextLine()

        return {
            key: key.value,
            value: typeof value === "string" ? value : (value && value.value ? value.value : value)
        }
    }

    skipWhiteSpace() {
        if(this.peek().type === TokenTypes.WHITE_SPACE) {
        
            while(this.peek().type === TokenTypes.WHITE_SPACE) {
                this.expect(TokenTypes.WHITE_SPACE)
            }
        }
    }

    
    private isEOT() {
        return this.currentIndex > this.tokens.length - 1
    }

    private nextLine() {
        this.lineNumber++
    }
}

