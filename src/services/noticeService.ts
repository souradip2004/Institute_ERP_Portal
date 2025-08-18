import prisma from "@/lib/prisma";
export class NoticeService {
  async getNoticeById(id: string) {
    console.log(id);
    const notice = await prisma.emailForm.findUnique({
      where: { id },
      include: {
        classSections: true,
        institution: true,
      },
    });
    console.log(notice);
    return notice;
  }
  async getNotices() {
    const notices = await prisma.emailForm.findMany({
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notices;
  }
  async createNotice(data: any, institutionId: string) {
  const notice = await prisma.emailForm.create({
    data: {
      subject: data.subject,
      body: data.body,
      sender: data.sender,
      attachments: data.attachments ?? [],
      sentAt: data.sentAt ? new Date(data.sentAt) : null,
      institutionId,
      classSections: data.classSectionIds && data.classSectionIds.length > 0
        ? {
            connect: data.classSectionIds.map((sectionId: string) => ({ id: sectionId })),
          }
        : undefined,
    },
    include: {
      classSections: true,
      institution: true,
    },
  });

  return notice;
}

  async updateNotice(id: string, data: any) {
    const notice = await prisma.emailForm.update({
      where: { id },
      data: {
        ...data,
        classSections: {
          set: data.classSections.map((id: string) => ({ id })),
        },
      },
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notice;
  }
  async deleteNotice(id: string) {
    const notice = await prisma.emailForm.delete({
      where: { id },
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notice;
  }
  async getNoticesByClassSectionId(classSectionId: string) {
    const notices = await prisma.emailForm.findMany({
      where: {
        classSections: {
          some: {
            id: classSectionId,
          },
        },
      },
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notices;
  }
  async getNoticesByInstitutionId(institutionId: string) {
    const notices = await prisma.emailForm.findMany({
      where: {
        institutionId,
      },
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notices;
  }
  async createNoticeWithMotherClass(data: any) {
    const classSections= await prisma.motherClass.findMany({
      where: {
        id: { in: data.classSections,
      },
      },
      select: {
        id: true,
      },
    });
    const notice = await prisma.emailForm.create({
      data: {
        ...data,
        classSections: {
          connect: classSections.map((section: { id: string }) => ({ id: section.id })),
        },
      },
      include: {
        classSections: true,
        institution: true,
      },
    });
    return notice;
  }
}
