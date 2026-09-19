import { api, read } from '../lib/client';
import type { Activity, GameResult } from '../lib/types';
import { esc, heading, error, loading, type Context } from './dom';
export async function mount({root,signal}:Context){
  const activities=await read<Activity[]>('activities/?summary=1');if(signal.aborted)return;
  let results:GameResult[]=[],version=0;
  root.innerHTML=heading('Cada resultado conta uma história.','Veja como sua turma está aprendendo, uma atividade de cada vez.','ACOMPANHAR PARA ENSINAR MELHOR')+'<button class="button secondary" data-export hidden>Exportar CSV</button><label class="report-select">Escolha a atividade<select><option value="" disabled>Selecione uma atividade</option>'+activities.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.title)+'</option>').join('')+'</select></label><div class="error" data-error role="alert"></div><div data-results></div>';
  async function load(id:string){
    const current=++version,output=root.querySelector('[data-results]')!,exportButton=root.querySelector<HTMLButtonElement>('[data-export]')!;
    exportButton.hidden=true;output.innerHTML=loading;error(root,'');
    try{
      const [activity,rows]=await Promise.all([api<Activity>('activities/'+id+'/',{signal}),api<GameResult[]>('activities/'+id+'/results/',{signal})]);
      if(signal.aborted||current!==version)return;
      results=rows;exportButton.hidden=!rows.length;
      const competitive=rows.filter(r=>r.template!=='flashcards'),average=competitive.length?Math.round(competitive.reduce((s,r)=>s+r.percentage,0)/competitive.length):0;
      output.innerHTML=rows.length?'<div class="stats-grid">'+[[rows.length,'Partidas concluídas'],[average+'%','Média de acertos · jogos avaliados'],[Math.round(rows.reduce((s,r)=>s+r.seconds,0)/rows.length)+'s','Tempo médio']].map(([v,l])=>'<div class="stat"><div><strong>'+v+'</strong><p>'+l+'</p></div></div>').join('')+'</div><div class="table-wrap"><table><thead><tr><th>Participante</th><th>Formato</th><th>Acertos</th><th>Pontos</th><th>Tempo</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+esc(r.name)+'</b></td><td>'+esc(r.template)+'</td><td><span class="badge">'+r.correct+'/'+r.total+' · '+r.percentage+'%</span></td><td>'+r.score+'</td><td>'+r.seconds+'s</td></tr>').join('')+'</tbody></table></div><h2 class="report-heading">Aprendizagem por pergunta</h2><p class="small-text">Flashcards não entram na média. Edições da atividade preservam os resultados anteriores.</p><div class="question-report">'+activity.questions.map((q,i)=>{const responses=competitive.flatMap(r=>r.responses).filter(r=>r.question_id===q.id),percent=responses.length?Math.round(responses.filter(r=>r.correct).length/responses.length*100):0;return '<div><b>'+(i+1)+'. '+esc(q.text)+'</b><div class="progress-track"><div style="width:'+percent+'%"></div></div><span>'+(responses.length?percent+'% de acertos · '+responses.length+' respostas':'Sem respostas nesta versão')+'</span></div>';}).join('')+'</div>':'<div class="empty"><h3>As descobertas vão aparecer aqui.</h3><p>Os resultados aparecem após a conclusão de cada partida.</p></div>';
    }catch(e){if(!signal.aborted&&current===version){output.innerHTML='';error(root,e);}}
  }
  root.querySelector('select')!.addEventListener('change',event=>void load((event.target as HTMLSelectElement).value),{signal});
  root.querySelector('[data-export]')!.addEventListener('click',()=>{
    const cell=(s:string)=>'"'+(/^[=+@\-\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';
    const csv='\uFEFF'+[['Participante','Formato','Acertos','Total','Pontos','Tempo (s)'],...results.map(r=>[r.name,r.template,String(r.correct),String(r.total),String(r.score),String(r.seconds)])].map(row=>row.map(cell).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='resultados-entrelacos.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  },{signal});
  if(activities[0]){root.querySelector('select')!.value=activities[0].id;await load(activities[0].id);}
  else root.querySelector('[data-results]')!.innerHTML='<div class="empty">Crie uma atividade para acompanhar os resultados.</div>';
}
