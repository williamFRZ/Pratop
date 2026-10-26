'use strict';
// TACO 4ª ed., 2011: kcal, proteína, carboidrato e lipídeos por 100 g.
const foods = [
 {id:1,name:'Arroz integral, cozido',kcal:124,p:2.6,c:25.8,f:1},
 {id:3,name:'Arroz tipo 1, cozido',kcal:128,p:2.5,c:28.1,f:0.2},
 {id:7,name:'Aveia em flocos, crua',kcal:394,p:13.9,c:66.6,f:8.5},
 {id:45,name:'Milho verde, enlatado, drenado',kcal:98,p:3.2,c:17.1,f:2.4},
 {id:52,name:'Pão de trigo integral, forma',kcal:253,p:9.4,c:49.9,f:3.7},
 {id:53,name:'Pão de trigo francês',kcal:300,p:8,c:58.6,f:3.1},
 {id:64,name:'Abóbora cabotian, cozida',kcal:48,p:1.4,c:10.8,f:0.7},
 {id:70,name:'Abobrinha italiana, cozida',kcal:15,p:1.1,c:3,f:0.2},
 {id:78,name:'Alface crespa, crua',kcal:11,p:1.3,c:1.7,f:0.2},
 {id:82,name:'Alho, cru',kcal:113,p:7,c:23.9,f:0.2},
 {id:88,name:'Batata doce, cozida',kcal:77,p:0.6,c:18.4,f:0.1},
 {id:129,name:'Mandioca, cozida',kcal:125,p:0.6,c:30.1,f:0.3},
 {id:157,name:'Tomate com semente, cru',kcal:15,p:1.1,c:3.1,f:0.2},
 {id:163,name:'Abacate, cru',kcal:96,p:1.2,c:6,f:8.4},
 {id:164,name:'Abacaxi, cru',kcal:48,p:0.9,c:12.3,f:0.1},
 {id:179,name:'Banana nanica, crua',kcal:92,p:1.4,c:23.8,f:0.1},
 {id:182,name:'Banana prata, crua',kcal:98,p:1.3,c:26,f:0.1},
 {id:408,name:'Frango, peito sem pele, cozido',kcal:163,p:31.5,c:0,f:3.2},
 {id:410,name:'Frango, peito sem pele, grelhado',kcal:159,p:32,c:0,f:2.5},
 {id:561,name:'Feijão carioca, cozido',kcal:76,p:4.8,c:13.6,f:0.5},
 {id:567,name:'Feijão preto, cozido',kcal:77,p:4.5,c:14,f:0.5},
 {id:577,name:'Lentilha, cozida',kcal:93,p:6.3,c:16.3,f:0.5}
];
const $ = s => document.querySelector(s);
const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = x => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(x);
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = dateKey(new Date());
const dateLabel = s => { const [y,m,d]=s.split('-'); return `${d}/${m}/${y}`; };
const key='meu-prato-v1';
let meals=[]; let draft=[];
try { const saved=JSON.parse(localStorage.getItem(key)||'[]'); if(Array.isArray(saved)) meals=saved; } catch { console.warn('Dados locais indisponíveis.'); }
const persist = () => localStorage.setItem(key,JSON.stringify(meals));
const sum = items => items.reduce((s,i) => { for(const k of ['kcal','p','c','f']) s[k]+=i[k]*i.grams/100; return s; },{kcal:0,p:0,c:0,f:0});
const sumMeals = ms => sum(ms.flatMap(m=>m.items));
const cards = n => [['Energia',n.kcal,'kcal'],['Proteínas',n.p,'g'],['Carboidratos',n.c,'g'],['Gorduras',n.f,'g']].map(([label,value,unit])=>`<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${fmt(value)} <small>${unit}</small></div></div>`).join('');
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const titles={inicio:['Um olhar para o seu dia.','Seu espaço para registrar, descobrir e acompanhar.'],registro:['Vamos registrar?','Cada refeição conta uma parte da sua rotina.'],receitas:['Inspiração para cozinhar.','Ideias para aproveitar o que você já tem.'],relatorios:['Seu progresso, no seu ritmo.','Uma visão dos seus registros ao longo do tempo.']};
function page(name){ if(!titles[name]) return; document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id===name)); document.querySelectorAll('.nav').forEach(e=>e.classList.toggle('active',e.dataset.page===name)); $('#pageTitle').textContent=titles[name][0]; $('#pageSubtitle').textContent=titles[name][1]; if(name==='inicio') renderHome(); if(name==='relatorios') renderReport(); window.scrollTo(0,0); }
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.go)));
$('#todayLabel').textContent=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(new Date());
$('#mealDate').value=today; $('#reportDate').value=today;
$('#foodSelect').innerHTML=foods.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('');
function renderDraft(){ $('#draftFoods').innerHTML=draft.length ? draft.map((x,i)=>`<div class="draft-row"><span>${esc(x.name)} · ${fmt(x.grams)} g</span><button class="delete" data-draft="${i}">Remover</button></div>`).join('') : '<div class="empty">Nenhum alimento adicionado ainda.</div>'; const t=sum(draft); $('#draftTotals').textContent=draft.length?`Total estimado: ${fmt(t.kcal)} kcal · ${fmt(t.p)} g proteínas · ${fmt(t.c)} g carboidratos · ${fmt(t.f)} g gorduras`:''; }
$('#draftFoods').addEventListener('click',e=>{if(e.target.dataset.draft!==undefined){draft.splice(Number(e.target.dataset.draft),1);renderDraft();}});
$('#addFood').addEventListener('click',()=>{let grams=Number($('#grams').value);const food=foods.find(f=>f.id===Number($('#foodSelect').value));if(!food||!Number.isFinite(grams)||grams<=0||grams>10000){$('#formMessage').textContent='Informe uma quantidade entre 0,1 e 10.000 g.';return;} draft.push({...food,grams});$('#grams').value='';$('#formMessage').textContent='';renderDraft();});
$('#saveMeal').addEventListener('click',()=>{if(!draft.length||!$('#mealDate').value){$('#formMessage').textContent='Adicione ao menos um alimento e informe a data.';return;} meals.push({id:makeId(),date:$('#mealDate').value,type:$('#mealType').value,items:draft});try{persist();}catch{meals.pop();$('#formMessage').textContent='Não foi possível salvar no navegador.';return;} draft=[];renderDraft();$('#formMessage').textContent='Refeição salva com sucesso.';renderHome();});
function mealList(list){if(!list.length)return '<div class="empty">Nenhuma refeição registrada neste período.</div>';return list.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(m=>{let t=sum(m.items);return `<div class="meal-row"><div><strong>${esc(m.type)}</strong><small>${esc(dateLabel(m.date))} · ${m.items.map(i=>`${esc(i.name)} (${fmt(i.grams)} g)`).join(', ')}</small></div><div class="right"><strong>${fmt(t.kcal)} kcal</strong><button class="delete" data-delete="${esc(m.id)}">Excluir</button></div></div>`}).join('');}
document.addEventListener('click',e=>{const id=e.target.dataset.delete;if(id&&confirm('Excluir esta refeição?')){const previous=meals;meals=meals.filter(m=>m.id!==id);try{persist();}catch{meals=previous;alert('Não foi possível salvar a alteração.');}renderHome();renderReport();}});
function renderHome(){let list=meals.filter(m=>m.date===today);$('#summary').innerHTML=cards(sumMeals(list));$('#todayMeals').innerHTML=mealList(list);}
function range(){const d=$('#reportDate').value||today;const [y,m,day]=d.split('-').map(Number);let count=$('#reportPeriod').value==='week'?7:1;return Array.from({length:count},(_,i)=>dateKey(new Date(y,m-1,day-(count-1-i))));}
function renderReport(){let dates=range(), list=meals.filter(m=>dates.includes(m.date));$('#reportStats').innerHTML=cards(sumMeals(list));$('#reportMeals').innerHTML=mealList(list);const values=dates.map(d=>sumMeals(list.filter(m=>m.date===d)).kcal);const max=Math.max(...values,1);$('#chart').innerHTML=dates.map((d,i)=>`<div class="chart-col"><span class="bar-value">${fmt(values[i])}</span><div class="bar" style="height:${Math.max(1,values[i]/max*80)}%"></div><span>${d.slice(8,10)}/${d.slice(5,7)}</span></div>`).join('');}
$('#reportDate').addEventListener('change',renderReport);$('#reportPeriod').addEventListener('change',renderReport);
async function askAI(tipo, input, output, button){const value=$(input).value.trim();if(!value){$(output).textContent='Escreva algumas informações para continuar.';return;} button.disabled=true;$(output).textContent='Consultando a IA...';try{const res=await fetch('/api/ia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,texto:value})});const data=await res.json();$(output).textContent=res.ok?data.texto:data.error||'Não foi possível consultar a IA.';}catch{$(output).textContent='Não foi possível conectar ao servidor local.';}finally{button.disabled=false;}}
$('#interpret').addEventListener('click',e=>askAI('interpretar','#mealDescription','#interpretResult',e.currentTarget));$('#getRecipes').addEventListener('click',e=>askAI('receitas','#ingredients','#recipeResult',e.currentTarget));
fetch('/api/status').then(r=>r.json()).then(s=>{$('#aiStatus').textContent=s.configured?'IA: chave configurada.':'IA: chave não configurada.';}).catch(()=>{$('#aiStatus').textContent='Servidor indisponível.';});
$('#export').addEventListener('click',()=>{let blob=new Blob([JSON.stringify({versao:1,refeicoes:meals},null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`meu-prato-${today}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
function validMeal(m){return m&&typeof m.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&['Café da manhã','Almoço','Jantar','Lanche','Outra'].includes(m.type)&&Array.isArray(m.items)&&m.items.length>0&&m.items.every(i=>i&&typeof i.name==='string'&&i.name.length<200&&['grams','kcal','p','c','f'].every(k=>typeof i[k]==='number'&&Number.isFinite(i[k])&&i[k]>=0)&&i.grams>0&&i.grams<=10000);}
$('#import').addEventListener('click',()=>$('#importFile').click());$('#importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2e6)throw Error();const data=JSON.parse(await file.text());if(data.versao!==1||!Array.isArray(data.refeicoes)||!data.refeicoes.every(validMeal))throw Error();if(confirm('Substituir os registros atuais pelos dados do arquivo?')){const previous=meals;meals=data.refeicoes;try{persist();}catch{meals=previous;throw Error();}renderHome();renderReport();alert('Dados importados.');}}catch{alert('Arquivo inválido ou não foi possível salvar os dados.');}e.target.value='';});
renderDraft();renderHome();renderReport();
