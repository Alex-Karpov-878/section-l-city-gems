export default {
  '*.{js,ts,jsx,tsx}': ['pnpm eslint --fix', 'pnpm prettier --write'],
  '*.{json,css,md}': ['pnpm prettier --write'],
};
