// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// pnpm monorepo — packages live in <root>/node_modules/.pnpm/...,
// reached via a symlink from app/node_modules/<pkg>. Metro must:
//   1. watch the workspace root so it sees those files
//   2. follow symlinks to resolve them
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// IMPORTANT: keep hierarchical lookup ON for pnpm — each package's peer
// deps live in its own node_modules folder up the tree.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
