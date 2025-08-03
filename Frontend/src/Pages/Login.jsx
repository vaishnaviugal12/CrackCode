import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch , useSelector} from 'react-redux';
import { useNavigate } from 'react-router';
import { loginUser } from '../authSlice';
import { useEffect } from 'react';


// Schema validation for signup
const loginSchema = z.object({
 
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  
  const {register,handleSubmit,formState: { errors },} = useForm({ resolver: zodResolver(loginSchema) });

   useEffect(() => {
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }
}, [isAuthenticated, user, navigate]);

  
    const onSubmit =(data) =>{
      dispatch(loginUser(data));
    };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-200 shadow-xl rounded-xl p-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">Leetcode</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          

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

          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">Password</span>
            </label>
            <input
              type="password"
              placeholder="********"
              className={`input input-bordered w-full h-14 text-lg px-4 ${errors.password && 'input-error'}`}
              {...register('password')}
            />
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full h-14 text-lg tracking-wide">
            Login
          </button>
        </form>
         <p className="text-base text-white text-center mt-4">
  Create a new account{' '}
  <span
    onClick={() => navigate('/Signup')}
    className="text-primary cursor-pointer hover:underline"
  >
    Signup
  </span>
</p>
        
      </div>
    </div>
  );
}

export default Login;

