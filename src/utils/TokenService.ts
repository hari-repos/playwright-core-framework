import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { APIRequestContext } from '@playwright/test';

export interface TokenConfig {
  authUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  grantType?: string;
}

export interface CachedToken {
  token: string;
  expiresAt: number; // timestamp in ms
}

const CACHE_FILE = path.join(process.cwd(), '.auth-token.json');
// Provide a buffer so we don't use a token that's about to expire in the next 10 seconds.
const EXPIRY_BUFFER_MS = 10000; 

export class TokenService {
  /**
   * Retrieves a valid token, either from cache or by requesting a new one.
   * @param requestContext Playwright APIRequestContext to make the auth request.
   * @param config The TokenConfig containing auth details.
   * @returns A promise that resolves to the token string.
   */
  static async getToken(requestContext: APIRequestContext, config: TokenConfig): Promise<string> {
    const cached = await this.readCache();
    
    if (cached && cached.expiresAt > Date.now() + EXPIRY_BUFFER_MS) {
      console.log('[TokenService] Using cached token.');
      return cached.token;
    }

    console.log('[TokenService] Token expired or not found. Fetching new token...');
    const newTokenData = await this.fetchNewToken(requestContext, config);
    await this.writeCache(newTokenData);
    
    return newTokenData.token;
  }

  /**
   * Forces a token refresh by ignoring the cache.
   */
  static async refreshToken(requestContext: APIRequestContext, config: TokenConfig): Promise<string> {
    console.log('[TokenService] Forcing token refresh...');
    const newTokenData = await this.fetchNewToken(requestContext, config);
    await this.writeCache(newTokenData);
    return newTokenData.token;
  }

  private static async fetchNewToken(requestContext: APIRequestContext, config: TokenConfig): Promise<CachedToken> {
    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('grant_type', config.grantType || 'client_credentials');
    if (config.scope) {
      params.append('scope', config.scope);
    }

    const response = await requestContext.post(config.authUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(),
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`[TokenService] Failed to fetch token. Status: ${response.status()}, Response: ${errorText}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in?: number };
    if (!data.access_token) {
      throw new Error('[TokenService] Response did not contain an access_token.');
    }

    const token = data.access_token;
    let expiresAt = Date.now() + (3600 * 1000); // Default to 1 hour if we can't figure it out

    // 1. Try to decode as JWT to get exact expiry
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload | null;
      if (decoded && decoded.exp) {
        expiresAt = decoded.exp * 1000;
        console.log(`[TokenService] Expiry determined from JWT claim: ${new Date(expiresAt).toISOString()}`);
        return { token, expiresAt };
      }
    } catch (e) {
      // Not a JWT or failed to decode, ignore
    }

    // 2. Fallback to expires_in from response
    if (data.expires_in) {
      expiresAt = Date.now() + (data.expires_in * 1000);
      console.log(`[TokenService] Expiry determined from expires_in field: ${new Date(expiresAt).toISOString()}`);
    } else {
      console.warn('[TokenService] Could not determine expiry from JWT or response. Defaulting to 1 hour.');
    }

    return { token, expiresAt };
  }

  private static async readCache(): Promise<CachedToken | null> {
    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      return JSON.parse(data) as CachedToken;
    } catch (e) {
      return null; // File doesn't exist or is invalid
    }
  }

  private static async writeCache(data: CachedToken): Promise<void> {
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn(`[TokenService] Failed to write cache to ${CACHE_FILE}: ${e.message}`);
    }
  }
}
