import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../Utils/axiosClient';

const ProblemPage = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('description');
  const [testCase, setTestCase] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // Added this line
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [testCasePanelTab, setTestCasePanelTab] = useState('testcase');
  const visibleTestCases = problem?.visibleTestCases || [];

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
      
      const hasCompilationError = res.data.testCases?.[0]?.compileOutput;
      const allPassed = res.data.testCases.every(tc => tc.passed);
      
      const formattedResult = {
        ...res.data,
        type: 'submit',
        status: hasCompilationError ? 'Compilation Error' : 
               allPassed ? 'Accepted' : 'Wrong Answer'
      };
      
      setSubmissionResult(formattedResult);
      setTestCasePanelTab('submission');
      
      if (hasCompilationError || !allPassed) {
        toast.error(hasCompilationError ? 'Compilation Error' : 'Wrong Answer');
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

 const TestCasesPanel = () => (
  <div className="bg-gray-800 border-t border-gray-700 flex flex-col" style={{ height: '30%' }}>
    <div className="bg-gray-800 p-2 flex space-x-1 border-b border-gray-700">
      <button
        className={`px-4 py-1.5 text-sm rounded-md ${
          testCasePanelTab === 'testcase' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
        }`}
        onClick={() => setTestCasePanelTab('testcase')}
      >
        Test Cases
      </button>
      <button
        className={`px-4 py-1.5 text-sm rounded-md ${
          testCasePanelTab === 'submission' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
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
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                    testCase === tc.input
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
                          <div className={`bg-gray-900 p-2 rounded border ${
                            result.passed ? 'border-green-700' : 'border-red-700'
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
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            submissionResult.status === 'Accepted' 
              ? 'bg-green-900/30 border border-green-800' 
              : 'bg-red-900/30 border border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {submissionResult.status === 'Accepted' ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={`font-medium ${
                  submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {submissionResult.status}
                </span>
              </div>
              {submissionResult.testCases?.[0]?.time && (
                <div className="text-sm text-gray-400">
                  Runtime: <span className="font-mono">{submissionResult.testCases[0].time} ms</span>
                </div>
              )}
            </div>
          </div>

          {submissionResult.testCases?.[0]?.compileOutput && (
            <div className="bg-red-800/30 p-3 rounded border border-red-700">
              <h4 className="font-bold text-red-300 mb-2">Compilation Error</h4>
              <pre className="text-xs whitespace-pre-wrap text-red-200">
                {submissionResult.testCases[0].compileOutput}
              </pre>
            </div>
          )}

          {submissionResult.testCases?.length > 0 && !submissionResult.testCases[0]?.compileOutput && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400">Test Cases</div>
              {submissionResult.testCases.map((test, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  test.passed ? 'border-green-800/50 bg-green-900/10' : 'border-red-800/50 bg-red-900/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {test.passed ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="text-sm">Test Case {idx + 1}</span>
                    </div>
                    <span className="text-xs text-gray-500">{test.time || '-'} ms</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Input:</div>
                      <pre className="p-2 bg-gray-900 rounded text-xs whitespace-pre-wrap">
                        {test.input}
                      </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Expected Output:</div>
                        <pre className="p-2 bg-gray-900 rounded text-xs whitespace-pre-wrap">
                          {test.expected}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Your Output:</div>
                        <pre className={`p-2 bg-gray-900 rounded text-xs whitespace-pre-wrap ${
                          test.passed ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {test.actual || '-'}
                        </pre>
                      </div>
                    </div>

                    {!test.passed && test.stderr && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Error:</div>
                        <pre className="p-2 bg-red-900/20 rounded text-xs whitespace-pre-wrap text-red-300">
                          {test.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

