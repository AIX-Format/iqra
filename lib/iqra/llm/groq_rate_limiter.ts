/**
 * Groq Rate Limiter - محدد معدل Groq
 * 
 * "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — مريم: 64
 * 
 * نظام ذكي للتعامل مع حدود معدل Groq API
 */

import { IQRALogger } from '../logger';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number;
  requestCount: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class GroqRateLimiter {
  private static requestCount = 0;
  private static lastResetTime = Date.now();
  private static rateLimitInfo: RateLimitInfo | null = null;
  
  /**
   * إعدادات Retry الافتراضية
   */
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 ثانية
    maxDelay: 30000, // 30 ثانية
    backoffMultiplier: 2
  };

  /**
   * التحقق من حدود المعدل
   */
  static checkRateLimit(error: any): RateLimitInfo | null {
    if (error?.code === 'rate_limit_exceeded') {
      const now = Date.now();
      
      // استخراج معلومات من رسالة الخطأ
      const message = error.message || '';
      const limitMatch = message.match(/Limit (\d+), Used (\d+), Requested (\d+)/);
      
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        const used = parseInt(limitMatch[2]);
        const requested = parseInt(limitMatch[3]);
        
        // حساب الوقت المتبقي لإعادة التعيين
        const timeMatch = message.match(/try again in ([\dhms\.]+)s/);
        let retryAfter = 3600000; // ساعة واحدة افتراضياً
        if (timeMatch) {
          const timeStr = timeMatch[1];
          retryAfter = this.parseTimeString(timeStr);
        }
        
        this.rateLimitInfo = {
          limit,
          remaining: limit - used,
          resetTime: now + retryAfter,
          retryAfter,
          requestCount: this.requestCount
        };
        
        IQRALogger.warn(`🚦 [GROQ_RATE_LIMIT] Rate limit exceeded:`, {
          limit,
          used,
          requested,
          retryAfter: `${Math.round(retryAfter / 1000)}s`,
          requestCount: this.requestCount
        });
        
        return this.rateLimitInfo;
      }
    }
    
    return null;
  }

  /**
   * تحويل نص الوقت إلى milliseconds
   */
  private static parseTimeString(timeStr: string): number {
    const parts = timeStr.split(/(\d+)([hms])/);
    let total = 0;
    
    for (let i = 0; i < parts.length; i += 2) {
      const value = parseInt(parts[i]);
      const unit = parts[i + 1];
      
      switch (unit) {
        case 'h':
          total += value * 3600000;
          break;
        case 'm':
          total += value * 60000;
          break;
        case 's':
          total += value * 1000;
          break;
      }
    }
    
    return total;
  }

  /**
   * تنفيذ طلب مع إعادة المحاولة
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: any;
    
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        this.requestCount++;
        const result = await operation();
        
        // إذا نجحت العملية، إعادة تعيين العداد
        if (attempt === 0) {
          this.requestCount = 0;
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // التحقق إذا كان الخطأ بسبب rate limit
        const rateLimitInfo = this.checkRateLimit(error);
        if (rateLimitInfo) {
          this.rateLimitInfo = rateLimitInfo;
          
          // الانتظار حتى وقت إعادة المحاولة
          if (attempt < finalConfig.maxRetries) {
            const waitTime = Math.min(
              finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
              finalConfig.maxDelay
            );
            
            IQRALogger.info(`⏳ [GROQ_RATE_LIMIT] Waiting ${waitTime}ms before retry ${attempt + 1}/${finalConfig.maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            throw error;
          }
        } else {
          // إذا كان خطأ آخر، إعادة المحاولة مع تأخير
          if (attempt < finalConfig.maxRetries) {
            const waitTime = Math.min(
              finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
              finalConfig.maxDelay
            );
            
            IQRALogger.warn(`⚠️ [GROQ_RATE_LIMIT] Attempt ${attempt + 1} failed, retrying in ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    }
    
    // إذا استنفذت جميع المحاولات
    throw lastError;
  }

  /**
   * التحقق إذا يمكننا إجراء طلب جديد
   */
  static canMakeRequest(): boolean {
    if (!this.rateLimitInfo) {
      return true;
    }
    
    const now = Date.now();
    return now >= this.rateLimitInfo.retryAfter;
  }

  /**
   * الحصول على معلومات الحد الحالي
   */
  static getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * إعادة تعيين حالة المعدل
   */
  static reset(): void {
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.rateLimitInfo = null;
    
    IQRALogger.info('🔄 [GROQ_RATE_LIMIT] Rate limiter reset');
  }

  /**
   * الحصول على إحصائيات الاستخدام
   */
  static getUsageStats(): {
    requestCount: number;
    isRateLimited: boolean;
    timeUntilReset: number | null;
  } {
    const now = Date.now();
    let timeUntilReset = null;
    
    if (this.rateLimitInfo) {
      timeUntilReset = this.rateLimitInfo.resetTime - now;
    }
    
    return {
      requestCount: this.requestCount,
      isRateLimited: !!this.rateLimitInfo,
      timeUntilReset
    };
  }

  /**
   * حساب وقت انتظار ذكي بناءً على استخدام API
   */
  static calculateSmartDelay(attempt: number, config: RetryConfig): number {
    const baseDelay = config.baseDelay || this.DEFAULT_RETRY_CONFIG.baseDelay;
    const multiplier = config.backoffMultiplier || this.DEFAULT_RETRY_CONFIG.backoffMultiplier;
    const maxDelay = config.maxDelay || this.DEFAULT_RETRY_CONFIG.maxDelay;
    
    // استخدام exponential backoff مع jitter
    const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
    const jitter = Math.random() * 1000; // حتى 1 ثانية jitter
    const smartDelay = Math.min(exponentialDelay + jitter, maxDelay);
    
    IQRALogger.debug(`🧮 [GROQ_RATE_LIMIT] Calculated smart delay: ${smartDelay}ms (attempt: ${attempt})`);
    
    return smartDelay;
  }

  /**
   * تنفيذ عملية مع تأخير ذكي
   */
  static async executeWithSmartDelay<T>(
    operation: () => Promise<T>,
    delay: number
  ): Promise<T> {
    if (delay > 0) {
      IQRALogger.info(`⏳ [GROQ_RATE_LIMIT] Smart delay: ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return await operation();
  }

  /**
   * تحديث معلومات الحد من استجابة API
   */
  static updateFromHeaders(headers: Record<string, string>): void {
    const limit = headers['x-ratelimit-limit-requests'];
    const remaining = headers['x-ratelimit-remaining-requests'];
    const reset = headers['x-ratelimit-reset-requests'];
    
    if (limit && remaining && reset) {
      const resetTime = new Date(reset).getTime();
      const now = Date.now();
      
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime,
        retryAfter: resetTime > now ? resetTime - now : 0,
        requestCount: this.requestCount
      };
      
      IQRALogger.info(`📊 [GROQ_RATE_LIMIT] Updated from headers:`, {
        limit: this.rateLimitInfo.limit,
        remaining: this.rateLimitInfo.remaining,
        resetIn: `${Math.round((this.rateLimitInfo.resetTime - now) / 1000)}s`
      });
    }
  }

  /**
   * اقتراح تحسينات بناءً على الاستخدام
   */
  static getOptimizations(): string[] {
    const stats = this.getUsageStats();
    const optimizations: string[] = [];
    
    if (stats.requestCount > 100) {
      optimizations.push('📈 High request volume detected - consider implementing request batching');
    }
    
    if (stats.isRateLimited) {
      optimizations.push('⏱️ Rate limiting active - consider upgrading to higher tier');
    }
    
    if (stats.timeUntilReset && stats.timeUntilReset > 300000) {
      optimizations.push('⏰ Long reset time detected - consider request optimization');
    }
    
    return optimizations;
  }

  /**
   * تصدير بيانات المعدل
   */
  static exportRateLimitData(): any {
    return {
      currentInfo: this.rateLimitInfo,
      usageStats: this.getUsageStats(),
      optimizations: this.getOptimizations(),
      exportTimestamp: Date.now()
    };
  }
}
