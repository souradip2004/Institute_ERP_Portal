// lib/fetchAdminData.ts
export async function fetchTeachers(id: string) {
    const res = await fetch("http://localhost:3000/api/teachers", { cache: "no-store" });
    if(res){
        const filteredTeachers = await res.json();
        return filteredTeachers.filter((teacher: { institutionId: string }) => teacher.institutionId === id);
    }
  }
  
  export async function fetchStudents() {
    const res = await fetch("http://localhost:3000/api/students", { cache: "no-store" });
    return res.ok ? await res.json() : [];
  }
  
  export async function fetchClasses() {
    const res = await fetch("http://localhost:3000/api/classes", { cache: "no-store" });
    return res.ok ? await res.json() : [];
  }
  