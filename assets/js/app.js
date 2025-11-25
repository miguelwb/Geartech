const s=(k,d)=>localStorage.setItem(k,JSON.stringify(d));
const g=k=>JSON.parse(localStorage.getItem(k)||"null");
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const state={user:null};
const init=()=>{
if(!g('users'))s('users',[]);
if(!g('schedules'))s('schedules',[]);
if(!g('finance'))s('finance',[]);
if(!g('notes'))s('notes',[]);
if(!g('hours')){s('hours',{slot:60,week:{0:{closed:true},1:{open:'08:00',close:'18:00',closed:false},2:{open:'08:00',close:'18:00',closed:false},3:{open:'08:00',close:'18:00',closed:false},4:{open:'08:00',close:'18:00',closed:false},5:{open:'08:00',close:'18:00',closed:false},6:{open:'08:00',close:'12:00',closed:false}},closedDates:[]})}
const users=g('users');
if(!users.find(u=>u.email==='admin@oficina.com')){users.push({id:uid(),nome:'Admin',email:'admin@oficina.com',senha:'admin123',role:'admin'});s('users',users)}
const cu=g('currentUser');
if(cu){state.user=cu;uiRefresh()}
bindNav();
bindAuth();
bindClient();
bindAdmin();
};
const showPage=id=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active')};
const bindNav=()=>{
document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.getAttribute('href').replace('#','');if(id==='cliente'&&!state.user)showPage('auth');else if(id==='admin'&&(!state.user||state.user.role!=='admin'))showPage('auth');else showPage(id)}));
document.getElementById('btnLogin').addEventListener('click',()=>showPage('auth'));
document.getElementById('btnLogout').addEventListener('click',()=>{state.user=null;localStorage.removeItem('currentUser');uiRefresh();showPage('home')});
document.getElementById('ctaAgendar').addEventListener('click',()=>{if(!state.user){showPage('auth')}else{showPage(state.user.role==='admin'?'admin':'cliente')}});
document.getElementById('ctaCadastro').addEventListener('click',()=>showPage('auth'));
};
const uiRefresh=()=>{
const navCli=document.getElementById('navCliente');
const navAdm=document.getElementById('navAdmin');
const btnLogin=document.getElementById('btnLogin');
const btnLogout=document.getElementById('btnLogout');
if(state.user){btnLogin.style.display='none';btnLogout.style.display='inline-block';if(state.user.role==='admin'){navAdm.classList.remove('hidden');navCli.classList.add('hidden');showPage('admin');renderAdmin();renderHours();renderClosedDates()}else{navCli.classList.remove('hidden');navAdm.classList.add('hidden');showPage('cliente');renderClient()}}else{btnLogin.style.display='inline-block';btnLogout.style.display='none';navCli.classList.add('hidden');navAdm.classList.add('hidden')}
};
const bindAuth=()=>{
const lf=document.getElementById('loginForm');
const rf=document.getElementById('registerForm');
lf.addEventListener('submit',e=>{e.preventDefault();const email=document.getElementById('loginEmail').value.trim();const senha=document.getElementById('loginPassword').value.trim();const users=g('users');const u=users.find(x=>x.email===email&&x.senha===senha);if(u){state.user=u;s('currentUser',u);uiRefresh()}else{alert('Credenciais inválidas')}});
rf.addEventListener('submit',e=>{e.preventDefault();const nome=document.getElementById('regNome').value.trim();const email=document.getElementById('regEmail').value.trim();const senha=document.getElementById('regPassword').value.trim();const users=g('users');if(users.find(x=>x.email===email)){alert('Email já cadastrado');return}const u={id:uid(),nome,email,senha,role:'cliente'};users.push(u);s('users',users);alert('Cadastro realizado');state.user=u;s('currentUser',u);uiRefresh()});
};
const bindClient=()=>{
const tabs=document.querySelectorAll('#cliente .tab');
tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById('tab-agendar').classList.add('hidden');document.getElementById('tab-meus').classList.add('hidden');const id=t.dataset.tab==='agendar'?'tab-agendar':'tab-meus';document.getElementById(id).classList.remove('hidden')}));
document.getElementById('srvData').addEventListener('change',()=>{populateSlots()});
document.getElementById('scheduleForm').addEventListener('submit',e=>{e.preventDefault();if(!state.user){showPage('auth');return}const nome=document.getElementById('cliNome').value.trim();const marca=document.getElementById('vehMarca').value.trim();const modelo=document.getElementById('vehModelo').value.trim();const ano=parseInt(document.getElementById('vehAno').value,10);const placa=document.getElementById('vehPlaca').value.trim();const tipo=document.getElementById('srvTipo').value;const descricao=document.getElementById('srvDesc').value.trim();const data=document.getElementById('srvData').value;const hora=document.getElementById('srvHora').value;const schedules=g('schedules');schedules.push({id:uid(),userId:state.user.id,nome,veiculo:{marca,modelo,ano,placa},tipo,descricao,data,hora,status:'Pendente'});s('schedules',schedules);renderClient();document.getElementById('scheduleForm').reset();alert('Agendamento enviado')});
};
const renderClient=()=>{
const list=document.getElementById('meusAgendamentos');
const schedules=g('schedules').filter(x=>state.user&&x.userId===state.user.id);
list.innerHTML='';
schedules.forEach(x=>{const el=document.createElement('div');el.className='item';const left=document.createElement('div');const right=document.createElement('div');const h=document.createElement('h4');h.textContent=x.tipo+' • '+x.data+' '+x.hora;const p=document.createElement('p');p.textContent=x.descricao;const v=document.createElement('p');v.textContent=x.veiculo.marca+' '+x.veiculo.modelo+' '+x.veiculo.ano+' • '+x.veiculo.placa;left.appendChild(h);left.appendChild(v);left.appendChild(p);const b=document.createElement('span');b.className='badge '+(x.status==='Pendente'?'pending':x.status==='Em processo'?'progress':'done');b.textContent=x.status;right.appendChild(b);el.appendChild(left);el.appendChild(right);list.appendChild(el)});
};
const bindAdmin=()=>{
const tabs=document.querySelectorAll('#admin .tab');
tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');['tab-adm-ag','tab-adm-fi','tab-adm-no','tab-adm-ho'].forEach(id=>document.getElementById(id)&&document.getElementById(id).classList.add('hidden'));document.getElementById('tab-'+t.dataset.tab).classList.remove('hidden')}));
document.getElementById('admFiltro').addEventListener('change',renderAdmin);
const admForm=document.getElementById('admEditForm');
if(admForm){admForm.addEventListener('submit',e=>{e.preventDefault();const id=document.getElementById('admAgId').value;const schedules=g('schedules');const i=schedules.findIndex(x=>x.id===id);if(i>=0){schedules[i].nome=document.getElementById('admNome').value.trim();schedules[i].tipo=document.getElementById('admTipo').value;schedules[i].descricao=document.getElementById('admDesc').value.trim();schedules[i].data=document.getElementById('admData').value;schedules[i].hora=document.getElementById('admHora').value;schedules[i].status=document.getElementById('admStatus').value;s('schedules',schedules);renderAdmin();alert('Agendamento atualizado')}})}
document.getElementById('financeForm').addEventListener('submit',e=>{e.preventDefault();const tipo=document.getElementById('finTipo').value;const categoria=document.getElementById('finCat').value.trim();const descricao=document.getElementById('finDesc').value.trim();const valor=parseFloat(document.getElementById('finValor').value);const data=document.getElementById('finData').value;const fin=g('finance');fin.push({id:uid(),tipo,categoria,descricao,valor,data});s('finance',fin);renderFinance();document.getElementById('financeForm').reset();});
document.getElementById('noteForm').addEventListener('submit',e=>{e.preventDefault();const categoria=document.getElementById('noteCat').value.trim();const titulo=document.getElementById('noteTitle').value.trim();const conteudo=document.getElementById('noteBody').value.trim();const notes=g('notes');notes.push({id:uid(),categoria,titulo,conteudo,data:new Date().toISOString().slice(0,10)});s('notes',notes);renderNotes();document.getElementById('noteForm').reset();});
document.getElementById('noteFilter').addEventListener('change',renderNotes);
const addBtn=document.getElementById('hoAddBtn');
if(addBtn){addBtn.addEventListener('click',()=>{const d=document.getElementById('hoAddDate').value;if(!d)return;const h=g('hours');if(!h.closedDates.includes(d)){h.closedDates.push(d);s('hours',h);renderClosedDates();document.getElementById('hoAddDate').value=''}})}
const hf=document.getElementById('hoursForm');
if(hf){hf.addEventListener('submit',e=>{e.preventDefault();const h=g('hours');h.slot=parseInt(document.getElementById('hoSlot').value,10)||60;for(let i=0;i<=6;i++){const closed=document.getElementById('hoClosed'+i).checked;const open=document.getElementById('hoOpen'+i).value||null;const close=document.getElementById('hoClose'+i).value||null;h.week[i]=closed?{closed:true}:{open,close,closed:false}}s('hours',h);alert('Horários salvos')})}
};
const setScheduleStatus=(id,status)=>{const schedules=g('schedules');const i=schedules.findIndex(x=>x.id===id);if(i>=0){schedules[i].status=status;s('schedules',schedules);renderAdmin()}};
const renderAdmin=()=>{
const wrap=document.getElementById('admAgList');
const filtro=document.getElementById('admFiltro').value;
const schedules=g('schedules');
wrap.innerHTML='';
schedules.filter(x=>!filtro||x.status===filtro).forEach(x=>{const el=document.createElement('div');el.className='item';const left=document.createElement('div');const right=document.createElement('div');right.className='right';const h=document.createElement('h4');h.textContent=x.nome+' • '+x.tipo+' • '+x.data+' '+x.hora;const p=document.createElement('p');p.textContent=x.descricao;const v=document.createElement('p');v.textContent=x.veiculo.marca+' '+x.veiculo.modelo+' '+x.veiculo.ano+' • '+x.veiculo.placa;left.appendChild(h);left.appendChild(v);left.appendChild(p);const badge=document.createElement('span');badge.className='badge '+(x.status==='Pendente'?'pending':x.status==='Em processo'?'progress':'done');badge.textContent=x.status;right.appendChild(badge);const actions=document.createElement('div');actions.className='actions';if(x.status==='Pendente'){const startBtn=document.createElement('button');startBtn.className='btn';startBtn.textContent='Iniciar';startBtn.addEventListener('click',()=>setScheduleStatus(x.id,'Em processo'));actions.appendChild(startBtn)}else if(x.status==='Em processo'){const finishBtn=document.createElement('button');finishBtn.className='btn accent';finishBtn.textContent='Concluir';finishBtn.addEventListener('click',()=>setScheduleStatus(x.id,'Concluído'));actions.appendChild(finishBtn)}if(actions.childElementCount>0)right.appendChild(actions);el.appendChild(left);el.appendChild(right);wrap.appendChild(el)});
};
const fillAdminEdit=x=>{
document.getElementById('admAgId').value=x.id;
document.getElementById('admNome').value=x.nome;
document.getElementById('admTipo').value=x.tipo;
document.getElementById('admDesc').value=x.descricao;
document.getElementById('admData').value=x.data;
document.getElementById('admHora').value=x.hora;
document.getElementById('admStatus').value=x.status;
};
const renderFinance=()=>{
const fin=g('finance');
const list=document.getElementById('finList');
list.innerHTML='';
fin.slice().reverse().forEach(x=>{const el=document.createElement('div');el.className='item';const left=document.createElement('div');const right=document.createElement('div');const h=document.createElement('h4');h.textContent=(x.tipo==='entrada'?'Entrada':'Saída')+' • '+x.categoria+' • '+x.data;const p=document.createElement('p');p.textContent=x.descricao;const v=document.createElement('p');v.textContent='R$ '+x.valor.toFixed(2);left.appendChild(h);left.appendChild(p);left.appendChild(v);const tag=document.createElement('span');tag.className='badge '+(x.tipo==='entrada'?'done':'pending');tag.textContent=x.tipo;right.appendChild(tag);el.appendChild(left);el.appendChild(right);list.appendChild(el)});
const now=new Date();const ym=now.toISOString().slice(0,7);const mes=fin.filter(x=>x.data.slice(0,7)===ym);const ent=mes.filter(x=>x.tipo==='entrada').reduce((a,b)=>a+b.valor,0);const sai=mes.filter(x=>x.tipo==='saida').reduce((a,b)=>a+b.valor,0);const bal=ent-sai;const resumo=document.getElementById('finResumo');resumo.innerHTML='';[['Entradas',ent],['Saídas',sai],['Balanço',bal]].forEach(([t,v])=>{const sdiv=document.createElement('div');sdiv.className='stat';sdiv.innerHTML='<div>'+t+'</div><div><strong>R$ '+v.toFixed(2)+'</strong></div>';resumo.appendChild(sdiv)});
const max=Math.max(ent,sai,1);document.getElementById('barEntrada').style.height=(ent/max*100)+'%';document.getElementById('barSaida').style.height=(sai/max*100)+'%';
};
const renderNotes=()=>{
const notes=g('notes');
const filter=document.getElementById('noteFilter');
const setCats=[...new Set(notes.map(n=>n.categoria))];filter.innerHTML='<option value="">Todas</option>'+setCats.map(c=>'<option>'+c+'</option>').join('');
const list=document.getElementById('noteList');
const f=filter.value;list.innerHTML='';
notes.filter(n=>!f||n.categoria===f).slice().reverse().forEach(n=>{const el=document.createElement('div');el.className='item';const left=document.createElement('div');const right=document.createElement('div');const h=document.createElement('h4');h.textContent=n.titulo+' • '+n.categoria;const p=document.createElement('p');p.textContent=n.conteudo;const d=document.createElement('p');d.textContent=n.data;left.appendChild(h);left.appendChild(p);left.appendChild(d);const del=document.createElement('button');del.className='btn';del.textContent='Excluir';del.addEventListener('click',()=>{const ns=g('notes').filter(x=>x.id!==n.id);s('notes',ns);renderNotes()});right.appendChild(del);el.appendChild(left);el.appendChild(right);list.appendChild(el)});
};
const timeToMinutes=t=>{const [h,m]=t.split(':').map(n=>parseInt(n,10));return h*60+m};
const minutesToTime=m=>{const h=(''+Math.floor(m/60)).padStart(2,'0');const mm=(''+(m%60)).padStart(2,'0');return h+':'+mm};
const slotsForDate=d=>{const h=g('hours');if(!h)return[];if(h.closedDates.includes(d))return[];const dt=new Date(d+'T00:00:00');const wd=dt.getDay();const cfg=h.week[wd];if(!cfg||cfg.closed)return[];if(!cfg.open||!cfg.close)return[];const used=g('schedules').filter(x=>x.data===d).map(x=>x.hora);const start=timeToMinutes(cfg.open);const end=timeToMinutes(cfg.close);const out=[];for(let m=start;m+h.slot<=end;m+=h.slot){const t=minutesToTime(m);if(!used.includes(t))out.push(t)}return out};
const populateSlots=()=>{const d=document.getElementById('srvData').value;const sel=document.getElementById('srvHora');const hint=document.getElementById('slotsInfo');sel.innerHTML='';if(!d){sel.disabled=true;sel.innerHTML='<option value="">Selecione a data</option>';hint.textContent='Selecione a data para ver horários disponíveis.';return}const slots=slotsForDate(d);if(slots.length===0){sel.disabled=true;sel.innerHTML='<option value="">Sem disponibilidade nesta data</option>';hint.textContent='Sem horários disponíveis para a data selecionada.';return}slots.forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=t;sel.appendChild(o)});sel.disabled=false;hint.textContent='Selecione um horário disponível.'};
document.addEventListener('DOMContentLoaded',()=>{init();renderFinance();renderNotes()});
const renderHours=()=>{const h=g('hours');if(!h)return;const slot=document.getElementById('hoSlot');if(slot)slot.value=h.slot;for(let i=0;i<=6;i++){const cfg=h.week[i]||{closed:true};const co=document.getElementById('hoClosed'+i);const op=document.getElementById('hoOpen'+i);const cl=document.getElementById('hoClose'+i);if(co)co.checked=!!cfg.closed;if(op)op.value=cfg.open||'';if(cl)cl.value=cfg.close||''}};
const renderClosedDates=()=>{const h=g('hours');const list=document.getElementById('hoClosedList');if(!list||!h)return;list.innerHTML='';h.closedDates.slice().sort().forEach(d=>{const el=document.createElement('div');el.className='item';const left=document.createElement('div');const right=document.createElement('div');const h4=document.createElement('h4');h4.textContent=d;left.appendChild(h4);const del=document.createElement('button');del.className='btn';del.textContent='Remover';del.addEventListener('click',()=>{const hh=g('hours');hh.closedDates=hh.closedDates.filter(x=>x!==d);s('hours',hh);renderClosedDates()});right.appendChild(del);el.appendChild(left);el.appendChild(right);list.appendChild(el)})};