import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router";
import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../Utils/axiosClient";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  
  const navigate = useNavigate();
  
  const menuRef = useRef();


  

 
  // Filters and Problems
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);

  useEffect(() => {
    const fetchAllProblems = async () => {
      const { data } = await axiosClient.get("/problem/getallproblem");
      setProblems(data);
    };

    const fetchSolvedProblems = async () => {
      if (user) {
        const { data } = await axiosClient.get("/problem/problemsolvedbyuser");
        setSolvedProblems(data);
      }
    };

    fetchAllProblems();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch = filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === "all" || problem.tag === filters.tag;
    const statusMatch = true; // Placeholder for status filtering
    return difficultyMatch && tagMatch && statusMatch;
  });


  return (
    <div className="min-h-screen bg-base-300">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-base-200 rounded-b-lg shadow-sm">
        <h1 className="text-2xl font-bold text-white">Crackcode</h1>

        <div className="relative" ref={menuRef}>
          {/* Username Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="text-md font-medium text-white hover:text-primary transition cursor-pointer"
          >
            {user?.firstName || "User"}
          </button>

          
        </div>
      </nav>



      {/* Filters */}
      <div className="pl-30  py-4 flex flex-wrap gap-4 bg-base200 rounded shadow pr-4 mb-4 ">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="select select-bordered w-48"
        >
          <option value="all">All Problems</option>
          <option value="solved">Solved Problems</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="select select-bordered"
        >
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          className="select select-bordered"
        >

          <option value="array">Array</option>
          <option value="string">String</option>
          <option value="dp">Dynamic Programming</option>
        </select>
      </div>

      {/* Problem List */}
      <div className="pl-30 mr-30 ">
        {filteredProblems.map((problem) => (
          <div
            key={problem._id}
            className="p-4 my-2 bg-base-200 rounded shadow "
          >
            <h3
              onClick={() => navigate(`/problem/${problem._id}`)}
              className="text-xl font-bold text-white mb-3 cursor-pointer hover:text-primary transition"
            >
              {problem.title}
            </h3>


            {/* Buttons for Difficulty and Tag */}
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-sm btn-outline btn-accent capitalize">
                {problem.difficulty}
              </button>

              {problem.tags?.map((tag, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline btn-info capitalize"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;