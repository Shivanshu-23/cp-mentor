export interface ResourceRow {
  label: string;
  url?: string;
  useFor: string;
  necessity: string;
  approach: string;
}

export interface ResourceSection {
  title: string;
  icon: string;
  note?: string;
  rows: ResourceRow[];
}

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    title: 'DSA — Learn with Visuals & Animations',
    icon: 'movie',
    rows: [
      { label: 'visualgo.net', url: 'https://visualgo.net/en', useFor: 'Animated trees, graphs, sorting, DP — gold standard', necessity: 'Must-use', approach: 'Watch once, then re-implement the same structure yourself in Java' },
      { label: 'cs.usfca.edu/~galles/visualization', url: 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html', useFor: 'Step-by-step animation of nearly every core structure', necessity: 'High', approach: "Use when stuck on how an algorithm moves through data" },
      { label: 'visualizedsa.com', url: 'https://visualizedsa.com/', useFor: '30+ visualizations with Java/C++/Python/JS code shown side-by-side', necessity: 'High', approach: 'Read the animation, then read the Java code next to it' },
      { label: 'dsavisualizer.in', url: 'https://www.dsavisualizer.in/', useFor: 'Clean UI for stacks, queues, trees, graphs', necessity: 'Medium', approach: 'Good for quick revision before interviews' },
      { label: 'toptal.com/developers/sorting-algorithms', url: 'https://www.toptal.com/developers/sorting-algorithms', useFor: 'Compares all sorting algorithms on the same dataset', necessity: 'Medium', approach: 'Use to build intuition on time-complexity differences' },
      { label: 'opendsa-server.cs.vt.edu', url: 'https://opendsa-server.cs.vt.edu/', useFor: 'Full interactive textbook, used in real university courses', necessity: 'High', approach: 'Follow it like a course — has built-in practice exercises' },
      { label: 'log2base2.com', url: 'https://log2base2.com/', useFor: 'Visual learning + interview prep combined', necessity: 'Medium', approach: 'Use for topic-wise revision sheets' }
    ]
  },
  {
    title: 'DSA — Practice & Structured Sheets',
    icon: 'checklist',
    rows: [
      { label: 'neetcode.io', url: 'https://neetcode.io/', useFor: 'Curated "150" problems with video explanations', necessity: 'Must-use', approach: "Follow the roadmap order, don't jump around randomly" },
      { label: "takeuforward.org (Striver's A2Z Sheet)", url: 'https://takeuforward.org/', useFor: 'Free sheet — video + article per topic, Java-friendly', necessity: 'Must-use', approach: '1 topic at a time, solve every problem before moving on' },
      { label: 'leetcode.com', url: 'https://leetcode.com/', useFor: 'Practice + company-tagged questions (free tier)', necessity: 'High', approach: 'Use "Explore" cards for structured learning, not random solving' },
      { label: 'geeksforgeeks.org', url: 'https://www.geeksforgeeks.org/', useFor: 'Quick concept lookup, huge free article base', necessity: 'Medium', approach: 'Use as a dictionary, not a primary course' }
    ]
  },
  {
    title: 'Java — Core Language',
    icon: 'coffee',
    rows: [
      { label: 'docs.oracle.com/javase/tutorial', url: 'https://docs.oracle.com/javase/tutorial/', useFor: 'Official Java tutorials, accurate & authoritative', necessity: 'High', approach: 'Use for fundamentals and to resolve doubts with certainty' },
      { label: 'baeldung.com', url: 'https://www.baeldung.com/', useFor: 'Best free deep-dive articles on Java internals', necessity: 'Must-use', approach: 'Search "Baeldung + topic" whenever a concept feels shaky' },
      { label: 'Java Brains (YouTube)', url: 'https://www.youtube.com/results?search_query=Java+Brains', useFor: 'Clear video explanations of Java/Spring concepts', necessity: 'High', approach: 'Watch before reading docs — makes the docs easier to digest' }
    ]
  },
  {
    title: 'Spring / Spring Boot',
    icon: 'settings_suggest',
    rows: [
      { label: 'spring.io/guides', url: 'https://spring.io/guides', useFor: 'Official, always-current guides', necessity: 'Must-use', approach: 'Build the "Getting Started" guides hands-on, don\'t just read' },
      { label: 'baeldung.com/spring-boot', url: 'https://www.baeldung.com/spring-boot', useFor: 'Best free Spring Boot deep-dive resource', necessity: 'Must-use', approach: 'Use topic-by-topic alongside your own project' },
      { label: 'in28minutes (YouTube + free guides)', url: 'https://www.in28minutes.com/', useFor: 'Spring Boot & microservices from scratch', necessity: 'High', approach: 'Follow one full course end-to-end, then build your own variant' }
    ]
  },
  {
    title: 'Free Books (all on GitHub — legally free, no piracy)',
    icon: 'menu_book',
    rows: [
      { label: 'EbookFoundation/free-programming-books', url: 'https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-langs.md', useFor: 'The master list — Java, DSA, Spring, Spring Security PDFs/HTML', necessity: 'Must-bookmark', approach: 'Ctrl+F "Java"/"Spring", pick ONE book per topic' },
      { label: 'Spring Boot Reference Guide (linked inside the repo above)', useFor: 'Official docs-as-book from the Spring team', necessity: 'High', approach: 'Use as a lookup manual, not cover-to-cover' },
      { label: 'RbkGh/Free-Algorithm-Books', url: 'https://github.com/RbkGh/Free-Algorithm-Books', useFor: 'Full algorithm PDF books (e.g. Data Structures & Algorithmic Puzzles)', necessity: 'Medium', approach: 'One chapter → implement in Java → move to next' },
      { label: 'Think Java / Think Data Structures (Allen Downey) — inside the EbookFoundation repo', useFor: 'Beginner-friendly, CS-professor style intro', necessity: 'High for beginners', approach: "Read front-to-back once; it's short and free (CC-licensed)" }
    ]
  },
  {
    title: 'Interview Questions — Java & Spring Boot',
    icon: 'quiz',
    rows: [
      { label: 'in28minutes/spring-interview-guide', url: 'https://github.com/in28minutes/spring-interview-guide', useFor: '200+ Spring/Spring Boot/MVC Q&A', necessity: 'Must-use', approach: 'Go topic-wise, write your own one-line answer before checking theirs' },
      { label: 'altafjava/spring-interview-questions-answers', url: 'https://github.com/altafjava/spring-interview-questions-answers', useFor: 'Huge list — Spring Core, Boot, Security, MVC', necessity: 'High', approach: 'Use in final-month revision' },
      { label: 'anjitagargi/JavaSpringBoot_Interview_Questions', url: 'https://github.com/anjitagargi/JavaSpringBoot_Interview_Questions', useFor: 'Real interview-style Q&A with code snippets', necessity: 'High', approach: 'Practice explaining answers out loud, not just reading' },
      { label: 'github.com/topics/java-interview-questions', url: 'https://github.com/topics/java-interview-questions', useFor: 'Evergreen list, always updating', necessity: 'Medium', approach: 'Revisit monthly — new repos get added often' },
      { label: 'github.com/topics/spring-boot-interview-questions', url: 'https://github.com/topics/spring-boot-interview-questions', useFor: 'Same, but Spring Boot–specific', necessity: 'Medium', approach: 'Same as above' }
    ]
  },
  {
    title: 'LinkedIn — Strategic Use',
    icon: 'groups',
    note: "LinkedIn is a discovery layer (who's hiring, what's trending) — not your main learning source. Do the real learning from the visualizers, docs, and books above.",
    rows: [
      { label: "Follow target companies' pages", useFor: 'Real hiring signals, actual tech stack, referral posts', necessity: 'High', approach: 'Follow 5–10 target companies, comment genuinely on posts' },
      { label: 'Known Java/Spring educators (e.g. Javin Paul – Javarevisited, Ranga Karanam – in28minutes)', useFor: 'Practical tips, "what\'s new" updates', necessity: 'Medium-High', approach: 'Save useful posts to a doc, revisit before interviews' },
      { label: '#OpenToWork / #JavaDeveloper / #100DaysOfCode', useFor: 'Discover recruiter posts, peer accountability', necessity: 'Medium', approach: 'Post your own progress — visibility compounds over months' },
      { label: 'LinkedIn Learning (if free via library access)', useFor: 'Structured video courses', necessity: 'Low-Medium', approach: "Skip if you don't already have free access — YouTube covers the same ground" }
    ]
  }
];

export interface GamePlanStep {
  text: string;
  linkLabel?: string;
  linkUrl?: string;
}

export const GAME_PLAN: GamePlanStep[] = [
  { text: 'Order of topics: Arrays/Strings → Recursion → Sorting/Searching → Linked List → Stack/Queue → Trees → Graphs → Dynamic Programming.' },
  { text: 'For every topic: watch it animate (VisuAlgo) → read the theory (Baeldung/GfG) → solve problems (NeetCode/Striver\'s sheet) → re-implement the structure yourself in Java from scratch.' },
  { text: 'In parallel: build ONE real Spring Boot project (CRUD + database + REST APIs + exception handling). Companies want proof you can build things, not just solve puzzles.' },
  { text: 'Last month before interviews: grind the GitHub Q&A repos, revisit visualizers for weak topics, do mock interviews —', linkLabel: 'Pramp is a free option for peer mock interviews', linkUrl: 'https://www.pramp.com/' },
  { text: 'Ongoing: use LinkedIn to track openings and stay visible, not as a primary study tool.' }
];
