/**
 * IQRA Memory Pool Manager - مدير تجمع الذاكرة
 * 
 * "وَمَا أَنزَلْنَا مِنَ الذِّكْرِ بِهِ عِلْمٌ" - الإسراء: 12
 * 
 * Manages connection pooling for Redis, Qdrant, and external services
 * Following object pool pattern for optimal resource utilization
 */

import { IQRALogger } from './logger';
import { IQRAMemory } from './memory';
import { MemoryCoordinator } from './memory_coordinator';

/**
 * Connection pool configuration
 */
export interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  reapInterval: number;
}

/**
 * Pooled connection with metadata
 */
export interface PooledConnection<T> {
  resource: T;
  inUse: boolean;
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

/**
 * Generic connection pool implementation
 */
export class ConnectionPool<T> {
  private pool: PooledConnection<T>[] = [];
  private waitingQueue: Array<{
    resolve: (connection: PooledConnection<T>) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  
  private config: PoolConfig;
  private activeConnections = 0;
  private totalCreated = 0;
  private totalReused = 0;

  constructor(config: PoolConfig) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      minConnections: config.minConnections || 2,
      acquireTimeout: config.acquireTimeout || 30000,
      idleTimeout: config.idleTimeout || 30000,
      reapInterval: config.reapInterval || 60000
    };
    
    // Start cleanup interval
    setInterval(() => this.reapIdleConnections(), this.config.reapInterval);
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<T> {
    return new Promise((resolve, reject) => {
      // Try to find an available connection
      const available = this.pool.find(conn => !conn.inUse);
      
      if (available) {
        available.inUse = true;
        available.lastUsed = Date.now();
        available.useCount++;
        this.activeConnections++;
        
        IQRALogger.debug(`🔗 [POOL] Connection acquired from pool. Active: ${this.activeConnections}`);
        resolve(available.resource);
      } else if (this.pool.length < this.config.maxConnections) {
        // Create new connection if under max
        this.createConnection().then(resource => {
          const pooledConn: PooledConnection<T> = {
            resource,
            inUse: true,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            useCount: 1
          };
          
          this.pool.push(pooledConn);
          this.activeConnections++;
          this.totalCreated++;
          
          IQRALogger.debug(`🔗 [POOL] New connection created. Active: ${this.activeConnections}`);
          resolve(pooledConn.resource);
        }).catch(reject);
      } else {
        // Pool exhausted - wait for available connection
        const timeout = setTimeout(() => {
          const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
          if (index !== -1) {
            this.waitingQueue.splice(index, 1);
            reject(new Error('Connection acquire timeout'));
          }
        }, this.config.acquireTimeout);
        
        this.waitingQueue.push({ resolve, reject, timeout });
      }
    });
  }

  /**
   * Release a connection back to the pool
   */
  async release(resource: T): Promise<void> {
    return new Promise<void>((resolve) => {
      const pooled = this.pool.find(conn => conn.resource === resource && conn.inUse);
      
      if (pooled) {
        pooled.inUse = false;
        this.activeConnections--;
        this.totalReused++;
        
        IQRALogger.debug(`🔗 [POOL] Connection released. Active: ${this.activeConnections}`);
        
        // Process waiting queue
        if (this.waitingQueue.length > 0) {
          const next = this.waitingQueue.shift();
          if (next) {
            clearTimeout(next.timeout);
            pooled.inUse = true;
            pooled.lastUsed = Date.now();
            pooled.useCount++;
            this.activeConnections++;
            
            next.resolve(pooled.resource);
          }
        }
        
        resolve();
      } else {
        IQRALogger.warn('⚠️ [POOL] Attempted to release unmanaged connection');
        resolve();
      }
    });
  }

  /**
   * Create a new connection (to be implemented by specific pool types)
   */
  private async createConnection(): Promise<T> {
    throw new Error('createConnection must be implemented by subclass');
  }

  /**
   * Reap idle connections
   */
  private reapIdleConnections(): void {
    const now = Date.now();
    const idleThreshold = this.config.idleTimeout;
    
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const conn = this.pool[i];
      
      if (!conn.inUse && (now - conn.lastUsed) > idleThreshold) {
        this.pool.splice(i, 1);
        this.activeConnections--;
        
        IQRALogger.debug(`🧹 [POOL] Reaped idle connection. Active: ${this.activeConnections}`);
        
        // Close the actual connection if it has a close method
        if (conn.resource && typeof (conn.resource as any).close === 'function') {
          (conn.resource as any).close();
        }
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      totalConnections: this.pool.length,
      activeConnections: this.activeConnections,
      waitingQueue: this.waitingQueue.length,
      totalCreated: this.totalCreated,
      totalReused: this.totalReused,
      utilizationRate: (this.activeConnections / this.config.maxConnections) * 100
    };
  }

  /**
   * Destroy pool and cleanup all connections
   */
  async destroy(): Promise<void> {
    IQRALogger.info('🧹 [POOL] Destroying connection pool...');
    
    // Clear waiting queue
    for (const waiter of this.waitingQueue) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Pool destroyed'));
    }
    this.waitingQueue = [];
    
    // Close all connections
    for (const conn of this.pool) {
      if (conn.resource && typeof (conn.resource as any).close === 'function') {
        (conn.resource as any).close();
      }
    }
    
