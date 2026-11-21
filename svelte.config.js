import adapter from '@sveltejs/adapter-static';
const base = process.env.BASE_PATH ?? '';
if (base && (!base.startsWith('/') || base.endsWith('/'))) throw new Error('BASE_PATH must begin with / and have no trailing slash');
export default { kit: { adapter: adapter(), paths: { base, relative: false } } };
