// 31 hand-picked verses — one per day of the month — that match the tone of
// tryHimandsee ministries (encouragement, generosity, encounter with Christ).
const VERSES = [
  { text: 'Freely ye have received, freely give.', ref: 'Matthew 10:8' },
  { text: 'Whoever is generous to the poor lends to the Lord, and He will repay them for their deed.', ref: 'Proverbs 19:17' },
  { text: 'Taste and see that the Lord is good.', ref: 'Psalm 34:8' },
  { text: 'Draw near to God, and He will draw near to you.', ref: 'James 4:8' },
  { text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { text: 'For where two or three gather in my name, there am I with them.', ref: 'Matthew 18:20' },
  { text: 'God is love. Whoever lives in love lives in God, and God in them.', ref: '1 John 4:16' },
  { text: 'Cast your burden on the Lord, and He will sustain you.', ref: 'Psalm 55:22' },
  { text: 'And we know that in all things God works for the good of those who love Him.', ref: 'Romans 8:28' },
  { text: 'The Lord is near to all who call on Him, to all who call on Him in truth.', ref: 'Psalm 145:18' },
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5' },
  { text: 'I can do all things through Christ who strengthens me.', ref: 'Philippians 4:13' },
  { text: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.', ref: 'Matthew 5:16' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', ref: 'Joshua 1:9' },
  { text: 'The steadfast love of the Lord never ceases; His mercies never come to an end; they are new every morning.', ref: 'Lamentations 3:22-23' },
  { text: 'Come to me, all who labor and are heavy laden, and I will give you rest.', ref: 'Matthew 11:28' },
  { text: 'For God so loved the world, that He gave His only Son.', ref: 'John 3:16' },
  { text: 'My grace is sufficient for you, for my power is made perfect in weakness.', ref: '2 Corinthians 12:9' },
  { text: 'Delight yourself in the Lord, and He will give you the desires of your heart.', ref: 'Psalm 37:4' },
  { text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
  { text: 'Seek first the kingdom of God and His righteousness, and all these things will be added to you.', ref: 'Matthew 6:33' },
  { text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.', ref: 'Philippians 4:6' },
  { text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', ref: 'Jeremiah 29:11' },
  { text: 'The thief comes only to steal and kill and destroy; I came that they may have life and have it abundantly.', ref: 'John 10:10' },
  { text: 'Greater love has no one than this: to lay down one\u2019s life for one\u2019s friends.', ref: 'John 15:13' },
  { text: 'Above all, keep loving one another earnestly, since love covers a multitude of sins.', ref: '1 Peter 4:8' },
  { text: 'But seek first His kingdom and His righteousness, and all these things will be given to you as well.', ref: 'Matthew 6:33' },
  { text: 'Therefore encourage one another and build one another up, just as you are doing.', ref: '1 Thessalonians 5:11' },
  { text: 'Each of you should use whatever gift you have received to serve others.', ref: '1 Peter 4:10' },
  { text: 'The Lord will fight for you; you need only to be still.', ref: 'Exodus 14:14' },
  { text: 'Whoever sows generously will also reap generously.', ref: '2 Corinthians 9:6' },
];

// Returns a deterministic verse based on the calendar day (UTC).
export const getVerseOfTheDay = () => {
  const day = new Date().getUTCDate(); // 1-31
  return VERSES[(day - 1) % VERSES.length];
};
