import { navigate } from 'astro:transitions/client';
import { api, post } from '../lib/client';
import { type Activity, type Question, subjects, templates } from '../lib/types';
import { esc, heading, error, options, type Context } from './dom';
const blank=():Question=>({text:'',explanation:'',answers:[{text:'',correct:true},...Array.from({length:3},()=>({text:'',correct:false}))]});
export async function mount({root,signal}:Context){
  const params=new URLSearchParams(location.search);
  let id=params.get('id')||'',step=0,busy=false;
  let data={title:'',description:'',subject:'Ciências',school_year:'6º ano',visibility:'link',template:templates.find(t=>t.id===params.get('template'))?.id||'quiz',language:'pt-BR',questions:[blank()]} as Omit<Activity,'id'|'published'|'code'|'creator_name'|'plays'>;
  if(id)data=await api<Activity>('activities/'+encodeURIComponent(id)+'/',{signal});
  else if(params.has('ia')){const draft=sessionStorage.getItem('entrelacos-ai-draft');if(draft)data={...data,...JSON.parse(draft)};}
  if(signal.aborted)return;
  const field=(label:string,key:string,max:number,textarea=false)=>'<label>'+label+'<'+(textarea?'textarea':'input')+' data-field="'+key+'" maxlength="'+max+'"'+(textarea?'>'+esc(data[key as keyof typeof data])+'</textarea>':' value="'+esc(data[key as keyof typeof data])+'"/>')+'</label>';
  function render(){
    root.innerHTML=heading(id?'Vamos lapidar sua ideia.':'Uma nova descoberta começa aqui.','Seu conteúdo pode ganhar diferentes formas de jogar.','ATELIÊ DE ATIVIDADES')+'<div class="editor-steps">'+['Sua ideia','Conteúdo','Formato','Publicar'].map((s,i)=>'<div class="'+(i<=step?'active':'')+'"><span>'+(i<step?'✓':i+1)+'</span>'+s+'</div>').join('')+'</div><div class="error" data-error role="alert"></div><div class="editor-panel">'+
    (step===0?'<div class="editor-title"><h2>Conte um pouco sobre sua atividade.</h2><a href="/dashboard/ia/" class="text-button">✦ Criar com IA</a></div>'+field('Título da atividade','title',160)+field('Descrição','description',2000,true)+'<div class="form-grid"><label>Matéria<select data-field="subject">'+options(subjects,data.subject)+'</select></label><label>Ano escolar<select data-field="school_year">'+options(['Educação infantil',...Array.from({length:9},(_,i)=>(i+1)+'º ano'),'Ensino médio','Outros'],data.school_year)+'</select></label></div>':
    step===1?'<h2>O que vamos aprender?</h2><p class="muted">Adicione perguntas e marque a alternativa correta.</p>'+data.questions.map((q,i)=>'<section class="question-editor" data-q="'+i+'"><div class="question-heading"><b>Pergunta '+(i+1)+'</b><button class="icon-button" data-action="remove-question" aria-label="Excluir pergunta '+(i+1)+'" '+(data.questions.length===1?'disabled':'')+'>×</button></div><label>Enunciado<textarea data-question="text" maxlength="1000">'+esc(q.text)+'</textarea></label><span class="field-label">Alternativas · selecione a correta</span>'+q.answers.map((a,j)=>'<div class="answer-editor '+(a.correct?'selected':'')+'" data-a="'+j+'"><input type="radio" name="correct-'+i+'" data-correct aria-label="Alternativa '+(j+1)+' correta da pergunta '+(i+1)+'" '+(a.correct?'checked':'')+'/><input data-answer aria-label="Alternativa '+(j+1)+' da pergunta '+(i+1)+'" value="'+esc(a.text)+'" maxlength="500"/>'+(q.answers.length>2?'<button class="icon-button" data-action="remove-answer" aria-label="Remover alternativa '+(j+1)+'">×</button>':'')+'</div>').join('')+(q.answers.length<6?'<button class="subtle-link" data-action="add-answer">+ Adicionar alternativa</button>':'')+'<label>Explicação (opcional)<input data-question="explanation" value="'+esc(q.explanation)+'" maxlength="1500"/></label></section>').join('')+'<button class="button secondary full" data-action="add-question" >＋ Adicionar pergunta</button>':
    step===2?'<h2>Como sua turma vai jogar?</h2><p class="muted">O formato é só o começo. Você pode trocá-lo depois.</p><div class="format-options">'+templates.map(t=>'<button class="format-option '+t.color+' '+(t.id===data.template?'selected-format':'')+'" data-action="format" data-format="'+t.id+'"><span class="template-symbol">'+t.symbol+'</span><h3>'+t.name+'</h3><p>'+t.description+'</p></button>').join('')+'</div>':
    '<h2>Pronta para encontrar sua turma.</h2><div class="publish-summary"><span class="template-symbol">'+templates.find(t=>t.id===data.template)?.symbol+'</span><div><h3>'+esc(data.title)+'</h3><p>'+esc(data.subject)+' · '+esc(data.school_year)+' · '+data.questions.length+' perguntas</p></div></div><label>Quem pode acessar?<select data-field="visibility">'+[['link','Quem tiver o link ou código'],['public','Todos · aparecer na biblioteca pública'],['private','Somente eu']].map(([v,l])=>'<option value="'+v+'" '+(data.visibility===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label><p class="small-text">Revise as perguntas antes de enviar para os alunos.</p>')+
    '<div class="editor-footer">'+(step>0?'<button class="button secondary" data-action="back">← Voltar</button>':'<a href="/dashboard/atividades/" class="text-button">Cancelar</a>')+(step<3?'<button class="button" data-action="next">Continuar →</button>':'<div class="actions"><button class="button secondary" data-action="save">Salvar</button><button class="button" data-action="publish">Publicar atividade →</button></div>')+'</div></div>';
  }
  render();
  root.addEventListener('input',event=>{
    const el=event.target as HTMLInputElement;
    if(el.dataset.field){Object.assign(data,{[el.dataset.field]:el.value});return;}
    const i=Number(el.closest<HTMLElement>('[data-q]')?.dataset.q),j=Number(el.closest<HTMLElement>('[data-a]')?.dataset.a),q=data.questions[i];if(!q)return;
    if(el.dataset.question)Object.assign(q,{[el.dataset.question]:el.value});
    if(el.hasAttribute('data-answer'))q.answers[j].text=el.value;
    if(el.hasAttribute('data-correct')){q.answers.forEach((a,n)=>a.correct=n===j);el.closest('.question-editor')!.querySelectorAll('.answer-editor').forEach((row,n)=>row.classList.toggle('selected',n===j));}
  },{signal});
  root.addEventListener('click',async event=>{
    const button=(event.target as Element).closest<HTMLButtonElement>('[data-action]');if(!button||busy)return;
    const action=button.dataset.action,i=Number(button.closest<HTMLElement>('[data-q]')?.dataset.q),j=Number(button.closest<HTMLElement>('[data-a]')?.dataset.a);error(root,'');
    if(action==='next'){
      if(step===0&&!data.title.trim()){error(root,'Dê um título à sua atividade.');return;}
      if(step===1&&data.questions.some(q=>!q.text.trim()||q.answers.some(a=>!a.text.trim())||q.answers.filter(a=>a.correct).length!==1||new Set(q.answers.map(a=>a.text.trim().toLowerCase())).size!==q.answers.length)){error(root,'Preencha cada pergunta e suas alternativas, sem repetições. Marque uma resposta correta.');return;}
      step++;window.scrollTo(0,0);
    }else if(action==='back')step--;
    else if(action==='format')data.template=button.dataset.format as Activity['template'];
    else if(action==='add-question')data.questions.push(blank());
    else if(action==='remove-question'&&data.questions.length>1)data.questions.splice(i,1);
    else if(action==='add-answer'&&data.questions[i].answers.length<6)data.questions[i].answers.push({text:'',correct:false});
    else if(action==='remove-answer'&&data.questions[i].answers.length>2){const answers=data.questions[i].answers;const removed=answers.splice(j,1)[0];if(removed.correct)answers[0].correct=true;}
    else if(action==='save'||action==='publish'){
      busy=true;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
      try{
        const saved=await api<Activity>(id?'activities/'+id+'/':'activities/',{method:id?'PUT':'POST',body:JSON.stringify(data),signal});id=saved.id;
        if(action==='publish')await post('activities/'+id+'/publish/',{},undefined,signal);
        if(signal.aborted)return;
        sessionStorage.removeItem('entrelacos-ai-draft');await navigate('/dashboard/atividades/');
      }catch(e){if(!signal.aborted){render();error(root,e);}}finally{busy=false;}return;
    }
    render();
  },{signal});
}
