"use client"
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CoAdminPage() {
    const [teacherName, setTeacherName] = useState('');
    const [section, setSection] = useState('');
    const [subject, setSubject] = useState('');
    const [token, setToken] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you can implement the logic to save or process the teacher's data.
        alert(`Teacher ${teacherName} added successfully!`);
        setTeacherName('');
        setSection('');
        setSubject('');
        setToken('');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-6 shadow-2xl bg-white">
                <CardContent>
                    <h2 className="text-2xl font-bold mb-4">Co-Admin - Add Teacher</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Teacher Name"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Section"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Unique Token Number"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                            Add Teacher
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}