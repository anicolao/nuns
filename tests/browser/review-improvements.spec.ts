import {test,expect} from '@playwright/test';
for(const viewport of [{width:390,height:844},{width:844,height:390},{width:820,height:1180},{width:1440,height:900},{width:1920,height:1080}])for(const reducedMotion of ['no-preference','reduce'] as const){
 test(`wish, dismiss, sight and anchored zoom ${viewport.width}×${viewport.height} ${reducedMotion}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion});await page.goto('play/?scenario=novice');
  await page.getByRole('button',{name:/Secret wish/}).click();const dialog=page.getByRole('dialog',{name:'Your secret wish'});await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img',{name:'Letter from Lover',exact:true})).toBeVisible();await dialog.getByRole('img',{name:'Letter from Lover',exact:true}).click();await expect(dialog).toBeVisible();
  const fits=await dialog.locator('.wish-details').evaluate(el=>{const well=el.parentElement!.getBoundingClientRect();return [...el.querySelectorAll('span')].every(span=>{const r=span.getBoundingClientRect();return r.left>=well.left-1&&r.top>=well.top-1&&r.right<=well.right+1&&r.bottom<=well.bottom+1;});});expect(fits).toBe(true);
  await page.getByRole('button',{name:'Dismiss secret wish',exact:true}).click({position:{x:4,y:4}});await expect(dialog).toHaveCount(0);
  await page.getByRole('button',{name:'Blessing: False Noise',exact:true}).click();await expect(page.getByRole('dialog',{name:'Your blessing'})).toBeVisible();await page.getByRole('button',{name:'Dismiss blessing',exact:true}).click({position:{x:4,y:4}});await expect(page.getByRole('dialog')).toHaveCount(0);
  const plan=page.getByRole('button',{name:'Plan route with Sneak',exact:true}),planBox=await plan.boundingBox(),footerBox=await page.locator('.game-controls').boundingBox();expect(planBox!.y).toBeGreaterThanOrEqual(0);expect(planBox!.y+planBox!.height).toBeLessThanOrEqual(footerBox!.y+1);await plan.click();const zoom=page.getByRole('button',{name:'Zoom in',exact:true}),before=await zoom.boundingBox();
  for(let i=0;i<3;i++){await zoom.click();const after=await zoom.boundingBox();expect(after!.x).toBeCloseTo(before!.x,0);expect(after!.y).toBeCloseTo(before!.y,0);}
  const out=page.getByRole('button',{name:'Zoom out',exact:true}),outBefore=await out.boundingBox();for(let i=0;i<3;i++){await out.click();const after=await out.boundingBox();expect(after!.x).toBeCloseTo(outBefore!.x,0);expect(after!.y).toBeCloseTo(outBefore!.y,0);}
  await page.getByRole('button',{name:'Show visibility barriers'}).click();await expect(page.locator('.sight-barriers line').first()).toBeAttached();await page.getByRole('button',{name:'Show guard sight'}).click();await expect(page.locator('[data-seen-by~="abbess"]').first()).toBeAttached();await expect(page.locator('[data-seen-by~="prioress"]').first()).toBeAttached();await page.getByRole('button',{name:'Show guard sight'}).click();await expect(page.locator('[data-seen-by]')).toHaveCount(0);
  await page.locator('.public-info summary').click();await expect(page.locator('.public-info')).toContainText('→');await page.locator('.public-info summary').click();
  expect(await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}))).toEqual({w:viewport.width,h:viewport.height});
 });
}
test('guard portraits match map tokens and the two backgrounds differ',async({page})=>{
 await page.goto('play/?scenario=capture');await expect(page.getByRole('button',{name:'Abbess',exact:true}).locator('img')).toHaveAttribute('src',/character-6/);await expect(page.getByRole('button',{name:'Prioress',exact:true}).locator('img')).toHaveAttribute('src',/character-7/);
 const backgrounds=await page.locator('.abbess-pawn .pawn-body').evaluateAll(els=>els.map(e=>getComputedStyle(e).backgroundColor));expect(new Set(backgrounds).size).toBe(2);
});
