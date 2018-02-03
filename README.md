# Description

Zero-configuration broadcast in electron

## Installation

```bash
yarn add electron-zero-broadcast
```

For developers,

```bash
git clone https://github.com/gwangyi/electron-zero-broadcast
cd electron-zero-broadcast
yarn
yarn build
```

## Example

The only object which is exported is an instance of EventEmitter.
It can listen and emit any event as same as EventEmitter, except the event can be listened in all processes (main, renderer, and renderer on other window) in same electron application.

```js
import broadcast from 'electron-zero-broadcast'

broadcast.on("message", msg => console.log(msg))
broadcast.emit("message", "Hello, world!")
```