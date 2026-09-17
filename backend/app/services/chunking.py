import re

MIN_WORDS = 200
MAX_WORDS = 400


def split_into_chunks(markdown: str, min_words: int = MIN_WORDS, max_words: int = MAX_WORDS) -> list[str]:
    """Split lesson markdown into ~200-400 word chunks along paragraph/heading
    boundaries only -- never mid-sentence. Headings start a new chunk once the
    current one already has enough content."""
    blocks = [b.strip() for b in re.split(r"\n\s*\n", markdown) if b.strip()]

    chunks: list[str] = []
    current: list[str] = []
    current_words = 0

    for block in blocks:
        block_words = len(block.split())
        is_heading = block.startswith("#")

        should_flush = current and (
            (is_heading and current_words >= min_words)
            or (current_words + block_words > max_words and current_words >= min_words)
        )
        if should_flush:
            chunks.append("\n\n".join(current))
            current = []
            current_words = 0

        current.append(block)
        current_words += block_words

    if current:
        joined = "\n\n".join(current)
        if chunks and current_words < min_words // 2:
            chunks[-1] = chunks[-1] + "\n\n" + joined
        else:
            chunks.append(joined)

    return chunks
