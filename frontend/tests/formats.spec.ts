import { test, expect } from '@playwright/test';
for (const format of ['true-false','flashcards','match']) {
  test('jogo Astro: '+format,async({page,request})=>{
    const response=await request.get((process.env.E2E_API_URL||'http://localhost:8000/api/v1')+'/explore/');
    const activities=await response.json();
    const activity=activities.find((a:{title:string})=>a.title==='Palavras e seus encontros');
    await page.goto('/jogar/?codigo='+activity.code);
    await page.getByLabel('Como podemos chamar você?').fill('Teste '+format);
    await page.getByLabel('Escolha seu jeito de aprender').selectOption(format);
    await page.getByRole('button',{name:'Começar descoberta'}).click();
    for(let i=0;i<activity.question_count;i++){
      if(format==='flashcards'){
        await page.getByRole('button',{name:'Virar cartão'}).click();
        await expect(page.getByText('VERSO DO CARTÃO')).toBeVisible();
        await page.getByRole('button',{name:'Aprendi',exact:true}).click();
      }else if(format==='true-false')await page.getByRole('button',{name:'Verdadeiro'}).click();
      else await page.locator('.game-answers button').first().click();
      await page.getByRole('button',{name:i+1===activity.question_count?'Ver meu resultado':'Próxima pergunta'}).click();
    }
    await expect(page.getByRole('heading',{name:'Boa jornada, Teste '+format+'!'})).toBeVisible();
  });
}

test('rascunho da IA chega ao editor sem recarga',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('entrelacos-token','test'));
  await page.route('**/api/v1/auth/me/',r=>r.fulfill({json:{id:1,name:'Maria',email:'maria@example.com',role:'TEACHER'}}));
  await page.route('**/api/v1/ai/generate-activity/',r=>r.fulfill({json:{title:'O ciclo da água',description:'Rascunho',subject:'Ciências',school_year:'6º ano',questions:[{text:'Como a água passa ao estado gasoso?',explanation:'Por evaporação.',answers:[{text:'Evaporação',correct:true},{text:'Congelamento',correct:false}]}]}}));
  await page.goto('/dashboard/ia/');
  await page.getByLabel('Tema ou instrução pedagógica').fill('Ciclo da água');
  await page.getByLabel('Quantidade de perguntas').fill('1');
  await page.getByRole('button',{name:'Gerar rascunho de atividade'}).click();
  await expect(page.getByLabel('Título da atividade')).toHaveValue('O ciclo da água');
  await page.getByRole('button',{name:'Continuar'}).click();
  await expect(page.getByLabel('Enunciado')).toHaveValue('Como a água passa ao estado gasoso?');
  await expect(page.getByRole('textbox',{name:'Alternativa 1 da pergunta 1',exact:true})).toHaveValue('Evaporação');
});
