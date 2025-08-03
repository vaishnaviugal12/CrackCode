import axiosClient from '../Utils/axiosClient';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const PROBLEM_TAGS = ['Array', 'String', 'Math', 'DP', 'Graph', 'Tree', 'Greedy'];
const LANGUAGES = ['Cpp', 'Python', 'JavaScript'];

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.enum(['Array', 'String', 'Math', 'DP', 'Graph', 'Tree', 'Greedy']),
  visibleTestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required'),
    })
  ).min(1),
  hiddenTestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
    })
  ).min(1),
  startCode: z.array(
    z.object({
      language: z.enum(['Cpp', 'Python', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required'),
    })
  ).length(3),
  referenceSolution: z.array(
    z.object({
      languages: z.enum(['Cpp', 'Python', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required'),
    })
  ).length(3),
});

const Admin = () => {
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'Easy',
      tags: 'Array',
      visibleTestcases: [{ input: '', output: '', explanation: '' }],
      hiddenTestcases: [{ input: '', output: '' }],
      startCode: LANGUAGES.map((lang) => ({ language: lang, initialCode: `// Your ${lang} code here` })),
      referenceSolution: LANGUAGES.map((lang) => ({ language: lang, completeCode: `// Your ${lang} solution here` })),
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
    control,
    name: 'visibleTestcases',
  });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
    control,
    name: 'hiddenTestcases',
  });

  const { fields: startCodeFields } = useFieldArray({
    control,
    name: 'startCode',
  });

  const { fields: referenceFields } = useFieldArray({
    control,
    name: 'referenceSolution',
  });

  const onSubmit = async (data) => {
    try {
      setSubmissionStatus('submitting');
      await axiosClient.post('/problem/create', data);
      setSubmissionStatus('success');
      setTimeout(() => setSubmissionStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setSubmissionStatus('error');
    }
  };

  const inputStyle = "input input-bordered w-full bg-base-200";
  const textareaStyle = "textarea textarea-bordered w-full min-h-[100px] bg-base-200";
  const labelStyle = "label-text font-medium";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b pb-2">Create New Coding Problem</h2>

        {/* Problem Details */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Problem Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Title</label>
              <input  {...register('title')} className={inputStyle} />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelStyle}>Difficulty</label>
              <select {...register('difficulty')} className={inputStyle}>
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Tag</label>
              <select {...register('tags')} className={inputStyle}>
                {PROBLEM_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Description</label>
              <textarea {...register('description')} className={textareaStyle} />
            </div>
          </div>
        </section>

        {/* Visible Testcases */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Visible Testcases</h3>
            <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-xs btn-info">Add Visible Case</button>
          </div>
          {visibleFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-3 gap-4 bg-neutral p-4 rounded-lg">
              <textarea {...register(`visibleTestcases.${index}.input`)} placeholder="Input" className={textareaStyle} />
              <textarea {...register(`visibleTestcases.${index}.output`)} placeholder="Output" className={textareaStyle} />
              <textarea {...register(`visibleTestcases.${index}.explanation`)} placeholder="Explanation" className={textareaStyle} />
            </div>
          ))}
        </section>

        {/* Hidden Testcases */}
        <section className="space-y-4 ">
          <div className="flex justify-between items-center ">
            <h3 className="text-xl font-semibold text-white">Hidden Testcases</h3>
            <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-xs btn-warning">Add Hidden Case</button>
          </div>
          {hiddenFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-2 gap-4 bg-neutral p-4 rounded-lg ">
              <textarea {...register(`hiddenTestcases.${index}.input`)} placeholder="Input" className={textareaStyle} />
              <textarea {...register(`hiddenTestcases.${index}.output`)} placeholder="Output" className={textareaStyle} />
            </div>
          ))}
        </section>

        {/* Starter Code */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Starter Code</h3>
          {startCodeFields.map((field, index) => (
            <div key={field.id}>
              <label className={labelStyle}>{field.language}</label>
              <textarea {...register(`startCode.${index}.initialCode`)} className={textareaStyle} />
            </div>
          ))}
        </section>

        {/* Reference Solution */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Reference Solution</h3>
          {referenceFields.map((field, index) => (
            <div key={field.id}>
              <label className={labelStyle}>{field.language}</label>
              <textarea {...register(`referenceSolution.${index}.completeCode`)} className={textareaStyle} />
            </div>
          ))}
        </section>

       <div className="flex justify-end">
          <button type="submit" className="btn btn-accent w-40">
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Create Problem'}
          </button>
        </div>
        {submissionStatus === 'success' && <p className="text-green-400 text-center mt-2">Problem created successfully!</p>}
        {submissionStatus === 'error' && <p className="text-red-400 text-center mt-2">Something went wrong. Try again.</p>}
      </form>
    </div>
  );
};

export default Admin;
