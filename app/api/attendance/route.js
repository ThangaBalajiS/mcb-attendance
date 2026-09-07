import {getDb,noId,fail} from '../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function GET(request){
 try{
  const {searchParams}=new URL(request.url);
  const from=searchParams.get('from'), to=searchParams.get('to');
  const query=from||to?{date:{...(from?{$gte:from}:{}),...(to?{$lte:to}:{})}}:{};
  const db=await getDb();
  const rows=await db.collection('attendance').find(query,noId).sort({date:1}).toArray();
  return Response.json(rows);
 }catch(e){return fail(e)}
}

export async function POST(request){
 try{
  const body=await request.json();
  const date=String(body.date||''), employeeId=String(body.employeeId||''), shiftId=String(body.shiftId||'');
  if(!date||!employeeId||!shiftId)return Response.json({error:'Select employee and shift.'},{status:400});
  const db=await getDb();
  if(!await db.collection('employees').countDocuments({id:employeeId},{limit:1}))return Response.json({error:'Employee not found.'},{status:404});
  if(!await db.collection('shifts').countDocuments({id:shiftId},{limit:1}))return Response.json({error:'Shift not found.'},{status:404});
  const row={id:crypto.randomUUID(),date,employeeId,shiftId};
  try{await db.collection('attendance').insertOne({...row})}
  catch(e){if(e?.code===11000)return Response.json({error:'This shift is already entered for this employee on this date.'},{status:409});throw e}
  return Response.json(row,{status:201});
 }catch(e){return fail(e)}
}
