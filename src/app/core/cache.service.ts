import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = localStorage;

  get(key: string): string | null {
    return this.cache.getItem(key);
  }

  set(key: string, value: string): void {
    this.cache.setItem(key, value);
  }

  remove(key: string): void {
    this.cache.removeItem(key);
  }

  clear(): void {
    this.cache.clear();
  }
}