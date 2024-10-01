![KRONOS](https://github.com/user-attachments/assets/12d572a7-335a-41f2-9429-bedd2dab9a20)

# n8n-nodes-kronos

This is an n8n community node. It lets you use Kronos in your n8n workflows.

Kronos is a scheduling service that allows you to create, manage, and trigger schedules for various tasks and workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- [Compatibility](#compatibility) -->  
[Usage](#usage)  <!-- [Resources](#resources) -->  
[Version history](#version-history)  <!-- [Troubleshooting](#troubleshooting) -->  <!-- [Contributing](#contributing) -->

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Create Schedule
- Delete Schedule
- Get Schedule
- Get Many Schedules
- Pause Schedule
- Resume Schedule
- Trigger Schedule

## Credentials

To use this node, you need to authenticate with the Kronos API. You will need to provide:

1. Base URL: The base URL of your Kronos API instance.
2. API Key: Your Kronos API key for authentication.

## Usage

### Create Schedule

This operation allows you to create a new schedule in Kronos.

**For recurring schedules:**
1. Set "Is Recurring" to true.
2. Enter the "Cron Expression" for the schedule.
3. (Optional) Set "Start At" and "End At" for the recurring schedule.

**For non-recurring schedules:**
1. Set "Is Recurring" to false.
2. Enter the "Run At" time for the non-recurring schedule.

**Common fields:**
- Title: The name of your schedule (must be unique).
- Description: An optional description of your schedule.
- URL: The webhook notification endpoint.
- Metadata: Optional metadata to be sent when triggering the webhook.

### Get Many Schedules

This operation allows you to retrieve multiple schedules from Kronos.

1. Choose whether to return all results or a limited number.
2. If not returning all, set the limit for the number of schedules to return.
3. (Optional) Enter a title filter to search for specific schedules.
4. (Optional) Enter metadata filters as a JSON object to further refine your search.

### Other Operations

- **Delete Schedule**: Remove a schedule by its ID.
- **Get Schedule**: Retrieve a single schedule by its ID.
- **Pause Schedule**: Pause an active schedule.
- **Resume Schedule**: Resume a paused schedule.
- **Trigger Schedule**: Manually trigger a schedule.

## License

[MIT](https://github.com/Deveji/n8n-nodes-kronos/blob/master/LICENSE.md)

## Version history

### 1.0.0

- Initial release of Kronos node for n8n
- Supports basic CRUD operations for schedules
- Implements filtering and pagination for retrieving multiple schedules
