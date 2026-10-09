import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeOperations, type Operation, type ResourceRoute } from './transport';
import operations from './operations.json';
import routes from './routes.json';

export class Directoryz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Directoryz',
		name: 'directoryz',
		icon: { light: 'file:directoryz.svg', dark: 'file:directoryz.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Automate your Directoryz account',
		defaults: { name: 'Directoryz' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'directoryzOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Directory',
						value: 'directories',
					},
					{
						name: 'Listing',
						value: 'listing',
					},
				],
				default: 'account',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Profile',
						value: 'get_profile',
						description: 'Read your connected workspace profile',
						action: 'Get profile in directoryz',
					},
				],
				default: 'get_profile',
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Directory',
						value: 'get_directory',
						description: 'Read an owned directory without publishing it',
						action: 'Get directory in directoryz',
					},
					{
						name: 'List Directories',
						value: 'list_directories',
						description: 'List directories in your selected Directoryz workspace',
						action: 'List directories in directoryz',
					},
				],
				default: 'get_directory',
				displayOptions: {
					show: {
						resource: ['directories'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Listings',
						value: 'list_listings',
						description: 'Read listings within an owned directory',
						action: 'List listings in directoryz',
					},
				],
				default: 'list_listings',
				displayOptions: {
					show: {
						resource: ['listing'],
					},
				},
			},
			{
				displayName: 'Directory ID',
				name: 'get_directory__directoryId',
				type: 'string',
				default: '',
				required: true,
				description: 'The directory ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_directory'],
						resource: ['directories'],
					},
				},
			},
			{
				displayName: 'Directory ID',
				name: 'list_listings__directoryId',
				type: 'string',
				default: '',
				required: true,
				description: 'The directory ID for this operation',
				displayOptions: {
					show: {
						operation: ['list_listings'],
						resource: ['listing'],
					},
				},
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeOperations(
			this,
			'https://api.directoryz.app',
			'directoryzOAuth2Api',
			operations as unknown as Operation[],
			routes as Record<string, ResourceRoute>,
		);
	}
}
