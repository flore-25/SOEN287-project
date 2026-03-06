import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./charts.css";


const courses = ["ENGR 233", "SOEN 287", "COMP 249", "SOEN 228", "ENGR 201"];

const colors = {
  "ENGR 233": "#f5c842",
  "SOEN 287": "#42c8f5",
  "COMP 249": "#a8d672",
  "SOEN 228": "#f57fa0",
  "ENGR 201": "#d4e86a",
};

const grades = {
  "ENGR 233": 88,
  "SOEN 287": 38,
  "COMP 249": 65,
  "SOEN 228": 27,
  "ENGR 201": 82,
};

const assessments = {
  "ENGR 233": [
    { name: "Quiz 1", grade: 55 },
    { name: "A1", grade: 30 },
    { name: "Midterm", grade: 18 },
    { name: "A2", grade: 100 },
    { name: "A3", grade: 78 },
  ],
  "SOEN 287": [
    { name: "Quiz 1", grade: 72 },
    { name: "A1", grade: 45 },
    { name: "Midterm", grade: 38 },
    { name: "A2", grade: 80 },
    { name: "Project", grade: 91 },
  ],
  "COMP 249": [
    { name: "Quiz 1", grade: 60 },
    { name: "A1", grade: 75 },
    { name: "Midterm", grade: 65 },
    { name: "A2", grade: 85 },
    { name: "Final", grade: 70 },
  ],
  "SOEN 228": [
    { name: "Quiz 1", grade: 40 },
    { name: "A1", grade: 22 },
    { name: "Midterm", grade: 27 },
    { name: "A2", grade: 50 },
    { name: "Final", grade: 60 },
  ],
  "ENGR 201": [
    { name: "Quiz 1", grade: 80 },
    { name: "A1", grade: 85 },
    { name: "Midterm", grade: 70 },
    { name: "A2", grade: 82 },
    { name: "Final", grade: 88 },
  ],
};

export default function Progress() {
  const [selectedCourse, setSelectedCourse] = useState("ENGR 233");

  return (
    <div className="page-content">
      <h1>My Progress</h1>
      <div className="card">
        <h2>Summary WINTER 2026</h2>
        <div className="bars-row">
          {courses.map((course) => (
            <div className="bar-item" key={course}>
              <p className="bar-percent">{grades[course]}%</p>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${grades[course]}%`,
                    backgroundColor: colors[course],
                  }}
                />
              </div>
              <p className="bar-label">{course}</p>
            </div>
          ))}
        </div>
      </div>

      
      <div className="card">
        <h2>Summary {selectedCourse}</h2>
        <select onChange={(e) => setSelectedCourse(e.target.value)}>
          {courses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={assessments[selectedCourse]}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="linear" dataKey="grade" stroke={colors[selectedCourse]} strokeWidth={2} dot={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}