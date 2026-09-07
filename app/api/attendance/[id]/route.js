import {getDb,fail} from '../../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function DELETE(request,{params}){
 try{
  const {id}=await params;
  const db=await getDb();
  const {deletedCount}=await db.collection('attendance').deleteOne({id});
  if(!deletedCount)return Response.json({error:'Attendance record not found.'},{status:404});
  return Response.json({id});
 }catch(e){return fail(e)}
}
