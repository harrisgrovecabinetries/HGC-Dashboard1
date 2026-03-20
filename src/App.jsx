import { useState, useEffect } from "react";

const S={bg:"#060810",bg2:"#0c1019",bg3:"#111827",bg4:"#1a2236",border:"#1e2a42",text:"#e2e8f0",muted:"#64748b",dim:"#334155",accent:"#3b82f6",green:"#10b981",red:"#ef4444",yellow:"#f59e0b",purple:"#8b5cf6",cyan:"#06b6d4"};
const PC={urgent:S.red,high:S.yellow,normal:S.accent,low:S.muted};
const SC={new:S.accent,contacted:S.yellow,qualified:S.purple,quoted:S.cyan,won:S.green,active:S.accent,in_progress:S.yellow,complete:S.green,on_hold:S.muted};
const fmt$=n=>"$"+Math.abs(Math.round(n)).toLocaleString();
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function ld(k){try{const v=localStorage.getItem("hg_"+k);return v?JSON.parse(v):null}catch{return null}}
function sv(k,v){try{localStorage.setItem("hg_"+k,JSON.stringify(v))}catch(e){console.error(e)}}

function Pill({text,color}){return<span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:600,textTransform:"uppercase",background:color+"18",color,border:`1px solid ${color}30`,display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:5,height:5,borderRadius:"50%",background:color}}/>{text}</span>}

function FileSection({label,color,icon,files,onUpload,onDelete,viewingFile,setViewingFile}){
  const handleChange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{onUpload({name:file.name,type:file.type,data:ev.target.result,date:new Date().toISOString().slice(0,10)});e.target.value=""};reader.readAsDataURL(file)};
  return<div style={{background:S.bg3,border:`1px solid ${S.border}`,borderRadius:14,padding:20,marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:8,height:8,borderRadius:"50%",background:color}}/><span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{label}</span><span style={{fontSize:11,color:S.muted}}>{files.length}</span></div>
    <div style={{background:S.bg,border:`2px dashed ${color}40`,borderRadius:10,padding:"14px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:11,color}}>Upload:</span>
      <input type="file" onChange={handleChange} style={{fontSize:12,color:S.muted,flex:1}}/>
    </div>
    {files.length===0?<div style={{padding:8,textAlign:"center",color:S.dim,fontSize:12}}>No files yet</div>:
    files.map((f,i)=><div key={i}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:S.bg,border:`1px solid ${S.border}`,borderLeft:`3px solid ${color}`,borderRadius:"0 8px 8px 0",marginBottom:viewingFile===`${label}-${i}`?0:6,cursor:"pointer"}} onClick={()=>setViewingFile(viewingFile===`${label}-${i}`?null:`${label}-${i}`)}>
        <span style={{fontSize:16}}>{icon}</span>
        <span style={{flex:1,fontSize:13,fontWeight:500,color:f.data?"#60a5fa":S.muted}}>{f.name}</span>
        <span style={{padding:"3px 10px",borderRadius:6,background:color+"20",border:`1px solid ${color}40`,fontSize:10,color,fontWeight:600}}>{viewingFile===`${label}-${i}`?"Hide":"View"}</span>
        <span style={{fontSize:10,color:S.dim}}>{f.date}</span>
        <button onClick={e=>{e.stopPropagation();onDelete(i)}} style={{background:"none",border:"none",color:S.dim,cursor:"pointer",fontSize:14}}>×</button>
      </div>
      {viewingFile===`${label}-${i}`&&f.data&&<div style={{marginBottom:6,border:`1px solid ${S.border}`,borderTop:"none",borderRadius:"0 0 8px 8px",overflow:"hidden",background:"#000"}}>
        {f.data.startsWith("data:image")?<img src={f.data} style={{maxWidth:"100%",maxHeight:500,display:"block",margin:"0 auto"}}/>:
        f.type?.includes("pdf")||f.data.includes("pdf")?<iframe src={f.data} style={{width:"100%",height:500,border:"none"}}/>:
        <div style={{padding:20,color:S.muted,textAlign:"center"}}>
          <div style={{marginBottom:10}}>File: {f.name}</div>
          <a href={f.data} download={f.name} style={{color:S.accent,textDecoration:"underline",fontSize:14}}>Click here to download</a>
        </div>}
      </div>}
    </div>)}
  </div>
}

