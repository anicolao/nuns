import type {Kind} from './catalog';
export const scenarios: {id:string; name:string; kind:Kind; hint:string; private:boolean}[] = [
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
