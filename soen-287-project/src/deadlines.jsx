import { useState, useEffect } from "react";
import "./deadlines-Styling.css";
 
export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
 
  const filters = ["All", "Pending", "Completed", "Overdue"];
 
  // fetch deadlines on page load
  useEffect(() => {
    fetch("/api/deadlines", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((d) => ({
          id: d.assignment_id,
          course_id: d.course_id,
          title: d.title,
          course: d.course,
          due: d.due_date,
          marks: d.marks + " Marks",
          status: mapStatus(d.status),
        }));
        setDeadlines(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch deadlines", err);
        setLoading(false);
      });
  }, []);
 
  function mapStatus(status) {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s === "completed") return "completed";
    if (s === "in progress") return "pending";
    if (s === "missing") return "overdue";
    return "pending";
  }
 
  const filtered = deadlines.filter((d) => {
    if (activeFilter === "All") return true;
    return d.status === activeFilter.toLowerCase();
  });
 
  const markComplete = (id) => {
    const deadline = deadlines.find((d) => d.id === id);
    fetch(`/api/deadlines/${id}/complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ course_id: deadline.course_id }),
    })
      .then((res) => res.json())
      .then(() => {
        setDeadlines((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: "completed" } : d))
        );
      })
      .catch((err) => console.error("Failed to mark complete", err));
  };
 
  const deleteDeadline = (id) => {
    const deadline = deadlines.find((d) => d.id === id);
    fetch(`/api/deadlines/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ course_id: deadline.course_id }),
    })
      .then((res) => res.json())
      .then(() => {
        setDeadlines((prev) => prev.filter((d) => d.id !== id));
      })
      .catch((err) => console.error("Failed to delete deadline", err));
  };
 
  if (loading) {
    return <div className="page-content"><p>Loading deadlines...</p></div>;
  }
 
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
        {filtered.length === 0 && (
          <p style={{ marginLeft: "20px", color: "#888" }}>No deadlines found.</p>
        )}
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