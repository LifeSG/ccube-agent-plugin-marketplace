# Writing rules — LifeSG / GovTech overrides

The Singapore Government delta from `writing-rules.md`. Load this alongside the universal rules
whenever the product is LifeSG, OneService, MyLegacy, or any other SG government digital
service (see "Detect the product context" in `SKILL.md` for the trigger conditions). Where a
rule here conflicts with `writing-rules.md`, **this file takes precedence**.

Source of truth: [LifeSG Consolidated Content Guidelines](https://dcubeux.gitbook.io/lifesg-consolidated-content-guidelines)

## Contents

1. [Voice and tone](#voice-and-tone--lifesg)
2. [Writing rules](#writing-rules--lifesg-overrides)
3. [Contractions — override](#contractions--override)
4. [Numbers — override](#numbers--override)
5. [Time — override](#time--override)
6. [Dates — override](#dates--override)
7. [Pronouns](#pronouns--lifesg-specific-rules)
8. [Capitalisation](#capitalisation--lifesg-specific-rules)
9. [Buttons and actions](#buttons-and-actions--lifesg-overrides)
10. [Error messages](#error-messages--lifesg-override)
11. [Alerts and confirmation dialogs](#alerts-and-confirmation-dialogs--lifesg-override)
12. [Push notifications](#push-notifications--lifesg-override)
13. [Empty states](#empty-states--lifesg-extensions)
14. [Full stops](#full-stops--lifesg-specific-rule)
15. [Links](#links--lifesg-specific-rules)
16. [Vocabulary — approved LifeSG terms](#vocabulary--approved-lifesg-terms)
17. [Translations](#translations--lifesg-specific-guidance)
18. [Inclusivity](#inclusivity--lifesg-specific-additions)
19. [Review mode — additional checks](#review-mode--additional-checks-for-lifesg)
20. [Content types — LifeSG-specific structures](#content-types--lifesg-specific-structures)

---

## Voice and tone — LifeSG

Voice is the same three principles as the universal rules (trustworthy, conversational,
inclusive), with these additions:

- Be upfront about eligibility criteria, declarations, and clauses — tell users early
- Use humour only when it is appropriate and natural; never go out of the way to make a joke
- Never use `we` to refer to the Singapore Government — LifeSG can only speak for itself or
  its agency stakeholders
- If an action is taken by a different agency (e.g. ICA sends the notification, not LifeSG),
  name that agency explicitly rather than using `we`

### Tone by content type (LifeSG-specific additions)

| Content type | Tone |
| --- | --- |
| Onboarding | Casual, enthusiastic |
| Transactional flow | Casual, matter-of-fact |
| Confirmation modal | Serious, matter-of-fact, respectful |
| Scheme / benefit descriptions | Plain, factual — inverted pyramid, lead with what the user gets |
| FAQs | Conversational, first-person (written from the user's perspective) |
| Maintenance alerts | Neutral, factual — no apologies |

---

## Writing rules — LifeSG overrides

### Readability target
- Aim for Grade 8 or lower. Grade 3–4 is best for general public content.
- When a scheme name is cumbersome, remove it when checking readability with
  `scripts/check_readability.py` — that's acceptable.

### Sentence length
- Average 15 words. Maximum 25 words.

---

## Contractions — override

**Replaces the universal contractions rule.**

Use simple positive contractions to sound human:
✅ you're, you'll, we're, we'll, I'll, it's

Avoid all of the following:

| Type | Examples | Reason |
| --- | --- | --- |
| Negative | shouldn't, can't, don't | Some users misread them |
| Conditional | should've, would've, could've | Harder to understand |
| Awkward | you'd, they'd, there'd | Not used in everyday conversation |

When you want to place extra weight on a negative — e.g. a user cannot take an action —
write it out in full:
- ✅ "You will not be able to submit the form."
- ❌ "You won't be able to submit the form."

---

## Numbers — override

**Replaces the universal numbers rule.**

Always write numbers as numerals (1, 2, 3), unless they are part of a figure of speech.

- ✅ "Upload up to 3 photos."
- ❌ "Upload up to three photos."
- ✅ "A picture is worth a thousand words." (figure of speech — spell out)
- ✅ "Use our third-party provider." (ordinal as adjective — spell out)

### Ordinal numbers
Spell out ordinals first to ninth. Use numerals for 10th and above.
- ✅ first, second, ninth | ✅ 10th, 23rd | ❌ 1st, 2nd, 9th

### Large numbers
Add a comma every 3rd digit from the right for amounts of 1,000 or more.
- ✅ 1,200 | ✅ 12,000 | ❌ 1200

### Money
- No space between $ and amount: $18.50
- No SGD country code unless comparing currencies
- Use $0.80 not 80¢
- Use 2 decimal places; omit cents in running text if they don't apply
  - ✅ "The fee is $18." | ❌ "The fee is $18.00."

### Percentages
Use the % symbol, not the word.
- ✅ 50% | ❌ 50 percent

### Phone numbers
Use spaces, no dashes, no country code unless for overseas users.
- ✅ 6354 8154 | ✅ 1800 356 8300 | ❌ 6354-8154

---

## Time — override

**Replaces the universal time formatting rule.**

- 12-hour clock followed by `am` or `pm` in lowercase, no space
- Use a colon to separate hours and minutes — no dot
- No leading zero for single-digit hours
- Remove minutes when they don't apply in running text

| ✅ Use | ❌ Avoid |
| --- | --- |
| 9:15pm | 09:15pm |
| 8:30pm | 8.30pm |
| 4pm | 4:00pm (in running text) |
| 1 hour 30 minutes | 1 hour 0 minutes |

In UI components, you may add minutes for emphasis (e.g. "Time remaining: 1 hour 0 minutes").

---

## Dates — override

**Replaces the universal dates rule.**

Format: `19 April 2022` — day, full month name, full year. No commas, no ordinals, no leading zeros.

| ✅ Use | ❌ Avoid |
| --- | --- |
| 19 April 2022 | April 19, 2022 |
| 3 April 2022 | 03 April 2022 |
| 19 Apr 2022 (space-constrained UI) | 19/04/2022 |

- Write the year in full: 2022, not 22
- Use `to` for date ranges in running text; en dash (–) is acceptable in UI components
- Include the day of the week when referencing a single specific date: Tuesday, 19 April 2022

---

## Pronouns — LifeSG-specific rules

**Extends the universal pronouns rule.**

### You
Default pronoun for addressing the user. Do not mix `you` and `my` in the same interface.

### I / My
Use `I` (first person) only in these specific contexts:

| Context | ✅ Use | ❌ Avoid |
| --- | --- | --- |
| Consent / T&C checkbox | I agree to the terms and conditions. | You agree to the terms and conditions. |
| Form options the user selects | I work at least 56 hours a month | You work at least 56 hours a month |
| FAQ questions | Can I use LifeSG to register my child's birth? | Can you use LifeSG to register your child's birth? |
| Navigation labels | — | My end-of-life plans (use "Your end-of-life plans") |

### We
Only use `we` when it is clear who `we` refers to (LifeSG or a named agency).
- **Never** use `we` to refer to the Singapore Government
- If a different agency acts (e.g. ICA sends the notification), name them explicitly

✅ "We've received your application. The Immigration & Checkpoints Authority (ICA) will notify
you when your child's birth certificate is ready."
❌ "We've received your application. We'll notify you when your child's birth certificate
is ready." (ambiguous — which `we`?)

### They
Use singular `they/their` as the gender-neutral pronoun — endorsed by Merriam-Webster and APA.
- ✅ "The trustee should be at least 18 years old. They should also…"
- ❌ "He or she should also…"

---

## Capitalisation — LifeSG-specific rules

- **Sentence case everywhere** — page names, headers, subheadings, buttons, nav labels
- **Title case only for proper nouns**: government scheme names, organisations, places, products,
  selected LifeSG services
- Do not capitalise after a colon unless it begins a full sentence or is a proper noun
- Do not capitalise entire words (reads as shouting; exception: badges/labels for wayfinding)

| ✅ Proper noun (title case) | ❌ Common noun (sentence case) |
| --- | --- |
| Baby Bonus | birth certificate |
| Family Support Calculator | government (as adjective) |
| Help Neighbour | citizen |
| Government (as proper noun: "the Government will…") | permanent resident |

---

## Buttons and actions — LifeSG overrides

**Extends the universal buttons rule.**

- Verb or verb+noun, sentence case, 4 words or fewer
- No full stops, no ampersands

### Approved button copy (use exactly as listed)

| Copy | Usage |
| --- | --- |
| Accept | Legal confirmation before continuing. If no legal confirmation needed, use OK. |
| Add | Bring something existing into the product. Use Create if from scratch. |
| Back | Return to previous screen. Secondary button from step 2 onwards in form wizards. |
| Cancel | Stop current action. Secondary button on step 1 of form wizards. |
| Clear / Clear selection | Remove all user input. |
| Close | Close a screen when user is viewing info only (not mid-edit). |
| Continue | Advance to next step when progress is not saved. |
| Done | User has made input but change is not yet saved. |
| Edit | Allow user to change data. |
| Enter | Ask user to input information. Do not use "type". |
| Log in | When product uses Singpass authentication. |
| Sign in | When product does not use Singpass. |
| OK | User acknowledges a message but cannot take further action. |
| Retrieve latest Myinfo data | Retrieve latest Singpass Myinfo data. |
| Save | Change is saved when button is selected. |
| Save and continue | Save inputs and advance to next step. |
| Select | Pick from a predefined list. Do not use "choose", "click", or "tap". |
| Show / Hide | Reveal or conceal content inline (e.g. accordions). |
| Sign out | Pair with Log in. |
| Log out | Pair with Sign in. |
| View | Go to a different page or section. Do not use "see" as a CTA. |

---

## Error messages — LifeSG override

**Extends the universal error message rule.**

### Attribute errors to the input, not the user

The user's data is never wrong — what they entered may be. Use "the" not "your" when
referring to the value in error.

| ✅ Use | ❌ Avoid |
| --- | --- |
| Invalid mobile number. Enter numbers only. | Your mobile number is invalid. |
| The NRIC number entered is invalid. | You entered an invalid NRIC number. |

### Use please and sorry sparingly
- Save `sorry` for serious errors or significant inconvenience — it becomes more sincere
- Use `please` only when the user has to go out of their way, or it is a sensitive situation
- Never use exclamation marks in error messages

### No full stop unless multiple sentences or other punctuation is present

### Approved error copy

| Field | Error |
| --- | --- |
| NRIC or FIN | Enter NRIC or FIN number / Invalid NRIC or FIN number. Try again. |
| Mobile number | Enter mobile number / Invalid mobile number. Try again. |
| Local mobile number | Enter local mobile number / Invalid local mobile number. Enter a Singapore mobile number that begins with 8 or 9. |
| Email address | Enter email address / Invalid email address. Try again. |
| Postal code | Enter a 6-digit Singapore postal code / Address not found. Check the postal code and try again. |

---

## Alerts and confirmation dialogs — LifeSG override

**Extends the universal confirmation dialogs rule.**

### Match the verb in the header to the destructive button

When asking a user to confirm a risky action, the verb in the header and the primary
(destructive) button must match. This removes ambiguity about what will happen.

| ✅ Use | ❌ Avoid |
| --- | --- |
| Header: "Leave and lose changes?" → Button: [Leave] | Header: "Confirm navigation" → Button: [Proceed] |

### Frame around the user, not the system
- ✅ "Continue with the form? You've been inactive for a while…"
- ❌ "Session expiring. Your session will expire in 2 minutes."

### Approved alert copy library

**Unsaved changes**

| Scenario | Copy |
| --- | --- |
| Changes will not be saved | **Leave and lose changes?** You have unsaved changes. If you leave this page, you will lose the changes you've made. [Leave] [Stay] |
| Changes lost + user logged out | **Leave and lose changes?** You have unsaved changes. If you leave this page, you'll be logged out and will lose the changes you've made. [Leave] [Stay] |

**Session timeout — form closed**

| Scenario | Copy |
| --- | --- |
| Session expiring | **Continue with the form?** You've been inactive for a while. Let us know if you wish to continue, or we'll close this form in X minutes YY seconds. You'll lose any unsaved changes. [Continue] |
| Session expired | **Your form has been closed.** It looks like you've left, so we closed the form to protect your privacy. [Back to service] |

**Session timeout — user logged out**

| Scenario | Copy |
| --- | --- |
| About to be signed out | **You're about to be signed out.** You've been inactive for a while. To protect your privacy, you'll be signed out in X minutes YY seconds. [Stay logged in] [Sign out now] |
| Signed out | **You've been signed out.** Looks like you've left, so we signed you out to keep your information safe. [Back to home] |

**Maintenance alerts**
- Format: **Maintenance alert**: [description] from [Day, Date, Time] to [Day, Date, Time].
- "Maintenance alert" in bold. No apology. Follow date/time formatting rules above.

---

## Push notifications — LifeSG override

**Replaces the universal push notification rule.**

| Constraint | Limit |
| --- | --- |
| Title | Max 30 characters (including spaces) |
| Message | Max 120 characters (including spaces) — anything longer is truncated in the LifeSG inbox |

- Frontload: put the most important word in the first 2 words of the title
- Personalise through relevant targeting — only send to users for whom it is relevant
- Use verbs for the CTA: "Book now", "Check balance", "Learn more"
- Max 1 emoji per notification; only if relevant; omit if unsure of cultural interpretation
- MINDEF stakeholders: do not use emojis

**SMS notifications**
- Max 1,000 characters
- No emojis, no special characters
- Keep short; modern SMS apps display over 160 chars as a single message

---

## Empty states — LifeSG extensions

**Extends the universal empty states rule.**

- Frame positively — empty states are not errors
- First-use: explain what the page is for and what the user will see once they act
- User-triggered: tell the user what they can do to get results

### Approved empty state copy

| Feature | Copy |
| --- | --- |
| Inbox (overall) | **Your inbox is empty.** Here's where you can find your messages and application updates for selected services. |
| Inbox (applications) | **No applications yet.** Here's where you can find application updates for selected services on LifeSG. |
| No results (filters) | **No results found.** Try changing or removing your filters to find what you're looking for. [Change filters] |
| No results (search + filters) | **No results found.** Try adjusting your search or filters to find what you're looking for. [Clear filters] |

---

## Full stops — LifeSG-specific rule

**Use full stops in:**
subheadings with body text, helper text for form fields, alert messages, body copy, toasts

**Do not use full stops in:**
headers, buttons, navigation menu items, form labels, copy alongside radio buttons or
checkboxes, error messages, placeholder copy, sentence fragments in lists

**Exception:** use a full stop even in the "do not use" list above if the item contains
multiple sentences or other punctuation (e.g. a comma).

---

## Links — LifeSG-specific rules

- Frontload the first 2 words — users scan these first
- Use verb phrases when the link starts a task: "Apply for subsidy", "Download form"
- Match link text to the page title it links to
- Never use raw URLs, "click here", "read more", "apply here", or arrow-only links (→)
- Longer and descriptive beats short and vague
- Do not link directly to file attachments without surrounding context

---

## Vocabulary — approved LifeSG terms

Use these exactly. Do not vary casing or spelling.

**For any Singapore government scheme or service name** (e.g. Baby Bonus, CPF LIFE, Family
Service Centre, Lasting Power of Attorney), check `resources/schemes-services-multilingual.csv`
first — it is the authoritative source for official English titles, abbreviations, category,
and administering agency, and is more comprehensive than the table below. Look up by term or by
its listed CSV Alias. Where the CSV and the table below overlap, the CSV wins. The table below
covers a small set of other high-frequency vocabulary not tied to a specific scheme/service.

| Term | Rule |
| --- | --- |
| LifeSG | Not: lifeSG, Lifesg |
| Singpass | Not: SingPass, singpass. Always "Log in with Singpass" not "Sign in" |
| Myinfo | Not: MyInfo, myinfo. Use when referring to Singpass Myinfo data retrieval |
| Baby Bonus | Proper noun, title case |
| Child Development Account (CDA) | Proper noun. Do not say "CDA account" — just "CDA" |
| Housing & Development Board (HDB) | Use "an HDB flat" not "a HDB flat" |
| OneService | Not: Oneservice |
| COVID-19 | Not: Covid-19, covid-19 |
| SkillsFuture Credit | Proper noun, title case |
| GST Voucher | Proper noun, title case |
| Pioneer Generation Package | Proper noun, title case |
| Merdeka Generation Package | Proper noun, title case |
| Family Support Calculator | Proper noun, title case |
| Help Neighbour | Proper noun, title case |
| NS55 credits | Not a proper noun — sentence case |
| gender | Do not use when collecting biological sex in forms. Use "sex" instead (MHA request) |
| sex | Use when collecting biological sex in forms |
| citizen | Sentence case. Only use if feature is for Singapore citizens specifically |
| resident | Use for citizens + PRs + long-term pass holders |
| Permanent Resident | Title case (ICA convention) |
| Government | Capital G when proper noun ("the Government will…"); lowercase as adjective ("government schemes") |
| gross monthly income | Not: total monthly income |
| Monthly household income | Not: gross household income |

### Government agency names — always check official form
Use the [Singapore Government Directory](https://www.sgdi.gov.sg/) to verify official names.
Note that some agencies use ampersands in their official names (HDB, ICA) — these are exceptions
to the general "spell out and" rule.

---

## Translations — LifeSG-specific guidance

LifeSG is partially translated into Chinese, Malay, and Tamil. When writing copy that may
be translated:

- Allow for text expansion — translated copy is often longer than English
- Frontload: if copy is truncated, the most important information survives
- Avoid idioms — they cannot be translated word for word
- Keep text separate from images
- Add text labels to icons (icons have different meanings across cultures)
- Do not combine UI elements with surrounding copy to form a sentence
- Naming convention for translation keys: `Feature_space_purpose`
  (e.g. `benefits_landingpage_header`, `deathcert_popupmodal_helpertext`)

### Scheme and service name glossary

For any Singapore government scheme or service name that needs a Malay, Chinese, or Tamil
rendering, check `resources/schemes-services-multilingual.csv` before writing or reviewing:

1. Look up the term by its English name or its listed CSV Alias.
2. If found with status `CSV-verified`, `Research-verified`, or `Research-verified (partial)`,
   use the listed translation for the language(s) available. For a "(partial)" entry, only the
   languages actually populated in the row are verified — treat any blank language cell as
   unsourced, not as "no translation needed".
3. If the term is not in the CSV, or its status is `Needs sourcing` or `No official
   translation found`, **do not invent a translation.** Tell the user no verified translation
   exists and ask them to confirm or supply one before finalising the copy.
4. For general UI vocabulary that isn't a named scheme or service, use
   [Government Terms Translated](https://www.translatedterms.gov.sg/) instead.

---

## Inclusivity — LifeSG-specific additions

- When writing about parents, consider all family structures: divorced, single, widowed,
  separated parents
- Use "disabled people" not "the disabled"; avoid medical labels for disabled people
- Avoid phrases like "suffers from" — prefer neutral or positive framing
- Avoid parenthetical plurals: child(ren), user(s) — write around them
- Do not use directional language in instructions (below, top right, bottom left) —
  it does not work for assistive devices or mobile users

---

## Review mode — additional checks for LifeSG

Run these after the standard universal review checklist (in `writing-rules.md`):

10. **LifeSG vocabulary** — check all product names, scheme names, and government agency
    names against the approved terms list above and, for scheme/service names specifically,
    against `resources/schemes-services-multilingual.csv`
11. **Pronoun consistency** — verify you/my are not mixed; I is used correctly for consent
    and FAQs; we does not refer to the Singapore Government
12. **Translations** — if copy will be localised, flag idioms, text that's embedded in
    images, and constructions that combine UI elements with surrounding copy. Check any
    scheme/service names against `resources/schemes-services-multilingual.csv` and flag any
    without a verified translation for the target language(s)
13. **Date / time / number formatting** — verify these follow LifeSG conventions (not the
    universal defaults)

---

## Content types — LifeSG-specific structures

### Scheme pages
1. Page title — noun, not verb; drop articles for concision; no agency name needed
2. Quick links — 1 to 3; short verb phrases or page titles
3. About the scheme — inverted pyramid: lead with what the user gets in 1 sentence
4. Who's eligible — broadest group first, then specifics, then exclusions
5. How to apply — 2 to 3 verb-led steps; max 3 bullet points per step
6. Getting help — AskGov FAQ, hotline, email

### Application / form pages
1. Header — name (verb-led) + short description
2. About this service — brief, for side navigation
3. Preparing for your application — documents and info needed before starting
4. Application process — 2 to 3 verb-led steps
5. Checking application status — processing time, notification channel, what to expect
6. Getting help — AskGov FAQ, hotline, email

### FAQs
- Phrase as a question from the user's perspective using `I`
- Answer in the first sentence
- Present tense unless referring to a past event
- Use `citizens` only if the feature is citizen-specific; otherwise `residents` or `the public`
- Categorise carefully; use -ing verb form for category names (e.g. "Applying for Baby Bonus")

### App release notes
- Max 500 characters (including spaces) — Android Play Store requirement
- Start with the most important update; new features before bug fixes
- Do not start with "What's new?" — iOS App Store adds this automatically
- Do not mention Android or iOS — leads to rejection
- Be specific about what changed; do not write "bug fixes and improvements"
- Plain language; do not copy from JIRA tickets
