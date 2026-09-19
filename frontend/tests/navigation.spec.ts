import { test, expect } from '@playwright/test';

test('Astro preserva menu, documento e cache entre abas; logout limpa a sessão', async ({page}) => {
  let lists=0;
  await page.route('**/api/v1/**', async route => {
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth/me/'))return route.fulfill({json:{id:1,name:'Maria Teste',email:'maria@example.com',role:'TEACHER'}});
    if(url.pathname.endsWith('/activities/'))lists++;
    return route.fulfill({json:[]});
  });
  await page.addInitScript(()=>sessionStorage.setItem('entrelacos-token','test-session'));
  await page.goto('/dashboard/');
  await expect(page.getByRole('heading',{name:'Olá, Maria!'})).toBeVisible();
  await page.evaluate(()=>{
    const state=window as Window & {menu?:Element|null;marker?:string};
    state.menu=document.querySelector('.sidebar');state.marker='same-document';
  });
  await page.getByRole('link',{name:'Minhas atividades',exact:true}).hover();
  await page.getByRole('link',{name:'Minhas atividades',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Minhas atividades',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>{
    const state=window as Window & {menu?:Element|null;marker?:string};
    return state.menu===document.querySelector('.sidebar')&&state.marker==='same-document';
  })).toBe(true);
  expect(lists).toBe(1);
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Olá, Maria!'})).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading',{name:'Minhas atividades',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Sair da conta'}).click();
  await expect(page.getByRole('heading',{name:'Bom ter você por aqui.'})).toBeVisible();
  expect(await page.evaluate(()=>sessionStorage.getItem('entrelacos-token'))).toBeNull();
});

test('falha de rede permite tentar de novo sem recarregar o documento',async({page})=>{
  let fail=true;
  await page.route('**/api/v1/explore/',route=>fail?route.abort():route.fulfill({json:[]}));
  await page.goto('/explorar/');
  await expect(page.getByRole('alert')).toContainText('Não foi possível conectar');
  fail=false;
  await page.getByRole('button',{name:'Tentar novamente'}).click();
  await expect(page.getByRole('heading',{name:'Uma biblioteca de descobertas.'})).toBeVisible();
});
