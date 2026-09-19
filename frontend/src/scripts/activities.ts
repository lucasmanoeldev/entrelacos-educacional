import { api, post, read } from '../lib/client';
import { type Activity, subjects, templates } from '../lib/types';
import { esc, heading, error, options, dialog, type Context } from './dom';
export async function mount({root,signal,user}: Context) {
  const overview = root.dataset.page === 'overview', mode = root.dataset.mode || 'own', own = mode === 'own';
  const endpoint = own ? 'activities/?summary=1' : mode === 'favorites' ? 'favorites/' : 'explore/';
  let items = await read<Activity[]>(endpoint), query = '', subject = '', template = '';
  if(signal.aborted)return;
  const saved = new Set(mode === 'favorites' ? items.map(a=>a.id) : []);
  root.innerHTML = heading(overview ? 'Olá, '+(user?.name.split(' ')[0] || 'professor(a)')+'!' : own ? 'Minhas atividades' : mode === 'favorites' ? 'Suas ideias favoritas' : 'Uma biblioteca de descobertas.', overview ? 'Que descoberta vamos criar hoje?' : 'Cada atividade é um novo jeito de conectar sua turma.','SEU REPERTÓRIO') +
    (overview ? '<div class="welcome-banner"><div><span class="eyebrow">CADA AULA, UMA NOVA POSSIBILIDADE</span><h2>Sua próxima ideia<br/>pode virar um jogo.</h2><p>Crie uma vez. Explore diferentes jeitos de ensinar.</p><a href="'+(user?.role === 'STUDENT' ? '/jogar/' : '/dashboard/atividades/criar/')+'" class="button cream">Criar uma atividade →</a></div><div class="banner-shapes" aria-hidden="true"><span>✳</span><span>✦</span><span>↗</span></div></div><div data-stats class="stats-grid"></div><div class="section-heading compact"><h2>Continue suas descobertas</h2><a href="/dashboard/atividades/">Ver todas →</a></div>' :
    '<div class="filters"><div class="search-input"><input placeholder="Buscar uma atividade…" aria-label="Buscar atividade" data-search/></div><select aria-label="Filtrar por matéria" data-subject><option value="">Todas as matérias</option>'+options(subjects)+'</select><select aria-label="Filtrar por formato" data-template><option value="">Todos os formatos</option>'+templates.map(t=>'<option value="'+t.id+'">'+t.name+'</option>').join('')+'</select></div>') +
    '<div class="error" data-error role="alert"></div><p role="status" data-notice></p><div data-cards></div>' +
    (overview ? '<div class="section-heading compact"><h2>Um conteúdo, cinco possibilidades</h2></div><div class="template-grid small-templates">'+templates.map(t=>'<a class="template-card '+t.color+'" href="/dashboard/atividades/criar/?template='+t.id+'"><span class="template-symbol">'+t.symbol+'</span><h3>'+t.name+'</h3></a>').join('')+'</div>' : '');
  const actionButton = (a:Activity,action:string,label:string,icon:string) => '<button class="icon-button" data-action="'+action+'" aria-label="'+label+' '+esc(a.title)+'" title="'+label+'">'+icon+'</button>';
  function render(){
    const filtered=items.filter(a=>(a.title+' '+a.subject).toLocaleLowerCase().includes(query.toLocaleLowerCase())&&(!subject||a.subject===subject)&&(!template||a.template===template));
    if(overview)root.querySelector('[data-stats]')!.innerHTML=[[items.length,'Atividades criadas'],[items.reduce((n,a)=>n+a.plays,0),'Partidas concluídas'],[items.filter(a=>a.published).length,'Atividades publicadas']].map(([v,l])=>'<div class="stat"><div><strong>'+v+'</strong><p>'+l+'</p></div></div>').join('');
    root.querySelector('[data-cards]')!.innerHTML = !filtered.length ? '<div class="empty"><h3>Novas ideias começam por aqui.</h3><p>'+(query||subject||template?'Nenhuma atividade encontrada. Experimente outros filtros.':own?'Crie sua primeira atividade e compartilhe com sua turma.':'Ainda não há atividades neste espaço.')+'</p></div>' :
      '<p class="results-count">'+filtered.length+' atividades</p><div class="activity-grid">'+(overview?filtered.slice(0,3):filtered).map(a=>{
        const t=templates.find(t=>t.id===a.template)||templates[0];
        return '<article class="activity-card" data-id="'+esc(a.id)+'"><div class="activity-art '+t.color+'"><span class="art-subject">'+esc(a.subject)+'</span><span class="art-symbol">'+t.symbol+'</span><span class="art-dots">✧</span>'+(own?'<span class="status-badge '+(a.published?'published':'')+'">'+(a.published?'Publicada':'Rascunho')+'</span>':'')+'</div><div class="activity-content"><div class="activity-meta"><span>'+t.name+'</span><span>'+esc(a.school_year)+'</span></div><h3>'+esc(a.title)+'</h3><p class="card-description">'+esc(a.description||'Uma nova oportunidade de aprender e descobrir.')+'</p><div class="card-details"><span>'+(a.question_count??a.questions?.length??0)+' perguntas</span><span>'+a.plays+' jogadas</span></div><div class="card-actions">'+(!own||a.published?'<a class="play-link" href="/jogar/?codigo='+encodeURIComponent(a.code)+'">▶ Jogar</a>':'<button class="play-link" data-action="publish">Publicar →</button>')+'<div>'+
        (own?'<a class="icon-button" aria-label="Editar '+esc(a.title)+'" href="/dashboard/atividades/criar/?id='+encodeURIComponent(a.id)+'">✎</a>'+(a.published?actionButton(a,'share','Compartilhar','↗'):''):'')+
        (user&&user.role!=='STUDENT'?actionButton(a,'duplicate','Duplicar','⧉'):'')+
        (own?actionButton(a,'delete','Excluir','×'):user?actionButton(a,'favorite','Favoritar',saved.has(a.id)?'♥':'♡'):'')+'</div></div>'+
        (own&&a.published?'<button class="subtle-link" data-action="unpublish">Retirar publicação</button>':'')+'</div></article>';
      }).join('')+'</div>';
  }
  async function refresh(){items=await read<Activity[]>(endpoint);if(!signal.aborted)render();}
  render();
  root.addEventListener('input',event=>{const el=event.target as HTMLInputElement;if(el.matches('[data-search]'))query=el.value;else if(el.matches('[data-subject]'))subject=el.value;else if(el.matches('[data-template]'))template=el.value;else return;render();},{signal});
  root.addEventListener('click',async event=>{
    const button=(event.target as Element).closest<HTMLButtonElement>('[data-action]');if(!button)return;
    const a=items.find(a=>a.id===button.closest<HTMLElement>('[data-id]')?.dataset.id);if(!a)return;
    const kind=button.dataset.action;error(root,'');
    if(kind==='share'){
      const url=location.origin+'/jogar/?codigo='+encodeURIComponent(a.code);
      const modal=dialog('Uma descoberta para compartilhar','<div class="qr"><canvas aria-label="QR Code da atividade"></canvas><div><span class="eyebrow">CÓDIGO DA ATIVIDADE</span><strong>'+esc(a.code)+'</strong><p>'+esc(a.title)+'</p></div></div><label>Link da atividade<input readonly value="'+esc(url)+'"/></label><p class="error" data-error></p><button class="button full" data-copy>Copiar link</button><p class="small-text">'+(a.visibility==='private'?'Esta atividade é privada. Altere para “Com link” no editor para permitir convidados.':'Os resultados aparecerão no seu painel após cada partida.')+'</p>');
      modal.querySelector('[data-copy]')!.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);modal.querySelector('[data-copy]')!.textContent='Link copiado!';}catch{error(modal,'Selecione e copie o link acima.');}});
      modal.querySelector('input')!.addEventListener('focus',event=>(event.target as HTMLInputElement).select());
      try{const qr=await import('qrcode');if(modal.isConnected)await qr.toCanvas(modal.querySelector('canvas')!,url,{width:150});}catch(e){error(modal,e);}return;
    }
    if(kind==='delete'){
      const modal=dialog('Excluir esta atividade?','<p>“'+esc(a.title)+'” e seus resultados serão excluídos. Esta ação não pode ser desfeita.</p><div class="error" data-error></div><div class="modal-actions"><button class="button secondary" data-cancel>Cancelar</button><button class="button danger" data-delete>Excluir atividade</button></div>');
      modal.querySelector('[data-cancel]')!.addEventListener('click',()=>modal.close());
      modal.querySelector('[data-delete]')!.addEventListener('click',async event=>{const b=event.currentTarget as HTMLButtonElement;b.disabled=true;try{await api('activities/'+a.id+'/',{method:'DELETE',signal});modal.close();await refresh();}catch(e){error(modal,e);b.disabled=false;}});return;
    }
    button.disabled=true;
    try{
      if(kind==='favorite'){await api('favorites/',{method:saved.has(a.id)?'DELETE':'POST',body:JSON.stringify({activity_id:a.id}),signal});if(saved.has(a.id))saved.delete(a.id);else saved.add(a.id);}
      else await post('activities/'+a.id+'/'+kind+'/',{},undefined,signal);
      if(signal.aborted)return;
      if(kind==='duplicate')root.querySelector('[data-notice]')!.textContent='Cópia salva em Minhas atividades.';
      await refresh();
    }catch(e){if(!signal.aborted)error(root,e);}finally{button.disabled=false;}
  },{signal});
}
