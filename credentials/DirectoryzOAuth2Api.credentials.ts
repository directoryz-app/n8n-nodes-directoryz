import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DirectoryzOAuth2Api implements ICredentialType {
	name = 'directoryzOAuth2Api';
	displayName = 'Directoryz OAuth2 API';
	documentationUrl = 'https://github.com/directoryz-app/n8n-nodes-directoryz#authentication';
	icon = { light: 'file:directoryz.svg', dark: 'file:directoryz.svg' } as const;
	extends = ['oAuth2Api'];
	properties: INodeProperties[] = [
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'account:read webhooks:manage',
		},
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://api.directoryz.app/v1',
		},
		{
			displayName: 'Resource URL',
			name: 'resourceUrl',
			type: 'hidden',
			default: 'https://api.directoryz.app/v1',
		},
	];
}
