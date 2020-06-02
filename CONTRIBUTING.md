# Contributing

## Setup

Clone the repository:
```
git clone <url>
```

Navigate to the cloned directory

Install local dependencies:
```
npm install
```

## Build:
```
npm run build
```
Or if using VScode: `Ctrl + Shift + B`

## Test
```
npm test
```
By default the tests run using Chrome

The build and tests use webpack to compile all the source modules into one bundled module that can be executed in the browser.

## Running the demo

If you want to embed any powerbi artifact in demo, set the `embedUrl` and `accessToken` in the [config file](demo\config.ts) for that artifact type.

Serve the demo:
```
npm run demo
```

Open the address to view in the browser:

http://localhost:8080/
