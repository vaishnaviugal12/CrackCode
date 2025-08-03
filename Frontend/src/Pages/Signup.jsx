import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { registerUser , } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(2, "Name should contain at least 2 characters"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-200 shadow-xl rounded-xl p-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">Leetcode</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* First Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">First Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter your Firstname"
              className={`input input-bordered w-full h-14 text-lg px-4 ${errors.firstName && 'input-error'}`}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="text-error text-sm mt-1">{errors.firstName.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter EmailId"
              className={`input input-bordered w-full h-14 text-lg px-4 ${errors.emailId && 'input-error'}`}
              {...register('emailId')}
            />
            {errors.emailId && (
              <span className="text-error text-sm mt-1">{errors.emailId.message}</span>
            )}
          </div>

          {/* Password with Toggle */}
          <div className="form-control relative">
            <label className="label">
              <span className="label-text text-white">Password</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              className={`input input-bordered w-full h-14 text-lg px-4 pr-12 ${errors.password && 'input-error'}`}
              {...register('password')}
            />
            {/* Eye Icon */}
            <span
              className="absolute right-4 top-[52px] cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                // Eye Off SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.95 9.95 0 013.342-7.567M3.13 3.128l17.746 17.746M10.12 10.122a3 3 0 014.243 4.243" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </span>
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password.message}</span>
            )}
          </div>

          <button
  type="submit"
  disabled={loading}
  className={`btn btn-primary w-full h-14 text-lg tracking-wide ${loading && 'opacity-50 cursor-not-allowed'}`}>
  {loading ? 'Signing up...' : 'Sign Up'}
</button>

        </form>

        <p className="text-base text-white text-center mt-4">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-primary cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;


// const Signup = () => {
// const [name, setName] = useState('');
// const[email , setEmail] = useState('');
// const[password , setPassword] = useState('')

// const handleSubmit = (e)=>{

//   e.preventDefault();
//   console.log(name,email,password);
// }
  
//   return (
//     <>
//     <form onSubmit={handleSubmit} className='min-h-screen flex flex-col justify-center items-center gap-y-2'>
//     <input type='text' value={name} placeholder='Enter your firstname' onChange={(e)=>setName(e.target.value)}/> 
//     <input type='email' value={email} placeholder='Enter your email' onChange={(e)=>setEmail(e.target.value)}/> 
//     <input type='password' value={password} placeholder='Enter password' onChange={(e)=>setPassword(e.target.value)}/> 
//     <button type='submit'>Submit</button>

//     </form>
// </>
    
  
//   )
// }

