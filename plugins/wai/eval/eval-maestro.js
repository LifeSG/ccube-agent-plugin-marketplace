// Usage: In a Claude Code session, ask:
//   "run the maestro eval"
// Or explicitly:
//   "run the workflow at plugins/wai/eval/eval-maestro.js
//    with args from plugins/wai/eval/maestro-test-cases.json"

export const meta = {
  name: 'eval-maestro',
  description: 'Classification smoke test for Maestro routing agent',
  phases: [
    { title: 'Classify', detail: 'Route each prompt through Maestro logic' },
    { title: 'Report', detail: 'Compare and aggregate results' }
  ]
}

const CLASSIFY_SCHEMA = {
  type: 'object',
  required: ['categories', 'dispatch_to', 'handle_directly'],
  properties: {
    categories: {
      type: 'array',
      items: {
        enum: ['FRONTEND', 'BACKEND', 'PRODUCT', 'SCAFFOLD', 'GENERAL']
      }
    },
    dispatch_to: {
      type: 'array',
      items: { type: 'string' },
      nullable: true
    },
    handle_directly: { type: 'boolean' }
  }
}

const cases = args

const predictions = await pipeline(
  cases,
  (c) => agent(
    [
      'You are the Maestro routing agent. Given this user prompt,',
      'classify it into categories and determine dispatch targets.',
      'Follow the Maestro routing protocol exactly.',
      '',
      'Categories: FRONTEND, BACKEND, PRODUCT, SCAFFOLD, GENERAL',
      'Dispatch targets: "WAI FDS Engineer", "WAI Backend Engineer",',
      '"WAI Product Manager", or null if handling directly.',
      '',
      `User prompt: "${c.prompt}"`,
      '',
      'Return your classification as structured output.',
      'Do NOT actually dispatch — just return the routing decision.'
    ].join('\n'),
    {
      label: `classify:${c.id}`,
      phase: 'Classify',
      schema: CLASSIFY_SCHEMA,
      effort: 'low'
    }
  )
)

phase('Report')

function isEmpty(a) {
  return !a || a.length === 0
}

function setsEqual(a, b) {
  if (isEmpty(a) && isEmpty(b)) return true
  if (isEmpty(a) || isEmpty(b)) return false
  const sa = new Set(a.map(x => x.toLowerCase()))
  const sb = new Set(b.map(x => x.toLowerCase()))
  if (sa.size !== sb.size) return false
  for (const item of sa) {
    if (!sb.has(item)) return false
  }
  return true
}

const results = cases.map((c, i) => {
  const pred = predictions[i]
  if (!pred) return { id: c.id, pass: false, reason: 'no prediction' }

  const catMatch = setsEqual(pred.categories, c.expected_categories)
  const dispMatch = setsEqual(pred.dispatch_to, c.expected_dispatch)
  const directMatch = pred.handle_directly === c.handle_directly
  const pass = catMatch && dispMatch && directMatch

  return {
    id: c.id,
    pass,
    catMatch,
    dispMatch,
    directMatch,
    predicted: pred,
    expected: {
      categories: c.expected_categories,
      dispatch_to: c.expected_dispatch,
      handle_directly: c.handle_directly
    }
  }
})

const passed = results.filter(r => r.pass).length
const total = results.length
const accuracy = total > 0 ? passed / total : 0

log(`Results: ${passed}/${total} passed (${(accuracy * 100).toFixed(0)}%)`)
log(passed === total ? 'PASS' : 'FAIL')

results.filter(r => !r.pass).forEach(r => {
  log(`FAIL: ${r.id} — cat:${r.catMatch} disp:${r.dispMatch} direct:${r.directMatch}`)
})

return {
  pass: passed === total,
  accuracy,
  total,
  passed,
  failed: total - passed,
  results
}
