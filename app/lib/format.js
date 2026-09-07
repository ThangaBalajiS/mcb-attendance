export const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const today=()=>iso(new Date());
export const parseDate=s=>new Date(s+'T00:00:00');
export const addDays=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return iso(d)};
export const fmtDate=d=>{if(!d)return '';const [y,m,x]=d.split('-');return `${x}/${m}/${y}`};
export const weekday=d=>d?parseDate(d).toLocaleDateString('en-IN',{weekday:'short'}):'';
export const longDate=d=>d?parseDate(d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
export const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
export const num=n=>Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});

const cell=v=>{const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
export const toCSV=rows=>rows.map(r=>r.map(cell).join(',')).join('\r\n');
export function downloadCSV(filename,rows){
 const blob=new Blob(['﻿'+toCSV(rows)],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export const PRESETS=[['today','Today'],['week','This week'],['month','This month'],['lastMonth','Last month']];
export function presetRange(key){
 const now=new Date(),y=now.getFullYear(),m=now.getMonth(),t=iso(now);
 if(key==='today')return [t,t];
 if(key==='week'){
  const start=new Date(now);
  start.setDate(start.getDate()-start.getDay());
  const end=new Date(start);
  end.setDate(end.getDate()+6);
  return [iso(start),iso(end)];
 }
 if(key==='month')return [iso(new Date(y,m,1)),iso(new Date(y,m+1,0))];
 if(key==='lastMonth')return [iso(new Date(y,m-1,1)),iso(new Date(y,m,0))];
 return [t,t];
}
