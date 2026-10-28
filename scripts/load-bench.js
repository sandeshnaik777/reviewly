/**
 * Comprehensive Concurrency, Load & Latency Distribution Benchmark
 * Tests concurrent users, request throughput, and latency percentiles (<100ms, <500ms, <1000ms).
 */

const TARGET_HOST = process.argv[2] || 'http://16.176.211.119';

async function measureRequest(url) {
  const start = performance.now();
  try {
    const res = await fetch(url);
    const duration = performance.now() - start;
    return { success: res.ok, status: res.status, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { success: false, error: err.message, duration };
  }
}

async function runConcurrencyStage(stageName, endpoint, totalRequests, concurrency) {
  console.log(`\n============================================================`);
  console.log(`🚀 STAGE: ${stageName}`);
  console.log(`   Target Endpoint: ${endpoint}`);
  console.log(`   Total Requests: ${totalRequests} | Concurrency: ${concurrency}`);
  console.log(`============================================================`);

  const results = [];
  let inFlight = 0;
  let completed = 0;
  const startTime = performance.now();

  return new Promise((resolve) => {
    let nextIndex = 0;

    function launchNext() {
      if (completed >= totalRequests) {
        const totalDuration = (performance.now() - startTime) / 1000;
        resolve({ stageName, endpoint, totalRequests, concurrency, totalDuration, results });
        return;
      }

      while (inFlight < concurrency && nextIndex < totalRequests) {
        nextIndex++;
        inFlight++;
        measureRequest(endpoint).then((res) => {
          results.push(res);
          inFlight--;
          completed++;
          launchNext();
        });
      }
    }

    launchNext();
  });
}

function analyzeStageResults(data) {
  const { stageName, endpoint, totalRequests, concurrency, totalDuration, results } = data;
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const min = durations[0] || 0;
  const max = durations[durations.length - 1] || 0;
  const sum = durations.reduce((a, b) => a + b, 0);
  const avg = durations.length ? sum / durations.length : 0;

  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p90 = durations[Math.floor(durations.length * 0.9)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

  const under100ms = durations.filter((d) => d < 100).length;
  const under200ms = durations.filter((d) => d >= 100 && d < 200).length;
  const under500ms = durations.filter((d) => d >= 200 && d < 500).length;
  const under1000ms = durations.filter((d) => d >= 500 && d < 1000).length;
  const over1000ms = durations.filter((d) => d >= 1000).length;

  const rps = (totalRequests / totalDuration).toFixed(1);

  return {
    stageName,
    concurrency,
    totalRequests,
    successful: successful.length,
    failed: failed.length,
    rps,
    avg: avg.toFixed(1),
    min: min.toFixed(1),
    max: max.toFixed(1),
    p50: p50.toFixed(1),
    p90: p90.toFixed(1),
    p95: p95.toFixed(1),
    p99: p99.toFixed(1),
    buckets: {
      under100ms: { count: under100ms, pct: ((under100ms / totalRequests) * 100).toFixed(1) },
      under200ms: { count: under200ms, pct: ((under200ms / totalRequests) * 100).toFixed(1) },
      under500ms: { count: under500ms, pct: ((under500ms / totalRequests) * 100).toFixed(1) },
      under1000ms: { count: under1000ms, pct: ((under1000ms / totalRequests) * 100).toFixed(1) },
      over1000ms: { count: over1000ms, pct: ((over1000ms / totalRequests) * 100).toFixed(1) },
    },
  };
}

async function runBenchmark() {
  console.log(`Starting Production Benchmark against: ${TARGET_HOST}`);

  // Test across endpoints
  const stages = [
    { name: '10 Users Concurrency (Warmup & Baseline)', endpoint: `${TARGET_HOST}/api/plans`, total: 50, conc: 10 },
    { name: '50 Concurrent Users (Normal Production Load)', endpoint: `${TARGET_HOST}/api/plans`, total: 150, conc: 50 },
    { name: '100 Concurrent Users (Peak Traffic Surge)', endpoint: `${TARGET_HOST}/api/plans`, total: 300, conc: 100 },
    { name: '200 Concurrent Users (High Density Burst)', endpoint: `${TARGET_HOST}/api/plans`, total: 400, conc: 200 },
    { name: '50 Concurrent Users (Content Rich - Blogs API)', endpoint: `${TARGET_HOST}/api/blogs`, total: 100, conc: 50 },
  ];

  const summary = [];
  for (const s of stages) {
    const raw = await runConcurrencyStage(s.name, s.endpoint, s.total, s.conc);
    const analyzed = analyzeStageResults(raw);
    summary.push(analyzed);
    console.log(`   -> Completed in ${raw.totalDuration.toFixed(2)}s | RPS: ${analyzed.rps}`);
    console.log(`   -> Latency: Avg ${analyzed.avg}ms | p50 ${analyzed.p50}ms | p90 ${analyzed.p90}ms | p99 ${analyzed.p99}ms`);
    console.log(`   -> Reaction Distribution:`);
    console.log(`      < 100 ms:  ${analyzed.buckets.under100ms.count} (${analyzed.buckets.under100ms.pct}%)`);
    console.log(`      < 200 ms:  ${analyzed.buckets.under200ms.count} (${analyzed.buckets.under200ms.pct}%)`);
    console.log(`      < 500 ms:  ${analyzed.buckets.under500ms.count} (${analyzed.buckets.under500ms.pct}%)`);
    console.log(`      < 1000 ms: ${analyzed.buckets.under1000ms.count} (${analyzed.buckets.under1000ms.pct}%)`);
    console.log(`      > 1000 ms: ${analyzed.buckets.over1000ms.count} (${analyzed.buckets.over1000ms.pct}%)`);
  }

  console.log('\n============================================================');
  console.log('📊 FINAL BENCHMARK SUMMARY TABLE:');
  console.log('============================================================');
  console.table(
    summary.map((s) => ({
      'Stage / Concurrency': `${s.concurrency} Users`,
      'Total Req': s.totalRequests,
      'Throughput (RPS)': s.rps,
      'Avg Latency': `${s.avg} ms`,
      'p50': `${s.p50} ms`,
      'p90': `${s.p90} ms`,
      'p99': `${s.p99} ms`,
      '< 100ms %': `${s.buckets.under100ms.pct}%`,
      '< 500ms %': `${(parseFloat(s.buckets.under100ms.pct) + parseFloat(s.buckets.under200ms.pct) + parseFloat(s.buckets.under500ms.pct)).toFixed(1)}%`,
      '< 1000ms %': `${(100 - parseFloat(s.buckets.over1000ms.pct)).toFixed(1)}%`,
      'Success Rate': `${((s.successful / s.totalRequests) * 100).toFixed(1)}%`,
    }))
  );
}

runBenchmark().catch(console.error);
