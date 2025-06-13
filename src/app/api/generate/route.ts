import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body=await req.json();
    const response = await fetch("https://ai-counsellor-reports-feedback-6ecdbce-v1.app.beam.cloud",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            'Authorization': `Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==`,
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