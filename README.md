# powerbi-client-react
Power BI React component. This library enables you to embed Power BI reports, dashboards, dashboard tiles, report visuals, Q&A or paginated reports in your React application, and to create new Power BI reports directly in your application.

## Quick Start

### Import

```jsx
import { PowerBIEmbed } from 'powerbi-client-react';
```

### Embed a Power BI report
```jsx
<PowerBIEmbed
	embedConfig = {{
		type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
		id: '<Report Id>',
		embedUrl: '<Embed Url>',
		accessToken: '<Access Token>',
		tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
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
			['error', function (event) {console.log(event.detail);}],
			['visualClicked', () => console.log('visual clicked')],
			['pageChanged', (event) => console.log(event)],
		])
	}

	cssClassName = { "reportClass" }

	getEmbeddedComponent = { (embeddedReport) => {
		this.report = embeddedReport as Report;
	}}
/>
```

### How to [bootstrap a PowerBI report](https://learn.microsoft.com/javascript/api/overview/powerbi/bootstrap-better-performance):
```jsx
<PowerBIEmbed
	embedConfig = {{
		type: 'report',   // Supported types: report, dashboard, tile, visual, qna and paginated report
		id: undefined,
		embedUrl: undefined,
		accessToken: undefined,    // Keep as empty string, null or undefined
		tokenType: models.TokenType.Embed
	}}
/>
```
__Note__: To embed the report after bootstrap, update the props (with at least accessToken).

### Demo

This demo includes a React application that demonstrates the complete flow of embedding a sample report using the PowerBIEmbed component.

The demo shows how to bootstrap the report, embed it, and update it. Additionally, the demo showcases the usage of the powerbi report authoring library by enabling the user to change the type of visual from a report using the "Change visual type" button.

The demo also sets a "DataSelected" event, which allows the user to interact with the embedded report and retrieve information about the selected data.

To run the demo on localhost, run the following commands:

```
npm run demo
```

Redirect to http://localhost:8080/ to view in the browser.

### Usage
|Use case|Details|
|:------|:------|
|Embed Power BI|To embed your powerbi artifact, pass the component with at least _type_, _embedUrl_ and _accessToken_ in _embedConfig_ prop.|
|Get reference to the embedded object|Pass a callback method which accepts the embedded object as parameter to the _getEmbed_ of props.<br/>Refer to the _getEmbed_ prop in [Quick Start](#quick-start).|
|Apply style class|Pass the name(s) of style classes to be added to the embed container div to the _cssClassName_ props.|
|Set event handlers|Pass a map object of event name (string) and event handler (function) to the _eventHandlers_ prop. <br/>__Key__: Event name <br/>__Value__: Event handler method to be triggered<br/>Event handler method takes 2 optional params:<br/>First parameter: Event<br/>Second parameter: Reference to the embedded entity|
|Reset event handlers|To reset event handler for an event, set the event handler's value as `null` in the _eventHandlers_ map of props.|
|Set new accessToken|To set new accessToken in the same embedded powerbi artifact, pass the updated _accessToken_ in _embedConfig_ of props. <br/>Reload manually with report.reload() after providing new token if the current token in report has already expired<br/>Example scenario: _Current token has expired_.|
|Update settings (Report type only)|To update the report settings, update the _embedConfig.settings_ property of props.<br/>Refer to the _embedConfig.settings_ prop in [Quick Start](#quick-start).<br/>__Note__: Update the settings only by updating embedConfig prop|
|Bootstrap Power BI|To [bootstrap your powerbi entity](https://learn.microsoft.com/javascript/api/overview/powerbi/bootstrap-better-performance), pass the props to the component without _accessToken_ in _embedConfig_.<br/>__Note__: _embedConfig_ of props should at least contain __type__ of the powerbi entity being embedded. <br/>Available types: "report", "dashboard", "tile", "visual", "qna" and "paginated report".<br/>Refer to _How to bootstrap a report_ section in [Quick Start](#quick-start).|
|Using with PowerBI Report Authoring|1. Install [powerbi-report-authoring](https://www.npmjs.com/package/powerbi-report-authoring) as npm dependency.<br>2. Use the report authoring APIs using the embedded report's instance|
|Phased embedding (Report type only)|Set phasedEmbedding prop's value as `true` <br/> Refer to [Phased embedding docs](https://learn.microsoft.com/javascript/api/overview/powerbi/phased-embedding).|
|Apply Filters (Report type only)|1. To apply updated filters, update filters in _embedConfig_ props.<br/>2. To remove the applied filters, update the _embedConfig_ prop with the filters removed or set as undefined/null.|
|Set Page (Report type only)|To set a page when embedding a report or on an embedded report, provide pageName field in the _embedConfig_.|
|Create report|To create a new report, pass the component with at least _type_, _embedUrl_ and _datasetId_ in _embedConfig_ prop.|

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
		| IPaginatedReportLoadConfiguration
		| IReportCreateConfiguration

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
```


## Supported Events


### Events supported by various Power BI entities:

|Entity|Event|
|:----- |:----- |
| Report | "buttonClicked", "commandTriggered", "dataHyperlinkClicked", "dataSelected", "loaded", "pageChanged", "rendered", "saveAsTriggered", "saved", "selectionChanged", "visualClicked", "visualRendered" |
| Dashboard | "loaded", "tileClicked" |
| Tile | "tileLoaded", "tileClicked" |
| QnA | "visualRendered" |

### Event Handler to be used with Map
```ts
type EventHandler = (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null;
```


## Using supported SDK methods for Power BI artifacts

### Import
*Import the 'PowerBIEmbed' inside your targeted component file:*
```ts
import { PowerBIEmbed } from 'powerbi-client-react';
```

### Use
You can use ```report``` state to call supported SDK APIs.

Steps:
   1. Create one state for storing the report object, for example, ```const [report, setReport] = useState<Report>();```.

   2. Use the ```setReport``` method inside the component to set the report object.
     <br />

```ts
<PowerBIEmbed
	embedConfig = { sampleReportConfig }
	eventHandlers = { eventHandlersMap }
	cssClassName = { reportClass }
	getEmbeddedComponent = { (embedObject: Embed) => {
		setReport(embedObject as Report);
	} }
/>
```

   3. Once the report object is set, it can be used to call SDK methods such as ```getVisuals```, ```getBookmarks```, etc.
   <br />

```ts
async getReportPages(): Page[] {
	// this.report is a class variable, initialized in step 3
	const activePage: Page | undefined = await report.getActivePage();
	console.log(pages);
}
```


### Dependencies

[powerbi-client](https://www.npmjs.com/package/powerbi-client)

### Peer dependencies

[react](https://www.npmjs.com/package/react)

### Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft’s Trademark & Brand Guidelines](https://www.microsoft.com/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.

### Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments

### Data Collection.

The software may collect information about you and your use of the software and send it to Microsoft. Microsoft may use this information to provide services and improve our products and services. You may turn off the telemetry as described in the repository. There are also some features in the software that may enable you and Microsoft to collect data from users of your applications.

If you use these features, you must comply with applicable law, including providing appropriate notices to users of your applications together with a copy of Microsoft’s privacy statement.
Our privacy statement is located at [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement). You can learn more about data collection and use in the help documentation and our privacy statement. Your use of the software operates as your consent to these practices.

### Support
Our public support page is available at [Microsoft Support Statement](https://powerbi.microsoft.com/support/).