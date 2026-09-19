import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test('roleta permanece entre o título e o botão em '+width+'px', async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.route('**/api/v1/**', route => {
      if(route.request().method()==='POST')return route.fulfill({json:{id:'session',token:'test',question:{id:'question',text:'',index:0,total:30,spun:false,wheel_slots:Array.from({length:30},(_,i)=>i+1)}}});
      return route.fulfill({json:{title:'30 questões de Matemática',description:'Atividade',subject:'Matemática',school_year:'6º ano',template:'roulette',question_count:30,creator_name:'Professor',code:'AABBCCDD'}});
    });
    await page.goto('/jogar/?codigo=AABBCCDD');
    await page.getByLabel('Como podemos chamar você?').fill('Teste');
    await page.getByRole('button',{name:'Começar descoberta'}).click();
    const wheel=page.locator('.roulette-wheel');
    await expect(wheel).toBeVisible();
    const bounds=await wheel.boundingBox();
    const title=await page.locator('.roulette-stage h1').boundingBox();
    const button=await page.getByRole('button',{name:'Girar roleta'}).boundingBox();
    const panel=await page.locator('.play-panel').boundingBox();
    expect(bounds!.y).toBeGreaterThan(title!.y+title!.height);
    expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(button!.y);
    expect(bounds!.x).toBeGreaterThanOrEqual(panel!.x);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(panel!.x+panel!.width);
    const hub=await wheel.locator('span').boundingBox();
    expect(Math.abs(hub!.width-hub!.height)).toBeLessThan(1);
    await page.screenshot({path:'test-results/roulette-layout-'+width+'.png',fullPage:true});
  });
}
