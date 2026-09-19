import { test, expect } from '@playwright/test';

test('IA GROQ gera perguntas reais e abre o rascunho no editor', async ({ page }) => {
  test.skip(process.env.E2E_GROQ_LIVE !== '1', 'Teste real opcional, utiliza a cota GROQ configurada na API.');
  test.setTimeout(180000);
  await page.goto('/cadastro/');
  await page.getByLabel('Seu nome').fill('Teste de Integração IA');
  await page.getByLabel('E-mail', { exact: true }).fill(`groq-${Date.now()}@example.com`);
  await page.getByLabel(/^Senha/).fill('Integracao!Groq2026');
  await page.getByLabel('Confirme a senha').fill('Integracao!Groq2026');
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Teste!' })).toBeVisible();
  await page.getByRole('link', { name: 'Criar com IA' }).click();
  await page.getByLabel('Tema ou instrução pedagógica').fill('Planetas do Sistema Solar');
  await page.getByLabel('Quantidade de perguntas').fill('1');
  const responsePromise = page.waitForResponse(r => r.url().endsWith('/ai/generate-activity/') && r.request().method() === 'POST', { timeout: 135000 });
  await page.getByRole('button', { name: 'Gerar rascunho de atividade' }).click();
  const response = await responsePromise;
  expect(response.status(), JSON.stringify(await response.json())).toBe(200);
  await expect(page.getByLabel('Título da atividade')).not.toHaveValue('');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByLabel('Enunciado')).not.toHaveValue('');
  await expect(page.getByRole('textbox', { name: 'Alternativa 1 da pergunta 1', exact: true })).not.toHaveValue('');
  await page.screenshot({ path: 'test-results/groq-draft.png', fullPage: true });
});

test('roleta sorteia sem repetir e conclui a partida no celular', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const response = await request.get((process.env.E2E_API_URL || 'http://localhost:8000/api/v1') + '/explore/');
  const activities = await response.json();
  const activity = activities.find((a: { title: string }) => a.title === 'Palavras e seus encontros');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/jogar/?codigo=${activity.code}`);
  await page.getByLabel('Como podemos chamar você?').fill('Explorador da Roleta');
  await page.getByLabel('Escolha seu jeito de aprender').selectOption('roulette');
  await page.getByRole('button', { name: 'Começar descoberta' }).click();
  const seen: string[] = [];
  for (let i = 0; i < activity.question_count; i++) {
    await expect(page.getByRole('button', { name: 'Girar roleta' })).toBeVisible();
    await expect(page.locator('.game-answers')).toHaveCount(0);
    if (i === 0) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: 'test-results/roulette-mobile.png', fullPage: true });
    }
    await page.getByRole('button', { name: 'Girar roleta' }).click();
    await expect(page.getByText('Pergunta sorteada:')).toBeVisible();
    const selected = await page.locator('.roulette-selected').innerText();
    expect(seen).not.toContain(selected); seen.push(selected);
    await page.locator('.game-answers button').first().click();
    await page.getByRole('button', { name: i + 1 === activity.question_count ? 'Ver meu resultado' : 'Próxima pergunta' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Boa jornada, Explorador da Roleta!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ranking · Roleta' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('página inicial, biblioteca e celular', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /O conhecimento/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Explorar ideias' }).click();
  await expect(page.getByRole('heading', { name: 'Uma biblioteca de descobertas.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Uma viagem pelo Sistema Solar' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar atividade' }).fill('sem-resultado-impossivel');
  await expect(page.getByText('Nenhuma atividade encontrada.')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Criar minha primeira atividade' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('professor cadastra, publica, aluno joga e professor consulta resultado', async ({ page, browser }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/cadastro/');
  await page.getByLabel('Seu nome').fill('Professora de Teste');
  await page.getByLabel('E-mail', { exact: true }).fill(`teste-${Date.now()}@example.com`);
  await page.getByLabel(/^Senha/).fill('Jornada!educacional2026');
  await page.getByLabel('Confirme a senha').fill('Jornada!educacional2026');
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Professora!' })).toBeVisible();
  await page.getByRole('link', { name: 'Criar atividade', exact: true }).click();
  await page.getByLabel('Título da atividade').fill('Descoberta E2E');
  await page.getByLabel('Descrição', { exact: true }).fill('Atividade de validação de ponta a ponta.');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Enunciado').fill('Quanto é 2 + 2?');
  for (const [i, value] of ['4', '3', '5', '6'].entries()) await page.getByRole('textbox', { name: `Alternativa ${i + 1} da pergunta 1`, exact: true }).fill(value);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Publicar atividade' }).click();
  await expect(page.getByRole('heading', { name: 'Descoberta E2E' })).toBeVisible();
  await page.getByRole('button', { name: 'Compartilhar Descoberta E2E', exact: true }).click();
  const url = await page.getByLabel('Link da atividade').inputValue();
  expect(url).toContain('/jogar/?codigo=');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  const guest = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const player = await guest.newPage(); player.on('pageerror', error => errors.push(error.message));
  await player.goto(url);
  await player.getByLabel('Como podemos chamar você?').fill('Explorador Teste');
  await player.getByRole('button', { name: 'Começar descoberta' }).click();
  await expect(player.getByRole('heading', { name: 'Quanto é 2 + 2?' })).toBeVisible();
  expect(await player.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await player.screenshot({ path: 'test-results/game-mobile.png', fullPage: true });
  await player.getByRole('button', { name: /^[A-D]\s*4$/ }).click();
  await expect(player.getByRole('heading', { name: 'Isso mesmo!' })).toBeVisible();
  await player.getByRole('button', { name: 'Ver meu resultado' }).click();
  await expect(player.getByRole('heading', { name: 'Boa jornada, Explorador Teste!' })).toBeVisible();
  await expect(player.getByText('100%', { exact: true })).toBeVisible();
  await player.screenshot({ path: 'test-results/result-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Resultados', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Explorador Teste', exact: true })).toBeVisible();
  await expect(page.getByText('100% de acertos · 1 respostas')).toBeVisible();
  await page.screenshot({ path: 'test-results/report-desktop.png', fullPage: true });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('resultados-entrelacos.csv');
  await guest.close();
  expect(errors).toEqual([]);
});
