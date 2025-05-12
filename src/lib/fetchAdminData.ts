// lib/fetchAdminData.ts
export async function fetchTeachers(id: string) {
    const res = await fetch("https://commercial.aiclassroom.in/api/teachers", { cache: "no-store" });
    if (res.status === 404) {
      return [];
    }
    if (res.status === 500) {
      throw new Error("Internal Server Error");
    }
    if(res.ok){
        const data = await res.json();
        const filteredTeachers = data.filter((teacher: any) => teacher?.user?.institutionId === id);
        return filteredTeachers;
    }
    return res.ok ? await res.json() : [];
  }
  
  export async function fetchStudents() {
    const res = await fetch("https://commercial.aiclassroom.in/api/students", { cache: "no-store" });
    return res.ok ? await res.json() : [];
  }
  
  export async function fetchClasses() {
    const res = await fetch("https://commercial.aiclassroom.in/api/classes", { cache: "no-store" });
    return res.ok ? await res.json() : [];
  }
  