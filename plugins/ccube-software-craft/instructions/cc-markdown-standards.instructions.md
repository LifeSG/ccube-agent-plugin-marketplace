---
description: >-
  Markdown formatting rules: 80-character hard line wrap, heading
  hierarchy (no H1), fenced code blocks with language tags, table
  alignment, and YAML front matter conventions. Apply whenever creating
  or editing any .md or markdown file.
applyTo: "**/*.md"
---

# Markdown Formatting Standards

---

## Content Rules

1. **Headings**: Use appropriate heading levels (H2, H3, etc.) to
   structure content. Do not use H1 — it is generated from the title.
2. **Lists**: Use bullet points or numbered lists. Ensure proper
   indentation and spacing.
3. **Code Blocks**: Use fenced code blocks for all code snippets.
   Specify the language for syntax highlighting.
4. **Links**: Use proper markdown syntax. Ensure links are valid and
   accessible.
5. **Images**: Use proper markdown syntax. Include descriptive alt text
   for accessibility.
6. **Tables**: Use markdown tables for tabular data. Ensure proper
   formatting and alignment.
7. **Line Length**: Wrap all prose, list items, blockquotes, and heading
   text at 80 characters by inserting a hard newline before the 80th
   character. Code blocks, bare URLs, and table cell content are exempt.
8. **Whitespace**: Use blank lines to separate sections and improve
   readability. Avoid excessive whitespace.
9. **Front Matter**: Include YAML front matter at the beginning of the
   file with required metadata fields where applicable.

---

## Formatting and Structure

- **Headings**: Use `##` for H2 and `###` for H3. Use headings
  hierarchically. Recommend restructuring if content uses H4; strongly
  recommend for H5.
- **Lists**: Use `-` for bullet points and `1.` for numbered lists.
  Indent nested lists with two spaces.
- **Code Blocks**: Use triple backticks to create fenced code blocks.
  Specify the language after the opening backticks
  (e.g., ` ```typescript `).
- **Links**: Use `[link text](URL)`. Ensure link text is descriptive
  and the URL is valid.
- **Images**: Use `![alt text](image URL)`. Include a brief description
  of the image in the alt text.
- **Tables**: Use `|` to create tables. Ensure columns are properly
  aligned and headers are included.
- **Line Length**: Hard-wrap all prose, list items, blockquotes, and
  heading text at 80 characters. Insert a newline before the 80th
  character. Code blocks, bare URLs, and table pipes are exempt.
- **Whitespace**: Use blank lines to separate sections. Avoid excessive
  whitespace.
