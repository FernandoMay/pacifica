import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const trades = await db.trade.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
  return NextResponse.json({ trades });
}

export async function POST(req: NextRequest) {
  try {
    const { symbol, side, size, leverage, entryPrice, alphaScore, riskScore, efficiencyScore } = await req.json();
    if (!symbol || !side || !size || !entryPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const trade = await db.trade.create({
      data: {
        symbol,
        side: side.toUpperCase(),
        size,
        leverage: leverage || 1,
        entryPrice,
        status: 'OPEN',
        alphaScore: alphaScore || 0,
        riskScore: riskScore || 0,
        efficiencyScore: efficiencyScore || 0,
      },
    });
    return NextResponse.json({ trade });
  } catch (err) {
    return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
  }
}
