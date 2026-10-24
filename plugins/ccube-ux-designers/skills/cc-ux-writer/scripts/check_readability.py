#!/usr/bin/env python3
"""
check_readability.py — Flesch-Kincaid grade-level checker for ccube-ux-writer.

Computes Flesch Reading Ease and Flesch-Kincaid Grade Level, flags sentences over the
25-word maximum, and reports against the target shared by both the universal and
LifeSG/GovTech rule sets: Grade 8 or lower (Grade 3-4 best for general-public content),
average sentence length 15 words.

Pure standard library — no install required.

Usage:
    python3 check_readability.py "Your copy here."
    python3 check_readability.py --file path/to/copy.txt
    echo "Your copy here." | python3 check_readability.py
"""

import argparse
import re
import sys


def count_syllables(word: str) -> int:
    """Heuristic vowel-group syllable counter with common silent-e/ed/es adjustments."""
    word = word.lower().strip()
    word = re.sub(r"[^a-z]", "", word)
    if not word:
        return 0
    if len(word) <= 3:
        return 1

    word = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", word)
    word = re.sub(r"^y", "", word)
    groups = re.findall(r"[aeiouy]+", word)
    return max(len(groups), 1)


def split_sentences(text: str):
    text = text.strip()
    if not text:
        return []
    raw = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in raw if s.strip()]


def split_words(sentence: str):
    return re.findall(r"[A-Za-z']+", sentence)


def analyse(text: str):
    sentences = split_sentences(text)
    if not sentences:
        return None

    sentence_stats = []
    total_words = 0
    total_syllables = 0

    for s in sentences:
        words = split_words(s)
        word_count = len(words)
        syllables = sum(count_syllables(w) for w in words)
        total_words += word_count
        total_syllables += syllables
        sentence_stats.append({
            "text": s,
            "word_count": word_count,
            "over_25": word_count > 25,
        })

    sentence_count = len(sentences)
    avg_sentence_len = total_words / sentence_count if sentence_count else 0
    avg_syllables_per_word = total_syllables / total_words if total_words else 0

    reading_ease = 206.835 - 1.015 * avg_sentence_len - 84.6 * avg_syllables_per_word
    grade_level = 0.39 * avg_sentence_len + 11.8 * avg_syllables_per_word - 15.59

    return {
        "sentence_count": sentence_count,
        "word_count": total_words,
        "avg_sentence_len": avg_sentence_len,
        "reading_ease": reading_ease,
        "grade_level": grade_level,
        "sentences": sentence_stats,
    }


def verdict(grade_level: float) -> str:
    if grade_level <= 4:
        return "Grade 3-4 \u2014 best for general public content."
    if grade_level <= 8:
        return "Grade 8 or below \u2014 meets the shared target."
    return "Above Grade 8 \u2014 rewrite with shorter sentences and plainer words."


def main():
    parser = argparse.ArgumentParser(
        description="Check UX copy against the ccube-ux-writer readability target."
    )
    parser.add_argument("text", nargs="?", help="Copy to check (or use --file, or pipe via stdin)")
    parser.add_argument("--file", "-f", help="Path to a text file to check")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        text = sys.stdin.read()

    result = analyse(text)
    if result is None:
        print("No sentences found.")
        sys.exit(1)

    print(f"Sentences: {result['sentence_count']}")
    print(f"Words: {result['word_count']}")
    print(f"Average sentence length: {result['avg_sentence_len']:.1f} words (target: avg 15, max 25)")
    print(f"Flesch Reading Ease: {result['reading_ease']:.1f}")
    print(f"Flesch-Kincaid Grade Level: {result['grade_level']:.1f}")
    print(f"Verdict: {verdict(result['grade_level'])}")

    overlong = [s for s in result["sentences"] if s["over_25"]]
    if overlong:
        print(f"\n{len(overlong)} sentence(s) over the 25-word maximum:")
        for s in overlong:
            print(f"  ({s['word_count']} words) {s['text']}")


if __name__ == "__main__":
    main()
