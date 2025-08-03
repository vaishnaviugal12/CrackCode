import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../Utils/axiosClient';
import ChatAi from '../Components/ChatAi';
import { useSelector } from 'react-redux';


const ProblemPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('description');
  const [testCase, setTestCase] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [testCasePanelTab, setTestCasePanelTab] = useState('testcase');
  const visibleTestCases = problem?.visibleTestCases || [];
  //for submission
  const [submissions, setSubmissions] = useState([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState([]);

  // Resizable panel states
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [bottomPanelHeight, setBottomPanelHeight] = useState(30); // percentage
  const containerRef = useRef(null);
  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axiosClient.get(`/problem/getproblem/${problemId}`);
        setProblem(res.data);
        setLoading(false);

        if (res.data.startCode) {
          const langCode = res.data.startCode.find(sc => sc.languages === language);
          setCode(langCode?.initialCode || '');
        }

        if (res.data.visibleTestCases?.length > 0) {
          setTestCase(res.data.visibleTestCases[0].input);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
        toast.error('Failed to load problem');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, language]);

  // Handle horizontal resize (left/right panels)
  const handleHorizontalMouseDown = (e) => {
    isDraggingHorizontal.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle vertical resize (editor/bottom panel)
  const handleVerticalMouseDown = (e) => {
    isDraggingVertical.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // Mouse move handler for both resizers
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    if (isDraggingHorizontal.current) {
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const clampedWidth = Math.max(30, Math.min(70, newWidth));
      setLeftPanelWidth(clampedWidth);
    }

    if (isDraggingVertical.current) {
      const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;
      const clampedHeight = Math.max(20, Math.min(50, newHeight));
      setBottomPanelHeight(clampedHeight);
    }
  };

  // Mouse up handler for both resizers
  const handleMouseUp = () => {
    isDraggingHorizontal.current = false;
    isDraggingVertical.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Add event listeners for mouse movements
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please enter code');
      return;
    }

    setIsRunning(true);
    try {
      const res = await axiosClient.post(`/submission/runcode/${problemId}`, {
        code,
        language,
        testCase
      });

      const formattedResult = {
        ...res.data,
        type: 'run',
        status: res.data.testCases.every(tc => tc.passed) ? 'Accepted' : 'Error',
        testCases: res.data.testCases
      };

      setSubmissionResult(formattedResult);
      setTestCasePanelTab('testcase');

      if (formattedResult.status !== 'Accepted') {
        toast.error('Execution failed');
      } else {
        toast.success('Code executed successfully');
      }
    } catch (err) {
      console.error('Run error:', err);
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please enter code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosClient.post(`/submission/submitcode/${problemId}`, {
        code,
        language
      });

      const formattedResult = {
        ...res.data,
        type: 'submit',
        testCases: []
      };

      setSubmissionResult(formattedResult);
      setTestCasePanelTab('submission');

      if (formattedResult.status !== 'Accepted') {
        toast.error(formattedResult.errorMessage || 'Submission failed');
      } else {
        toast.success('Code submitted successfully');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty || typeof difficulty !== 'string') return 'text-gray-400';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

 //for submission ta 
const toggleSubmission = (index) => {
  if (expandedSubmissions.includes(index)) {
    setExpandedSubmissions(expandedSubmissions.filter(i => i !== index));
  } else {
    setExpandedSubmissions([...expandedSubmissions, index]);
  }
};

// Fetch submissions when tab changes to Submissions
useEffect(() => {
  if (activeTab === 'Submissions' && problem?._id && user?._id) {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(`/api/problem//submitedproblems/${problem._id}`, {
          headers: { 
            Authorization: `Bearer ${user?.token}` 
          }
        });
        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };
    fetchSubmissions();
  }
}, [activeTab, problem?._id, user?._id, user?.token]);

  const TestCasesPanel = () => (
    <div className="bg-gray-800 border-t border-gray-700 flex flex-col" style={{ height: `${bottomPanelHeight}%` }}>
      <div className="bg-gray-800 p-2 flex space-x-1 border-b border-gray-700">
        <button
          className={`px-4 py-1.5 text-sm rounded-md ${testCasePanelTab === 'testcase' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
          onClick={() => setTestCasePanelTab('testcase')}
        >
          Test Cases
        </button>
        <button
          className={`px-4 py-1.5 text-sm rounded-md ${testCasePanelTab === 'submission' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
          onClick={() => setTestCasePanelTab('submission')}
        >
          Results
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {testCasePanelTab === 'testcase' && (
          <div className="h-full flex flex-col">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-400 mb-2">Test Cases</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {visibleTestCases.map((tc, index) => (
                  <button
                    key={tc._id || index}
                    onClick={() => setTestCase(tc.input)}
                    className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${testCase === tc.input
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    Case {index + 1}
                    {submissionResult?.testCases?.[index] && (
                      submissionResult.testCases[index].passed ? (
                        <span className="text-green-400">●</span>
                      ) : (
                        <span className="text-red-400">●</span>
                      )
                    )}
                  </button>
                ))}
              </div>

              {visibleTestCases.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-400">Input</span>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-700">
                      <pre className="text-xs whitespace-pre-wrap">{testCase}</pre>
                    </div>
                  </div>

                  {submissionResult?.testCases?.map((result, idx) =>
                    testCase === result.input && (
                      <div key={idx} className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-400">Expected Output</span>
                            </div>
                            <div className="bg-gray-900 p-2 rounded border border-gray-700">
                              <pre className="text-xs whitespace-pre-wrap">{result.expected}</pre>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-400">Your Output</span>
                              {result.time && (
                                <span className="text-xs text-gray-500">
                                  {result.time} ms
                                </span>
                              )}
                            </div>
                            <div className={`bg-gray-900 p-2 rounded border ${result.passed ? 'border-green-700' : 'border-red-700'
                              }`}>
                              <pre className="text-xs whitespace-pre-wrap">
                                {result.actual || 'No output'}
                              </pre>
                            </div>
                          </div>
                        </div>

                        {!result.passed && (
                          <div className="bg-red-900/20 p-2 rounded border border-red-800/50">
                            <div className="text-sm font-medium text-red-400 mb-1">Error:</div>
                            {result.compileOutput ? (
                              <pre className="text-xs whitespace-pre-wrap text-red-300">
                                {result.compileOutput}
                              </pre>
                            ) : result.stderr ? (
                              <pre className="text-xs whitespace-pre-wrap text-red-300">
                                {result.stderr}
                              </pre>
                            ) : (
                              <div className="text-xs text-red-300">Wrong Answer</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {testCasePanelTab === 'submission' && submissionResult?.type === 'submit' && (
          <div className="space-y-4 p-3">
            <div className={`p-4 rounded-lg ${submissionResult.status === 'Accepted'
                ? 'bg-green-900/30 border border-green-800'
                : 'bg-red-900/30 border border-red-800'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {submissionResult.status === 'Accepted' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-lg font-semibold ${submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {submissionResult.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Runtime:</span> {submissionResult.runtime} ms
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Test Cases</div>
                  <div className="text-xl font-mono">
                    {submissionResult.passedTestCases}/{submissionResult.totalTestCases}
                  </div>
                </div>

                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Memory Used</div>
                  <div className="text-xl font-mono">
                    {(submissionResult.memory / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {submissionResult.errorMessage && (
                <div className="mt-4 bg-red-900/20 p-3 rounded border border-red-800/50">
                  <div className="text-sm font-medium text-red-400 mb-1">Error:</div>
                  <pre className="text-xs whitespace-pre-wrap text-red-300">
                    {submissionResult.errorMessage}
                  </pre>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400 italic">
              Note: Hidden test case details are not shown for submissions
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!problem) return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="text-2xl">Problem not found</div>
    </div>
  );

  return (
    <div
      className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden"
      ref={containerRef}
    >
      {/* Header */}
      <div className="bg-gray-800 p-3 shadow-md flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{problem.title}</h1>
          <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-gray-400">
            Acceptance: {problem.acceptanceRate}%
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Problem Description */}
        <div
          className="flex flex-col border-r border-gray-700 overflow-hidden"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="bg-gray-800 p-2 flex space-x-1 border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm rounded-md ${activeTab === 'description' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md ${activeTab === 'editorial' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('editorial')}
            >
              Editorial
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md ${activeTab === 'solution' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('solution')}
            >
              Solutions
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md ${activeTab === 'Submissions' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('Submissions')}
            >
              Submissions
            </button>
            <button
              className={`px-4 py-2 text-fuchsia-50 rounded-md ${activeTab === 'ChatAI' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ChatAI')}
            >
              ChatAI
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'description' && problem && (
              <div className="text-gray-300 p-4">
                {/* Problem Title with Difficulty */}
                <div className="flex items-center mb-4">
                  <h1 className="text-2xl font-bold text-white mr-3">{problem.title}</h1>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${problem.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                      problem.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                    }`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="mb-6 text-gray-300 leading-relaxed text-base">
                  {problem.description}
                </div>

                {/* Examples Section */}
                {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white mb-3">Examples:</h2>

                    <div className="space-y-5">
                      {problem.visibleTestCases.map((testCase, index) => (
                        <div key={index}>
                          <h3 className="font-medium text-white mb-2 text-lg">Example {index + 1}:</h3>
                          <div className="flex items-baseline mb-1">
                            <span className="text-gray-400 mr-2 text-base">Input:</span>
                            <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded text-base">
                              {testCase.input}
                            </span>
                          </div>
                          <div className="flex items-baseline mb-1">
                            <span className="text-gray-400 mr-2 text-base">Output:</span>
                            <span className="font-mono text-white bg-gray-700 px-2 py-1 rounded text-base">
                              {testCase.output}
                            </span>
                          </div>
                          {testCase.explanation && (
                            <p className="text-gray-400 text-base mt-2">
                              Explanation: {testCase.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints Section */}
                
              </div>
            )}

            {activeTab === 'editorial' && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Approach</h2>
                <div dangerouslySetInnerHTML={{ __html: problem.editorial || '<p>No editorial available for this problem yet.</p>' }} />
              </div>
            )}

            {activeTab === 'solution' && (
  <div className="text-gray-300">
    <h2 className="text-2xl font-bold text-white mb-6">Reference Solutions</h2>
    
    {problem.refrenceSolution?.length > 0 ? (
      <div className="space-y-6">
        {problem.refrenceSolution.map((solution, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center mb-4">
              <span className="text-lg font-semibold text-white mr-3">
                Solution {index + 1}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-300">
                {solution.languages}
              </span>
            </div>
            
            <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm">
              <code className="font-mono text-gray-300">
                {solution.completeCode}
              </code>
            </pre>
            
            <div className="mt-4">
              <h3 className="text-md font-medium text-white mb-2">How it works:</h3>
              <div className="prose prose-invert text-gray-300 text-sm">
                {solution.explanation || (
                  <p className="text-gray-500">No explanation provided for this solution.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="text-gray-300">No reference solutions available yet.</p>
        <p className="mt-2 text-gray-400">You can submit your solution to contribute!</p>
      </div>
    )}
  </div>
)}

            {activeTab === 'Submissions' && (
  <div className="text-gray-300">
    <h2 className="text-2xl font-bold text-white mb-6">Your Submissions</h2>
    
    {submissions.length > 0 ? (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-sm text-gray-400 font-medium mb-2 px-4">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Language</div>
          <div className="col-span-4">Status</div>
          <div className="col-span-2">Runtime</div>
          <div className="col-span-2">Memory</div>
        </div>
        
        {submissions.map((submission, index) => (
          <div 
            key={index} 
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2 text-sm">
                {new Date(submission.createdAt).toLocaleString()}
              </div>
              <div className="col-span-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-300">
                  {submission.language}
                </span>
              </div>
              <div className="col-span-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  submission.status === 'Accepted' ? 'bg-green-900 text-green-300' :
                  submission.status === 'Pending' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {submission.status}
                </span>
              </div>
              <div className="col-span-2 text-sm">
                {submission.runtime || 'N/A'} ms
              </div>
              <div className="col-span-2 text-sm">
                {submission.memory || 'N/A'} MB
              </div>
            </div>
            
            {/* Expandable code view */}
            <div className="mt-3">
              <button 
                onClick={() => toggleSubmission(index)}
                className="text-blue-400 text-sm hover:underline"
              >
                {expandedSubmissions.includes(index) ? 'Hide Code' : 'View Code'}
              </button>
              
              {expandedSubmissions.includes(index) && (
                <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-sm mt-2">
                  <code className="font-mono text-gray-300">
                    {submission.code}
                  </code>
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="text-gray-300">No submissions found for this problem.</p>
        <p className="mt-2 text-gray-400">Submit your solution to see it here!</p>
      </div>
    )}
  </div>
)}

            {activeTab === 'ChatAI' && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Chat with AI</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {<ChatAi problem={problem}></ChatAi>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Resizer */}
        <div
          className="w-1 bg-gray-700 hover:bg-blue-600 cursor-col-resize active:bg-blue-600"
          onMouseDown={handleHorizontalMouseDown}
        />

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden" style={{ width: `${100 - leftPanelWidth}%` }}>
          {/* Editor Toolbar */}
          <div className="bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <select
                className="bg-gray-700 text-white text-sm rounded px-3 py-1 focus:outline-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
              </select>

              <select
                className="bg-gray-700 text-white text-sm rounded px-3 py-1 focus:outline-none"
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>

              <select
                className="bg-gray-700 text-white text-sm rounded px-3 py-1 focus:outline-none"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                className={`px-4 py-1.5 text-sm rounded-md flex items-center space-x-1 ${isRunning || isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                disabled={isRunning || isSubmitting}
                onClick={handleRun}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Run</span>
                  </>
                )}
              </button>

              <button
                className={`px-4 py-1.5 text-sm rounded-md flex items-center space-x-1 ${isSubmitting || isRunning ? 'bg-green-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                  }`}
                disabled={isSubmitting || isRunning}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div
            className="flex-1 overflow-hidden"
            style={{ height: `calc(100% - ${bottomPanelHeight}%)` }}
          >
            <MonacoEditor
              height="100%"
              language={language}
              theme={editorTheme}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                padding: { top: 10 },
                lineNumbersMinChars: 3,
                folding: true,
                showFoldingControls: 'always',
                matchBrackets: 'always',
                suggestOnTriggerCharacters: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Horizontal Resizer */}
          <div
            className="h-1 bg-gray-700 hover:bg-blue-600 cursor-row-resize active:bg-blue-600"
            onMouseDown={handleVerticalMouseDown}
          />

          {/* Test Case / Results Panel */}
          <TestCasesPanel />
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;