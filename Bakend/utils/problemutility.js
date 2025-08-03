import axios from 'axios';


const getLanguageId = (lang)=>{
   if (!lang) return undefined;
    const language ={
        "c++":54,
        "cpp":54,
         "c++17": 54,
        "java":91,
        "javascript":93
    }
    return language[lang.toLowerCase()];
}


const submitBatch = async (submissions) => {
  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    console.error("❌ submitBatch error: No submissions provided.");
    throw new Error("There should be at least one submission in a batch");
  }

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: { submissions },
  };

  try {
    const response = await axios.request(options);
    console.log("✅ Judge0 raw response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Judge0 submitBatch failed:", error);
    throw error;
  }
};

const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));



const submitToken = async(resultToken)=>{
   

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    //coverting the array of token into quama seprated string
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};


async function fetchData() {
	try {
		const response = await axios.request(options);
		return(response.data);
	} catch (error) {
		console.error(error);
	}
}
while(true){

  const result = await fetchData();

  if (!result || !result.submissions) {
      console.log("Waiting for valid response...");
      await waiting(1000);
      continue;
    }

  const isResultObtained = result.submissions.every((r)=>r.status_id>2);

  if(isResultObtained)
    return result.submissions;
    
  await waiting(1000);
}
}


export {getLanguageId,submitBatch,submitToken}