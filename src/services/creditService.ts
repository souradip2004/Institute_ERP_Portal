import prisma from "@/lib/prisma";

export class CreditService {
    async getAll() {
        return await prisma.credit.findMany();
    }
async getcoinsById(id: string) {
        console.log("Fetching coins for user:", id);
        return await prisma.user.findUnique({
            where: { id },
            select: {
                coins: true,
            },
        });
    }
    async getById(id: string, month: number, year: number) {
        let credit = await prisma.credit.findFirst({
            where: {
                institutionId: id,
                month,
                year
            },
        });
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() is 0-based
        const currentYear = now.getFullYear();
        if (!credit && month === currentMonth && year === currentYear) {
            credit = await prisma.credit.create({
                data: {
                    institutionId: id,
                    month,
                    year,
                    questionPaperCreditsBalance: 0,
                    attendanceCreditsBalance: 0,
                    videoCreditsBalance: 0,
                    copyCheckingCreditsBalance: 0,
                    
                    total: 0,
                    lastUpdated: new Date()
                },
            });
        }
        return credit;
    }
    async updateCoins(id: string, coins: number) { 
        console.log("Updating coins for user:", id, "Coins to update:", coins);
        return  prisma.user.update({
            where: { id },
            data: {
                coins: { increment:-coins },
            },
        });
    }       
    async updateTotalById(id: string, data: any, month: number, year: number) {
        const existingCredit = await prisma.credit.findFirst({
            where: { institutionId: id, month, year },
        });
        if (!existingCredit) {
            await prisma.credit.create({
                data: {
                    institutionId: id,
                    month,
                    year,
                    questionPaperCreditsBalance: 0,
                    attendanceCreditsBalance: 0,
                    videoCreditsBalance: 0,
                    copyCheckingCreditsBalance: 0,
                    total:0,
                    lastUpdated: new Date()
                },
            });
        }
        return await prisma.credit.update({
            where: {
                institutionId: id,
                month,
                year
            },
            data: data,
        });
    }
}