import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log('API called: ', request.url);
  
  return NextResponse.json({ 
    message: "Aurora API working",
    timestamp: new Date().toISOString()
  });
}