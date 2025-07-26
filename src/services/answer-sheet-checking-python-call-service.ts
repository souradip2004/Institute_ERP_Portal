import axios,{isAxiosError} from 'axios';

export async function segregateFromPdf(fileUrls: string[]) {
  try {
    console.log("🔄 Sending PDF URL(s) to AnsKey Segregate API...with fileURLs: " + fileUrls);

    const response = await axios.post(
       'https://anskey-segregate-from-pdfs-33f7051-v3.app.beam.cloud' ,
      { file_url_list: fileUrls },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==',
        }
      }
    );

    // console.log('python response: ');
    // console.log(response)

    // console.log("✅ PDF Segregation Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error during PDF Segregation:", error);
    throw error;
  }
}



export async function checkAnswerWithModelKey(
  modelJsonAnskey: string,
  studentJsonAns: string,
  configJson1: string
) {
  try {

    // Convert to JSON strings
    const modelJsonAnskey1 = JSON.stringify(modelJsonAnskey);
    // const studentJsonAns1 = JSON.stringify(studentJsonAns);
    const configJson1string = JSON.stringify(configJson1);
    

    console.log("\n\n\n\n..................🔍 Checking student answer using model answer key fn call receive...");
    console.log('\nteacher answer key:\n\n');
    console.log(modelJsonAnskey1);
    console.log('\n\nstudent answer:\n');
    console.log(studentJsonAns);
    console.log('\n\n\nconfig:\n');
    console.log(configJson1string);
    console.log('.............................\n\n\n\n\n\n\n');

    // console.log(modelJsonAnskey.toString())
    console.log(JSON.parse(modelJsonAnskey1))
    console.log(JSON.parse(studentJsonAns))
    console.log(JSON.parse(configJson1string))
    console.log('......................................................\n\n\n\n\n\n');
    const response = await fetch(
       'https://answer-checking-4-89f26c7-v4.app.beam.cloud',
      {
        method: 'POST',
        body: JSON.stringify({
          model_json_anskey: JSON.parse(modelJsonAnskey1),  
          student_json_ans: JSON.parse(studentJsonAns),    
          config_json: JSON.parse(configJson1string)             
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA==',
          "Connection": "keep-alive",
        }
      }
    );

    const responseData = await response.json();
    console.log("✅ Answer Checking Response:", responseData);
    const checkingResponse = responseData;
    console.log(checkingResponse);
    console.log('\n\ninside response: ');
    const temp = checkingResponse.final_results_data;
    console.log(temp[0])
    console.log(temp[1])
    console.log(temp[2])
    console.log('----------------------------\n\n');
    const updatedScoresJson = JSON.stringify(checkingResponse.final_results_data[checkingResponse.final_results_data.length - 1]);
    console.log('updatedScoreJson.....  :');
    console.log(updatedScoresJson)
    
    return responseData;
  } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error("❌ Axios Error during answer checking:", error.response?.data || error.message);
  } else if (error instanceof Error) {
    console.error("❌ General Error during answer checking:", error.message);
  } else {
    console.error("❌ Unknown Error during answer checking:", error);
  }
  throw error;
}

}




export async function checkAnswerWithDiagramSupport(
  studentUid: string,
  studentAnsPdfUrl: string,
  modelJsonAnskey: string,
  diagramDataJson: string,
  updatedScoresJson: string,
  configJson2: string
) {
  try {


    // Convert to JSON strings
    const modelJsonAnskey1 = JSON.stringify(modelJsonAnskey);
    const diagramDataJson1 = JSON.stringify(diagramDataJson);
    const configJson1string2 = JSON.stringify(configJson2);
    



    console.log("\n\n\n\n\n\n📊 Sending answer and diagram data for enhanced checking...");
    console.log('studentUid: ', studentUid);
    console.log('studentAnsPdfUrl: ', studentAnsPdfUrl);
    console.log('\n\nmodelJsonAnskey: ', modelJsonAnskey1);
    console.log('\n\n\ndiagramDataJson: ', diagramDataJson1);
    console.log('\n\nupdatedScoresJson: ', updatedScoresJson);
    console.log('\n\nconfigJson2: ', configJson1string2);
    console.log('......................................................\n\n\n\n\n\n');
    

    const response = await fetch(
      'https://answer-and-diagram-checking-5-12af4c2-v2.app.beam.cloud',
    
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw==',
        },
        body: JSON.stringify({
        
        student_uid: studentUid,
        student_ans_pdf_url: studentAnsPdfUrl,
        ans_key_json: JSON.parse(modelJsonAnskey1),
        diagram_data_json: JSON.parse(diagramDataJson1),
        updated_scores_json: JSON.parse(updatedScoresJson),
        config_json: JSON.parse(configJson1string2)
      
      })}
      
    );
    const responseData = await response.json();
    console.log("✅ Answer + Diagram Checking Response:", responseData);
    return responseData;
  } catch (error) {
    console.error("❌ Error during answer + diagram check:", error);
    throw error;
  }
}
