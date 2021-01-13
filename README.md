# powerbi-client-react
Power BI React component. This library lets you embed Power BI report, dashboard, dashboard tile, report visual, or Q&A in your React application.

## Quick Start

### Import

```jsx
import { PowerBIEmbed } from 'powerbi-client-react';
```

### Embed a Power BI report
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
		])
	}
		
	cssClassName = { "report-style-class" }

	getEmbeddedComponent = { (embeddedReport) => {
		this.report = embeddedReport as Report;
	}}
/>
```

### How to [bootstrap a PowerBI report](https://aka.ms/PbieBootstrap):
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
__Note__: To embed the report after bootstrap, update the props (with atleast accessToken).

### Demo

A React application that embeds a sample report using the _PowerBIEmbed_ component.<br/>
It demonstrates the complete flow from bootstrapping the report, to embedding and updating the embedded report.<br/>
It also demonstrates the usage of _powerbi report authoring_ library by deleting a visual from report on click of "Delete a Visual" button.

To run the demo on localhost, run the following commands:

```
npm run install:demo
npm run demo
```

Redirect to http://localhost:8080/ to view in the browser.

### Usage
|Use case|Details|
|:------|:------|
|Embed Power BI|To embed your powerbi artifact, pass the component with atleast _type_, _embedUrl_ and _accessToken_ in _embedConfig_ prop.|
|Get reference to the embedded object|Pass a callback method which accepts the embedded object as parameter to the _getEmbed_ of props.<br/>Refer to the _getEmbed_ prop in [Quick Start](#quick-start).|
|Apply style class|Pass the name(s) of style classes to be added to the embed container div to the _cssClassName_ props.|
|Set event handlers|Pass a map object of event name (string) and event handler (function) to the _eventHandlers_ prop. <br/>__Key__: Event name <br/>__Value__: Event handler method to be triggered<br/>Event handler method takes 2 optional params:<br/>First parameter: Event<br/>Second parameter: Reference to the embedded entity|
|Reset event handlers|To reset event handler for an event, set the event handler's value as `null` in the _eventHandlers_ map of props.|
|Set new accessToken|To set new accessToken in the same embedded powerbi artifact, pass the updated _accessToken_ in _embedConfig_ of props. <br/>Reload manually with report.reload() after providing new token if the current token in report has already expired<br/>Example scenario: _Current token has expired_.|
|Update settings (Report type only)|To update the report settings, update the _embedConfig.settings_ property of props.<br/>Refer to the _embedConfig.settings_ prop in [Quick Start](#quick-start).<br/>__Note__: Update the settings only by updating embedConfig prop|
|Bootstrap Power BI|To [bootstrap your powerbi entity](https://aka.ms/PbieBootstrap), pass the props to the component without _accessToken_ in _embedConfig_.<br/>__Note__: _embedConfig_ of props should atleast contain __type__ of the powerbi entity being embedded. <br/>Available types: "report", "dashboard", "tile", "visual" and "qna".<br/>Refer to _How to bootstrap a report_ section in [Quick Start](#quick-start).|
|Using with PowerBI Report Authoring|1. Install [powerbi-report-authoring](https://www.npmjs.com/package/powerbi-report-authoring) as npm dependency.<br>2. Use the report authoring APIs using the embedded report's instance|
|Phased embedding (Report type only)|Set phasedEmbedding prop's value as `true` <br/> Refer to [Phased embedding docs](https://github.com/microsoft/PowerBI-JavaScript/wiki/Phased-Embedding).|
|Apply Filters (Report type only)|1. To apply updated filters, update filters in _embedConfig_ props.<br/>2. To remove the applied filters, update the _embedConfig_ prop with the filters removed or set as undefined/null.|
|Set Page (Report type only)|To set a page when embedding a report or on an embedded report, provide pageName field in the _embedConfig_. 

__Note__: To use this library in IE browser, use [react-app-polyfill](https://www.npmjs.com/package/react-app-polyfill) to add support for the incompatible features. Refer to the imports of [demo/index.tsx](https://github.com/microsoft/powerbi-client-react/blob/master/demo/index.tsx).


### Props interface

```ts
interface EmbedProps {

	// Configuration for embedding the PowerBI entity (required)
	embedConfig:
		| IReportEmbedConfiguration
		| IDashboardEmbedConfiguration
		| ITileEmbedConfiguration
		| IQnaEmbedConfiguration
		| IVisualEmbedConfiguration
		| IEmbedConfiguration

	// Callback method to get the embedded PowerBI entity object (optional)
	getEmbed?: { (embeddedComponent: Embed): void }

	// Map of pair of event name and its handler method to be triggered on the event (optional)
	eventHandlers?: Map<string, EventHandler>

	// CSS class to be set on the embedding container (optional)
	cssClassName?: string

	// Phased embedding flag (optional)
	phasedEmbedding?: boolean;

	// Provide instance of PowerBI service (optional)
	service?: service.Service
}

type EventHandler = {
	(event?: service.ICustomEvent<any>, embeddedEntity?: Embed): void | null;
};
```

### Dependencies

[powerbi-client](https://www.npmjs.com/package/powerbi-client)

### Peer dependencies

[react](https://www.npmjs.com/package/react)

### Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments