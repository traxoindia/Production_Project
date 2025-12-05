import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import Navbar from './Navbar';

// Initial dummy data for the tracker
const initialProjects = [
  { id: 1, name: 'Sticker App Overlap Fix', status: 'In Progress', complexity: 'Medium' },
  { id: 2, name: 'Implement User Authentication', status: 'In Progress', complexity: 'High' },
  { id: 3, name: 'Review Q3 Performance Metrics', status: 'Completed', complexity: 'Low' },
];

// Utility function to get status colors
const getStatusClasses = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle size={16} />;
    case 'In Progress':
      return <Clock size={16} />;
    case 'Pending':
      return <Clock size={16} />;
    default:
      return null;
  }
};

const getComplexityClasses = (complexity) => {
  switch (complexity) {
    case 'High':
      return 'bg-red-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * A component to track ongoing work for the team.
 * Allows adding tasks, marking them complete, and deleting them.
 */
function TeamWorkTracker() {
  const [projects, setProjects] = useState(initialProjects);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectComplexity, setNewProjectComplexity] = useState('Medium');
  const [error, setError] = useState('');

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim() === '') {
      setError('Project name cannot be empty.');
      return;
    }

    const newProject = {
      id: Date.now(), // Simple unique ID
      name: newProjectName.trim(),
      status: 'In Progress',
      complexity: newProjectComplexity,
    };

    setProjects([...projects, newProject]);
    setNewProjectName('');
    setError('');
  };

  const toggleStatus = (id) => {
    setProjects(projects.map(project => {
      if (project.id === id) {
        return {
          ...project,
          status: project.status === 'Completed' ? 'In Progress' : 'Completed',
        };
      }
      return project;
    }));
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const totalCount = projects.length;

  return (
     <div>
        <Navbar/>
   
    <div className="p-6 bg-gray-50 min-h-screen">
   
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Team Work Tracker 🚀</h1>
        <p className="text-gray-500 mb-8">List of all active and completed projects/tasks.</p>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-indigo-50 p-4 rounded-lg border-b-4 border-indigo-500">
            <p className="text-3xl font-bold text-indigo-700">{totalCount}</p>
            <p className="text-sm text-indigo-500">Total Tasks</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-b-4 border-blue-500">
            <p className="text-3xl font-bold text-blue-700">{inProgressCount}</p>
            <p className="text-sm text-blue-500">In Progress</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-b-4 border-green-500">
            <p className="text-3xl font-bold text-green-700">{completedCount}</p>
            <p className="text-sm text-green-500">Completed</p>
          </div>
        </div>

        {/* Add New Project Form */}
        <form onSubmit={handleAddProject} className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><Plus size={20}/> Add New Task</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Task name (e.g., Fix database connection)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select
              value={newProjectComplexity}
              onChange={(e) => setNewProjectComplexity(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Low">Low Complexity</option>
              <option value="Medium">Medium Complexity</option>
              <option value="High">High Complexity</option>
            </select>
            <button
              type="submit"
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Task
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        {/* Project List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Project List</h2>
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">No tasks added yet!</div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center justify-between p-4 rounded-xl shadow-sm border ${project.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:shadow-md'} transition duration-200`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <span className={`h-3 w-3 rounded-full ${getComplexityClasses(project.complexity)} flex-shrink-0`} title={`Complexity: ${project.complexity}`}></span>
                  <p className={`text-lg font-medium truncate ${project.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {project.name}
                  </p>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusClasses(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    {project.status}
                  </span>

                  <button
                    onClick={() => toggleStatus(project.id)}
                    className={`p-2 rounded-full transition duration-150 ${project.status === 'Completed' ? 'bg-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                    title={project.status === 'Completed' ? 'Mark as In Progress' : 'Mark as Completed'}
                  >
                    <CheckCircle size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
     </div>
  );
}

export default TeamWorkTracker;