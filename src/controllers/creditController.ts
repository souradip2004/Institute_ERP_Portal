import {NextRequest, NextResponse} from 'next/server';
import {CreditService} from '@/services/creditService'
import {error} from 'console';

const transactionService = new CreditService();

export class creditController {

  async getcoinsById(id: string) {
    try {
      const transaction = await transactionService.getcoinsById(id);
      if (!transaction) {
        return NextResponse.json({error: "no database found"}, {status: 404})
      } else {
        return NextResponse.json(transaction);
      }
    } catch (error) {
      return NextResponse.json({error}, {status: 500})
    }
  }

  async getall() {
    const transaction = await transactionService.getAll();
    if (!transaction) {
      return NextResponse.json({error: "no database found"}, {status: 404})
    } else {
      return NextResponse.json(transaction);
    }
  }

  async getById(id: string, month: number, year: number) {
    console.log(month)
    const transaction = await transactionService.getById(id, month, year);
    if (!transaction) {
      return NextResponse.json({error: "no institutions found"}, {status: 404})
    } else {
      return NextResponse.json(transaction)
    }
  }

  async updatecoins(id: string, coins: number) {
    try {
      if (!coins) {
        return NextResponse.json({error: "Missing Data"}, {status: 404})
      } else {
        const transaction = await transactionService.updateCoins(id, coins);
        return NextResponse.json(transaction);
      }
    } catch (error) {
      return NextResponse.json({error}, {status: 500})
    }
  }

  async updateTotalById(id: string, data: any, month: number, year: number) {
    try {
      if (!month || !year) {
        return NextResponse.json({error: "Missing Data"}, {status: 404})
      } else {
        const transaction = await transactionService.updateTotalById(id, data, month, year);
        return NextResponse.json(transaction);
      }
    } catch (error) {
      return NextResponse.json({error}, {status: 500})
    }
  }
}