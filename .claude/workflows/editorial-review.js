export const meta = {
  name: 'editorial-review',
  description:
    'Multi-lens editorial review of a blog article (technical accuracy, clarity, code-sample correctness) with single-skeptic verification per finding',
  phases: [
    { title: 'Review', detail: 'three lenses find issues independently' },
    { title: 'Verify', detail: 'one skeptic per finding tries to refute it' },
  ],
}

const articlePath = args
if (!articlePath || typeof articlePath !== 'string') {
  throw new Error(
    'editorial-review requires the article path as args, e.g. Workflow({ name: "editorial-review", args: "src/articles/foo.mdx" })',
  )
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description:
              'Heading or quoted sentence/code line the issue is anchored to',
          },
          issue: {
            type: 'string',
            description: 'What is wrong, one or two sentences',
          },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          suggestion: {
            type: 'string',
            description: 'Concrete fix or rewrite',
          },
        },
        required: ['location', 'issue', 'severity', 'suggestion'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    reasoning: { type: 'string' },
  },
  required: ['refuted', 'reasoning'],
}

const LENSES = [
  {
    key: 'technical-accuracy',
    prompt: `Read the article at ${articlePath}. Review it strictly for TECHNICAL ACCURACY: factual errors, incorrect claims about how the described systems/algorithms/tools actually work, outdated or wrong terminology, and simplifications that cross the line from "simplified" into "wrong". Do not comment on prose clarity or code correctness — other reviewers cover those. For each issue, report its location (quote the nearest sentence or heading), the issue, a severity, and a concrete suggested fix. If you find nothing, return an empty findings array — do not invent issues to have something to report.`,
  },
  {
    key: 'clarity',
    prompt: `Read the article at ${articlePath}. Review it strictly for CLARITY given its apparent target audience (infer this from the article's own framing/introduction): confusing explanations, unexplained jargon, logical gaps where a reader would get lost, examples that don't actually illuminate the point they're attached to, and sections that assume knowledge not yet established. Do not comment on technical accuracy or code correctness — other reviewers cover those. For each issue, report its location (quote the nearest sentence or heading), the issue, a severity, and a concrete suggested fix. If you find nothing, return an empty findings array.`,
  },
  {
    key: 'code-samples',
    prompt: `Read the article at ${articlePath}. Review every code sample/snippet in it strictly for CORRECTNESS: syntax errors, code that would not actually run or compile, logic that doesn't do what the surrounding prose claims it does, and mismatches between a snippet and its stated output. If a snippet is pseudocode explicitly framed as such, judge it against its own stated intent rather than a specific language's exact syntax. Do not comment on prose clarity or technical accuracy of surrounding claims — other reviewers cover those. For each issue, report its location (quote the snippet or its preceding heading), the issue, a severity, and a concrete suggested fix. If you find nothing, return an empty findings array.`,
  },
]

const verified = await pipeline(
  LENSES,
  (lens) =>
    agent(lens.prompt, {
      label: `review:${lens.key}`,
      phase: 'Review',
      schema: FINDINGS_SCHEMA,
    }).then((result) =>
      (result?.findings || []).map((f) => ({ ...f, lens: lens.key })),
    ),
  (findings) =>
    parallel(
      findings.map(
        (f) => () =>
          agent(
            `You are skeptically fact-checking a claimed editorial issue in the article at ${articlePath}. The claim: "${f.issue}" anchored at "${f.location}" (severity: ${f.severity}, suggested fix: "${f.suggestion}"). Re-read the relevant part of the article yourself and try to REFUTE this claim — is it actually wrong, a non-issue, or already fine as written? Default to refuted:true if you are genuinely uncertain rather than confident it's a real issue.`,
            {
              label: `verify:${f.lens}`,
              phase: 'Verify',
              schema: VERDICT_SCHEMA,
            },
          ).then((v) => ({ ...f, verdict: v })),
      ),
    ),
)

const flat = verified.flat().filter(Boolean)
const confirmed = flat.filter((f) => f.verdict && !f.verdict.refuted)

const bySeverity = { high: [], medium: [], low: [] }
for (const f of confirmed) {
  ;(bySeverity[f.severity] || bySeverity.low).push(f)
}
const ranked = [...bySeverity.high, ...bySeverity.medium, ...bySeverity.low]

log(
  `${confirmed.length} confirmed issue(s) out of ${flat.length} raised across ${LENSES.length} lenses`,
)

return { articlePath, raisedCount: flat.length, confirmed: ranked }
