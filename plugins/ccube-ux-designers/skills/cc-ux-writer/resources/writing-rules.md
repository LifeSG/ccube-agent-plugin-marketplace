# Writing rules — universal

The general-purpose rule set for `ccube-ux-writer`. Applies in every context. When the LifeSG/
GovTech layer is active, check `lifesg-overrides.md` for anything that overrides or extends a
section here.

## Contents

1. [Voice and tone](#voice-and-tone)
2. [Writing rules](#writing-rules)
3. [Avoiding AI-sounding patterns](#avoiding-ai-sounding-patterns)
4. [Component-level guidance](#component-level-guidance)
5. [Review mode — what to check](#review-mode--what-to-check)
6. [Grammar and style rules](#grammar-and-style-rules)
7. [Vocabulary — approved terms](#vocabulary--approved-terms)
8. [Inclusivity checks](#inclusivity-checks)

---

## Voice and tone

### Voice (always consistent)

- **Conversational, not casual.** Write the way a thoughtful person talks — not the way a
  corporate memo reads.
- **Trustworthy, not arrogant.** Use expertise to help users, never to talk down to them.
  Be transparent; back up claims with facts.
- **Warm, not sycophantic.** Never open with hollow affirmations. Clarity is the goal, not charm.
- **Direct.** Lead with the point. Frontload the most important information.
- **Inclusive.** Every group within the target audience should feel addressed.

### Tone (adapts by context)

| Context | Tone |
| --- | --- |
| Onboarding / first-time flows | Warm, casual, a little enthusiastic |
| Transactional flows (forms, uploads) | Calm, matter-of-fact, efficient |
| Errors and warnings | Clear, reassuring — never blame the user |
| Confirmation modals | Serious, respectful, precise |
| Benefit / eligibility descriptions | Plain, factual, inclusive |
| Notifications and alerts | Concise, direct, action-oriented |
| Empty states | Anticipatory or encouraging, depending on state |

If the product has a defined tone of voice, that overrides this table. Check the connected
guidelines first.

---

## Writing rules

### Always
- **Lead with what matters to the user.** Put the outcome or action before the mechanism.
- **Use active voice by default.** "We'll send you a confirmation" not "A confirmation will be
  sent to you."
- **Write short sentences for key points.** Aim for an average of 15 words; maximum 25.
  Vary length for rhythm — short for impact, longer for explanation.
- **Use plain words.** "Use" not "utilise". "Help" not "facilitate". "End" not "terminate".
- **Every sentence must justify itself.** If it doesn't move the user forward, cut it.
- **Be specific.** Vague copy erodes trust. If you can name a number, a date, or a next step — do it.
- **Read it aloud.** If you stumble, rewrite.
- **Aim for Grade 8 readability or lower.** Grade 3–4 is best for general public audiences.
  Use the bundled `scripts/check_readability.py` (or Hemingway Editor) to verify.

### Never
- Use filler openers: "Please note that…", "Kindly be informed…", "It goes without saying…"
- Use unproven superlatives: "world-class", "best-in-class", "seamless", "revolutionary"
- Use passive voice to dodge accountability: "Your application could not be processed" →
  say why and what to do instead
- Use jargon without defining it first
- Use slashes, ampersands (&), or parenthetical plurals like (s) in body copy
- Open with a question unless it's genuinely useful to the user

---

## Avoiding AI-sounding patterns

Copy can pass every rule above and still read as AI-generated. These patterns are the specific
tells. Watch for them on top of everything else.

- **No em dashes (—), ever.** The single biggest tell. Rewrite as two sentences, or use a
  comma, colon, or parenthesis.
  - ❌ "Submit your form — we'll review it within 3 days."
  - ✅ "Submit your form. We'll review it within 3 days."
- **No buzzword inflation.** Words that assert quality instead of describing what happens:
  "seamless", "effortless", "empower", "elevate", "unlock", "streamlined", "leverage", "robust",
  "intuitive", "cutting-edge", "game-changing".
  - ❌ "Unlock a seamless way to manage your projects."
  - ✅ "Manage your projects in one place."
- **No "not just X, it's Y" framing.** Marketing cadence that says nothing concrete.
  - ❌ "This isn't just a form — it's your gateway to faster approvals."
  - ✅ "Fill out this form to apply for faster approvals."
- **No triadic padding.** Don't tack on a third adjective just to complete a rule-of-three
  if it isn't doing real work.
  - ❌ "Fast, easy, and reliable."
  - ✅ "Takes under 2 minutes." (name the one specific thing that's actually true)
- **No hollow enthusiasm.** Naming a feeling instead of a benefit.
  - ❌ "We're excited to bring you a better way to track your applications!"
  - ✅ "Track all your applications in one place."
- **Vary sentence rhythm.** Don't make every sentence the same length and shape. Uniform,
  balanced clauses read as generated rather than written. Mix short and long deliberately.

If a draft could have come straight out of a generic AI tool with no further editing, rewrite
it. Specificity and irregularity are the antidotes: say the one true, useful thing instead of
three vague ones.

---

## Component-level guidance

### Buttons and CTAs
- Verb-first, outcome-clear: "Save draft", "View report", "Submit application"
- No full stops. No ampersands.
- Sentence case.
- Aim for under 24 characters. Never wrap across two lines.

### Error messages
Structure: What happened + Why (if known) + What to do next. Never blame the user.
- ✅ "Payment declined. Your card was rejected by your bank. Try a different card or contact
  your bank."
- ❌ "Invalid input. Please try again."

### Empty states
Structure: What this is + Why it's empty + How to start.
- ✅ "No projects yet. Create your first project to start collaborating." (first-time)
- ✅ "Your request is being reviewed. We'll notify you once there's an update." (waiting)
- Don't just say "nothing here yet" — tell users what they'll get when they act.

### Tooltips
- One sentence. If it needs more, the UI has a design problem.
- Under 80 characters.

### Push notifications
- Title: under 50 characters
- Body: under 100 characters
- Lead with what changed or what's needed — not with the app name

### Toast messages
- Under 60 characters. One idea only. No CTA unless the action is undoable ("Undo").

### Form labels and helper text
- Labels: noun phrases, no trailing colon
- Helper text: one line explaining format or why it's needed — not a repeat of the label

### Confirmation dialogs
- Make the action clear: "Delete 3 files?" not "Are you sure?"
- Describe consequences: "This can't be undone."
- Label buttons with the action: "Delete files" / "Keep files" — not "OK" / "Cancel"

### Loading states
- Set expectations and reduce anxiety. Tell users what's happening, not just that something is.

---

## Review mode — what to check

Work through these in order. Quote the original, name the issue, give the fix.

1. **Readability** — Any sentences over 25 words? Unnecessarily complex words? Aim for Grade 8
   or below. Run `scripts/check_readability.py` to confirm.
2. **Voice** — Trustworthy, conversational, inclusive? Does it sound human?
3. **AI-sounding patterns** — Em dashes, buzzwords, "not just X, it's Y", triadic padding,
   hollow enthusiasm, uniform sentence rhythm? See "Avoiding AI-sounding patterns" above.
4. **Frontloading** — Does the most important information come first?
5. **Active voice** — Is the subject doing the action, or buried in passive construction?
6. **Component rules** — Do buttons, errors, tooltips, empty states, and notifications follow
   the patterns above? Check character limits.
7. **Vocabulary** — If a content guidelines connector is available, check approved terms.
   If not, flag any ambiguous product-specific terms and ask the user to confirm.
8. **Grammar and style** — Check all rules below (and any product-specific overrides from
   connected guidelines).
9. **Inclusivity** — Have all affected user groups been considered? Does any phrasing assume
   a default user that excludes others? Is the reading level accessible? Would it work via a
   screen reader or assistive technology?

If the LifeSG/GovTech layer is active, continue with checks 10–13 in `lifesg-overrides.md`.

---

## Grammar and style rules

These are sensible defaults. If the product's connected guidelines specify different rules
(e.g. American spelling, title case for CTAs), those take precedence. If the LifeSG/GovTech
layer is active, its overrides take precedence over these.

### Language

- **Sentence case** everywhere. Only proper nouns and the first word of a sentence get
  initial caps — unless brand guidelines say otherwise.
- **Spelling and locale** — use whatever is standard for the product's primary audience.
  If unspecified, default to the locale indicated by the product's market. When in doubt, ask.
- **Contractions are encouraged** — "you're", "we'll", "don't" — they sound human.
  Use them unless the context is very formal (e.g. legal declarations).
- **Active voice by default.** Passive is acceptable when the actor is unknown or irrelevant.
  - ✅ "We'll send you a confirmation."
  - ❌ "A confirmation will be sent to you."
- **Abbreviations** — spell out in full on first mention, then abbreviate.
- **No (s) for plurals** — write it out.
  - ✅ "one or more documents" ❌ "document(s)"
- **Avoid slashes** — rewrite around them.
  - ✅ "citizens and permanent residents" ❌ "citizens/PRs"
- **Pronouns** — use "you" for the user, "we" for the product or brand, "they/them" as the
  gender-neutral singular pronoun.

### Punctuation

- **Oxford comma** — always use it in lists of three or more.
  - ✅ "your name, email, and date of birth"
- **Ampersands** — write "and", not "&", in body copy. Abbreviations (e.g. "T&Cs") are fine.
- **Exclamation marks** — use sparingly. One per screen at most, only for genuinely positive moments.
- **Full stops** — do not use in standalone headings or button labels. Use in body copy and
  multi-sentence fields.
- **Hyphens vs dashes**
  - Hyphen (-): compound adjectives ("step-by-step guide")
  - En dash (–): ranges ("9am–5pm")
  - **No em dashes (—).** Rewrite as two sentences, or use a comma, colon, or parenthesis
    instead. Em dashes are one of the strongest tells of AI-generated writing. See
    "Avoiding AI-sounding patterns" below.

### Formatting (defaults — override with product locale)

- **Dates** — write the month in full; avoid ambiguous numeric formats. E.g. "1 January 2024"
  or "January 1, 2024" depending on locale.
- **Time** — 12-hour clock followed by `am` or `pm` in lowercase, no space. Use a colon to separate hours and minutes — not a dot. No leading zero for single-digit hours. Omit minutes when they don't apply in running text. E.g. "9:15pm", "8:30am", "4pm" (not "4:00pm" in running text).
- **Numbers** — spell out one to nine; use numerals for 10 and above. Always use numerals for
  currency, dates, and percentages.
- **Lists** — use bullet points for unordered items; numbered lists for sequential steps.
  Start each item with a capital letter; use full stops only if items are full sentences.

---

## Vocabulary — approved terms

**If a content guidelines connector is available:** query it for the product's approved term
list before writing or reviewing. Use the connector's vocabulary as the source of truth.

**If no connector is available:** flag any product-specific terms (product names, feature labels,
legal terms) and ask the user to confirm the correct form before finalising. Don't guess.

### Universal vocabulary rules (apply always)

| Principle | Rule |
| --- | --- |
| Product names | Always match the official casing exactly. If unsure, ask. |
| Login vs log in | "Log in" (verb), "login" (noun/adjective) |
| Sign in vs log in | Use whichever the product standardises. Be consistent. |
| OK vs Okay | Use "OK" in UI copy |
| Email | One word, no hyphen |
| Username | One word |
| Set up vs setup | "Set up" (verb), "setup" (noun/adjective) |

---

## Inclusivity checks

Run these on every output — in Write mode before you finalise, in Review mode as step 8.

- Have I considered all users this feature affects, including edge cases and minority groups?
- Does any phrasing assume a "default" user that excludes others?
- Is the reading level accessible across the target audience's literacy range?
- Could this be understood via a screen reader or assistive technology?
- Does the copy work for users in different situations (mobile, low connectivity, stressed)?
