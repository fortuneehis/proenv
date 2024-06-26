# proenv

proenv is a dependency free package like [`dotenv`](https://www.npmjs.com/package/dotenv) but with extra features.

## Installation

```bash
# installing with npm
npm install proenv --save
```

```bash
# installing with yarn
yarn add proenv
```

## Usage Guide

Create a `.env` file in the root of your project.

```dosini
PORT=3000
```

Import and configure proenv in your application:

```javascript
const { config } = require("proenv");

config();
console.log(process.env);
```

Using ES6:

```javascript
import { config } from "proenv";

config();
console.log(process.env);
```

That's it. `process.env` now has the keys and values you defined in your `.env` file:
All key-value pairs defined in your `.env` should be available in your `process.env`

## Features

- Declaring Private key-value pairs
- Key-value pairs reuse
- Declaring values as objects
- Object spreading with the `...` syntax
- Comments
- Multiline Values

### Declaring Private key-value pairs

Unlike the normal key-value pairs, private key-value pairs prefixed with the `>` syntax can only be declared at the top of the `.env` file and will not be loaded into `process.env`.

```dosini
>PRIVATE_KEY=PRIVATE_VALUE

SOME_KEY=SOME_VALUE
```

### Key-value pairs reuse

Key-value pairs can also be reused as values if prefixed with the `$` syntax.

```dosini
SOME_KEY=VALUE
ANOTHER_KEY=$SOME_KEY
```

### Declaring values as objects.

Values can be declared as objects and will be loaded as objects into `process.env`.

```dosini
DB=[
    USERNAME=root
    PASSWORD=
    HOST=localhost
    PORT=3306
]
```

Alternatively,

```dosini
DB=[
    CURRENCIES=[
      NAIRA=[
        CODE=NGN
      ]
    ]
]
```

can be written as:

```dosini
DB.CURRENCIES.NAIRA.CODE=NGN
```

```js
const { config } = require("proenv");

config(undefined);

console.log(process.env); // { DB: { USERNAME: "root", PASSWORD: undefined, HOST: "localhost", PORT: "3306" }}
```

### Object spreading with the `...` syntax

If the value is declared as an object, it can also be spread into another object with the spread syntax `...`

```dosini
DB=[
    USERNAME=root
    PASSWORD=
    HOST=localhost
    PORT=3306
]

DB_DEV=[
    ...$DB
    LOG=true
]
```

### Comments

Comments can be added to your file either on separate lines or inline:

```dosini
# Seperate Comment
SOME_KEY=SOME_VALUE # Inline comment
```

### Multiline Values

Values can also be multiline using single or double quotes.

```dosini
SINGLE_QUOTES_MULTILINE='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

DOUBLE_QUOTES_MULTILINE="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
```

## `config()`

The `config` function accepts will read your `.env` file if a path to the env file(s) is not specified, parse the contents, assign it to
`process.env` else an error will be returned.

```js
const error = config();

if (error) {
  throw new Error(error);
}
```

`config()` takes two arguments:

##### paths

`config()` by default uses the `.env` file in the root of your application.

Custom paths can be specified if your files containing environment varibales resides elsewhere in your application.

```js
const { config } = require("proenv");

config([".env", ".env.development", "/app/elsewhere/.env"]);
```

They will be parsed in order and combined with `process.env`.
