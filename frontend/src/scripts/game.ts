import { api, post } from '../lib/client';
import { type Activity, type GameQuestion, type GameResult, type Template, templates } from '../lib/types';
import { esc, error, type Context } from './dom';
type Session={id:string;token:string;question:GameQuestion};
type Feedback={correct:boolean;answer:string;explanation:string;points:number;score:number;finished:boolean;next:GameQuestion|null};
export async function mount({root,signal}:Context){
  let code=new URLSearchParams(location.search).get('codigo')||'',activity:Activity|null=null,name='',template:Template='quiz',session:Session|null=null,question:GameQuestion|null=null,feedback:Feedback|null=null,result:GameResult|null=null,reveal='',busy=false,started=0,score=0;
  const request=<T>(action:string,data?:unknown)=>data===undefined?api<T>('game-sessions/'+session!.id+'/'+action+'/',{headers:{'X-Game-Token':session!.token},signal}):post<T>('game-sessions/'+session!.id+'/'+action+'/',data,{'X-Game-Token':session!.token},signal);
  const format=()=>templates.find(t=>t.id===template)!;
  const timer=setInterval(()=>{const el=root.querySelector('[data-timer]');if(el)el.textContent=Math.floor((Date.now()-started)/1000)+'s';},1000);
  signal.addEventListener('abort',()=>clearInterval(timer),{once:true});
  function render(){
    if(signal.aborted)return;
    let html='';
    if(!activity)html='<section class="join-card"><span class="join-symbol">✳</span><p class="eyebrow">SUA PRÓXIMA DESCOBERTA</p><h1>Vamos aprender<br/><em>juntos?</em></h1><p class="muted">Digite o código que seu professor compartilhou.</p><form data-find><label>Código da atividade<input name="code" class="code-input" placeholder="Ex.: A1B2C3D4" value="'+esc(code)+'" maxlength="8" required pattern="[a-fA-F0-9]{8}"/></label><button class="button full">Encontrar atividade →</button></form><small>Você não precisa de uma conta para participar.</small></section>';
    else if(result)html='<section class="result-card"><span class="result-trophy">🏆</span><p class="eyebrow">CADA PASSO É UMA DESCOBERTA</p><h1>Boa jornada, '+esc(result.name)+'!</h1><p>Atividade concluída. Continue explorando!</p><div class="result-stats">'+[[result.percentage+'%',template==='flashcards'?'autoavaliação':'de acertos'],[result.correct+'/'+result.total,'respostas corretas'],[result.score,'pontos'],[result.seconds+'s','tempo total']].map(([v,l])=>'<div><strong>'+v+'</strong><span>'+l+'</span></div>').join('')+'</div>'+(result.ranking.length?'<div class="ranking"><h2>Ranking · '+format().name+'</h2><p class="small-text">Melhores partidas neste formato. Apelidos são públicos para participantes.</p>'+result.ranking.map((r,i)=>'<div><span>'+(i+1)+'º</span><b>'+esc(r.guest_name)+'</b><strong>'+r.score+' pts</strong></div>').join('')+'</div>':'')+'<button class="button" data-action="restart">Jogar novamente</button><a class="text-button" href="/explorar/">Explorar mais atividades →</a></section>';
    else if(!session)html='<section class="join-card"><span class="join-symbol">'+format().symbol+'</span><p class="eyebrow">'+esc(activity.subject)+' · '+esc(activity.school_year)+'</p><h1 class="activity-game-title">'+esc(activity.title)+'</h1><p class="muted">'+esc(activity.description)+'</p><p class="small-text">'+activity.question_count+' perguntas · por '+esc(activity.creator_name)+'</p><form data-start><label>Como podemos chamar você?<input name="name" value="'+esc(name)+'" placeholder="Seu primeiro nome ou apelido" required maxlength="40"/></label><label>Escolha seu jeito de aprender<select name="template">'+templates.map(t=>'<option value="'+t.id+'" '+(template===t.id?'selected':'')+'>'+t.name+'</option>').join('')+'</select></label><p class="small-text">Seu apelido e pontuação aparecerão no ranking. Evite usar seu nome completo.</p><button class="button full">Começar descoberta ▶</button></form></section>';
    else if(question){
      const q=question;
      html='<section class="play-panel"><div class="play-top"><span>'+esc(activity.title)+'</span><div><span data-timer>'+Math.floor((Date.now()-started)/1000)+'s</span> · '+score+' pts</div></div><div class="progress-track"><div style="width:'+((q.index+(feedback?1:0))/q.total*100)+'%"></div></div><div class="question-count">'+format().name+' <span>PERGUNTA '+(q.index+1)+' DE '+q.total+'</span></div>';
      if(template==='roulette'&&!q.spun){
        const slots=q.wheel_slots||[1],colors=['#b9a5e5','#f1c49c','#a9cebf','#a7c9eb'];
        html+='<div class="roulette-stage"><h1>Gire a roleta para descobrir sua pergunta.</h1><p>'+slots.length+' perguntas disponíveis</p><div class="roulette-wheel" role="img" aria-label="Roleta com '+slots.length+' perguntas" style="background:conic-gradient('+slots.map((_,i)=>colors[i%4]+' '+(i/slots.length*100)+'% '+((i+1)/slots.length*100)+'%').join(',')+')"><span>?</span></div><button class="button" data-action="spin">Girar roleta</button><p role="status" data-spin-status></p></div>';
      }else{
        if(template==='roulette')html+='<p class="roulette-selected" role="status">Pergunta sorteada: '+q.wheel_number+'</p>';
        html+='<h1 class="game-question">'+esc(q.text)+'</h1>';
        if(template==='true-false')html+='<div class="statement"><span>Resposta sugerida</span><strong>'+esc(q.candidate)+'</strong><p>Essa associação está correta?</p></div>';
        if(!feedback){
          if(template==='true-false')html+='<div class="game-answers"><button data-action="true">✓ Verdadeiro</button><button data-action="false">× Falso</button></div>';
          else if(template==='flashcards')html+='<div class="flashcard">'+(reveal?'<p class="eyebrow">VERSO DO CARTÃO</p><h2>'+esc(reveal)+'</h2><p>Você lembrou da resposta?</p><div class="actions"><button class="button secondary" data-action="review">Quero revisar</button><button class="button" data-action="learned">Aprendi</button></div>':'<button class="button secondary" data-action="flip">Virar cartão</button>')+'</div>';
          else html+='<p class="muted game-instruction">'+(template==='match'?'Encontre a resposta que forma um par com esta pergunta.':'Escolha uma alternativa.')+'</p><div class="game-answers '+(template==='match'?'match-answers':'')+'">'+q.answers?.map((a,i)=>'<button data-action="answer" data-answer="'+esc(a.id)+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(a.text)+'</button>').join('')+'</div>';
        }
      }
      if(feedback)html+='<div class="feedback '+(feedback.correct?'right':'wrong')+'" role="status"><div><h2>'+(template==='flashcards'?(feedback.correct?'Mais uma descoberta aprendida!':'Revisar também é aprender.'):feedback.correct?'Isso mesmo!':'Mais uma oportunidade de aprender.')+'</h2><span>+'+feedback.points+' pontos</span></div><p><b>Resposta:</b> '+esc(feedback.answer)+'</p><p>'+esc(feedback.explanation)+'</p><button class="button" data-action="next">'+(feedback.finished?'Ver meu resultado':'Próxima pergunta')+' →</button></div>';
      html+='</section>';
    }
    root.innerHTML='<div class="error" data-error role="alert"></div>'+html+'<p class="game-bottom">Aprender é conectar uma descoberta à outra. ✦</p>';
  }
  async function run(work:()=>Promise<void>){
    if(busy)return;busy=true;error(root,'');root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
    try{await work();if(!signal.aborted)render();}catch(e){if(!signal.aborted)error(root,e);}finally{busy=false;root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);}
  }
  async function find(value:string){code=value.trim().toUpperCase();activity=await api<Activity>('games/'+encodeURIComponent(code)+'/',{signal});template=activity.template;}
  render();
  root.addEventListener('submit',event=>{
    event.preventDefault();const form=event.target as HTMLFormElement,data=new FormData(form);
    void run(async()=>{
      if(form.hasAttribute('data-find'))await find(String(data.get('code')));
      else{name=String(data.get('name'));template=String(data.get('template')) as Template;session=await post<Session>('games/'+code+'/',{name,template},undefined,signal);question=session.question;score=0;started=Date.now();}
    });
  },{signal});
  root.addEventListener('click',event=>{
    const button=(event.target as Element).closest<HTMLButtonElement>('[data-action]');if(!button)return;
    void run(async()=>{
      const action=button.dataset.action;
      if(action==='restart'){session=null;question=null;feedback=null;result=null;reveal='';return;}
      if(action==='spin'){
        const selected=await request<GameQuestion>('spin',{});
        if(signal.aborted)return;
        const wheel=root.querySelector<HTMLElement>('.roulette-wheel')!;
        wheel.style.transform='rotate(1440deg)';
        root.querySelector('[data-spin-status]')!.textContent='Sorteando pergunta…';
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise<void>(resolve=>{const timeout=setTimeout(resolve,2200);signal.addEventListener('abort',()=>{clearTimeout(timeout);resolve();},{once:true});});
        question=selected;return;
      }
      if(action==='flip'){reveal=(await request<{answer:string}>('reveal')).answer;return;}
      if(action==='next'){
        if(feedback!.finished)result=await request<GameResult>('result');
        else{question=feedback!.next;feedback=null;reveal='';}return;
      }
      const answer=action==='answer'?{answer_id:button.dataset.answer}:action==='true'||action==='false'?{value:action==='true'}:{learned:action==='learned'};
      feedback=await request<Feedback>('answer',{question_id:question!.id,...answer});score=feedback.score;
    });
  },{signal});
  if(code)await run(()=>find(code));
}
