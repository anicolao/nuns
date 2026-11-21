/** Normalized source coordinates measured against the 320 × 484 painted body. */
export const cardWells={
 title:{left:0.19,top:0.052,width:0.62,height:0.112},
 illustration:{left:0.05,top:0.164,width:0.90,height:0.475},
 rules:{left:0.11,top:0.665,width:0.78,height:0.268},
};
export const movementArt={Still:'movement-still',Sneak:'movement-sneak',Walk:'movement-walk',Run:'movement-run'} as const;
export function regionStyle(region:{left:number;top:number;width:number;height:number}){return`left:${region.left*100}%;top:${region.top*100}%;width:${region.width*100}%;height:${region.height*100}%`;}
