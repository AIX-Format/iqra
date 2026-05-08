import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * 🪙 IQRA Sovereign Trading | Bybit V5 Native Client
 * 
 * النية: توفير اتصال آمن وسيادي مع منصة Bybit Testnet باستخدام native fetch لتجنب التبعيات الخارجية.
 * المرجع: استخلاف المال وعمارة الأرض بالحق.
 */
export class BybitClient {
  private readonly baseUrl = 'https://api-testnet.bybit.com';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = process.env.BYBIT_API_KEY || '';
    this.apiSecret = process.env.BYBIT_API_SECRET || '';
  }

  /**
   * توليد التوقيع الرقمي لمنصة Bybit V5
   */
  private generateSignature(timestamp: number, recvWindow: number, data: string): string {
    const message = timestamp + this.apiKey + recvWindow + data;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  /**
   * تنفيذ طلب محمي (Private Request)
   */
  private async privateRequest(method: 'GET' | 'POST', path: string, params: Record<string, unknown> = {}): Promise<any> {
    const timestamp = Date.now();
    const recvWindow = 5000;
    const data = method === 'GET' 
      ? new URLSearchParams(params).toString() 
      : JSON.stringify(params);

    const signature = this.generateSignature(timestamp, recvWindow, data);

    const headers: Record<string, string> = {
      'X-BAPI-API-KEY': this.apiKey,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp.toString(),
      'X-BAPI-RECV-WINDOW': recvWindow.toString(),
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const url = `${this.baseUrl}${path}${method === 'GET' && data ? `?${data}` : ''}`;
    
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? data : undefined,
    });

    const result = await response.json();
    if (result.retCode !== 0) {
      throw new Error(`Bybit API Error: ${result.retMsg} (Code: ${result.retCode})`);
    }
    return result.result;
  }

  /**
   * جلب السعر الحالي (Public API)
   */
  async getPrice(symbol: string): Promise<number> {
    const url = `${this.baseUrl}/v5/market/tickers?category=spot&symbol=${symbol.replace('/', '')}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.retCode === 0 && result.result.list.length > 0) {
      return parseFloat(result.result.list[0].lastPrice);
    }
    return 0;
  }

  /**
   * جلب رصيد المحفظة (Private API)
   */
  async getBalance(): Promise<any> {
    const result = await this.privateRequest('GET', '/v5/account/wallet-balance', { accountType: 'UNIFIED' });
    if (result.list && result.list.length > 0) {
      const account = result.list[0];
      const balances: Record<string, number> = { total: {} } as any;
      account.coin.forEach((c: any) => {
        (balances as any).total[c.coin] = parseFloat(c.walletBalance);
      });
      return balances;
    }
    return { total: {} };
  }

  /**
   * ✅ Preflight Check (Risk Gating)
   */
  async preflightCheck(side: 'buy' | 'sell', symbol: string, qty: number): Promise<boolean> {
    const balance = await this.getBalance();
    const price = await this.getPrice(symbol);
    const cost = price * qty;
    const baseAsset = symbol.split('/')[1] || 'USDT';
    
    const available = balance.total[baseAsset] || 0;
    
    if (side === 'buy' && cost > available) {
      console.warn(`🛑 [RISK_GATE] Insufficient balance for ${symbol}. Needed: ${cost}, Available: ${available}`);
      return false;
    }
    
    // Strict Risk Limit: Max 1% of total portfolio per trade
    const totalValue = Object.entries(balance.total as Record<string, number>).reduce((acc, [coin, val]) => acc + val, 0); // Simplified value calculation
    if (cost > totalValue * 0.01) {
      console.warn(`🛑 [RISK_GATE] Trade size exceeds 1% portfolio limit.`);
      return false;
    }

    return true;
  }

  /**
   * تنفيذ أمر شراء أو بيع (Private API)
   */
  async placeOrder(side: 'buy' | 'sell', symbol: string, qty: number): Promise<any> {
    const isSafe = await this.preflightCheck(side, symbol, qty);
    if (!isSafe) {
      throw new Error(`Risk Gating Blocked: ${side} ${qty} ${symbol}`);
    }

    console.log(`🚀 [TRADING_ACT] Placing ${side} order for ${qty} of ${symbol}`);
    
    const params = {
      category: 'spot',
      symbol: symbol.replace('/', ''),
      side: side.charAt(0).toUpperCase() + side.slice(1).toLowerCase(), // Buy or Sell
      orderType: 'Market',
      qty: qty.toString(),
    };

    try {
      const order = await this.privateRequest('POST', '/v5/order/create', params);
      return { id: order.orderId, ...order };
    } catch (error) {
      console.error(`❌ [TRADING_FAILURE] Order failed:`, error);
      throw error;
    }
  }
}
