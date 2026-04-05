import { useState, useEffect } from "react";
import "./deadlines-Styling.css";
 
export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newDeadline, setNewDeadline] = useState({
    course_id: "",
    assn_desc: "",
    assn_type: 3,
    due_date: "",
    weight: "",
  });
 
  const filters = ["All", "Pending", "Completed", "Overdue"];
 
  const assignmentTypes = [
    { value: 0, label: "Quiz" },
    { value: 1, label: "Lab" },
    { value: 2, label: "Exam" },
    { value: 3, label: "Assignment" },
  ];
 
  // fetch deadlines and courses on page load
  useEffect(() => {
    fetch("/api/deadlines", {
      credentials: 'include'
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
 
    fetch("/api/courses", {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => setCourses(data.courses ?? data))
      .catch((err) => console.error("Failed to fetch courses", err));
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
      body: JSON.stringify({ course_id: deadline.course_id }),
    })
      .then((res) => res.json())
      .then(() => {
        setDeadlines((prev) => prev.filter((d) => d.id !== id));
      })
      .catch((err) => console.error("Failed to delete deadline", err));
  };
 
  const handleAddDeadline = () => {
    if (!newDeadline.course_id || !newDeadline.assn_desc || !newDeadline.due_date || !newDeadline.weight) {
      alert("Please fill in all fields!");
      return;
    }
 
    fetch("/api/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDeadline),
    })
      .then((res) => res.json())
      .then(() => {
        const course = courses.find((c) => c.course_id === parseInt(newDeadline.course_id));
        const added = {
          id: Date.now(),
          course_id: newDeadline.course_id,
          title: newDeadline.assn_desc,
          course: course ? course.course_code : "Unknown Course",
          due: newDeadline.due_date,
          marks: newDeadline.weight + " Marks",
          status: "pending",
        };
        setDeadlines((prev) => [...prev, added]);
        setNewDeadline({ course_id: "", assn_desc: "", assn_type: 3, due_date: "", weight: "" });
        setShowForm(false);
      })
      .catch((err) => console.error("Failed to add deadline", err));
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
        <button className="filter-bttns" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Deadline"}
        </button>
      </div>
 
      {showForm && (
        <div className="deadline-form">
          <h3>New Deadline</h3>
 
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Assignment 1"
              value={newDeadline.assn_desc}
              onChange={(e) => setNewDeadline({ ...newDeadline, assn_desc: e.target.value })}
            />
          </div>
 
          <div className="form-group">
            <label>Course</label>
            <select
              value={newDeadline.course_id}
              onChange={(e) => setNewDeadline({ ...newDeadline, course_id: e.target.value })}
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code}
                </option>
              ))}
            </select>
          </div>
 
          <div className="form-group">
            <label>Type</label>
            <select
              value={newDeadline.assn_type}
              onChange={(e) => setNewDeadline({ ...newDeadline, assn_type: parseInt(e.target.value) })}
            >
              {assignmentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
 
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={newDeadline.due_date}
              onChange={(e) => setNewDeadline({ ...newDeadline, due_date: e.target.value })}
            />
          </div>
 
          <div className="form-group">
            <label>Weight / Marks</label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={newDeadline.weight}
              onChange={(e) => setNewDeadline({ ...newDeadline, weight: e.target.value })}
            />
          </div>
 
          <button className="detail-bttns" onClick={handleAddDeadline}>
            Add Deadline
          </button>
          <button className="detail-bttns" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}
 
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