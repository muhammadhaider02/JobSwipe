export default {
  // TypeScript/JavaScript files - run prettier, eslint on staged files, full type check
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // Exclude shared eslint-config package from ESLint (type-aware parsing not needed)
    const excludeConfigPkg = (file) =>
      !file.includes('/packages/eslint-config/') &&
      !file.includes('\\packages\\eslint-config\\');

    const eslintTargets = filenames.filter(excludeConfigPkg);

    const cmds = [
      `prettier --write ${filenames.join(' ')}`,
      eslintTargets.length > 0 ? `eslint --fix ${eslintTargets.join(' ')}` : null,
      'pnpm check-types',
    ].filter(Boolean);

    return cmds;
  },

  // Other files - just prettier
  '*.{json,css,scss,md,mdx}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
};
