```

ts-node-dev - It automatically restarts the Node.js server whenever we change the code.

Why use it?
Tool	    Purpose
typescript	Converts TypeScript → JavaScript
ts-node	    Runs TypeScript directly
ts-node-dev	Runs TypeScript + automatically restarts on changes
nodemon	    Automatically restarts Node.js apps

For a Node.js + Express + TypeScript backend, ts-node-dev is convenient during development.

Note: ts-node-dev is a development tool. For production, you would generally compile TypeScript with tsc and run the generated JavaScript with Node.js.


// "dev": "ts-node-dev --files src/index.ts",
// "build": "tsc && cp ./package.json ./dist",
// "start": " node dist/index.js"


```