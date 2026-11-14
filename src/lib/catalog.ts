export type Style = 'moonlit';
export type Kind = 'board' | 'novices' | 'guards' | 'movement' | 'wish' | 'blessing' | 'patrol' | 'backs' | 'tokens' | 'status' | 'track' | 'die' | 'log' | 'key';
export const styles = {
 moonlit: { name: 'Moonlit Storybook', label: '01', description: 'A little mischief after midnight.', detail: 'Painted gouache, expressive die-cut characters, and pools of candlelight. Warm, theatrical, and easy to read from across the table.', colors: ['#243c51','#77969b','#dcaa64','#e7d6b4','#b8694d'] },
};
export const catalog: { id: Kind; name: string; category: string; note: string; privacy: string }[] = [
 {id:'board',name:'The abbey',category:'Board',note:'Original 2010 board: 155 numbered dots, source connections, barriers, keys, locks and colored patrols.',privacy:'Public'},
 {id:'novices',name:'Six novices',category:'Pieces',note:'Six named, numbered silhouettes. Identity survives colour loss and small sizes.',privacy:'Visible only when spotted; cell placeholders otherwise'},
 {id:'guards',name:'Abbess & Prioress',category:'Pieces',note:'Distinct profiles and an explicit facing arrow for the sight arc.',privacy:'Public'},
 {id:'movement',name:'Movement cards',category:'Cards',note:'Four individually illustrated novice speeds, with distance and noise modifiers. Public after reveal.',privacy:'Private selection → public reveal'},
 {id:'wish',name:'Secret Wish',category:'Cards',note:'Sample objective: Chapel key 5, medicine at Pharmacy 121, then home.',privacy:'Private phone'},
 {id:'blessing',name:'Blessing',category:'Cards',note:'Extra Move blessing: move one extra dot, then discard. Card presentation only; effect resolution remains future work.',privacy:'Private until the card’s specified reveal'},
 {id:'patrol',name:'Guard patrol',category:'Cards',note:'Original blue patrol: Pharmacy 122 to Garden Gate 84, shown on the actual board minimap. All 14 colored patrols are in the manifest.',privacy:'Public'},
 {id:'backs',name:'Card backs',category:'Cards',note:'One generated Moonlit reverse study. Distinct family reverses remain future asset work.',privacy:'Public backs / private faces'},
 {id:'tokens',name:'Noise & vanished',category:'Tokens',note:'Directional sounds and last-seen exits. These marks never identify a hidden endpoint.',privacy:'Public clues'},
 {id:'status',name:'Novice status',category:'Tokens',note:'On the run and caught faces use words, symbols and distinct shapes.',privacy:'Public'},
 {id:'track',name:'Night & captures',category:'Tokens',note:'Separate round and capture indicators. Fifteen rounds; capture target depends on total players.',privacy:'Public'},
 {id:'die',name:'Noise die',category:'Tokens',note:'Rounded ruby die reused from Istanbul’s Can’t Stop-derived renderer. Preview all six faces; no game roll is resolved.',privacy:'Public result'},
 {id:'log',name:'Private movement log',category:'Player aids',note:'Route and collection history stays on its owner’s device. All entries here are fixtures.',privacy:'Private phone'},
 {id:'key',name:'Keys & medicine',category:'Player aids',note:'Private progress markers for a sample wish. Keys persist after capture; the item does not.',privacy:'Private phone'}
];
