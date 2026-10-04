import {test,expect} from '@playwright/test';
test('stories, list, map, keyboard and optional sections',async({page})=>{
  await page.goto('/');await expect(page.getByRole('heading',{name:'Alex Morgan',exact:true})).toBeVisible();
  await expect(page.locator('#writing,#experience,#recognition')).toHaveCount(0);
  await page.keyboard.press('Tab');await expect(page.getByText('Skip to content')).toBeFocused();
  await page.getByRole('button',{name:'Show Release Checks',exact:true}).click();await expect(page.locator('#case-title')).toHaveText('Release Checks');
  await page.getByRole('button',{name:'View case study'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button',{name:'List',exact:true}).click();await expect(page.locator('.project-list article')).toHaveCount(3);
  await page.getByRole('button',{name:'Map',exact:true}).click();await expect(page.locator('.map-node')).toHaveCount(12);
  await page.screenshot({path:'test-results/desktop-home.png',fullPage:true});
});
for(const id of ['sample-web','sample-tests','sample-workflow'])test(`architecture ${id}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/architecture/${id}`);await expect(page.locator('.architecture-node').first()).toBeVisible();
  await page.locator('.architecture-node button').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.architecture-node.selected')).toHaveCount(1);
  await page.getByRole('button',{name:'Expand diagram'}).click();await expect(page.locator('.architecture-expanded')).toBeVisible();
  await page.screenshot({path:`test-results/${id}.png`,fullPage:true});
  await page.locator('.architecture-source summary').click();
  const source=await page.locator('.architecture-source code').innerText();
  await page.evaluate(async s=>{const modulePath='/node_modules/mermaid/dist/mermaid.esm.min.mjs';const mermaid=(await import(/* @vite-ignore */modulePath)).default;mermaid.initialize({startOnLoad:false,securityLevel:'strict'});await mermaid.parse(s);},source);
  if(id==='sample-workflow'){await page.getByRole('switch').uncheck();await expect(page.locator('.architecture-outcome')).toContainText('Simulated unavailable');}
  expect(errors).toEqual([]);
});
test('mobile layout and readable component view',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
  await page.goto('/architecture');await expect(page.locator('.architecture-components')).toBeVisible();
  await page.locator('.architecture-components button').first().click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/mobile-architecture.png',fullPage:true});
  await page.getByRole('button',{name:'Diagram',exact:true}).click();await expect(page.locator('.architecture-canvas')).toBeVisible();
});
test('unknown direct route is explicit',async({page})=>{await page.goto('/architecture/does-not-exist');await expect(page.getByRole('heading',{name:'Architecture not found'})).toBeVisible();});
