import React from 'react';
import { X } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <h2>Filters</h2>
          <button className="btn-icon" onClick={onClose}><X /></button>
        </div>

        <div className="filter-group mb-6">
          <label className="block mb-2">Department</label>
          <select>
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Physics</option>
            <option>Mathematics</option>
            <option>History</option>
          </select>
        </div>

        <div className="filter-group mb-6">
          <label className="flex justify-between mb-2 block">
            <span>Strictness</span>
          </label>
          <input type="range" min="1" max="5" defaultValue="3" />
          <div className="flex justify-between mt-1 text-muted" style={{fontSize: '12px'}}>
            <span>Chill</span>
            <span>Nightmare</span>
          </div>
        </div>

        <div className="filter-group mb-8">
          <label className="flex justify-between mb-2 block">
            <span>Marks Leniency</span>
          </label>
          <input type="range" min="1" max="5" defaultValue="3" />
          <div className="flex justify-between mt-1 text-muted" style={{fontSize: '12px'}}>
            <span>Failed Everyone</span>
            <span>Free A's</span>
          </div>
        </div>

        <div className="filter-group mb-8">
          <label className="block mb-2">Sort By</label>
          <select>
            <option>Highest Rated</option>
            <option>Easiest Pass</option>
            <option>Most Reviews</option>
          </select>
        </div>

        <button className="btn btn-primary w-full mt-4" onClick={onClose}>Apply Filters</button>
      </div>
    </>
  );
};

export default FilterSidebar;
