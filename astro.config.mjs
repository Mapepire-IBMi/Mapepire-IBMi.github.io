import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Mapepire',
			social: {
				github: 'https://github.com/Mapepire-IBMi',
			},
			sidebar: [
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
					badge: `start here`
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
					collapsed: true,
				},
			],
		}),
	],
});
