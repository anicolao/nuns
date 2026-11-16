import {test,expect,type Page} from '@playwright/test';
const sizes=[{width:390,height:844},{width:844,height:390},{width:820,height:1180},{width:1440,height:900},{width:1920,height:1080}];
const modes=['novice','hearing','sight','capture','false-noise'];
async function transport(page:Page,action:string,value?:number){await page.evaluate(({action,value})=>window.postMessage({type:'nuns:transport',action,value},location.origin),{action,value});}
for(const mode of modes)for(const viewport of sizes)for(const reducedMotion of ['no-preference','reduce'] as const){
 test(`${mode} ${viewport.width}×${viewport.height} ${reducedMotion}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`play/?scenario=${mode}&review=1`);await expect(page.locator('.encounter')).toBeVisible();
  if(mode==='novice'){
   await expect(page.getByRole('button',{name:'Commit movement',exact:true})).toBeDisabled();
   await page.getByRole('button',{name:'Plan step to 18',exact:true}).click();await page.getByRole('button',{name:'Plan step to 19',exact:true}).click();
   await page.getByRole('button',{name:'Undo step',exact:true}).click();await expect(page.locator('.route-log')).toContainText('4 → 18');
   await page.getByRole('button',{name:'Commit movement',exact:true}).click();await expect(page.getByRole('button',{name:'Commit movement',exact:true})).toBeDisabled();
  }else if(mode==='hearing'){
   await page.getByRole('button',{name:'Listen · roll die',exact:true}).click();await expect(page.locator('.noise-clue')).toHaveAttribute('aria-label','Noise beside 23 toward 43');await expect(page.locator('.novice-pawn')).toHaveCount(0);
  }else if(mode==='sight'){
   await expect(page.locator('.novice-pawn')).toHaveCount(0);await page.locator('.pawn-grab').click();await page.getByRole('button',{name:'Face East',exact:true}).click();await expect(page.locator('.novice-pawn')).toBeVisible();
   await page.locator('.pawn-grab').click();await page.getByRole('button',{name:'Face West',exact:true}).click();await expect(page.locator('.novice-pawn')).toHaveCount(0);
  }else if(mode==='capture'){
   await page.getByRole('button',{name:/Move Abbess to 19,/}).click();await expect(page.locator('.novice-pawn.caught')).toBeVisible();await expect(page.locator('.capture-result')).toContainText('Captures: 1');await expect(page.locator('.capture-result')).toContainText('Keys retained');await expect(page.locator('.capture-result')).toContainText('Wish item returned');await expect(page.locator('.move-destination')).toHaveCount(0);
  }else{
   await page.getByRole('button',{name:/False Noise Choose/}).click();await page.getByRole('button',{name:'Aim noise toward 43',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.locator('.noise-clue')).toHaveCount(0);
   await page.getByRole('button',{name:/False Noise Choose/}).click();await page.getByRole('button',{name:'Aim noise toward 43',exact:true}).click();await page.getByRole('button',{name:'Place noise',exact:true}).click();await expect(page.locator('.noise-clue')).toBeVisible();
   await transport(page,'next-hearing');await expect(page.getByText('Revealed · discarded.',{exact:true})).toBeVisible();
  }
  if(reducedMotion==='no-preference'){
   await transport(page,'seek',320);
   await expect.poll(()=>page.evaluate(()=>document.getAnimations().filter(a=>a.effect instanceof KeyframeEffect&&a.effect.target instanceof Element&&a.effect.target.closest('.encounter')).map(a=>Number(a.currentTime)))).not.toEqual([]);
   expect(await page.evaluate(()=>document.getAnimations().map(a=>Number(a.currentTime)))).toEqual(expect.arrayContaining([320]));
   await transport(page,'replay');
  }else expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
  const layout=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,panels:[...document.querySelectorAll('.encounter-panel,.encounter-panel button')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};})}));
  expect(layout.height).toBeLessThanOrEqual(viewport.height);expect(layout.width).toBeLessThanOrEqual(viewport.width);
  for(const r of layout.panels){expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(viewport.width+1);expect(r.bottom).toBeLessThanOrEqual(viewport.height+1);}
  expect(errors).toEqual([]);
 });
}
for(const scenario of ['novice','false-noise'])for(const edge of ['south','west','north','east'])for(const reduced of [0,1]){
 test(`table projection ${scenario} ${edge} reduced=${reduced}`,async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(`lab/?scenario=${scenario}&surface=tabletop&edge=${edge}&reduced=${reduced}`);
  const table=page.frameLocator('iframe').nth(0),phone=page.frameLocator('iframe').nth(1);
  await expect(phone.locator('.encounter')).toBeVisible();await expect(table.locator('.target-layer')).toHaveCount(0);await expect(table.locator('.private-route')).toHaveCount(0);await expect(table.locator('.novice-pawn')).toHaveCount(0);
  if(scenario==='novice'){
   await phone.getByRole('button',{name:'Plan step to 18',exact:true}).click();await expect(table.locator('.private-route')).toHaveCount(0);
   await phone.getByRole('button',{name:'Commit movement',exact:true}).click();await expect(table.locator('.encounter-panel')).toContainText('Sneak');await expect(table.locator('.novice-pawn')).toHaveCount(0);
  }else{
   await phone.getByRole('button',{name:/False Noise Choose/}).click();await phone.getByRole('button',{name:'Aim noise toward 43',exact:true}).click();await expect(table.locator('.noise-clue')).toHaveCount(0);
   await phone.getByRole('button',{name:'Place noise',exact:true}).click();await expect(table.locator('.noise-clue')).toHaveCount(1);await expect(table.locator('.encounter-panel')).not.toContainText('False Noise');
   await page.getByRole('button',{name:'Next hearing phase',exact:true}).click();await expect(table.locator('.encounter-panel')).toContainText('False Noise');
  }
  await page.getByRole('button',{name:'Reset scene',exact:true}).click();
  await expect(table.locator('.noise-clue')).toHaveCount(0);await expect(table.locator('.private-route')).toHaveCount(0);
 });
}
