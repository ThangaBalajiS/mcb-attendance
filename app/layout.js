import './globals.css';
import {cookies} from 'next/headers';
import Shell from './components/Shell';

export const metadata={
 title:{default:'MCB Attendance Management',template:'%s · MCB Attendance'},
 description:'Employee attendance and salary management'
};

export default async function RootLayout({children}){
 const pref=(await cookies()).get('mcb-theme')?.value;
 const theme=pref==='dark'||pref==='light'?pref:undefined;
 return <html lang="en" data-theme={theme}><body><Shell>{children}</Shell></body></html>;
}
