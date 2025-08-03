import submission from "../Models/submissionModel.js";
import Problem from "../Models/problemModel.js";

import { getLanguageId, submitBatch, submitToken } from "../utils/problemutility.js";

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params._id;
    const { language, code } = req.body;

    if (!userId || !problemId || !language || !code)
      return res.status(400).send("Some field is missing");

    const problem = await Problem.findById(problemId);
    const hiddenTestCases = problem.hiddenTestCases;

    const submitedResult = await submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      status: "pending",
      testCasesTotal: hiddenTestCases.length,
      memory: 0,
      runtime: 0
    });

    const languageId = getLanguageId(language);
    const submissions = hiddenTestCases.map((testcases) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcases.input,
      expected_output: testcases.output
    }));
console.log(submission);
    const submitresult = await submitBatch(submissions);
    console.log("Results from Judge0:", submitresult);
    const resultToken = submitresult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = test.status?.description || "Error";
        errorMessage = test.stderr || test.compile_output || "Unknown Error";
      }
    }

    submitedResult.status = status;
    submitedResult.testCasesPassed = testCasesPassed;
    submitedResult.errorMessage = errorMessage;
    submitedResult.runtime = runtime;
    submitedResult.memory = memory;
    await submitedResult.save();

    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).json({
      status,
      totalTestCases: hiddenTestCases.length,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      errorMessage
    });
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const runCode = async(req,res)=>{

try {
    const userId = req.result._id;
    const problemId = req.params._id
    
    const { language, code } = req.body;

    if (!userId || !problemId || !language || !code)
      res.status(400).send("Some field is missing");

    //fetch the problem from database;
    const problem = await Problem.findById(problemId);
    //tetscases (hidden)

     
    //Now submit the code to judge0
    const languageId = getLanguageId(language);

    const visibleTestCases = problem.visibleTestCases
   
   
    const submissions = visibleTestCases.map((testcases) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcases.input,
      expected_output: testcases.output

    }));

    const submitresult = await submitBatch(submissions);

    const resultToken = submitresult.map((value) => (value.token));

    const testResult = await submitToken(resultToken);
    console.log(" Judge0 Raw Test Results:", testResult);


   const formattedResults = testResult.map((result, index) => {
  return {
    passed: result.status?.description === "Accepted",
    input: visibleTestCases[index].input,
    expected: visibleTestCases[index].output,
    actual: result.stdout,
    time: result.time,
    memory: result.memory,
    status: result.status?.description,
    compileOutput: result.compile_output,
    stderr: result.stderr,
  };
});
res.status(200).json({
  status: formattedResults.every(tc => tc.passed) ? "Accepted" : "Failed",
  testCases: formattedResults
});

  }
  catch (error) {

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }}


export {submitCode,runCode};


