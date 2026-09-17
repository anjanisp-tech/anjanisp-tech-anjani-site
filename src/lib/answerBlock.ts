/**
 * THE ANSWER BLOCK, ported to anjanipandey.com 2026-09-18.
 *
 * The content engine's rule 4.9 (added 2026-09-15) makes every long piece open
 * with the one question it answers, then a 40 to 60 word answer that stands on
 * its own when it is quoted with nothing around it. metmov.com already lifts
 * that visible pair into a one-item FAQPage. This is the same thing for the
 * personal site, which had a BlogPosting block and no question-answer markup at
 * all.
 *
 * FAQ RICH RESULTS ARE GONE FROM GOOGLE SEARCH (2026-05-07). This is not
 * chasing a SERP feature. It is grounding for ChatGPT, Perplexity and Gemini,
 * which pick one source and cite it.
 *
 * THE MARKUP IS BUILT FROM THE VISIBLE TEXT AND FROM NOTHING ELSE, the same
 * contract metmov.com keeps, so the page and the markup can never drift apart.
 * A post with no question line gets no block and no change of any kind.
 *
 * DIFFERENCE FROM THE METMOV VERSION. metmov posts carry a separate `intro`
 * field, so its splitter reads one field and splits on the first newline. Here
 * the answer block sits at the top of `content`, which is markdown, so this
 * splitter works in paragraphs and first steps over any leading heading or
 * image line the body may open with.
 */

export interface AnswerBlock {
  question: string;
  answer: string;
}

/** A markdown line that is not prose: a heading, an image, a rule, a quote. */
const isFurniture = (line: string): boolean =>
  /^\s*(#{1,6}\s|!\[|>\s|-{3,}\s*$|\*{3,}\s*$)/.test(line);

/**
 * Pull the answer block out of a markdown body.
 *
 * Returns undefined unless the first two prose paragraphs are, in order, a
 * short question and a non-empty answer. Everything else is an ordinary post.
 */
export function extractAnswerBlock(content?: string): AnswerBlock | undefined {
  if (!content) return undefined;

  const paras = content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split('\n')
        .filter((line) => !isFurniture(line))
        .join(' ')
        .trim(),
    )
    .filter(Boolean);

  if (paras.length < 2) return undefined;

  // Strip the emphasis markers markdown uses, so the markup carries the words
  // the reader sees rather than the asterisks the author typed.
  const plain = (s: string) => s.replace(/[*_`]/g, '').trim();

  const question = plain(paras[0]);
  const answer = plain(paras[1]);

  if (!question.endsWith('?') || question.length > 120) return undefined;
  if (!answer || answer.length < 40) return undefined;

  return { question, answer };
}

export function answerFaqSchema(url: string, block: AnswerBlock) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#answer`,
    mainEntity: [
      {
        '@type': 'Question',
        name: block.question,
        acceptedAnswer: { '@type': 'Answer', text: block.answer },
      },
    ],
  };
}
