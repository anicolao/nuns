import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const manifest=[];
for(const style of ['moonlit']){
 const dir=`static/art/${style}`;await mkdir(dir,{recursive:true});
 const atlas=`art/sources/${style}-atlas.png`;
 async function crop(name,left,top,width,height){await sharp(atlas).extract({left,top,width,height}).webp({quality:94}).toFile(`${dir}/${name}.webp`);manifest.push({id:`${style}/${name}`,source:atlas,crop:{left,top,width,height},path:`/art/${style}/${name}.webp`});}
 for(const [i,name] of ['movement','wish','blessing'].entries())await crop(name,96+i*512,14,320,484);
 await crop('parchment',96,327,320,170);
 await crop('noise',538,535,226,226);
 await crop('vanished',774,535,225,226);
 await crop('key',537,768,226,225);
 await crop('medicine',774,768,226,224);
 await crop('back',1056,535,300,461);

 const scenes='art/sources/moonlit-movement-scenes.png';
 const sceneMeta=await sharp(scenes).metadata();
 for(const [i,name]of ['still','sneak','walk','run'].entries()){
  const width=Math.floor(sceneMeta.width/2),height=Math.floor(sceneMeta.height/2);
  const crop={left:(i%2)*width,top:Math.floor(i/2)*height,width,height};
  await sharp(scenes).extract(crop).webp({quality:95}).toFile(`${dir}/movement-${name}.webp`);
  manifest.push({id:`${style}/movement-${name}`,source:scenes,crop,path:`/art/${style}/movement-${name}.webp`});
 }
 await sharp('art/sources/moonlit-selected.png').trim({threshold:8}).resize({width:192,height:192,fit:'inside'}).webp({quality:95,alphaQuality:100}).toFile(`${dir}/selected.webp`);
 manifest.push({id:`${style}/selected`,source:'art/sources/moonlit-selected.png',path:`/art/${style}/selected.webp`});
 await sharp('art/sources/moonlit-board-canonical.png').webp({quality:93}).toFile(`${dir}/board.webp`);
 manifest.push({id:`${style}/board`,source:'art/sources/moonlit-board-canonical.png',path:`/art/${style}/board.webp`});
 const characters=`art/sources/${style}-characters.png`,meta=await sharp(characters).metadata();
 for(let i=0;i<8;i++){
  const cellWidth=Math.floor(meta.width/4),cellHeight=Math.floor(meta.height/2);
  const cell=await sharp(characters).extract({left:(i%4)*cellWidth,top:Math.floor(i/4)*cellHeight,width:cellWidth,height:cellHeight}).toBuffer();
  await sharp(cell).trim({threshold:8}).webp({quality:94,alphaQuality:100}).toFile(`${dir}/character-${i}.webp`);
  manifest.push({id:`${style}/character-${i}`,source:characters,cell:i,path:`/art/${style}/character-${i}.webp`});
 }
}
await writeFile('art/manifest.json',JSON.stringify(manifest,null,2)+'\n');
await writeFile('static/art/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared ${manifest.length} local graphical layers. Source PNGs and alpha retained.`);
