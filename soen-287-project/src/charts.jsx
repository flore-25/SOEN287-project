import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./charts.css";
import { useAuth } from "./context/AuthContext";
import { ROLES } from "./constants";
 
// fallback colors for courses
const colorPalette = [
  "#f5c842", "#42c8f5", "#a8d672", "#f57fa0", "#d4e86a",
  "#f5a742", "#42f5a7", "#a772f5", "#f57272", "#72f5f5",
];
 
export default function Progress() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMINISTRATOR;
 
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({});
  const [assessments, setAssessments] = useState({});
  const [colors, setColors] = useState({});
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (isAdmin) {
      // ADMIN: fetch averages across all students
      
      fetch("/api/admin/averages")
        .then((res) => res.json())
        .then((data) => {
          // data = [{ course: "SOEN 287", average: 72.5 }, ...]
          const courseList = data.map((d) => d.course);
          const gradesMap = {};
          const colorsMap = {};
 
          data.forEach((d, i) => {
            gradesMap[d.course] = Math.round(d.average);
            colorsMap[d.course] = colorPalette[i % colorPalette.length];
          });
 
          setCourses(courseList);
          setGrades(gradesMap);
          setColors(colorsMap);
          if (courseList.length > 0) setSelectedCourse(courseList[0]);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch admin averages", err);
          setLoading(false);
        });
    } else {
      // STUDENT: fetch their own grades
      Promise.all([
        fetch("/api/averages").then((res) => res.json()),
        fetch("/api/grades").then((res) => res.json()),
      ])
        .then(([averagesData, gradesData]) => {
          const courseList = averagesData.map((d) => d.course);
          const gradesMap = {};
          const colorsMap = {};
          const assessmentsMap = {};
 
          averagesData.forEach((d, i) => {
            gradesMap[d.course] = Math.round(d.average);
            colorsMap[d.course] = colorPalette[i % colorPalette.length];
          });
 
          // group grades by course for line chart
          gradesData.forEach((d) => {
            if (!assessmentsMap[d.course]) assessmentsMap[d.course] = [];
            assessmentsMap[d.course].push({ name: d.name, grade: d.grade });
          });
 
          setCourses(courseList);
          setGrades(gradesMap);
          setColors(colorsMap);
          setAssessments(assessmentsMap);
          if (courseList.length > 0) setSelectedCourse(courseList[0]);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch grades", err);
          setLoading(false);
        });
    }
  }, [isAdmin]);
 
  if (loading) {
    return <div className="page-content"><p>Loading...</p></div>;
  }
 
  if (courses.length === 0) {
    return (
      <div className="page-content">
        <h1>My Progress</h1>
        <p style={{ marginTop: "20px", color: "#888" }}>No course data found.</p>
      </div>
    );
  }
 
  return (
    <div className="page-content">
      <h1>My Progress</h1>
 
      {/* Bar chart - same structure as before */}
      <div className="card">
        <h2>{isAdmin ? "All Courses - Student Averages" : "Summary WINTER 2026"}</h2>
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
 
      {/* Line chart - same structure as before, hidden for admin */}
      {!isAdmin && (
        <div className="card">
          <h2>Summary {selectedCourse}</h2>
          <select onChange={(e) => setSelectedCourse(e.target.value)}>
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={assessments[selectedCourse] || []}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="linear"
                dataKey="grade"
                stroke={colors[selectedCourse]}
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}