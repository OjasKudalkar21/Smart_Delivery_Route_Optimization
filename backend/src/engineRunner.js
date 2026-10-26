const { spawn } = require('child_process');
const fs = require('fs');
const { ENGINE_PATH, ENGINE_TIMEOUT_MS } = require('./config');

/**
 * Safely executes the compiled C++17 DSA Route Engine binary via stdin/stdout IPC.
 * 
 * Security & Reliability guarantees:
 * 1. Spawns directly using OS executive without invoking a shell (NO shell injection possible).
 * 2. Inputs are strictly serialized as JSON and piped over standard input.
 * 3. Enforces an explicit timeout so infinite loops or stalled child processes are killed.
 * 4. Captures stderr diagnostics separately so stdout remains clean, strictly valid JSON.
 * 
 * @param {object} payload - Request payload containing action and parameters
 * @returns {Promise<object>} Parsed JSON response from the C++ engine
 */
function invokeEngine(payload) {
  return new Promise((resolve, reject) => {
    // 1. Verify that the C++ binary is compiled and present
    if (!fs.existsSync(ENGINE_PATH)) {
      return reject(
        new Error(
          `C++ Route Engine executable not found at '${ENGINE_PATH}'. ` +
          `Please compile it first by running 'build.bat' in the cpp-engine directory.`
        )
      );
    }

    const jsonInput = JSON.stringify(payload);
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let isSettled = false;

    // 2. Spawn executable directly without shell execution
    const child = spawn(ENGINE_PATH, [], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // 3. Setup watchdog timeout timer
    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        child.kill('SIGKILL');
        reject(
          new Error(
            `C++ Route Engine timed out after ${ENGINE_TIMEOUT_MS}ms for action '${payload.action || 'unknown'}'.`
          )
        );
      }
    }, ENGINE_TIMEOUT_MS);

    // 4. Collect standard output (JSON response)
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString('utf8');
    });

    // 5. Collect standard error (diagnostic logs)
    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk.toString('utf8');
    });

    // 6. Handle child process error
    child.on('error', (err) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        reject(new Error(`Failed to start C++ engine process: ${err.message}`));
      }
    });

    // 7. Handle child termination
    child.on('close', (code, signal) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      if (stderrBuffer.trim()) {
        // Log C++ engine diagnostics to server console
        console.log(`[C++ Engine Diagnostics]\n${stderrBuffer.trim()}`);
      }

      if (!stdoutBuffer.trim()) {
        return reject(
          new Error(
            `C++ engine produced no output (Exit Code: ${code}, Signal: ${signal}). Stderr: ${stderrBuffer}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdoutBuffer);
        if (parsed.status === 'error') {
          return reject(new Error(parsed.error || 'C++ Engine reported an unspecified error.'));
        }
        resolve(parsed);
      } catch (parseErr) {
        reject(
          new Error(
            `Failed to parse C++ engine JSON response: ${parseErr.message}. Raw output: ${stdoutBuffer}`
          )
        );
      }
    });

    // 8. Pipe payload to child stdin and close stream
    try {
      child.stdin.write(jsonInput, 'utf8');
      child.stdin.end();
    } catch (writeErr) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        child.kill();
        reject(new Error(`Error writing to C++ engine stdin: ${writeErr.message}`));
      }
    }
  });
}

module.exports = {
  invokeEngine,
};
