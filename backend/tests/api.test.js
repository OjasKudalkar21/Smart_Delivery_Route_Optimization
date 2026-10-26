const http = require('http');
const app = require('../src/server');

let server;
const TEST_PORT = 5001;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let respBody = '';
        res.on('data', (chunk) => (respBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(respBody);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: respBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('Running RoutePilot Phase 6 Backend API Integration Tests');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // 1. Health Endpoint
    console.log('=== Test 1: GET /api/health ===');
    const healthRes = await makeRequest('GET', '/api/health');
    assert(healthRes.statusCode === 200, 'Health check returns HTTP 200');
    assert(healthRes.data.status === 'ok', "API status is 'ok'");
    assert(healthRes.data.engine && healthRes.data.engine.status === 'ok', "C++ engine status is 'ok'");
    assert(healthRes.data.engine.version === '1.0.0', "Engine version is 1.0.0");

    // 2. Sample Graph Endpoint
    console.log('\n=== Test 2: GET /api/graph/sample ===');
    const sampleRes = await makeRequest('GET', '/api/graph/sample');
    assert(sampleRes.statusCode === 200, 'Sample graph returns HTTP 200');
    assert(sampleRes.data.status === 'success', "Response status is 'success'");
    assert(Array.isArray(sampleRes.data.vertices), "Response contains 'vertices' array");
    assert(sampleRes.data.vertices.length === 8, 'Sample graph has exactly 8 vertices');
    assert(sampleRes.data.edges.length === 11, 'Sample graph has exactly 11 edges');
    assert(sampleRes.data.warehouse === 'Warehouse', "Warehouse vertex is 'Warehouse'");

    // 3. Graph Analysis (BFS/DFS) Endpoint
    console.log('\n=== Test 3: POST /api/graph/analyze ===');
    const analyzeRes = await makeRequest('POST', '/api/graph/analyze', {
      start: 'Warehouse',
    });
    assert(analyzeRes.statusCode === 200, 'Graph analyze returns HTTP 200');
    assert(analyzeRes.data.status === 'success', "Analyze status is 'success'");
    assert(analyzeRes.data.bfs && analyzeRes.data.bfs.visitedOrder.length === 8, 'BFS visited all 8 vertices');
    assert(analyzeRes.data.dfs && analyzeRes.data.dfs.hasCycle === true, 'DFS correctly identified cycle');
    assert(analyzeRes.data.bfs.steps.length > 0, 'BFS recorded discrete playback steps');

    // 4. Route Optimization (Greedy) Endpoint
    console.log('\n=== Test 4: POST /api/route/optimize ===');
    const optRes = await makeRequest('POST', '/api/route/optimize', {
      start: 'Warehouse',
      destinations: ['Downtown', 'Harbor', 'Airport'],
    });
    assert(optRes.statusCode === 200, 'Route optimize returns HTTP 200');
    assert(optRes.data.status === 'success', "Optimization status is 'success'");
    assert(optRes.data.strategy === 'greedy', "Strategy is 'greedy'");
    assert(optRes.data.route.length === 3, 'All 3 destinations visited');
    assert(optRes.data.route[0] === 'Downtown', 'First greedy stop is Downtown (3.2 km)');
    assert(optRes.data.route[1] === 'Harbor', 'Second greedy stop is Harbor (3.8 km)');
    assert(optRes.data.totalDistance > 0, `Total distance calculated (${optRes.data.totalDistance} km)`);
    assert(optRes.data.legs.length === 3, 'Generated 3 delivery legs');
    assert(optRes.data.algorithmTrace.length === 3, 'Algorithm trace contains 3 candidate decision steps');

    // 5. Route Comparison Endpoint
    console.log('\n=== Test 5: POST /api/route/compare ===');
    const compRes = await makeRequest('POST', '/api/route/compare', {
      start: 'Warehouse',
      destinations: ['Airport', 'Downtown', 'Harbor'],
    });
    assert(compRes.statusCode === 200, 'Route compare returns HTTP 200');
    assert(compRes.data.status === 'success', "Comparison status is 'success'");
    assert(compRes.data.greedy !== undefined, "Contains 'greedy' route result");
    assert(compRes.data.baseline !== undefined, "Contains 'baseline' route result");
    assert(compRes.data.distanceDifference !== undefined, 'Contains distance difference calculation');
    assert(typeof compRes.data.percentageSavings === 'number', 'Percentage savings is numeric');

    // 6. Validation Error: Missing Start Location
    console.log('\n=== Test 6: Input Validation Errors ===');
    const valRes1 = await makeRequest('POST', '/api/route/optimize', {
      destinations: ['Downtown'],
    });
    assert(valRes1.statusCode === 400, 'Missing start location returns HTTP 400');
    assert(valRes1.data.status === 'error', 'Error status returned');

    // 7. Validation Error: Non-array destinations
    const valRes2 = await makeRequest('POST', '/api/route/optimize', {
      start: 'Warehouse',
      destinations: 'Downtown',
    });
    assert(valRes2.statusCode === 400, 'Non-array destinations returns HTTP 400');

    // 8. C++ Engine Error: Unknown Starting Vertex
    console.log('\n=== Test 7: C++ Engine Error Handling ===');
    const engineErrRes = await makeRequest('POST', '/api/route/optimize', {
      start: 'NonExistentVertex',
      destinations: ['Downtown'],
    });
    assert(engineErrRes.statusCode === 500, 'Engine error correctly mapped to HTTP error');
    assert(engineErrRes.data.error.includes('not found in graph'), 'Informative C++ error message returned');

    console.log('\n========================================================');
    console.log(`Backend API Test Summary: ${passed}/${total} assertions passed.`);
    if (passed === total) {
      console.log('ALL PHASE 6 BACKEND API TESTS PASSED SUCCESSFULLY! (100%)');
    } else {
      console.log(`SOME TESTS FAILED: ${total - passed} failure(s).`);
    }
    console.log('========================================================\n');
  } finally {
    server.close();
  }

  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  if (server) server.close();
  process.exit(1);
});
