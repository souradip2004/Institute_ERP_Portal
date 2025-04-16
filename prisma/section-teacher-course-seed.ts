import prisma from '@/config/prisma';

async function seedSectionCourseTeacherRelation() {
    const classSections = await prisma.classSection.findMany();
    const teachers = await prisma.teacher.findMany();
    const courses = await prisma.course.findMany();

    const existingRelations = await prisma.sectionCourseTeacherRelation.findMany();

    const isAlreadyRelated = (sectionId: string, courseId: string, teacherId: string) => {
        return existingRelations.some(rel =>
            rel.classSectionId === sectionId &&
            rel.courseId === courseId &&
            rel.teacherId === teacherId
        );
    };

    let createdCount = 0;

    for (const section of classSections) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

        if (!isAlreadyRelated(section.id, randomCourse.id, randomTeacher.id)) {
            await prisma.sectionCourseTeacherRelation.create({
                data: {
                    classSectionId: section.id,
                    courseId: randomCourse.id,
                    teacherId: randomTeacher.id,
                },
            });
            createdCount++;
        }
    }

    console.log(`${createdCount} new relations seeded.`);
}

seedSectionCourseTeacherRelation()
    .catch((e) => {
        console.error('Seeding error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
