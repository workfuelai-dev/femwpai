import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const appKey = process.env.APP_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  if (!appKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }
  const res = await fetch(`${supabaseUrl}/functions/v1/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': appKey
    },
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(()=>({}))
  return NextResponse.json(data, { status: res.status })
} 