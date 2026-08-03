// Fetched from the live, seeded backend (GET /api/v1/method/patterns/trie and
// /problems) — this is the same content already served by the API, migrated here
// as a typed frontend-static constant per the content-layer decision.
import { Pattern, PatternProblemRef } from './types';

export const TRIE: Pattern = {
  slug: 'trie',
  name: 'Trie (Prefix Tree)',
  category: 'DESIGN',
  intuition: 'A tree where each path from the root spells out a prefix, and shared prefixes share the same path — like an index in the back of a book organized so every word sharing a common prefix branches off from the same node, letting you check or search a whole family of words as fast as one.',
  recognitionTriggers: [
    'implement autocomplete',
    'word search with a dictionary',
    'longest common prefix among many strings',
    'prefix matching at scale'
  ],
  antiTriggers: [
    'only a handful of strings are involved (a simple hashset/list beats the overhead of building a trie)',
    'no prefix relationship matters, only exact matches'
  ],
  javaTemplate: 'class TrieNode {\n    TrieNode[] children = new TrieNode[26];\n    boolean isEndOfWord;\n}\nvoid insert(TrieNode root, String word) {\n    TrieNode node = root;\n    for (char c : word.toCharArray()) {\n        int idx = c - \'a\';\n        if (node.children[idx] == null) node.children[idx] = new TrieNode();\n        node = node.children[idx];\n    }\n    node.isEndOfWord = true;\n}',
  timeComplexity: 'O(L) per insert/search, where L is the word\'s length — independent of how many other words are stored',
  spaceComplexity: 'O(total characters across all inserted words), worst case O(N * L * alphabet size)',
  whyComplexityIsNotObvious: 'It\'s counter-intuitive that searching among a million words costs the same O(L) as searching among ten — the trick is that the cost is proportional to the query word\'s length, not the dictionary size, because shared prefixes are only ever stored and traversed once.',
  commonMistakes: [
    'Using a HashMap<Character, TrieNode> for children when a fixed-size array is faster and simpler for a known alphabet',
    'Forgetting the isEndOfWord flag, so \'contains prefix\' and \'contains full word\' get conflated',
    'Not handling case sensitivity or non-lowercase characters consistently'
  ],
  edgeCaseChecklist: [
    'empty string insert/search',
    'single character words',
    'one word being a prefix of another',
    'searching for a prefix that exists but isn\'t a complete word'
  ],
  variants: 'Standard word trie with array children; trie with wildcard search support (DFS branching on a wildcard character); compressed trie (radix tree) for memory efficiency; trie augmented with counts for autocomplete ranking.',
  interviewFollowUps: [
    'How would you support wildcard search (e.g. \'.\' matches any character)?',
    'How would you reduce memory usage for a trie storing a huge, sparse dictionary?',
    'How would you rank autocomplete suggestions by frequency instead of just returning all matches?'
  ],
  relatedPatterns: [
    'hashing-frequency',
    'recursion-backtracking'
  ],
  difficultyToLearn: 3,
  frequencyScore: 3
};

export const TRIE_PROBLEMS: PatternProblemRef[] = [
  {
    leetcodeId: '208',
    title: 'Implement Trie (Prefix Tree)',
    url: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    difficulty: 'Medium',
    role: 'INTRO',
    orderIndex: 1
  },
  {
    leetcodeId: '211',
    title: 'Design Add and Search Words Data Structure',
    url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/',
    difficulty: 'Medium',
    role: 'CORE',
    orderIndex: 2
  },
  {
    leetcodeId: '212',
    title: 'Word Search II',
    url: 'https://leetcode.com/problems/word-search-ii/',
    difficulty: 'Hard',
    role: 'HARD',
    orderIndex: 3
  },
];