    this.pool = [];
    this.activeConnections = 0;
    
    IQRALogger.info('✅ [POOL] Connection pool destroyed');
  }
}

/**
 * Redis connection pool
 */
export class RedisConnectionPool extends ConnectionPool<any> {
  constructor(config: PoolConfig) {
    super(config);
  }

  protected async createConnection(): Promise<any> {
    const redis = await IQRAMemory['getRedis']();
    if (!redis) {
      throw new Error('Redis unavailable for pool creation');
    }
    
    IQRALogger.debug('🔗 [REDIS_POOL] Creating new Redis connection');
    return redis;
  }
}

/**
 * Qdrant connection pool
 */
export class QdrantConnectionPool extends ConnectionPool<any> {
  constructor(config: PoolConfig) {
    super(config);
  }

  protected async createConnection(): Promise<any> {
    const qdrant = await IQRAMemory['getQdrant']();
    if (!qdrant) {
      throw new Error('Qdrant unavailable for pool creation');
    }
    
    IQRALogger.debug('🔗 [QDRANT_POOL] Creating new Qdrant connection');
    return qdrant;
  }
}

/**
 * Memory pool manager that coordinates all connection pools
 */
export class MemoryPoolManager {
  private static instance: MemoryPoolManager | null = null;
  private redisPool: RedisConnectionPool | null = null;
  private qdrantPool: QdrantConnectionPool | null = null;
  private coordinator: MemoryCoordinator | null = null;

  static getInstance(): MemoryPoolManager {
    if (!this.instance) {
      this.instance = new MemoryPoolManager();
    }
    return this.instance;
  }

  /**
   * Initialize all connection pools
   */
  async initialize(): Promise<void> {
    IQRALogger.info('🚀 [POOL_MANAGER] Initializing memory pool manager...');
    
    // Initialize memory coordinator
    this.coordinator = MemoryCoordinator.getInstance();
    await this.coordinator.initialize();
    
    // Initialize Redis pool
    this.redisPool = new RedisConnectionPool({
      maxConnections: 10,
      minConnections: 2,
      acquireTimeout: 30000,
      idleTimeout: 60000,
      reapInterval: 30000
    });
    
    // Initialize Qdrant pool
    this.qdrantPool = new QdrantConnectionPool({
      maxConnections: 5,
      minConnections: 1,
      acquireTimeout: 30000,
      idleTimeout: 60000,
      reapInterval: 30000
    });
    
    IQRALogger.info('✅ [POOL_MANAGER] Memory pool manager initialized');
  }

  /**
   * Acquire Redis connection from pool
   */
  async acquireRedis(): Promise<any> {
    if (!this.redisPool) {
      throw new Error('Redis pool not initialized');
    }
    return this.redisPool.acquire();
  }

  /**
   * Release Redis connection back to pool
   */
  async releaseRedis(redis: any): Promise<void> {
    if (!this.redisPool) {
      IQRALogger.warn('⚠️ [POOL_MANAGER] Redis pool not initialized');
      return;
    }
    return this.redisPool.release(redis);
  }

  /**
   * Acquire Qdrant connection from pool
   */
  async acquireQdrant(): Promise<any> {
    if (!this.qdrantPool) {
      throw new Error('Qdrant pool not initialized');
    }
    return this.qdrantPool.acquire();
  }

  /**
   * Release Qdrant connection back to pool
   */
  async releaseQdrant(qdrant: any): Promise<void> {
    if (!this.qdrantPool) {
      IQRALogger.warn('⚠️ [POOL_MANAGER] Qdrant pool not initialized');
      return;
    }
    return this.qdrantPool.release(qdrant);
  }

  /**
   * Get comprehensive pool statistics
   */
  getPoolStats() {
    const coordinator = this.coordinator?.getMetrics();
    const redisStats = this.redisPool?.getStats();
    const qdrantStats = this.qdrantPool?.getStats();
    
    return {
      coordinator,
      redis: redisStats,
      qdrant: qdrantStats,
      timestamp: Date.now()
    };
  }

  /**
   * Health check for all pools
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    if (this.coordinator) {
      const coordinatorHealth = await this.coordinator.healthCheck();
      Object.assign(health, coordinatorHealth);
    }
    
    // Check pool health
    if (this.redisPool) {
      const redisStats = this.redisPool.getStats();
      health.redis_pool = redisStats.utilizationRate < 80; // Healthy if under 80% utilization
    }
    
    if (this.qdrantPool) {
      const qdrantStats = this.qdrantPool.getStats();
      health.qdrant_pool = qdrantStats.utilizationRate < 80; // Healthy if under 80% utilization
    }
    
    return health;
  }

  /**
   * Cleanup all pools
   */
  async cleanup(): Promise<void> {
    IQRALogger.info('🧹 [POOL_MANAGER] Cleaning up memory pool manager...');
    
    if (this.redisPool) {
      await this.redisPool.destroy();
    }
    
    if (this.qdrantPool) {
      await this.qdrantPool.destroy();
    }
    
    if (this.coordinator) {
      await this.coordinator.cleanup();
    }
    
    this.redisPool = null;
    this.qdrantPool = null;
    this.coordinator = null;
    
    IQRALogger.info('✅ [POOL_MANAGER] Memory pool manager cleaned up');
  }
}
