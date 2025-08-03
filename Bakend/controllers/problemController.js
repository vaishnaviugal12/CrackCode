import { getLanguageId, submitBatch, submitToken } from "../utils/problemutility.js";
import Problem from "../Models/problemModel.js";
import User from "../Models/userModel.js";
import submission from "../Models/submissionModel.js";


const createProblem = async (req, res) => {
       console
  const { title, description, difficulty, tags, visibleTestCases, startCode, refrenceSolution, problemCreater } = req.body;

  try {
    for (const { languages, completeCode } of refrenceSolution) {
      //source code
      //input
      //output
      //language

      const languageId = getLanguageId(languages);

      //creating batch submission ,as ataching all the test cases once instead of testing one by one test cases 
      //beacause we have only 50 submission per day
      //map(element,index)
      const submissions = visibleTestCases.map((testcases) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcases.input,
        expected_output: testcases.output

      }));

console.log(" Submitting test cases to Judge0:", JSON.stringify(submissions, null, 2));

      const submitresult = await submitBatch(submissions);
console.log(submitresult);
      const resultToken = submitresult.map((value) => (value.token));
console.log(resultToken)
      const testResult = await submitToken(resultToken);
console.log(testResult)

      for (const test of testResult) {
        if (test.status?.id !== 3) {
          return res.status(400).json({
            message: "Test case failed",

          });
        }
      }

    }  
      const problemController = await Problem.create(req.body);
      res.status(201).json({
        message: "Problem saved successfully",
        data: problemController
      });
    
     
  }
  catch (err) {
    console.error("Error in createProblem:", err); //  Log error to terminal
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message || "Unknown error"
    });
  }
}

const updateProblem = async (req, res) => {
  const { id } = req.params;

  const { title, description, difficulty, tags, visibleTestCases, startCode, refrenceSolution, problemCreater } = req.body;

  try {

    if (!id)
      return res.status(400).send("id field is not present");

    const dsaProblem = Problem.findById(id)

    if (!dsaProblem)
      res.status(400).send("problem is not present in db");

    for (const { languages, completeCode } of refrenceSolution) {

      const languageId = getLanguageId(languages);

      //creating batch submission ,as ataching all the test cases once instead of testing one by one test cases 
      //beacause we have only 50 submission per day
      //map(element,index)
      const submissions = visibleTestCases.map((testcases) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcases.input,
        expected_output: testcases.output

      }));

      const submitresult = await submitBatch(submissions);

      const resultToken = submitresult.map((value) => (value.token));

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status?.id !== 3) {
          return res.status(400).json({
            message: "Test case failed",

          });
        }
      }

      

     


    }

    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

    res.status(200).send(newProblem);

  }
  catch (err) {
    console.error("Error in createProblem:", err); //  Log error to terminal
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message || "Unknown error"
    });
  }

}

const deleteProblem = async (req,res)=>{

const {id} = req.params;

try{
if(!id)
  res.status(400).send("Problem is Missing")

const problemdeleted = await Problem.findByIdAndDelete(id);

if(!problemdeleted)
  return res.status(404).send("Problem is not present");

return res.status(200).send("problem deleted sucessfully")

}
catch(error){
  res.status(500).send("Error"+error)
}



}

const getProblemById = async (req, res) => {
  const { _id } = req.params;

  try {
    if (!_id) return res.status(400).send("Problem ID is missing");

    const problem = await Problem.findById(_id).select(
      '_id title description difficulty tags visibleTestCases startCode refrenceSolution'
    );

    if (!problem) return res.status(404).send("Problem is not present");

    // Convert to plain JavaScript object
    const problemObj = problem.toObject();
    
    // Keep the raw data instead of generating HTML
    // The frontend will handle the presentation
    return res.status(200).json(problemObj);

  } catch (error) {
    console.error("Error in getProblemById:", error);
    return res.status(500).send("Internal Server Error");
  }
};
const getAllProblem = async (req,res)=>{
try{


const getallproblem = await Problem.find({}).select('_id title difficulty tags');

if(getallproblem.length==0)
   return res.status(404).send("Problem is not present");

 return res.status(200).send(getallproblem)

}
catch(error){
  res.status(500).send("Error"+error)
}

}

const allProblemsolvedByUeser = async(req,res)=>{

  try{

  const userId = req.result._id;

const user= await User.findById(userId).populate({
  path:"problemSolved",
  select:"_id title difficulty tags"
})

  res.status(200).send(user.problemSolved)

}
catch(error){
   res.status(500).send("Error"+error)
  }
}

const submittedProblem = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you're using auth middleware
    const problemId = req.params._id;

    const submissions = await submission.find({ userId, problemId })
      .sort({ createdAt: -1 }) // Newest first
      .select('language status runtime memory code createdAt');

    if (submissions.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
export { createProblem, updateProblem,deleteProblem,getProblemById,getAllProblem,allProblemsolvedByUeser,submittedProblem};
