import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification, TelegramEnv } from '../../../../lib/iqra/telegram';

export async function POST(request: NextRequest) {
  try {
    const env: TelegramEnv = {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID!,
    };

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Telegram configuration missing' 
      }, { status: 400 });
    }

    // Parse the webhook update
    const update = await request.json();
    
    // Handle different update types
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;
      const text = message.text;

      // Echo back the message for now (can be enhanced with IQRA processing)
      if (text && chatId) {
        await sendTelegramNotification(env, `📿 IQRA received: ${text}`);
      }
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Telegram webhook processed' 
    });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
