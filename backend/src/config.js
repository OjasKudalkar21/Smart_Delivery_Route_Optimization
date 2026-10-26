const path = require('path');
const fs = require('fs');

// Resolves candidate paths for the C++ route_engine executable
function resolveEnginePath() {
  if (process.env.ENGINE_PATH && fs.existsSync(process.env.ENGINE_PATH)) {
    return process.env.ENGINE_PATH;
  }

  const baseDir = path.resolve(__dirname, '../../cpp-engine/bin');
  const candidates = [
    path.join(baseDir, 'route_engine.exe'),
    path.join(baseDir, 'route_engine'),
    path.join(__dirname, '../../../cpp-engine/bin/route_engine.exe'),
    path.join(__dirname, '../../../cpp-engine/bin/route_engine'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Default fallback path for build instructions
  return path.join(baseDir, process.platform === 'win32' ? 'route_engine.exe' : 'route_engine');
}

module.exports = {
  PORT: process.env.PORT || 5000,
  ENGINE_PATH: resolveEnginePath(),
  ENGINE_TIMEOUT_MS: parseInt(process.env.ENGINE_TIMEOUT_MS || '8000', 10),
  MAX_DESTINATIONS_LIMIT: 50,
  MAX_VERTICES_LIMIT: 500,
  MAX_EDGES_LIMIT: 2000,
};
