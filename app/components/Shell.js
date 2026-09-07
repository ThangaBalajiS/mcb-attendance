'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {CalendarDays, ClipboardList, Settings as SettingsIcon, Sun, Moon, TriangleAlert, RotateCcw, Clock3} from 'lucide-react';
import {ToastProvider,useToast} from './Toasts';
import {ConfirmProvider} from './Confirm';
import {StoreProvider,useStoreContext} from '../lib/StoreProvider';
import {longDate,today} from '../lib/format';

const TABS=[
 ['/roster',ClipboardList,'Roster','Tap through the day’s shifts.'],
 ['/report',CalendarDays,'Reports','Attendance, day value and salary payable.'],
 ['/settings',SettingsIcon,'Settings','Manage employees and shifts.']
];

export default function Shell({children}){
 return <ToastProvider><ConfirmProvider><StoreProvider>
  <Chrome>{children}</Chrome>
 </StoreProvider></ConfirmProvider></ToastProvider>;
}

function Chrome({children}){
 const store=useStoreContext();
 const toast=useToast();
 const pathname=usePathname()||'';
 const [theme,setTheme]=useState(null);
 const [retrying,setRetrying]=useState(false);

 useEffect(()=>{
  const root=document.documentElement;
  setTheme(root.dataset.theme||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
 },[]);

 function toggleTheme(){
  const next=theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next;
  document.cookie=`mcb-theme=${next};path=/;max-age=31536000;samesite=lax`;
  setTheme(next);
 }

 async function retry(){
  setRetrying(true);
  await store.reload();
  setRetrying(false);
  toast.info('Reconnected.');
 }

 const active=TABS.find(([href])=>pathname===href||pathname.startsWith(href+'/'))||TABS[0];
 const [activeHref,,label,blurb]=active;

 return <div className="app">
  <aside>
   <div className="brand"><div className="brandmark">M</div><div><b>MCB</b><span>Attendance</span></div></div>
   <nav>{TABS.map(([href,Icon,text])=>
    <Link key={href} href={href} className={activeHref===href?'active':''} aria-current={activeHref===href?'page':undefined}>
     <Icon size={18} aria-hidden="true"/>{text}
    </Link>)}
   </nav>
   <div className="sidefoot">
    <span className={'dot '+(store.dbError?'bad':'good')}/>
    {store.dbError?'MongoDB unavailable':'MongoDB connected'}
   </div>
  </aside>

  <main>
   <header>
    <div><h1>{label}</h1><p>{blurb}</p></div>
    <div className="headtools">
     <div className="today"><Clock3 size={15}/>{longDate(today())}</div>
     <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}
     </button>
    </div>
   </header>

   {store.dbError&&<div className="banner">
    <TriangleAlert size={17}/>
    <div><b>Can’t reach MongoDB.</b> {store.dbError}</div>
    <button className="btn ghost sm" onClick={retry} disabled={retrying}><RotateCcw size={14}/>{retrying?'Retrying…':'Retry'}</button>
   </div>}

   {store.ready
    ?children
    :<div className="card skeleton"><div className="sk sk-title"/><div className="sk"/><div className="sk"/><div className="sk sk-short"/></div>}
  </main>
 </div>;
}