export default function App(){
  const[tab,setTab]=useState("dash");const[leads,setLeads]=useState([]);const[builders,setBuilders]=useState([]);const[jobs,setJobs]=useState([]);const[ready,setReady]=useState(false);const[modal,setModal]=useState(null);const[form,setForm]=useState({});const[selJob,setSelJob]=useState(null);const[viewingFile,setViewingFile]=useState(null);
  useEffect(()=>{const l=ld("leads"),b=ld("builders"),j=ld("jobs");if(l)setLeads(l);if(b)setBuilders(b);if(j)setJobs(j);setReady(true)},[]);
  const sL=v=>{setLeads(v);sv("leads",v)};const sB=v=>{setBuilders(v);sv("builders",v)};const sJ=v=>{setJobs(v);sv("jobs",v)};
  const updateJob=(ji,fn)=>{const nj=[...jobs];fn(nj[ji]);sJ(nj)};
  const tv=jobs.reduce((s,j)=>s+(j.price||0),0),tp=jobs.reduce((s,j)=>s+(j.paid||0),0),te=jobs.reduce((s,j)=>s+((j.expenses||[]).reduce((s2,e)=>s2+(e.amt||0),0)),0);
  if(!ready)return<div style={{padding:40,color:S.muted,background:S.bg,minHeight:"100vh"}}>Loading...</div>;
  const Card=({children,style,onClick})=><div onClick={onClick} style={{background:S.bg3,border:`1px solid ${S.border}`,borderRadius:14,padding:20,cursor:onClick?"pointer":"default",...style}}>{children}</div>;
  const Btn=({children,onClick,color,style})=><button onClick={onClick} style={{padding:"8px 18px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:color||S.accent,color:"#fff",...style}}>{children}</button>;
  const Input=({label,value,onChange,type,placeholder})=><div style={{display:"flex",flexDirection:"column",gap:4}}>{label&&<label style={{fontSize:11,color:S.muted}}>{label}</label>}<input type={type||"text"} value={value||""} onChange={onChange} placeholder={placeholder} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none"}}/></div>;

  const renderJobDetail=()=>{const ji=jobs.findIndex(j=>j.id===selJob);if(ji===-1){setSelJob(null);return null}const j=jobs[ji],exp=(j.expenses||[]).reduce((s,e)=>s+(e.amt||0),0),pct=j.price>0?Math.round((j.paid||0)/j.price*100):0,tasks=j.tasks||[],todo=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done);
    return<div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <Btn onClick={()=>setSelJob(null)} color="transparent" style={{border:`1px solid ${S.border}`,color:S.muted}}>← Back</Btn>
        <div style={{flex:1}}><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{j.name}</div><div style={{fontSize:12,color:S.muted}}>{j.client} · {j.address}</div></div>
        <select value={j.status} onChange={e=>updateJob(ji,x=>x.status=e.target.value)} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:8,padding:"4px 8px",color:SC[j.status]||S.accent,cursor:"pointer",outline:"none",fontSize:11}}>
          <option value="active">Active</option><option value="in_progress">In Progress</option><option value="on_hold">On Hold</option><option value="complete">Complete</option>
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <Card style={{padding:"14px 16px"}}><div style={{fontSize:11,color:S.muted,textTransform:"uppercase",marginBottom:4}}>Total</div><div style={{fontSize:22,fontWeight:700,color:S.accent,fontFamily:"monospace"}}>{fmt$(j.price||0)}</div></Card>
        <Card style={{padding:"14px 16px"}}><div style={{fontSize:11,color:S.muted,textTransform:"uppercase",marginBottom:4}}>Paid</div><div style={{fontSize:22,fontWeight:700,color:S.green,fontFamily:"monospace"}}>{fmt$(j.paid||0)}</div>
          <Btn onClick={()=>{const a=prompt("Payment amount ($):");if(a)updateJob(ji,x=>x.paid=(x.paid||0)+parseFloat(a))}} color="transparent" style={{border:`1px solid ${S.green}30`,color:S.green,marginTop:6,fontSize:10,padding:"4px 10px"}}>+ Payment</Btn></Card>
        <Card style={{padding:"14px 16px"}}><div style={{fontSize:11,color:S.muted,textTransform:"uppercase",marginBottom:4}}>Expenses</div><div style={{fontSize:22,fontWeight:700,color:S.red,fontFamily:"monospace"}}>{fmt$(exp)}</div>
          <Btn onClick={()=>{const d=prompt("Expense:");const a=prompt("Amount ($):");if(d&&a)updateJob(ji,x=>{x.expenses=x.expenses||[];x.expenses.push({desc:d,amt:parseFloat(a),date:new Date().toISOString().slice(0,10)})})}} color="transparent" style={{border:`1px solid ${S.red}30`,color:S.red,marginTop:6,fontSize:10,padding:"4px 10px"}}>+ Expense</Btn></Card>
        <Card style={{padding:"14px 16px"}}><div style={{fontSize:11,color:S.muted,textTransform:"uppercase",marginBottom:4}}>Profit</div><div style={{fontSize:22,fontWeight:700,color:(j.paid||0)-exp>=0?S.green:S.red,fontFamily:"monospace"}}>{fmt$((j.paid||0)-exp)}</div></Card>
      </div>
      <div style={{marginBottom:24}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:S.muted,marginBottom:4}}><span>Payment</span><span>{pct}%</span></div><div style={{height:8,background:S.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${S.accent},${S.green})`,borderRadius:3}}/></div></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:16,fontWeight:600,color:"#fff"}}>Task board</h2><Btn onClick={()=>{const n=prompt("Task name:");if(n)updateJob(ji,x=>{x.tasks=x.tasks||[];x.tasks.push({id:uid(),name:n,priority:"normal",done:false})})}}>+ Add task</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {[{title:"To do",items:todo,color:S.yellow},{title:"Done",items:done,color:S.green}].map(col=><div key={col.title} style={{background:S.bg2,border:`1px solid ${S.border}`,borderRadius:14,padding:16,minHeight:200}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${S.border}`}}><div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/><span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{col.title}</span><span style={{fontSize:11,color:S.muted,fontFamily:"monospace",marginLeft:"auto"}}>{col.items.length}</span></div>
          {col.items.length===0?<div style={{textAlign:"center",padding:20,color:S.dim,fontSize:12}}>Empty</div>:col.items.map(t=>{const ti=tasks.indexOf(t);return<div key={t.id} style={{background:S.bg4,border:`1px solid ${S.border}`,borderLeft:`3px solid ${PC[t.priority]}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <input type="checkbox" checked={t.done} onChange={()=>updateJob(ji,x=>x.tasks[ti].done=!x.tasks[ti].done)} style={{marginTop:3,cursor:"pointer",accentColor:S.green,width:16,height:16}}/>
              <span style={{flex:1,fontSize:13,fontWeight:500,color:t.done?S.dim:"#fff",textDecoration:t.done?"line-through":"none"}}>{t.name}</span>
              <select value={t.priority} onChange={e=>updateJob(ji,x=>x.tasks[ti].priority=e.target.value)} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:6,padding:"2px 6px",fontSize:10,color:PC[t.priority],cursor:"pointer",outline:"none"}}><option value="urgent">Urgent</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select>
              <button onClick={()=>updateJob(ji,x=>x.tasks.splice(ti,1))} style={{background:"none",border:"none",color:S.dim,cursor:"pointer",fontSize:12}}>×</button>
            </div>
          </div>})}
        </div>)}
      </div>
      {(j.expenses||[]).length>0&&<Card style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:S.muted,marginBottom:10}}>Expenses ({j.expenses.length})</div>
        {j.expenses.map((e,ei)=><div key={ei} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
          <span style={{flex:1,fontSize:12,color:S.text}}>{e.desc}</span><span style={{fontSize:12,color:S.red,fontFamily:"monospace",fontWeight:500}}>{fmt$(e.amt)}</span><span style={{fontSize:10,color:S.dim}}>{e.date}</span>
          <button onClick={()=>updateJob(ji,x=>x.expenses.splice(ei,1))} style={{background:"none",border:"none",color:S.dim,cursor:"pointer",fontSize:11}}>×</button>
        </div>)}
      </Card>}
      <FileSection label="Renderings & Drawings" color={S.purple} icon="🎨" files={j.renderings||[]} viewingFile={viewingFile} setViewingFile={setViewingFile} onUpload={f=>updateJob(ji,x=>{x.renderings=x.renderings||[];x.renderings.push(f)})} onDelete={i=>updateJob(ji,x=>x.renderings.splice(i,1))}/>
      <FileSection label="Estimates" color={S.cyan} icon="📋" files={j.estimates||[]} viewingFile={viewingFile} setViewingFile={setViewingFile} onUpload={f=>updateJob(ji,x=>{x.estimates=x.estimates||[];x.estimates.push(f)})} onDelete={i=>updateJob(ji,x=>x.estimates.splice(i,1))}/>
      <FileSection label="Receipts & Files" color={S.accent} icon="📎" files={j.files||[]} viewingFile={viewingFile} setViewingFile={setViewingFile} onUpload={f=>updateJob(ji,x=>{x.files=x.files||[];x.files.push(f)})} onDelete={i=>updateJob(ji,x=>x.files.splice(i,1))}/>
    </div>};

  return<div style={{background:S.bg,color:S.text,minHeight:"100vh",fontFamily:"-apple-system,system-ui,sans-serif"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${S.border}`}}>
      <div style={{width:32,height:32,borderRadius:8,background:S.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>HG</div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Harris Grove Cabinetries</div><div style={{fontSize:10,color:S.muted}}>Command Center</div></div>
      {["dash","leads","builders","jobs"].map(t=><button key={t} onClick={()=>{setTab(t);setSelJob(null)}} style={{background:tab===t?"rgba(59,130,246,0.15)":"transparent",border:"none",color:tab===t?"#fff":S.muted,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:500,cursor:"pointer"}}>{t==="dash"?"Dashboard":t==="leads"?"Leads":t==="builders"?"Builders":"Jobs"}</button>)}
    </div>
    <div style={{padding:20,maxWidth:1100}}>
    {tab==="dash"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <Card><div style={{fontSize:10,color:S.muted,textTransform:"uppercase"}}>Active</div><div style={{fontSize:22,fontWeight:700,color:S.accent,fontFamily:"monospace"}}>{jobs.filter(j=>j.status!=="complete").length}</div></Card>
        <Card><div style={{fontSize:10,color:S.muted,textTransform:"uppercase"}}>Pipeline</div><div style={{fontSize:22,fontWeight:700,color:S.purple,fontFamily:"monospace"}}>{fmt$(tv)}</div></Card>
        <Card><div style={{fontSize:10,color:S.muted,textTransform:"uppercase"}}>Revenue</div><div style={{fontSize:22,fontWeight:700,color:S.green,fontFamily:"monospace"}}>{fmt$(tp)}</div></Card>
        <Card><div style={{fontSize:10,color:S.muted,textTransform:"uppercase"}}>Profit</div><div style={{fontSize:22,fontWeight:700,color:tp-te>=0?S.green:S.red,fontFamily:"monospace"}}>{fmt$(tp-te)}</div></Card>
      </div>
      {jobs.filter(j=>j.status!=="complete").length>0&&<Card style={{marginBottom:16}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:14}}>Active jobs</div>
        {jobs.filter(j=>j.status!=="complete").map(j=>{const tasks=j.tasks||[];return<div key={j.id} onClick={()=>{setTab("jobs");setSelJob(j.id)}} style={{padding:"12px 0",borderBottom:`1px solid ${S.border}`,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{j.name}</span> <Pill text={j.status} color={SC[j.status]}/><div style={{fontSize:11,color:S.muted}}>{j.client} · {fmt$(j.price||0)}</div></div>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:600}}>{tasks.filter(t=>t.done).length}/{tasks.length}</div></div></div>})}</Card>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card><div style={{fontSize:14,fontWeight:600,color:S.muted,marginBottom:14}}>Leads ({leads.length})</div>{leads.slice(-5).reverse().map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${S.border}`}}><div><div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{l.project||l.address}</div><div style={{fontSize:10,color:S.muted}}>{l.city}</div></div><Pill text={l.status||"new"} color={SC[l.status]||SC.new}/></div>)}</Card>
        <Card><div style={{fontSize:14,fontWeight:600,color:S.muted,marginBottom:14}}>Builders ({builders.length})</div>{builders.slice(-5).reverse().map((b,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${S.border}`}}><div><div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{b.company}</div><div style={{fontSize:10,color:S.muted}}>{b.contact}</div></div><Pill text={b.status||"new"} color={SC[b.status]||SC.new}/></div>)}</Card>
      </div>
    </div>}
    {tab==="leads"&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:700,color:"#fff"}}>Leads ({leads.length})</h1><Btn onClick={()=>{setModal("lead");setForm({})}}>+ Add</Btn></div>
      {leads.map((l,i)=><Card key={i} style={{marginBottom:8,display:"flex",alignItems:"center",gap:16}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{l.project||l.address}</div><div style={{fontSize:11,color:S.muted}}>{l.city} {l.builder?"· "+l.builder:""}</div>{l.notes&&<div style={{fontSize:10,color:S.dim,marginTop:2}}>{l.notes?.substring(0,100)}</div>}</div>{l.estValue>0&&<div style={{fontSize:14,fontWeight:600,color:S.accent,fontFamily:"monospace"}}>{fmt$(l.estValue)}</div>}<Pill text={l.status||"new"} color={SC[l.status]||SC.new}/><button onClick={()=>{const n={new:"contacted",contacted:"qualified",qualified:"quoted",quoted:"won"};const nl=[...leads];nl[i].status=n[nl[i].status]||"won";sL(nl)}} style={{background:"none",border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:"4px 8px",fontSize:10,cursor:"pointer"}}>→</button><button onClick={()=>sL(leads.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:S.dim,cursor:"pointer",fontSize:14}}>×</button></Card>)}</div>}
    {tab==="builders"&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:700,color:"#fff"}}>Builders ({builders.length})</h1><Btn onClick={()=>{setModal("builder");setForm({})}}>+ Add</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{builders.map((b,i)=><Card key={i}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{b.company}</div><Pill text={b.status||"new"} color={SC[b.status]||SC.new}/></div><div style={{fontSize:12,color:S.muted,lineHeight:1.7}}>{b.contact&&<div>👤 {b.contact}</div>}{b.phone&&<div>📞 {b.phone}</div>}{b.location&&<div>📍 {b.location}</div>}{b.specialty&&<div>🔨 {b.specialty}</div>}</div><div style={{display:"flex",gap:6,marginTop:12}}><button onClick={()=>{const n={new:"contacted",contacted:"qualified",qualified:"quoted",quoted:"won"};const nb=[...builders];nb[i].status=n[nb[i].status]||"won";sB(nb)}} style={{flex:1,background:"none",border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:5,fontSize:10,cursor:"pointer"}}>Advance →</button><button onClick={()=>sB(builders.filter((_,idx)=>idx!==i))} style={{background:"none",border:`1px solid ${S.red}30`,color:S.red,borderRadius:6,padding:"5px 8px",fontSize:10,cursor:"pointer"}}>×</button></div></Card>)}</div></div>}
    {tab==="jobs"&&<div>{selJob?renderJobDetail():<><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:700,color:"#fff"}}>Jobs</h1><Btn onClick={()=>{setModal("job");setForm({})}}>+ New job</Btn></div>
      {jobs.map(j=>{const tasks=j.tasks||[];const dn=tasks.filter(t=>t.done).length;const pct=j.price>0?Math.round((j.paid||0)/j.price*100):0;return<Card key={j.id} onClick={()=>setSelJob(j.id)} style={{marginBottom:10,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>{j.name}</span><Pill text={j.status} color={SC[j.status]}/></div><div style={{fontSize:12,color:S.muted}}>{j.client}</div></div><div style={{fontSize:16,fontWeight:700,color:S.accent,fontFamily:"monospace"}}>{fmt$(j.price||0)}</div><div style={{textAlign:"center",minWidth:60}}><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace"}}>{dn}/{tasks.length}</div><div style={{fontSize:9,color:S.muted}}>tasks</div></div><div style={{width:60}}><div style={{height:6,background:S.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${S.accent},${S.green})`,borderRadius:3}}/></div></div><div style={{color:S.muted}}>→</div></div></Card>})}</>}</div>}
    </div>
    {modal&&<div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:S.bg2,border:`1px solid ${S.border}`,borderRadius:18,padding:28,width:"90%",maxWidth:480}}>
      {modal==="lead"&&<><h3 style={{fontSize:17,fontWeight:600,color:"#fff",marginBottom:18}}>Add lead</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Input label="Project" value={form.project} onChange={e=>setForm({...form,project:e.target.value})}/><Input label="City" value={form.city||"Omaha"} onChange={e=>setForm({...form,city:e.target.value})}/><Input label="Builder" value={form.builder} onChange={e=>setForm({...form,builder:e.target.value})}/><Input label="Est. value" value={form.estValue} onChange={e=>setForm({...form,estValue:e.target.value})} type="number"/></div><Btn onClick={()=>{if(!form.project)return;sL([...leads,{...form,id:uid(),status:"new",estValue:parseInt(form.estValue)||0}]);setModal(null);setForm({})}} style={{width:"100%",marginTop:16,padding:14,fontSize:15}}>Save</Btn></>}
      {modal==="builder"&&<><h3 style={{fontSize:17,fontWeight:600,color:"#fff",marginBottom:18}}>Add builder</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Input label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/><Input label="Contact" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/><Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><Input label="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div><Btn onClick={()=>{if(!form.company)return;sB([...builders,{...form,id:uid(),status:"new"}]);setModal(null);setForm({})}} style={{width:"100%",marginTop:16,padding:14,fontSize:15}}>Save</Btn></>}
      {modal==="job"&&<><h3 style={{fontSize:17,fontWeight:600,color:"#fff",marginBottom:18}}>New job</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Input label="Job name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><Input label="Client" value={form.client} onChange={e=>setForm({...form,client:e.target.value})}/><Input label="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><Input label="Price ($)" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} type="number"/></div><Btn onClick={()=>{if(!form.name)return;sJ([...jobs,{...form,id:uid(),price:parseInt(form.price)||0,paid:0,expenses:[],files:[],tasks:[],renderings:[],estimates:[],status:"active"}]);setModal(null);setForm({})}} style={{width:"100%",marginTop:16,padding:14,fontSize:15}}>Create</Btn></>}
    </div></div>}
  </div>;
}
