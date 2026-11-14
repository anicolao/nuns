import {BOARD_WIDTH,BOARD_HEIGHT,type Point} from './board.ts';
export type Camera={x:number;y:number;scale:number};
export function fitCamera(width:number,height:number):Camera {
 const scale=Math.min(width/BOARD_WIDTH,height/BOARD_HEIGHT);
 return {x:(width-BOARD_WIDTH*scale)/2,y:(height-BOARD_HEIGHT*scale)/2,scale};
}
export function focusCamera(width:number,height:number,point:Point):Camera {
 const scale=Math.max(fitCamera(width,height).scale,Math.min(1.6,width/280));
 return clampCamera({x:width/2-point.x*scale,y:height/2-point.y*scale,scale},width,height);
}
export function clampCamera(camera:Camera,width:number,height:number):Camera {
 const bound=(offset:number,available:number,size:number)=>size<available?(available-size)/2:Math.max(available-size,Math.min(0,offset));
 return {...camera,x:bound(camera.x,width,BOARD_WIDTH*camera.scale),y:bound(camera.y,height,BOARD_HEIGHT*camera.scale)};
}
export function zoomCamera(camera:Camera,width:number,height:number,scale:number,anchor:Point={x:width/2,y:height/2}):Camera {
 const next=Math.max(fitCamera(width,height).scale,Math.min(2.5,scale));
 return clampCamera({scale:next,x:anchor.x-(anchor.x-camera.x)*next/camera.scale,y:anchor.y-(anchor.y-camera.y)*next/camera.scale},width,height);
}
export const worldPoint=(camera:Camera,point:Point):Point=>({x:(point.x-camera.x)/camera.scale,y:(point.y-camera.y)/camera.scale});
