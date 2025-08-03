// import React from "react";
// import { Routes, Route, Navigate } from "react-router";
// import Home from "./Pages/Home.jsx";
// import Login from "./Pages/Login.jsx";
// import Signup from "./Pages/Signup.jsx";
// import { checkAuth } from "./authSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { useEffect } from "react";
// import Admin from "./Pages/Admin.jsx";
// import ProblemPage from "./Pages/problempage.jsx";



// function App() {


//   const { isAuthenticated,user,loading } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   //check the initail authentication
//   useEffect(() => {
//     dispatch(checkAuth());
//   }, [dispatch])  //or [dispatch]

//   if(loading){
//     return <div className="min-h-screen flex items-center justify-center">
//          <span className="loading loading-spinner loading-lg"></span>
//     </div>
//   }


//   return (
//     <>
//       { <Routes>
//         <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to='/Signup' />} />
//         <Route path="/login" element={isAuthenticated ? <Navigate to='/' /> : <Login />} />
//         <Route path="/Signup" element={isAuthenticated ? <Navigate to='/' /> : <Signup />} />
//         <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ?<Admin/>: <Navigate to='/'/>}/>
//         <Route path="/problem/:problemId" element={<ProblemPage />} />

//       </Routes> }
    
//     </>
//   )
// }

// export default App

import React from 'react';
import { Routes, Route ,Navigate} from 'react-router';
import FrontPage from './Pages/Frontpage.jsx';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import Admin from './Pages/Admin.jsx';
import ProblemPage from './Pages/problempage.jsx';
import Home from './Pages/Home.jsx';

const App = () => {
  return (
    
      <Routes>
        {/* Main Front Page */}
        <Route path="/" element={<FrontPage />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Route - Protected */}
        <Route path="/admin" element={<Admin />} />

        <Route path="/problems" element={<Home/>} />

        <Route path="/problem/:problemId" element={<ProblemPage />} />
        
        {/* Fallback route - redirects to home if no match */}
        <Route path="*" element={<FrontPage />} />
      </Routes>
   
  );
};

export default App;