# Contributing

## Setup

Clone the repository:
```
git clone <url>
```

Navigate to the cloned directory

Navigate to the React\powerbi-client-react workspace folder:
```
cd React\powerbi-client-react
```

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
By default the tests run using ChromeHeadless browser

The build and tests use webpack to compile all the source modules into bundled module that can be executed in the browser.

## Running the demo

```
npm run demo
```

Open the address to view in the browser:

http://localhost:8080/

## Flow Diagram for the PowerBIEmbed Component:
![Flow Diagram](/resources/react_wrapper_flow_diagram.png)
