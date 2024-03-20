# superenv [![NPM version](https://img.shields.io/npm/v/dotenv.svg?style=flat-square)](https://www.npmjs.com/package/dotenv)

Dotenv stands as a self-reliant module designed to seamlessly load environment variables from a .env file into into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env).
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![LICENSE](https://img.shields.io/github/license/motdotla/dotenv.svg)](LICENSE)

## 🌱 Installation

```bash
# installing with npm
npm install superenv --save
```

```bash
# installing with yarn
yarn add superenv
```

## Usage Guide

Create a `.env` file in the root of your project.

```dosini
PORT=3000
```

Import and configure superenv in your application:

```javascript
const config = require("dotenv");
console.log(process.env);
```

Using ES6:

```javascript
import config from "superenv";
config();
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

### Comments

Comments can be added to your file either on separate lines or inline:

```dosini
# Seperate Comment
SOME_KEY=SOME_VALUE # Inline comment
```

### Variable Expansion

You need to add the value of another variable in one of your variables? Use [dotenv-expand](https://github.com/motdotla/dotenv-expand).

## `config()`

The `config` function accepts will read your `.env` file if a path to the env file(s) is not specified, parse the contents, assign it to
`process.env` else an error will be returned.

```js
const error = config();

if (error) {
  throw result.error;
}
```

`config()` takes two arguments:

##### paths

`config()` by default uses the `.env` file in the root of your application.

Custom paths can be specified if your files containing environment varibales resides elsewhere in your application.

```js
const config = require("superenv");

config([".env", ".env.development", "/app/elsewhere/.env"]);
```

They will be parsed in order and combined with `process.env`.

##### options

###### keyToLowercase

Default: `false`

If set to true, tranforms the parsed keys of your env file(s) to lowercase.

```js
const config = require("superenv");

config(undefined, {
  keysToLowercase: true,
});
```

##### processEnv

Default: `process.env`

Specify an object to write your secrets to. Defaults to `process.env` environment variables.

```js
const myObject = {};
require("dotenv").config({ processEnv: myObject });

console.log(myObject); // values from .env or .env.vault live here now.
console.log(process.env); // this was not changed or written to
```

##### DOTENV_KEY

Default: `process.env.DOTENV_KEY`

Pass the `DOTENV_KEY` directly to config options. Defaults to looking for `process.env.DOTENV_KEY` environment variable. Note this only applies to decrypting `.env.vault` files. If passed as null or undefined, or not passed at all, dotenv falls back to its traditional job of parsing a `.env` file.

```js
require("dotenv").config({
  DOTENV_KEY:
    "dotenv://:key_1234…@dotenvx.com/vault/.env.vault?environment=production",
});
```

### Parse

The engine which parses the contents of your file containing environment
variables is available to use. It accepts a String or Buffer and will return
an Object with the parsed keys and values.

```js
const dotenv = require("dotenv");
const buf = Buffer.from("BASIC=basic");
const config = dotenv.parse(buf); // will return an object
console.log(typeof config, config); // object { BASIC : 'basic' }
```

#### Options

##### debug

Default: `false`

Turn on logging to help debug why certain keys or values are not being set as you expect.

```js
const dotenv = require("dotenv");
const buf = Buffer.from("hello world");
const opt = { debug: true };
const config = dotenv.parse(buf, opt);
// expect a debug message because the buffer is not in KEY=VAL form
```

### Populate

The engine which populates the contents of your .env file to `process.env` is available for use. It accepts a target, a source, and options. This is useful for power users who want to supply their own objects.

For example, customizing the source:

```js
const dotenv = require("dotenv");
const parsed = { HELLO: "world" };

dotenv.populate(process.env, parsed);

console.log(process.env.HELLO); // world
```

For example, customizing the source AND target:

```js
const dotenv = require("dotenv");
const parsed = { HELLO: "universe" };
const target = { HELLO: "world" }; // empty object

dotenv.populate(target, parsed, { override: true, debug: true });

console.log(target); // { HELLO: 'universe' }
```

#### options

##### Debug

Default: `false`

Turn on logging to help debug why certain keys or values are not being populated as you expect.

##### override

Default: `false`

Override any environment variables that have already been set.

### Decrypt

The engine which decrypts the ciphertext contents of your .env.vault file is available for use. It accepts a ciphertext and a decryption key. It uses AES-256-GCM encryption.

For example, decrypting a simple ciphertext:

```js
const dotenv = require("dotenv");
const ciphertext =
  "s7NYXa809k/bVSPwIAmJhPJmEGTtU0hG58hOZy7I0ix6y5HP8LsHBsZCYC/gw5DDFy5DgOcyd18R";
const decryptionKey =
  "ddcaa26504cd70a6fef9801901c3981538563a1767c297cb8416e8a38c62fe00";

const decrypted = dotenv.decrypt(ciphertext, decryptionKey);

console.log(decrypted); // # development@v6\nALPHA="zeta"
```

## ❓ FAQ

### Why is the `.env` file not loading my environment variables successfully?

Most likely your `.env` file is not in the correct place. [See this stack overflow](https://stackoverflow.com/questions/42335016/dotenv-file-is-not-loading-environment-variables).

Turn on debug mode and try again..

```js
require("dotenv").config({ debug: true });
```

You will receive a helpful error outputted to your console.

### Should I commit my `.env` file?

No. We **strongly** recommend against committing your `.env` file to version
control. It should only include environment-specific values such as database
passwords or API keys. Your production database should have a different
password than your development database.

### Should I have multiple `.env` files?

We recommend creating on `.env` file per environment. Use `.env` for local/development, `.env.production` for production and so on. This still follows the twelve factor principles as each is attributed individually to its own environment. Avoid custom set ups that work in inheritance somehow (`.env.production` inherits values form `.env` for example). It is better to duplicate values if necessary across each `.env.environment` file.

> In a twelve-factor app, env vars are granular controls, each fully orthogonal to other env vars. They are never grouped together as “environments”, but instead are independently managed for each deploy. This is a model that scales up smoothly as the app naturally expands into more deploys over its lifetime.
>
> – [The Twelve-Factor App](http://12factor.net/config)

### What rules does the parsing engine follow?

The parsing engine currently supports the following rules:

- `BASIC=basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- lines beginning with `#` are treated as comments
- `#` marks the beginning of a comment (unless when the value is wrapped in quotes)
- empty values become empty strings (`EMPTY=` becomes `{EMPTY: ''}`)
- inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)
- whitespace is removed from both ends of unquoted values (see more on [`trim`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)) (`FOO=  some value  ` becomes `{FOO: 'some value'}`)
- single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- single and double quoted values maintain whitespace from both ends (`FOO="  some value  "` becomes `{FOO: '  some value  '}`)
- double quoted values expand new lines (`MULTILINE="new\nline"` becomes

```
{MULTILINE: 'new
line'}
```

- backticks are supported (`` BACKTICK_KEY=`This has 'single' and "double" quotes inside of it.` ``)

### What happens to environment variables that were already set?

By default, we will never modify any environment variables that have already been set. In particular, if there is a variable in your `.env` file which collides with one that already exists in your environment, then that variable will be skipped.

If instead, you want to override `process.env` use the `override` option.

```javascript
require("dotenv").config({ override: true });
```

### How come my environment variables are not showing up for React?

Your React code is run in Webpack, where the `fs` module or even the `process` global itself are not accessible out-of-the-box. `process.env` can only be injected through Webpack configuration.

If you are using [`react-scripts`](https://www.npmjs.com/package/react-scripts), which is distributed through [`create-react-app`](https://create-react-app.dev/), it has dotenv built in but with a quirk. Preface your environment variables with `REACT_APP_`. See [this stack overflow](https://stackoverflow.com/questions/42182577/is-it-possible-to-use-dotenv-in-a-react-project) for more details.

If you are using other frameworks (e.g. Next.js, Gatsby...), you need to consult their documentation for how to inject environment variables into the client.

### Can I customize/write plugins for dotenv?

Yes! `dotenv.config()` returns an object representing the parsed `.env` file. This gives you everything you need to continue setting values on `process.env`. For example:

```js
const dotenv = require("dotenv");
const variableExpansion = require("dotenv-expand");
const myEnv = dotenv.config();
variableExpansion(myEnv);
```

### How do I use dotenv with `import`?

Simply..

```javascript
// index.mjs (ESM)
import "dotenv/config"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
```

A little background..

> When you run a module containing an `import` declaration, the modules it imports are loaded first, then each module body is executed in a depth-first traversal of the dependency graph, avoiding cycles by skipping anything already executed.
>
> – [ES6 In Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)

What does this mean in plain language? It means you would think the following would work but it won't.

`errorReporter.mjs`:

```js
import { Client } from "best-error-reporting-service";

export default new Client(process.env.API_KEY);
```

`index.mjs`:

```js
// Note: this is INCORRECT and will not work
import * as dotenv from "dotenv";
dotenv.config();

import errorReporter from "./errorReporter.mjs";
errorReporter.report(new Error("documented example"));
```

`process.env.API_KEY` will be blank.

Instead, `index.mjs` should be written as..

```js
import "dotenv/config";

import errorReporter from "./errorReporter.mjs";
errorReporter.report(new Error("documented example"));
```

Does that make sense? It's a bit unintuitive, but it is how importing of ES6 modules work. Here is a [working example of this pitfall](https://github.com/dotenv-org/examples/tree/master/usage/dotenv-es6-import-pitfall).

There are two alternatives to this approach:

1. Preload dotenv: `node --require dotenv/config index.js` (_Note: you do not need to `import` dotenv with this approach_)
2. Create a separate file that will execute `config` first as outlined in [this comment on #133](https://github.com/motdotla/dotenv/issues/133#issuecomment-255298822)

### Why am I getting the error `Module not found: Error: Can't resolve 'crypto|os|path'`?

You are using dotenv on the front-end and have not included a polyfill. Webpack < 5 used to include these for you. Do the following:

```bash
npm install node-polyfill-webpack-plugin
```

Configure your `webpack.config.js` to something like the following.

```js
require("dotenv").config();

const path = require("path");
const webpack = require("webpack");

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        HELLO: JSON.stringify(process.env.HELLO),
      },
    }),
  ],
};
```

Alternatively, just use [dotenv-webpack](https://github.com/mrsteele/dotenv-webpack) which does this and more behind the scenes for you.

### What about variable expansion?

Try [dotenv-expand](https://github.com/motdotla/dotenv-expand)

### What about syncing and securing .env files?

Use [dotenv-vault](https://github.com/dotenv-org/dotenv-vault)

### What is a `.env.vault` file?

A `.env.vault` file is an encrypted version of your development (and ci, staging, production, etc) environment variables. It is paired with a `DOTENV_KEY` to deploy your secrets more securely than scattering them across multiple platforms and tools. Use [dotenv-vault](https://github.com/dotenv-org/dotenv-vault) to manage and generate them.

### What if I accidentally commit my `.env` file to code?

Remove it, [remove git history](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) and then install the [git pre-commit hook](https://github.com/dotenvx/dotenvx#pre-commit) to prevent this from ever happening again.

```
brew install dotenvx/brew/dotenvx
dotenvx precommit --install
```

### How can I prevent committing my `.env` file to a Docker build?

Use the [docker prebuild hook](https://dotenvx.com/docs/features/prebuild).

```bash
# Dockerfile
...
RUN curl -fsS https://dotenvx.sh/ | sh
...
RUN dotenvx prebuild
CMD ["dotenvx", "run", "--", "node", "index.js"]
```

## Contributing Guide

See [CONTRIBUTING.md](CONTRIBUTING.md)

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md)

## Who's using dotenv?

[These npm modules depend on it.](https://www.npmjs.com/browse/depended/dotenv)

Projects that expand it often use the [keyword "dotenv" on npm](https://www.npmjs.com/search?q=keywords:dotenv).
