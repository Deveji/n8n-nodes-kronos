import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KronosApi implements ICredentialType {
	name = 'kronosApi';
	displayName = 'Kronos API';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:9175',
			required: true,
		},
		// Add any other required credentials (e.g., API key) here
	];
}
