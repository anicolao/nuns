import {test,expect,type Page} from '@playwright/test';
const sizes=[{width:390,height:844},{width:844,height:390},{width:820,height:1180},{width:1440,height:900},{width:1920,height:1080}];
const modes=['novice','hearing','sight','capture','false-noise'];
async function transport(page:Page,action:string,value?:number){await page.evaluate(({action,value})=>window.postMessage({type:'nuns:transport',action,value},location.origin),{action,value});}
for(const mode of modes)for(const viewport of sizes)for(const reducedMotion of ['no-preference','reduce'] as const){
 test(`${mode} ${viewport.width}×${viewport.height} ${reducedMotion}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`play/?scenario=${mode}&review=1`);await expect(page.locator('[data-production-component="GameSurface"]')).toBeVisible();
  if(mode==='novice'){
   await expect(page.locator('[data-production-component="MovementHand"]')).toBeVisible();await page.getByRole('button',{name:'Choose Sneak',exact:true}).click();await page.getByRole('button',{name:'Plan route with Sneak',exact:true}).click();
   await page.getByRole('button',{name:'Plan step to 18',exact:true}).click();await page.getByRole('button',{name:'Plan step to 19',exact:true}).click();await page.getByRole('button',{name:'Undo step',exact:true}).click();await expect(page.locator('.private-route-log')).toContainText('4 → 18');
   await page.getByRole('button',{name:'Commit movement',exact:true}).click();await expect(page.getByRole('button',{name:'Commit movement',exact:true})).toHaveCount(0);
  }else if(mode==='hearing'){
   await page.getByRole('button',{name:'Listen with Abbess',exact:true}).click();await expect(page.locator('.pending-roll')).toContainText('6');await page.getByRole('button',{name:'Resolve hearing',exact:true}).click();await expect(page.locator('.live-clue')).toHaveAttribute('aria-label','Noise at 23 toward 43');await expect(page.locator('.live-novice')).toHaveCount(0);
  }else if(mode==='sight'){
   await expect(page.locator('.live-novice')).toHaveCount(0);await page.getByRole('button',{name:/Move Abbess to 19,/}).click();await expect(page.locator('.live-novice')).toBeVisible();await expect(page.locator('.live-novice')).toHaveAttribute('aria-label','Celeste spotted at 20');
  }else if(mode==='capture'){
   await page.getByRole('button',{name:/Move Abbess to 19,/}).click();await expect(page.locator('.live-novice.caught')).toBeVisible();await expect(page.locator('.game-status')).toContainText('Captures 1 / 2');await expect(page.locator('.game-controls')).not.toContainText('Medicine');
  }else{
   await page.getByRole('button',{name:'Blessing: False Noise',exact:true}).click();await page.getByRole('button',{name:'Use blessing',exact:true}).click();await page.getByRole('button',{name:'Aim noise from abbess toward 43',exact:true}).click();await page.getByRole('button',{name:'Cancel blessing',exact:true}).click();await expect(page.locator('.live-clue')).toHaveCount(0);
   await page.getByRole('button',{name:'Blessing: False Noise',exact:true}).click();await page.getByRole('button',{name:'Use blessing',exact:true}).click();await page.getByRole('button',{name:'Aim noise from abbess toward 43',exact:true}).click();await page.getByRole('button',{name:'Place noise',exact:true}).click();await expect(page.locator('.live-clue')).toBeVisible();await transport(page,'next-hearing');await expect(page.locator('.revealed-blessing')).toContainText('False Noise');
  }
  if(reducedMotion==='no-preference'){await transport(page,'seek',320);await expect.poll(()=>page.evaluate(()=>document.getAnimations().map(a=>Number(a.currentTime)))).toContain(320);await transport(page,'replay');}else expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
  const layout=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,panels:[...document.querySelectorAll('.game-controls,.game-controls button')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};})}));
  expect(layout.height).toBeLessThanOrEqual(viewport.height);expect(layout.width).toBeLessThanOrEqual(viewport.width);for(const r of layout.panels){expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(viewport.width+1);expect(r.bottom).toBeLessThanOrEqual(viewport.height+1);}expect(errors).toEqual([]);
 });
}
for(const scenario of ['novice','false-noise'])for(const edge of ['south','west','north','east'])for(const reduced of [0,1]){
 test(`table projection ${scenario} ${edge} reduced=${reduced}`,async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(`lab/?scenario=${scenario}&surface=tabletop&edge=${edge}&reduced=${reduced}`);
  const table=page.frameLocator('iframe').nth(0),phone=page.frameLocator('iframe').nth(1);await expect(phone.locator('.game-surface')).toBeVisible();await expect(table.locator('.live-targets button')).toHaveCount(0);await expect(table.locator('.private-route')).toHaveCount(0);await expect(table.locator('.live-novice')).toHaveCount(0);
  if(scenario==='novice'){
   await phone.getByRole('button',{name:'Choose Sneak',exact:true}).click();await phone.getByRole('button',{name:'Plan route with Sneak',exact:true}).click();await phone.getByRole('button',{name:'Plan step to 18',exact:true}).click();await expect(table.locator('.private-route')).toHaveCount(0);await phone.getByRole('button',{name:'Commit movement',exact:true}).click();await expect(table.locator('.live-novice')).toHaveCount(0);await expect(table.locator('.private-hand')).toHaveCount(0);
  }else{
   await phone.getByRole('button',{name:'Blessing: False Noise',exact:true}).click();await phone.getByRole('button',{name:'Use blessing',exact:true}).click();await phone.getByRole('button',{name:'Aim noise from abbess toward 43',exact:true}).click();await expect(table.locator('.live-clue')).toHaveCount(0);await phone.getByRole('button',{name:'Place noise',exact:true}).click();await expect(table.locator('.live-clue')).toHaveCount(1);await expect(table.locator('.game-controls')).not.toContainText('False Noise');await page.getByRole('button',{name:'Next hearing phase',exact:true}).click();await expect(table.locator('.revealed-blessing')).toContainText('False Noise');
  }
  await page.getByRole('button',{name:'Reset scene',exact:true}).click();await expect(table.locator('.live-clue')).toHaveCount(0);await expect(table.locator('.private-route')).toHaveCount(0);
 });
}
test('choose-movement bench and novice walkthrough render the same movement card component',async({page})=>{
 await page.goto('play/?scenario=movement');await expect(page.locator('[data-production-component="MovementHand"]')).toBeVisible();const cards=await page.locator('.painted-card').evaluateAll(nodes=>nodes.map(n=>({face:n.getAttribute('data-card-face'),title:n.querySelector('.painted-title')?.textContent})));await page.goto('play/?scenario=novice');await expect(page.locator('[data-production-component="MovementHand"]')).toBeVisible();expect(await page.locator('.painted-card').evaluateAll(nodes=>nodes.map(n=>({face:n.getAttribute('data-card-face'),title:n.querySelector('.painted-title')?.textContent})))).toEqual(cards);
});
