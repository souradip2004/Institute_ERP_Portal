import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body=await req.json();
    const response = await fetch("https://ai-counsellor-reports-feedback-a239e5a-v3.app.beam.cloud",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            'Authorization': `Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw==`,
            'Connection': 'keep-alive'
        },
        body:JSON.stringify(body)
    },
    
)
    if(!response.ok){
        console.log(response)
        return NextResponse.json(
            {
                error:"Beam Response failed"
            },
            {status:400}
        )
    }else{
        return response;
    }
}catch(error){
    return NextResponse.json(
        {
            error
        },
        {status:500}
    )
}}