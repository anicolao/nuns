import type {Kind} from './catalog';
export const scenarios: {id:string; name:string; kind:Kind; hint:string; private:boolean}[] = [
 {id:'novice',name:'Control a novice',kind:'board',hint:'Choose among the same illustrated movement cards as the card bench, then Plan route, tap adjacent spaces, Undo a step, and commit. The public table receives only the revealed speed and sightings.',private:true},
 {id:'hearing',name:'Guard hears a noise',kind:'board',hint:'Listen with the Abbess, then Resolve hearing: fixture result 6, walking novice modifier −1. A directional bell appears beside the Abbess, without exposing the hidden source. Move toward the clue.',private:false},
 {id:'sight',name:'Guard spots a novice',kind:'board',hint:'Move the Abbess from 18 to 19. Her production turn-and-step reveals Celeste at 20. Continue onto her space to capture.',private:false},
 {id:'capture',name:'Catch a novice on the map',kind:'board',hint:'Move the Abbess from 18 onto Celeste at 19. Capture resolves automatically. Her Walk, key retention and wish loss come from the same game reducer; the guard may finish her remaining steps.',private:false},
 {id:'false-noise',name:'Use False Noise on the map',kind:'board',hint:'Open the blessing on the private phone, select a direction beside the Abbess, then confirm or cancel. The public clue looks like any noise. Use Next hearing phase to review delayed reveal. Targets and delayed reveal follow the transcribed blessing. This scenario uses the live game surface and reducer.',private:true},
 {id:'movement',name:'Choose movement',kind:'movement',hint:'Tap one of the four movement cards, then Undo. Only one card stays selected.',private:true},
 {id:'wish',name:'Reveal / conceal wish',kind:'wish',hint:'Turn the card over, replay the flip, then conceal it again.',private:true},
 {id:'blessing',name:'Turn a blessing',kind:'blessing',hint:'Turn the card and check both text wells at rest.',private:true},
 {id:'patrol',name:'Turn a patrol card',kind:'patrol',hint:'Turn the route card; check minimap and text after it settles.',private:false},
 {id:'collection',name:'Collect key and medicine',kind:'key',hint:'Try medicine first to review rejection. Collect the key, then medicine; Undo each action.',private:true},
 {id:'caught',name:'Caught and return',kind:'status',hint:'Use Simulate capture in the lab controls. The status updates automatically: Walk, medicine returned, key retained. Reset to repeat.',private:true},
 {id:'guard',name:'Move the Abbess',kind:'board',hint:'Tap a lit destination or drag the Abbess there. Tap her to turn; use the on-map Undo.',private:false},
 {id:'die',name:'Roll noise die',kind:'die',hint:'Tap the actual die to roll. Replay or scrub the resulting face change.',private:false}
];
export const findScenario=(id:string)=>scenarios.find(s=>s.id===id)??scenarios[0];
export const surfaces = [
 {id:'phone',name:'Phone · portrait',width:390,height:844},
 {id:'phone-landscape',name:'Phone · landscape',width:844,height:390},
 {id:'tablet',name:'Tablet',width:820,height:1180},
 {id:'laptop',name:'Laptop',width:1440,height:900},
 {id:'tabletop',name:'Tabletop · 55 inch',width:1920,height:1080}
];
