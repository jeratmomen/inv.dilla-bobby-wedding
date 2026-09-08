import {db,guard,failure} from "@/lib/server";

export async function DELETE(request:Request){
  try{
    const error=await guard(request);
    if(error)return error;

    await db().prepare("DELETE FROM replies").run();

    return Response.json(
      {ok:true},
      {headers:{"Cache-Control":"private, no-store"}}
    );
  }catch(e){
    return failure(e);
  }
}
