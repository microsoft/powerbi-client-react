# powerbi-client-react
A React wrapper library for embedding PowerBI artifacts.

## Table of contents

<!--ts-->
* [Sample Usage](#sample-usage)
* [Run Demo](#run-demo)
* [Docs](#docs)
	* Props interface
	* PowerBI Embed
	* Get reference to embedded object
	* How to set new accessToken
	* Set event handlers
	* Reset event handlers
	* Apply style class
	* Update settings (Report only)
	* PowerBI Bootstrap
* [Flow diagram](#flow-diagram-for-the-wrapper-component)
* [Dependencies](#dependencies)
<!--te-->

## Sample Usage

How to import:

```jsx
import { PowerBIEmbed } from 'powerbi-client-react';
```

How to bootstrap a PowerBI report:
```jsx
<PowerBIEmbed
	embedConfig = {{
		type: 'report',   // Supported types: report, dashboard, tile, visual and qna
		id: undefined, 
		embedUrl: undefined,
		accessToken: undefined,    // Keep as empty string, null or undefined
		tokenType: models.TokenType.Embed
	}}
/>
```

How to embed a PowerBI report:
```jsx
<PowerBIEmbed
	embedConfig = {{
		type: 'report',   // Supported types: report, dashboard, tile, visual and qna
		id: '<Report Id>',
		embedUrl: '<Embed Url>',
		accessToken: '<Access Token>',
		tokenType: models.TokenType.Embed,
		settings: {
			panes: {
				filters: {
					expanded: false,
					visible: false
				}
			},
			background: models.BackgroundType.Transparent,
		}
	}}

	eventHandlers = { 
		new Map([
			['loaded', function () {console.log('Report loaded');}],
			['rendered', function () {console.log('Report rendered');}],
			['error', function (event) {console.log(event.detail);}]
		])}
		
	cssClassName = { "report-style-class" }

	getEmbed = { (embeddedReport) => {
		this.report = embeddedReport as Report;
	}}
/>
```

## Run Demo

To run the demo on localhost, run the following commands:

```
npm install
npm run install:demo
npm run demo
```

Redirect to http://localhost:8080/ to view in the browser.

## Docs
|Topic|Details|
|:------|:------|
|PowerBI Embed|To embed your powerbi artifact, pass the component with atleast _type_, _embedUrl_ and _accessToken_ in _embedConfig_ prop.|
|Get reference to embedded object|Pass a callback method which accepts the embedded object as parameter to the _getEmbed_ of props.<br/>Refer to the _getEmbed_ prop in [Sample Usage](#sample-usage).|
|Apply style class|Pass the name(s) of classes to be set as "classname" for the embed container div via _className_ of props.|
|Set event handlers|Pass a map object of event name (string) and event handler (function) to the _eventHandlers_ of props. <br/>Key: Event name <br/>Value: Method to be triggered|
|Reset event handlers|To reset event handler for an event, set the event handler's value as `null` in the _eventHandlers_ map of props.|
|How to set new accessToken|To set new accessToken in the same embedded powerbi artifact, pass the updated _accessToken_ in _embedConfig_ of props.<br/>Example scenario: _Current token has expired_.|
|Update settings (Report type only)|To update the report settings, update the _embedConfig.settings_ property of props.<br/>Refer to the _embedConfig.settings_ prop in [Sample Usage](#sample-usage).|
|PowerBI Bootstrap|To [bootstrap your powerbi entity](https://github.com/microsoft/PowerBI-JavaScript/wiki/Bootstrap-For-Better-Performance), call the component without _accessToken_ in _embedConfig_ of props.<br/>__Note__: _embedConfig_ of props should atleast contain __type__ of the powerbi artifact being embedded. <br/>Eg: "report", "dashboard", "tile", "visual" or "qna".<br/>Refer How to bootstrap a report section in [Sample Usage](#sample-usage).|

### Props interface:

```ts
interface EmbedProps {

	// Configuration for embedding the PowerBI entity
	embedConfig: IEmbedConfiguration | IQnaEmbedConfiguration

	// Callback method to get the embedded PowerBI entity object (Optional)
	getEmbed?: { (embeddedComponent: Embed): void }

	// Map of pair of event name and its handler method to be triggered on the event (Optional)
	eventHandlers?: Map<string, service.IEventHandler<any> | null>

	// CSS class to be set on the embedding container (Optional)
	cssClassName?: string

	// Provide a custom implementation of PowerBI service (Optional)
	service?: service.Service
}
```

### Flow Diagram for the Wrapper Component:
![Flow Diagram](./resources/react_wrapper_flow_diagram.png)

## Dependencies

1.  powerbi-client

## Peer-Dependencies

1.  react
