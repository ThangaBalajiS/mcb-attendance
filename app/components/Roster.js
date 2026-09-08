'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ChevronLeft, ChevronRight, Search, UserPlus} from 'lucide-react';
import {useToast} from './Toasts';
import {useStoreContext} from '../lib/StoreProvider';
import {today,addDays,longDate,money,num} from '../lib/format';

export default function Roster(){
 const store=useStoreContext();
 const {employees,shifts,attendance}=store;
 const router=useRouter();
 const toast=useToast();
 const [date,setDate]=useState(today());
 const [q,setQ]=useState('');

 const logged=useMemo(()=>{
  const m={};
  attendance.forEach(a=>{if(a.date===date)(m[a.employeeId]??=new Set()).add(a.shiftId)});
  return m;
 },[attendance,date]);

 const valueOf=set=>[...(set||[])].reduce((sum,id)=>sum+(shifts.find(s=>s.id===id)?.value||0),0);

 const term=q.trim().toLowerCase();
 const rows=useMemo(()=>employees
  .filter(e=>!term||e.name.toLowerCase().includes(term)||e.id.toLowerCase().includes(term))
  .map(e=>{const set=logged[e.id]||new Set();return {...e,set,total:valueOf(set)}}),
  [employees,logged,term,shifts]);

 const summary=useMemo(()=>{
  let covered=0,value=0,payable=0;
  employees.forEach(e=>{
   const set=logged[e.id];
   if(!set?.size)return;
   const t=valueOf(set);
   covered++;value+=t;payable+=t*e.salary;
  });
  return {covered,value,payable};
 },[employees,logged,shifts]);

 async function toggle(emp,shift){
  try{await store.toggleAttendance(date,emp.id,shift.id)}
  catch(err){toast.error(err.message)}
 }

 if(!employees.length)return <div className="card empty-state">
  <UserPlus size={30}/><h2>No employees yet</h2>
  <p>Add your team first — then this screen becomes a daily roster you can tap through.</p>
  <button className="btn primary" onClick={()=>router.push('/settings')}>Add employees</button>
 </div>;

 return <>
  <div className="card daybar">
   <div className="daynav">
    <button className="icon-btn" onClick={()=>setDate(d=>addDays(d,-1))} aria-label="Previous day"><ChevronLeft size={18}/></button>
    <input type="date" value={date} onChange={e=>setDate(e.target.value||today())} aria-label="Roster date"/>
    <button className="icon-btn" onClick={()=>setDate(d=>addDays(d,1))} aria-label="Next day"><ChevronRight size={18}/></button>
    {date!==today()&&<button className="btn ghost sm" onClick={()=>setDate(today())}>Today</button>}
   </div>
   <div className="daymeta">
    <div><span>Logged</span><strong>{summary.covered} <i>/ {employees.length}</i></strong></div>
    <div><span>Day value</span><strong>{num(summary.value)}</strong></div>
    <div><span>Payable</span><strong>{money(summary.payable)}</strong></div>
   </div>
  </div>

  <div className="card rostercard">
   <div className="rosterhead">
    <div>
     <h2>{longDate(date)}</h2>
     <span>Tap a shift to log it. Tap again to remove.</span>
    </div>
    <div className="rostertools">
     <div className="searchbox"><Search size={15}/><input value={q} placeholder="Filter by name or ID" onChange={e=>setQ(e.target.value)} aria-label="Filter employees"/></div>
    </div>
   </div>

   {!shifts.length&&<p className="empty">No shifts configured. Add one in Settings first.</p>}

   {shifts.length>0&&(rows.length?<div className="roster">
    {rows.map(e=><div key={e.id} className={'roster-row'+(e.total?' done':'')}>
     <div className="who"><b>{e.name}</b><span>{e.id} · {money(e.salary)}/day</span></div>
     <div className="chips">
      {shifts.map(s=>{
       const on=e.set.has(s.id);
       const key=`att:${date}:${e.id}:${s.id}`;
       return <button key={s.id} type="button" className={'chip'+(on?' on':'')}
        disabled={store.isBusy(key)} aria-pressed={on}
        title={`${s.name} · ${s.time} · value ${s.value}`}
        onClick={()=>toggle(e,s)}>{s.code}<i>{s.value}</i></button>;
      })}
     </div>
     <div className="daytotal">{e.total?num(e.total):<span className="muted">—</span>}</div>
    </div>)}
   </div>:<p className="empty">No employee matches “{q}”.</p>)}
  </div>
 </>;
}
