
"use client";
import { useState } from "react";
import AddClass from "./AddClass";
import ViewTeachers from "./ViewTeachersComponent"
import AddStudent from "./AddStudent";
import StudentDetail from "./ViewStudentPage";
import ViewClassSectionPage from "./ViewClassSectionPage"
import AddTeacher from "@/components/admin/AddTeachers";

interface SiderProps {
    id: any;
  }
  
const Navigator = ({id,userId}) => {
    const [activeComponent, setActiveComponent] = useState<string>("Dashboard");
    const renderComponent = () => {
        switch (activeComponent) {
            case "Dashboard":
                return <div> <AddClass id={id} userid={userId} /><ViewClassSectionPage id={id}/>
                </div>;
            case "Users":
                return <div>Users Content</div>;
            case "Settings":
                return <div>Settings Content</div>;
            case "Attendance":
                return <div>Attendance Content</div>;
            case "Notifications":
                return <div>Notifications Content</div>;
            case "Teacher":
                return <div><AddTeacher id={id}/>    <ViewTeachers id={id}/>
                </div>;
            case "Student":
                return <div><AddStudent id={id}/><StudentDetail id={id}/></div>;
            default:
                return <div>Select an option from the sidebar</div>;
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <aside
                style={{
                    width: "200px",
                    backgroundColor: "#f4f4f4",
                    padding: "10px",
                    borderRight: "1px solid #ddd",
                }}
            >
                <ul style={{ listStyle: "none", padding: 0 }}>
                    <li
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: activeComponent === "Dashboard" ? "#ddd" : "",
                        }}
                        onClick={() => setActiveComponent("Dashboard")}
                    >
                        Class Management
                    </li>
                    <li
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: activeComponent === "Teacher" ? "#ddd" : "",
                        }}
                        onClick={() => setActiveComponent("Teacher")}
                    >
                        Teacher Management
                    </li>
                    <li
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: activeComponent === "Student" ? "#ddd" : "",
                        }}
                        onClick={() => setActiveComponent("Student")}
                    >
                        Student Management
                    </li>
                    <li
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: activeComponent === "Settings" ? "#ddd" : "",
                        }}
                        onClick={() => setActiveComponent("Settings")}
                    >
                        Attendance Management
                    </li>
                    <li
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            backgroundColor: activeComponent === "Settings" ? "#ddd" : "",
                        }}
                        onClick={() => setActiveComponent("Settings")}
                    >
                        Notifcations
                    </li>
                </ul>
            </aside>
            <main style={{ flex: 1, padding: "20px" }}>{renderComponent()}</main>
        </div>
    );
};

export default Navigator;