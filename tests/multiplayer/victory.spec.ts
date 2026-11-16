import {test,expect,type Page} from '@playwright/test';
import {neighbors,isLocked,distance} from '../../src/lib/game/board';
function safePath(from:number,to:number,key:boolean,blocked:number[]){const queue=[[from]],seen=new Set([from]);for(let i=0;i<queue.length;i++){const path=queue[i],last=path.at(-1)!;if(last===to)return path;for(const next of neighbors(last)){if(seen.has(next)||(!key&&isLocked(last,next))||blocked.includes(next)&&next!==to)continue;seen.add(next);queue.push([...path,next]);}}return[];}
async function ack(page:Page){await expect(page.locator('.game-surface')).toHaveAttribute('aria-busy','false');}
test('novice retrieves her actual dealt key and wish, then wins by returning home through production controls',async({browser})=>{
 test.setTimeout(300000);
 const gc=await browser.newContext({reducedMotion:'reduce'}),nc=await browser.newContext({reducedMotion:'reduce'}),g=await gc.newPage(),n=await nc.newPage();
 await g.goto('/');await g.getByLabel('Your name',{exact:true}).fill('Mother');await g.getByLabel('Room capacity').selectOption('2');await g.getByRole('button',{name:'Create room',exact:true}).click();await expect(g.locator('.roster')).toContainText('Mother');const code=new URL(g.url()).searchParams.get('room')!;
 await n.goto('/controller/?room='+code);await n.getByLabel('Your name',{exact:true}).fill('Celeste');await n.getByLabel('Your side').selectOption('novice');await n.getByLabel('Character').selectOption('3');await n.getByRole('button',{name:'Take a seat',exact:true}).click();await n.getByRole('button',{name:'I’m ready',exact:true}).click();await g.getByRole('button',{name:'I’m ready',exact:true}).click();await g.getByRole('button',{name:'Start game',exact:true}).click();await g.getByLabel('Choose patrol').selectOption('1');await g.getByRole('button',{name:'Prioress',exact:true}).click();await g.getByLabel('Choose patrol').selectOption('2');
 let finished=false,keyEver=false,wishEver=false;
 for(let round=1;round<=15&&!finished;round++){
  for(let segment=0;segment<(round===1?2:1);segment++){
   await expect(n.locator('.game-status')).toContainText(`Night ${round} / 15`);
   const caught=await n.locator('.live-novice.caught').count()>0;
   if(!caught){await n.getByRole('button',{name:'Choose Run',exact:true}).click();await n.getByRole('button',{name:'Plan route with Run',exact:true}).click();}
   const copy=await n.locator('.private-hand').innerText(),key=copy.includes('Key ✓'),item=copy.includes('Wish ✓');keyEver ||= key;wishEver ||= item;
   const target=!key?Number(copy.match(/Key \d+ at (\d+)/)![1]):!item?Number(copy.match(/Wish at (\d+)/)![1]):4;
   const position=Number((await n.locator('.live-novice').getAttribute('aria-label'))!.match(/at (\d+)$/)![1]);
   const guards=await n.locator('.canonical-guard,.other-guard').evaluateAll(nodes=>nodes.map(el=>Number(el.getAttribute('data-motion-state')?.match(/^\d+/)?.[0])));
   let path=safePath(position,caught?4:target,key,caught?[]:guards).slice(0,caught?5:6);
   if(path.length<2&&!caught)path=[position,...neighbors(position).filter(dot=>!guards.includes(dot)&&(key||!isLocked(position,dot))).slice(0,1)];
   for(const dot of path.slice(1))await n.getByRole('button',{name:`Plan step to ${dot}`,exact:true}).click();
   await n.getByRole('button',{name:'Commit movement',exact:true}).click();await ack(n);
   if(await n.getByRole('heading',{name:'Celeste won!',exact:true}).count()){finished=true;break;}
  }
  if(finished)break;
  if(await n.getByRole('button',{name:'Roll for noise',exact:true}).count()){await n.getByRole('button',{name:'Roll for noise',exact:true}).click();await n.getByRole('button',{name:'Resolve hearing',exact:true}).click();}
  for(const name of ['Abbess','Prioress']){
   await g.getByRole('button',{name,exact:true}).click();
   for(let step=0;step<3;step++){
    if(!await g.locator('.move-destination').count()){const select=g.getByLabel('Choose patrol');const card=await select.locator('option').evaluateAll(options=>options.map(o=>(o as HTMLOptionElement).value).find(Boolean));await select.selectOption(card!);await ack(g);}
    const observed=g.locator('.live-novice'),visible=await observed.count()?Number((await observed.getAttribute('aria-label'))!.match(/at (\d+)$/)![1]):null;
    const targets=await g.locator('.move-destination').evaluateAll(nodes=>nodes.map(el=>Number(el.getAttribute('data-destination'))));
    // A deliberately gentle guard follows legal controls, retreating from a
    // publicly visible novice. It never reads her private route or wish.
    const target=visible===null?targets[0]:targets.sort((a,b)=>distance(b,visible)-distance(a,visible))[0];
    await g.locator(`[data-destination="${target}"]`).click();await ack(g);
   }
   await g.getByRole('button',{name:`Finish ${name} movement`,exact:true}).click();await ack(g);
  }
  for(const name of ['Abbess','Prioress']){await g.getByRole('button',{name:`Listen with ${name}`,exact:true}).click();await g.getByRole('button',{name:'Resolve hearing',exact:true}).click();}
  await g.getByRole('button',{name:'Next round',exact:true}).click();await ack(g);
 }
 await test.info().attach('complete-novice-victory',{body:await n.screenshot(),contentType:'image/png'});expect(finished).toBe(true);expect(keyEver).toBe(true);expect(wishEver).toBe(true);await n.reload();await expect(n.getByRole('heading',{name:'Celeste won!',exact:true})).toBeVisible();await gc.close();await nc.close();
});
