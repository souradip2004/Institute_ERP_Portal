"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ReportEntry {
  processId: string;
  pdfName: string;
  topic: string;
  pdfUrl: string;
  deepfakeError: string;
  animationError: string;
  name: string;
  email: string;
  reasons: string;
}

const reportData: ReportEntry[] = [
  {
    processId: "12345",
    pdfName: "Intro to Animation",
    topic: "Basics",
    pdfUrl: "/pdfs/intro.pdf",
    deepfakeError: "None",
    animationError: "None",
    name: "John Doe",
    email: "john@example.com",
    reasons: "Just a test report."
  }
];

export default function AnimationClassroom() {
  const [search, setSearch] = useState("");
  const filteredReports = reportData.filter((report) =>
    report.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Animation Classroom</h1>
      
      {/* Search Bar */}
      <Input
        placeholder="Search topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {/* Report Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Process ID</TableHead>
            <TableHead>PDF Name</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Download</TableHead>
            <TableHead>Deepfake Error</TableHead>
            <TableHead>Animation Model Error</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Reasons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.map((report, index) => (
            <TableRow key={index}>
              <TableCell>{report.processId}</TableCell>
              <TableCell>{report.pdfName}</TableCell>
              <TableCell>{report.topic}</TableCell>
              <TableCell>
                <a href={report.pdfUrl} className="text-blue-500 underline" download>
                  Download
                </a>
              </TableCell>
              <TableCell>{report.deepfakeError}</TableCell>
              <TableCell>{report.animationError}</TableCell>
              <TableCell>{report.name}</TableCell>
              <TableCell>{report.email}</TableCell>
              <TableCell>{report.reasons}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}