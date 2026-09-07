'use client';
import {useMemo,useState} from 'react';
import {Download, CalendarDays, Users} from 'lucide-react';
import {useToast} from './Toasts';
import {useStoreContext} from '../lib/StoreProvider';
import {fmtDate,weekday,money,num,PRESETS,presetRange,downloadCSV} from '../lib/format';

export default function Report(){
 const store=useStoreContext();
 const {employees,shifts,attendance}=store;
 const toast=useToast();
 const [range,setRange]=useState(()=>presetRange('month'));
 const [preset,setPreset]=useState('month');
 const [from,to]=range;
 const [empId,setEmpId]=useState('');
 const [view,setView]=useState('day');
 const invalid=!from||!to||from>to;

 const applyPreset=key=>{setPreset(key);setRange(presetRange(key))};
 const setDates=next=>{setPreset('');setRange(next)};

 const rows=useMemo(()=>{
  if(invalid)return [];
  const map={};
  attendance.forEach(a=>{
   if(a.date<from||a.date>to)return;
   if(empId&&a.employeeId!==empId)return;
   const e=employees.find(x=>x.id===a.employeeId);if(!e)return;
   const s=shifts.find(x=>x.id===a.shiftId);if(!s)return;
   const k=e.id+'_'+a.date;
   const row=map[k]??(map[k]={key:k,date:a.date,id:e.id,name:e.name,salary:e.salary,vals:{},total:0});
   row.vals[s.id]=(row.vals[s.id]||0)+s.value;
   row.total+=s.value;
  });
  return Object.values(map).sort((x,y)=>x.date.localeCompare(y.date)||x.name.localeCompare(y.name));
 },[attendance,employees,shifts,from,to,empId,invalid]);

 const byEmployee=useMemo(()=>{
  const m={};
  rows.forEach(r=>{
   const g=m[r.id]??(m[r.id]={id:r.id,name:r.name,days:0,vals:{},total:0,payable:0});
   g.days++;g.total+=r.total;g.payable+=Math.min(r.total,1)*r.salary;
   Object.entries(r.vals).forEach(([k,v])=>{g.vals[k]=(g.vals[k]||0)+v});
  });
  return Object.values(m).sort((a,b)=>a.name.localeCompare(b.name));
 },[rows]);

 const summary=useMemo(()=>{
  let present=0,payable=0;
  rows.forEach(r=>{const d=Math.min(r.total,1);present+=d;payable+=d*r.salary});
  return {days:rows.length,present,payable,people:new Set(rows.map(r=>r.id)).size};
 },[rows]);

 function exportCSV(){
  if(!rows.length){toast.error('Nothing to export for this range.');return}
  const shiftCols=shifts.map(s=>`${s.code} (${s.time})`);
  const head=view==='day'
   ?['S.No','Date','Day','Employee','ID',...shiftCols,'Total value','Payable days','Payable salary']
   :['S.No','Employee','ID','Days present',...shiftCols,'Total value','Payable salary'];
  const body=view==='day'
   ?rows.map((r,i)=>[i+1,fmtDate(r.date),weekday(r.date),r.name,r.id,...shifts.map(s=>r.vals[s.id]??''),r.total,Math.min(r.total,1),Math.min(r.total,1)*r.salary])
   :byEmployee.map((g,i)=>[i+1,g.name,g.id,g.days,...shifts.map(s=>g.vals[s.id]??''),g.total,g.payable]);
  downloadCSV(`mcb-attendance-${from}_to_${to}.csv`,[
   head,...body,[],
   ['Range',`${fmtDate(from)} to ${fmtDate(to)}`],
   ['Employees',summary.people],['Days logged',summary.days],
   ['Payable days',summary.present],['Total payable salary',summary.payable]
  ]);
  toast.success('CSV exported.');
 }

 return <>
  <div className="card filters">
   <div className="presets">
    {PRESETS.map(([key,label])=><button key={key} className={'pill'+(preset===key?' on':'')} aria-pressed={preset===key} onClick={()=>applyPreset(key)}>{label}</button>)}
   </div>
   <div className="filtergrid">
    <label>From date<input type="date" value={from} onChange={e=>setDates([e.target.value,to])}/></label>
    <label>To date<input type="date" value={to} onChange={e=>setDates([from,e.target.value])}/></label>
    <label>Employee<select value={empId} onChange={e=>setEmpId(e.target.value)}>
     <option value="">All employees</option>
     {employees.map(e=><option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
    </select></label>
    <div className="viewtoggle" role="group" aria-label="Report view">
     <button className={view==='day'?'on':''} onClick={()=>setView('day')}><CalendarDays size={15}/>By day</button>
     <button className={view==='employee'?'on':''} onClick={()=>setView('employee')}><Users size={15}/>By employee</button>
    </div>
   </div>
  </div>

  {invalid?<div className="card"><p className="empty">“From” date is after “To” date — adjust the range.</p></div>:<>
   <div className="stats">
    <div><span>Employees</span><strong>{summary.people}</strong></div>
    <div><span>Days logged</span><strong>{summary.days}</strong></div>
    <div><span>Payable days</span><strong>{num(summary.present)}</strong></div>
    <div><span>Total payable salary</span><strong>{money(summary.payable)}</strong></div>
   </div>

   <div className="card tablecard">
    <div className="tablehead">
     <div><h2>{view==='day'?'Attendance by day':'Attendance by employee'}</h2>
      <span>{fmtDate(from)} – {fmtDate(to)} · {view==='day'?`${rows.length} records`:`${byEmployee.length} employees`}</span></div>
     <button className="btn ghost" onClick={exportCSV} disabled={!rows.length}><Download size={16}/>Export CSV</button>
    </div>
    <div className="tablewrap">
     {view==='day'
      ?<table><thead><tr>
        <th className="tight">#</th><th>Date</th><th>Employee</th><th>ID</th>
        {shifts.map(s=><th key={s.id} className="numeric">{s.code}<small>{s.time}</small></th>)}
        <th className="numeric">Total value</th><th className="numeric">Payable salary</th>
       </tr></thead>
       <tbody>{rows.length?rows.map((r,i)=><tr key={r.key}>
         <td className="tight">{i+1}</td>
         <td className="nowrap">{fmtDate(r.date)} <small className="muted">{weekday(r.date)}</small></td>
         <td>{r.name}</td><td className="muted">{r.id}</td>
         {shifts.map(s=><td key={s.id} className="numeric">{r.vals[s.id]??<span className="muted">—</span>}</td>)}
         <td className="numeric"><b>{num(r.total)}</b></td>
         <td className="numeric">{money(Math.min(r.total,1)*r.salary)}</td>
        </tr>):<tr><td colSpan={6+shifts.length} className="empty">No attendance logged in this range.</td></tr>}
       </tbody></table>
      :<table><thead><tr>
        <th className="tight">#</th><th>Employee</th><th>ID</th><th className="numeric">Days present</th>
        {shifts.map(s=><th key={s.id} className="numeric">{s.code}<small>{s.time}</small></th>)}
        <th className="numeric">Total value</th><th className="numeric">Payable salary</th>
       </tr></thead>
       <tbody>{byEmployee.length?<>{byEmployee.map((g,i)=><tr key={g.id}>
         <td className="tight">{i+1}</td><td>{g.name}</td><td className="muted">{g.id}</td>
         <td className="numeric">{g.days}</td>
         {shifts.map(s=><td key={s.id} className="numeric">{g.vals[s.id]??<span className="muted">—</span>}</td>)}
         <td className="numeric"><b>{num(g.total)}</b></td>
         <td className="numeric">{money(g.payable)}</td>
        </tr>)}
        <tr className="totalrow"><td/><td colSpan={2}>Total</td>
         <td className="numeric">{summary.days}</td>
         {shifts.map(s=><td key={s.id} className="numeric">{num(byEmployee.reduce((n,g)=>n+(g.vals[s.id]||0),0))||<span className="muted">—</span>}</td>)}
         <td className="numeric"><b>{num(byEmployee.reduce((n,g)=>n+g.total,0))}</b></td>
         <td className="numeric"><b>{money(summary.payable)}</b></td>
        </tr></>:<tr><td colSpan={6+shifts.length} className="empty">No attendance logged in this range.</td></tr>}
       </tbody></table>}
    </div>
    <div className="mobilecards">
     {view==='day'
      ?(rows.length?rows.map(r=><div key={r.key} className="mcard">
        <div className="mcard-top"><b>{r.name}</b><span>{fmtDate(r.date)} · {weekday(r.date)}</span></div>
        <div className="mcard-vals">{shifts.filter(s=>r.vals[s.id]).map(s=><em key={s.id}>{s.code} {r.vals[s.id]}</em>)}</div>
        <div className="mcard-foot"><span>Total value <b>{num(r.total)}</b></span><b>{money(Math.min(r.total,1)*r.salary)}</b></div>
       </div>):<p className="empty">No attendance logged in this range.</p>)
      :(byEmployee.length?byEmployee.map(g=><div key={g.id} className="mcard">
        <div className="mcard-top"><b>{g.name}</b><span>{g.id}</span></div>
        <div className="mcard-vals">{shifts.filter(s=>g.vals[s.id]).map(s=><em key={s.id}>{s.code} {g.vals[s.id]}</em>)}</div>
        <div className="mcard-foot"><span>{g.days} days · value <b>{num(g.total)}</b></span><b>{money(g.payable)}</b></div>
       </div>):<p className="empty">No attendance logged in this range.</p>)}
    </div>
   </div>
  </>}
 </>;
}
