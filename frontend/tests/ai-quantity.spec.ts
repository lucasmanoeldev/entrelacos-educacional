import {test,expect} from '@playwright/test';
test('57 perguntas em etapas, retomada após erro e editor acima de 50',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('entrelacos-token','test'));
  let failed=false;
  const offsets:number[]=[];
  await page.route('**/api/v1/**',async route=>{
    if(route.request().url().endsWith('/auth/me/'))return route.fulfill({json:{id:1,name:'Maria',role:'TEACHER'}});
    const {count,offset}=route.request().postDataJSON();
    offsets.push(offset);
    if(offset===10&&!failed){failed=true;return route.fulfill({status:503,json:{error:'Indisponibilidade temporária'}});}
    return route.fulfill({json:{title:'Atividade extensa',subject:'Ciências',school_year:'6º ano',questions:Array.from({length:count},(_,i)=>({text:'Pergunta '+(offset+i+1),explanation:'',answers:[{text:'Sim',correct:true},{text:'Não',correct:false}]}))}});
  });
  await page.goto('/dashboard/ia/');
  await page.getByLabel('Tema ou instrução pedagógica').fill('Planetas');
  const count=page.getByLabel('Quantidade de perguntas');
  await expect(count).not.toHaveAttribute('max');
  await count.fill('57');
  await page.getByRole('button',{name:'Gerar rascunho'}).click();
  await expect(page.getByText('10 de 57 perguntas prontas.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Continuar geração'}).click();
  await expect(page.getByLabel('Título da atividade')).toHaveValue('Atividade extensa');
  await page.getByRole('button',{name:'Continuar',exact:false}).click();
  await expect(page.locator('textarea[data-question="text"]')).toHaveCount(57);
  await page.getByRole('button',{name:'Adicionar pergunta'}).click();
  await expect(page.locator('textarea[data-question="text"]')).toHaveCount(58);
  expect(offsets).toEqual([0,10,10,20,30,40,50]);
});
