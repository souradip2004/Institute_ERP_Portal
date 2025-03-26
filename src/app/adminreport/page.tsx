"use client"
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function AdminPage() {
  const [className, setClassName] = useState("");
  const [subscription, setSubscription] = useState("");
  const [credits, setCredits] = useState(0);
  const [classes, setClasses] = useState<{
    name: string;
    token: string;
    subscription: string;
    credits: number;
  }[]>([]);
  const [activeSection, setActiveSection] = useState("classManagement");
  const [reportToken, setReportToken] = useState("");

  const addClass = () => {
    if (!className || !subscription || credits <= 0) return;
    const newClass = {
      name: className,
      token: uuidv4(),
      subscription,
      credits,
    };
    setClasses([...classes, newClass]);
    setClassName("");
    setSubscription("");
    setCredits(0);
  };

  const handleReport = () => {
    if (!reportToken) return;
    alert(`Fetching report for Token: ${reportToken}`);
    setReportToken("");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <ul className="space-y-2">
          <li onClick={() => setActiveSection("attendance")} className="cursor-pointer hover:text-blue-500">Attendance</li>
          <li onClick={() => setActiveSection("reports")} className="cursor-pointer hover:text-blue-500">Reports</li>
          <li onClick={() => setActiveSection("notifications")} className="cursor-pointer hover:text-blue-500">Notifications</li>
          <li onClick={() => setActiveSection("classManagement")} className="cursor-pointer hover:text-blue-500">Class Management</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4 flex-1">
        {activeSection === "classManagement" && (
          <Card className="p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Class</h2>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter class name"
              className="mb-2"
            />
            <Input
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
              placeholder="Enter subscription type"
              className="mb-2"
            />
            <Input
              type="number"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              placeholder="Enter credits"
              className="mb-2"
            />
            <Button onClick={addClass}>Add Class</Button>
          </Card>
        )}

        {activeSection === "reports" && (
          <Card className="p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Reports</h2>
            <Input
              value={reportToken}
              onChange={(e) => setReportToken(e.target.value)}
              placeholder="Enter token number"
              className="mb-2"
            />
            <Button onClick={handleReport}>Get Report</Button>
          </Card>
        )}

        {activeSection === "classManagement" && (
          <Card className="p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Classes List</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Token</th>
                  <th>Subscription</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, index) => (
                  <tr key={index} className="border-t">
                    <td>{cls.name}</td>
                    <td className="text-gray-500">{cls.token}</td>
                    <td>{cls.subscription}</td>
                    <td>{cls.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}