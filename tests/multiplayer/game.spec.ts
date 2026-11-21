import {test,expect,type Page} from '@playwright/test';
async function proof(page:Page,name:string){await test.info().attach(name,{body:await page.screenshot(),contentType:'image/png'});}
async function create(page:Page){await page.goto('/');await page.getByLabel('Your name',{exact:true}).fill('Mother');await page.getByLabel('Room capacity').selectOption('2');await page.getByRole('button',{name:'Create room',exact:true}).click();await expect(page.getByRole('heading',{name:/Room [A-Z2-9]{6}/})).toBeVisible();return new URL(page.url()).searchParams.get('room')!;}
async function join(page:Page,code:string){await page.goto('/controller/?room='+code);await page.getByLabel('Your name',{exact:true}).fill('Celeste');await page.getByLabel('Your side').selectOption('novice');await page.getByLabel('Character').selectOption('3');await page.getByRole('button',{name:'Take a seat',exact:true}).click();await expect(page.locator('.roster')).toContainText('Celeste');await page.getByRole('button',{name:'I’m ready',exact:true}).click();}
async function still(page:Page){await page.getByRole('button',{name:'Choose Still',exact:true}).click();await page.getByRole('button',{name:'Plan route with Still',exact:true}).click();await page.getByRole('button',{name:'Commit movement',exact:true}).click();}
test('anonymous rooms survive reload, use the approved cards, complete a round, and replay the same log',async({browser})=>{
 const guardContext=await browser.newContext(),noviceContext=await browser.newContext();const guard=await guardContext.newPage(),novice=await noviceContext.newPage();const errors:string[]=[];guard.on('pageerror',e=>errors.push(e.message));novice.on('pageerror',e=>errors.push(e.message));
 const code=await create(guard);await join(novice,code);await guard.getByRole('button',{name:'I’m ready',exact:true}).click();await guard.getByRole('button',{name:'Start game',exact:true}).click();
 await guard.getByLabel('Choose patrol').selectOption('1');await guard.getByRole('button',{name:'Prioress',exact:true}).click();await guard.getByLabel('Choose patrol').selectOption('2');
 await expect(novice.locator('[data-production-component="MovementHand"]')).toBeVisible();await proof(novice,'approved-movement-cards');await still(novice);await still(novice);
 for(const name of ['Abbess','Prioress']){
  await guard.getByRole('button',{name,exact:true}).click();
  for(let i=0;i<3;i++)await guard.locator('.move-destination').first().click();
  await guard.getByRole('button',{name:`Finish ${name} movement`,exact:true}).click();
 }
 for(const name of ['Abbess','Prioress']){await guard.getByRole('button',{name:`Listen with ${name}`,exact:true}).click();await guard.getByRole('button',{name:'Resolve hearing',exact:true}).click();}
 await guard.getByRole('button',{name:'Next round',exact:true}).click();await expect(guard.locator('.game-status')).toContainText('Night 2 / 15');
 await novice.reload();await expect(novice.locator('[data-production-component="MovementHand"]')).toBeVisible();await expect(novice.locator('.game-status')).toContainText('Night 2 / 15');
 await guard.getByRole('button',{name:'Refresh game',exact:true}).click();await expect(guard.locator('.game-status')).toContainText('Night 2 / 15');await expect(guard.locator('.private-hand')).toHaveCount(0);expect(errors).toEqual([]);await proof(guard,'public-round-two');await proof(novice,'private-controller-after-reload');
 await guardContext.close();await noviceContext.close();
});
test('a complete anonymous two-player game reaches the round limit and rematches without replacing history',async({browser})=>{
 test.setTimeout(300000);
 const gc=await browser.newContext({reducedMotion:'reduce'}),nc=await browser.newContext({reducedMotion:'reduce'}),g=await gc.newPage(),n=await nc.newPage();
 const code=await create(g);await join(n,code);await g.getByRole('button',{name:'I’m ready',exact:true}).click();await g.getByRole('button',{name:'Start game',exact:true}).click();await g.getByLabel('Choose patrol').selectOption('1');await g.getByRole('button',{name:'Prioress',exact:true}).click();await g.getByLabel('Choose patrol').selectOption('2');
 for(let round=1;round<=15;round++){
  await still(n);if(round===1)await still(n);else{await n.getByRole('button',{name:'Roll for noise',exact:true}).click();await n.getByRole('button',{name:'Resolve hearing',exact:true}).click();}
  await expect(g.locator('.game-status')).toContainText('Guards move');
  for(const name of ['Abbess','Prioress']){
   await g.getByRole('button',{name,exact:true}).click();
   for(let step=0;step<3;step++){
    if(await g.locator('.move-destination').count()===0){const select=g.getByLabel('Choose patrol');const card=await select.locator('option').evaluateAll(options=>options.map(o=>(o as HTMLOptionElement).value).find(Boolean));await select.selectOption(card!);await expect(g.locator('.game-surface')).toHaveAttribute('aria-busy','false');}
    await g.locator('.move-destination').first().click();await expect(g.locator('.game-surface')).toHaveAttribute('aria-busy','false');
   }
   await g.getByRole('button',{name:`Finish ${name} movement`,exact:true}).click();
  }
  for(const name of ['Abbess','Prioress']){await g.getByRole('button',{name:`Listen with ${name}`,exact:true}).click();await g.getByRole('button',{name:'Resolve hearing',exact:true}).click();}
  await g.getByRole('button',{name:'Next round',exact:true}).click();
 }
 await expect(g.getByRole('heading',{name:'The guards win',exact:true})).toBeVisible();await proof(g,'complete-guard-victory');await n.reload();await expect(n.getByRole('heading',{name:'The guards win',exact:true})).toBeVisible();await g.getByRole('button',{name:'Play again',exact:true}).click();await expect(g.locator('.game-status')).toContainText('Choose patrols');await expect(n.locator('.game-status')).toContainText('Night 1 / 15');await gc.close();await nc.close();
});
test('eight anonymous players join and commit simultaneously, with separate guard ownership',async({browser})=>{
 const contexts=await Promise.all(Array.from({length:8},()=>browser.newContext({reducedMotion:'reduce'})));const pages=await Promise.all(contexts.map(c=>c.newPage()));const host=pages[0];await host.goto('/');await host.getByLabel('Your name',{exact:true}).fill('Mother');await host.getByLabel('Room capacity').selectOption('8');await host.getByRole('button',{name:'Create room',exact:true}).click();await expect(host.locator('.roster')).toContainText('Mother');const code=new URL(host.url()).searchParams.get('room')!;
 await Promise.all(pages.slice(1).map(async(page,i)=>{await page.goto('/controller/?room='+code);await page.getByLabel('Your name',{exact:true}).fill(i===6?'Prioress':`Novice ${i}`);await page.getByLabel('Your side').selectOption(i===6?'guard':'novice');if(i<6)await page.getByLabel('Character').selectOption(String(i));await page.getByRole('button',{name:'Take a seat',exact:true}).click();await page.getByRole('button',{name:'I’m ready',exact:true}).click();}));
 await host.getByRole('button',{name:'I’m ready',exact:true}).click();await expect(host.getByRole('button',{name:'Start game',exact:true})).toBeEnabled();await host.getByRole('button',{name:'Start game',exact:true}).click();await host.getByLabel('Choose patrol').selectOption('1');const prioress=pages[7];await expect(prioress.getByLabel('Choose patrol')).toBeVisible();await prioress.getByLabel('Choose patrol').selectOption('2');
 await Promise.all(pages.slice(1,7).map(page=>still(page)));await Promise.all(pages.slice(1,7).map(page=>still(page)));await expect(host.locator('.game-status')).toContainText('Guards move');await expect(prioress.getByRole('button',{name:'Finish Prioress movement',exact:true})).toBeVisible();await expect(prioress.getByRole('button',{name:'Abbess',exact:true})).toHaveCount(0);await Promise.all(contexts.map(c=>c.close()));
});
test('short laptop lobby scrolls, novice auto-selects, public choices and first-turn undo persist',async({browser})=>{
 const gc=await browser.newContext({viewport:{width:1280,height:600},reducedMotion:'reduce'}),nc=await browser.newContext({viewport:{width:1280,height:600},reducedMotion:'reduce'}),g=await gc.newPage(),n=await nc.newPage();
 const code=await create(g);await n.goto('/controller/?room='+code);await expect(n.getByLabel('Your side')).toHaveValue('novice');await n.getByLabel('Your name',{exact:true}).fill('Celeste');await n.getByLabel('Character').selectOption('3');
 const joinButton=n.getByRole('button',{name:'Take a seat',exact:true});await joinButton.scrollIntoViewIfNeeded();const box=await joinButton.boundingBox();expect(box!.y+box!.height).toBeLessThanOrEqual(600);await joinButton.click();await n.getByRole('button',{name:'I’m ready',exact:true}).click();await g.getByRole('button',{name:'I’m ready',exact:true}).click();await g.getByRole('button',{name:'Start game',exact:true}).click();
 await expect(n.getByText('Waiting for guards to choose routes',{exact:true}).first()).toBeVisible();await g.getByLabel('Choose patrol').selectOption('1');await g.getByRole('button',{name:'Prioress',exact:true}).click();await g.getByLabel('Choose patrol').selectOption('2');
 await expect(n.getByText(/First turn: novices move twice/)).toBeVisible();const planBox=await n.getByRole('button',{name:'Plan route with Sneak',exact:true}).boundingBox(),footerBox=await n.locator('.game-controls').boundingBox();expect(planBox!.y).toBeGreaterThanOrEqual(0);expect(planBox!.y+planBox!.height).toBeLessThanOrEqual(footerBox!.y+1);await still(n);await expect(n.getByRole('button',{name:'Choose Sneak',exact:true})).toBeDisabled();await n.getByRole('button',{name:'Undo first turn',exact:true}).click();await expect(n.getByRole('button',{name:'Choose Sneak',exact:true})).toBeEnabled();await still(n);await still(n);
 await g.getByRole('button',{name:'Log',exact:true}).click();await expect(g.getByLabel('Game log',{exact:true})).toContainText('Celeste chose Still');await expect(g.getByLabel('Game log',{exact:true})).toContainText('patrol:');await g.getByRole('button',{name:'Close log',exact:true}).click();
 await n.reload();await n.getByRole('button',{name:'Undo first turn',exact:true}).click();await expect(n.getByRole('button',{name:'Choose Sneak',exact:true})).toBeEnabled();await still(n);await still(n);await g.locator('.move-destination').first().click();await expect(n.getByRole('button',{name:'Undo first turn',exact:true})).toHaveCount(0);await gc.close();await nc.close();
});
