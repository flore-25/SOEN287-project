import { useState } from "react";
import "./deadlines-Styling.css";

const deadlinesData = [
  {
    id: 1,
    status: "overdue",
    title: "Assignment 1",
    course: "ENGR 201 - Professional practice",
    due: "March 15 2026",
    marks: "20 Marks",
  },
  {
    id: 2,
    status: "completed",
    title: "Quiz 1",
    course: "SOEN 228 - System Hardware",
    due: "March 20 2026",
    marks: "20 Marks",
  },
  {
    id: 3,
    status: "pending",
    title: "Project 1",
    course: "SOEN 287 - Web Programming",
    due: "March 25 2026",
    marks: "20 Marks",
  },
];

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState(deadlinesData);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Pending", "Completed", "Overdue"];

  const filtered = deadlines.filter((d) => {
    if (activeFilter === "All") return true;
    return d.status === activeFilter.toLowerCase();
  });

  const markComplete = (id) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "completed" } : d))
    );
  };

  const deleteDeadline = (id) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="page-content">
      <h1>Deadlines</h1>
      <div className="filters">
        {filters.map((f) => (
          <button
            key={f}
            className="filter-bttns"
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

<div className="deadlines-container">
      {filtered.map((d) => (
        <div key={d.id} className={`deadline ${d.status}`}>
          <p className={`status ${d.status}`}>
            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </p>
          <h3>{d.title}</h3>
          <p className="course">{d.course}</p>
          <div className="details">
            <span>Due: {d.due}</span>
            <span>{d.marks}</span>
          </div>
          <button className="detail-bttns" onClick={() => markComplete(d.id)}>
            Mark Complete
          </button>
          <button className="detail-bttns" onClick={() => deleteDeadline(d.id)}>
            Delete
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}