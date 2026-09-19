import { navigate } from 'astro:transitions/client';
import { post } from '../lib/client';
import { subjects, type Activity } from '../lib/types';
import { esc, error, heading, options, type Context } from './dom';
export function mount({root,signal,user}: Context) {
  if (root.dataset.page === 'account') {
    root.innerHTML = heading('Sua conta, seu espaço.')+'<div class="editor-panel"><h2>'+esc(user?.name)+'</h2><p>'+esc(user?.email)+'</p><p>'+esc(user?.role === 'STUDENT' ? 'Aluno(a)' : 'Educador(a)')+'</p><a href="/esqueci-senha/" class="button secondary">Alterar minha senha</a></div>'; return;
  }
  root.innerHTML = heading('Sua ideia, com uma mãozinha da IA.','Descreva o tema. Depois, revise e personalize cada pergunta no editor.','UM PONTO DE PARTIDA PARA SUA CRIATIVIDADE')+'<div class="ai-layout"><form class="editor-panel"><span class="ai-form-icon">✦</span><h2>O que vamos descobrir hoje?</h2><div class="error" data-error role="alert"></div><label>Tema ou instrução pedagógica<textarea name="topic" required maxlength="300" placeholder="Ex.: O ciclo da água, com exemplos do dia a dia dos alunos."></textarea></label><div class="form-grid"><label>Matéria<select name="subject">'+options(subjects)+'</select></label><label>Ano escolar<select name="school_year">'+options(Array.from({length:9},(_,i)=>(i+1)+'º ano'),'6º ano')+'</select></label><label>Quantidade de perguntas<input name="count" type="number" min="1" step="1" value="5" required/></label><label>Dificuldade<select name="difficulty">'+options(['Fácil','Média','Difícil'],'Média')+'</select></label></div><button class="button full">Gerar rascunho de atividade →</button><p class="small-text" role="status" data-status></p></form><aside class="ai-tips"><p class="eyebrow">SEU OLHAR FAZ A DIFERENÇA</p><h2>A IA propõe.<br/>Você transforma.</h2><p>Revise os fatos e as respostas antes de publicar.</p><ul><li>Seja específico sobre o tema.</li><li>Informe o nível da turma.</li><li>Não envie informações pessoais dos alunos.</li></ul><span class="tips-star">✳</span></aside></div>';
  let progress: { signature: string; draft: Activity | null } | null = null;
  root.querySelector('form')!.addEventListener('submit',async event=>{
    event.preventDefault(); const form=event.currentTarget as HTMLFormElement, button=form.querySelector('button')!;
    const data=Object.fromEntries(new FormData(form)), total=Number(data.count);
    if(!Number.isSafeInteger(total)||total<1){error(root,'Informe uma quantidade inteira maior que zero.');return;}
    const signature=JSON.stringify(data);
    if(progress?.signature!==signature)progress={signature,draft:null};
    const current=progress!;
    form.querySelectorAll<HTMLInputElement|HTMLButtonElement>('input,select,textarea,button').forEach(el=>el.disabled=true);
    error(root,'');button.textContent='Preparando suas perguntas…';
    root.querySelector('[data-partial]')?.remove();
    try {
      while((current.draft?.questions.length||0)<total){
        const offset=current.draft?.questions.length||0,count=Math.min(10,total-offset);
        root.querySelector('[data-status]')!.textContent=offset+' de '+total+' perguntas prontas. Gerando as próximas…';
        const batch=await post<Activity>('ai/generate-activity/',{...data,count,offset},undefined,AbortSignal.any([signal,AbortSignal.timeout(135000)]));
        if(signal.aborted)return;
        if(!Array.isArray(batch.questions)||batch.questions.length!==count)throw new Error('A IA retornou uma quantidade incompleta. Tente continuar a geração.');
        if(current.draft)current.draft.questions.push(...batch.questions);
        else current.draft=batch;
        sessionStorage.setItem('entrelacos-ai-draft',JSON.stringify(current.draft));
      }
      await navigate('/dashboard/atividades/criar/?ia=1');
    } catch(e){
      if(!signal.aborted){
        error(root,e);
        if(current.draft){
          root.querySelector('[data-status]')!.textContent=current.draft.questions.length+' de '+total+' perguntas prontas. Você pode continuar ou revisar o rascunho parcial.';
          const link=document.createElement('a');link.href='/dashboard/atividades/criar/?ia=1';link.dataset.partial='';link.className='subtle-link';link.textContent='Revisar perguntas já geradas';form.append(link);
        }
      }
    }
    finally{
      form.querySelectorAll<HTMLInputElement|HTMLButtonElement>('input,select,textarea,button').forEach(el=>el.disabled=false);
      button.textContent=current.draft?'Continuar geração →':'Gerar rascunho de atividade →';
    }
  },{signal});
}
