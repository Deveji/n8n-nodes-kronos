import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

function formatDateTimeForTimeAPI(dateTimeString: string): string {
	const date = new Date(dateTimeString);
	return date.toISOString().replace('T', ' ').slice(0, 19);
}

function formatDateTimeForKronos(dateTimeString: string): string {
	const date = new Date(dateTimeString);
	return date.toISOString();
}

async function getAvailableTimezones(this: ILoadOptionsFunctions): Promise<string[]> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: 'https://timeapi.io/api/timezone/availabletimezones',
		headers: {
			accept: 'application/json',
		},
	};

	const response = await this.helpers.request(options);
	return JSON.parse(response);
}

async function convertTimezone(this: IExecuteFunctions, fromTimeZone: string, dateTime: string, toTimeZone: string): Promise<string> {
	const formattedDateTime = formatDateTimeForTimeAPI(dateTime);
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: 'https://timeapi.io/api/conversion/converttimezone',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			fromTimeZone: toTimeZone,
			dateTime: formattedDateTime,
			toTimeZone: fromTimeZone,
			dstAmbiguity: '',
		}),
	};

	const response = await this.helpers.request(options);
	const result = JSON.parse(response);
	return formatDateTimeForKronos(result.conversionResult.dateTime);
}

export class Kronos implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kronos',
		name: 'kronos',
		icon: 'file:kronos.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Kronos API',
		defaults: {
			name: 'Kronos',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kronosApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Create Schedule',
						value: 'create',
					},
					{
						name: 'Delete Schedule',
						value: 'delete',
					},
					{
						name: 'Get Many Schedules',
						value: 'getMany',
					},
					{
						name: 'Get Schedule',
						value: 'get',
					},
					{
						name: 'Pause Schedule',
						value: 'pause',
					},
					{
						name: 'Resume Schedule',
						value: 'resume',
					},
					{
						name: 'Trigger Schedule',
						value: 'trigger',
					},
				],
				default: 'create',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Schedule ID',
				name: 'scheduleId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['delete', 'get', 'pause', 'resume', 'trigger'],
					},
				},
				description: 'The ID of the schedule',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'The name of your schedule. It must be unique.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'An optional description of your schedule',
			},
			{
				displayName: 'Is Recurring',
				name: 'isRecurring',
				type: 'boolean',
				default: true,
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Whether the schedule is recurring or not',
			},
			{
				displayName: 'Cron Expression',
				name: 'cronExpr',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
						isRecurring: [true],
					},
				},
				description: 'Cron expression for recurring schedules',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Webhook notification endpoint',
			},
			{
				displayName: 'Run At',
				name: 'runAt',
				type: 'dateTime',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
						isRecurring: [false],
					},
				},
				description:
					'For non-recurring schedules, it indicates the instant the schedule will be triggered at',
			},
			{
				displayName: 'Start At',
				name: 'startAt',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['create'],
						isRecurring: [true],
					},
				},
				description: 'UTC start date of the schedule',
			},
			{
				displayName: 'End At',
				name: 'endAt',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['create'],
						isRecurring: [true],
					},
				},
				description: 'UTC end date of the schedule',
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Timezone',
				name: 'timezone',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTimezones',
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-excess-final-period, n8n-nodes-base/node-param-description-wrong-for-dynamic-options
				description: 'Choose from the list, or specify using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Metadata File',
				name: 'metadata',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Optional metadata file which will be sent when triggering a webhook',
			},
			// Properties for getMany operation
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: true,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						operation: ['getMany'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						operation: ['getMany'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: 'Filter by Title',
				name: 'filterTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['getMany'],
					},
				},
				description: 'Filter schedules by title (case-insensitive)',
			},
			{
				displayName: 'Filter by Metadata',
				name: 'filterMetadata',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['getMany'],
					},
				},
				description: 'Filter schedules by metadata (JSON object)',
			},
		],
	};

	methods = {
		loadOptions: {
			async getTimezones(this: ILoadOptionsFunctions) {
				const timezones = await getAvailableTimezones.call(this);
				return timezones.map((tz: string) => ({ name: tz, value: tz }));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('kronosApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let endpoint = '';
				let method: IHttpRequestOptions['method'];
				let body: { [key: string]: any } | undefined;

				switch (operation) {
					case 'create':
						method = 'POST';
						endpoint = 'schedules';
						body = {
							title: this.getNodeParameter('title', i) as string,
							description: this.getNodeParameter('description', i) as string,
							isRecurring: this.getNodeParameter('isRecurring', i) as boolean,
							url: this.getNodeParameter('url', i) as string,
						};
						if (body.isRecurring) {
							body.cronExpr = this.getNodeParameter('cronExpr', i) as string;
							const startAt = this.getNodeParameter('startAt', i) as string;
							const endAt = this.getNodeParameter('endAt', i) as string;
							const timezone = this.getNodeParameter('timezone', i) as string;
							if (startAt) body.startAt = await convertTimezone.call(this, timezone, startAt, 'UTC');
							if (endAt) body.endAt = await convertTimezone.call(this, timezone, endAt, 'UTC');
						} else {
							const runAt = this.getNodeParameter('runAt', i) as string;
							const timezone = this.getNodeParameter('timezone', i) as string;
							const convertedRunAt = await convertTimezone.call(this, timezone, runAt, 'UTC');
							body.runAt = convertedRunAt;
							body.startAt = convertedRunAt;
							body.endAt = convertedRunAt;
						}
						const metadata = this.getNodeParameter('metadata', i) as string;
						if (metadata) body.metadata = JSON.parse(metadata);
						break;
					case 'get':
						method = 'GET';
						endpoint = `schedules/${this.getNodeParameter('scheduleId', i)}`;
						break;
					case 'getMany':
						method = 'GET';
						endpoint = 'schedules';
						break;
					case 'delete':
						method = 'DELETE';
						endpoint = `schedules/${this.getNodeParameter('scheduleId', i)}`;
						break;
					case 'pause':
						method = 'POST';
						endpoint = `schedules/${this.getNodeParameter('scheduleId', i)}/pause`;
						break;
					case 'resume':
						method = 'POST';
						endpoint = `schedules/${this.getNodeParameter('scheduleId', i)}/resume`;
						break;
					case 'trigger':
						method = 'POST';
						endpoint = `schedules/${this.getNodeParameter('scheduleId', i)}/trigger`;
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported!`,
						);
				}

				const options: IHttpRequestOptions = {
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					method,
					url: `${baseUrl}${endpoint}`,
					json: true,
				};

				if (body) {
					options.body = body;
				}

				this.logger.debug('Request options:');
				this.logger.debug(JSON.stringify(options, null, 2));

				let response = await this.helpers.request(options);

				this.logger.debug('Response:');
				this.logger.debug(JSON.stringify(response, null, 2));

				if (operation === 'getMany') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filterTitle = this.getNodeParameter('filterTitle', i) as string;
					const filterMetadata = JSON.parse(this.getNodeParameter('filterMetadata', i) as string);

					// Filter by title
					if (filterTitle) {
						response = response.filter((schedule: any) =>
							schedule.title.toLowerCase().includes(filterTitle.toLowerCase())
						);
					}

					// Filter by metadata
					if (Object.keys(filterMetadata).length > 0) {
						response = response.filter((schedule: any) => {
							return Object.entries(filterMetadata).every(([key, value]) => {
								return schedule.metadata && schedule.metadata[key] === value;
							});
						});
					}

					// Apply limit if not returning all
					if (!returnAll) {
						const limit = this.getNodeParameter('limit', i) as number;
						response = response.slice(0, limit);
					}

					// Push each schedule as a separate item with pairedItem information
					for (let j = 0; j < response.length; j++) {
						returnData.push({
							json: response[j],
							pairedItem: {
								item: i,
							},
						});
					}
				} else {
					// For all other operations, push a single item with pairedItem information
					returnData.push({
						json: response,
						pairedItem: {
							item: i,
						},
					});
				}
			} catch (error) {
				if (error.response) {
					this.logger.error('API Error Response:');
					this.logger.error(JSON.stringify(error.response.data, null, 2));
				}

				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
