import { ref } from 'vue'
import { mediator } from './mediator'

enum CacheType {
  Local,
  Session
}

class Caches {
  #keys: any[]
  storage: Storage
  constructor(type: CacheType) {
    this.storage = type === CacheType.Local ? localStorage : sessionStorage
    this.#keys = []
  }

  setCache(key: string, value: any, options?: { watch?: boolean }) {
    if (value && key) {
      const _value = JSON.stringify(value)
      if (options && options.watch) {
        if (!this.#keys.includes(key)) {
          this.#keys.push(key)
        }
        mediator.publish(key, value)
      }
      this.storage.setItem(key, _value)
    }
  }

  getSubCache(key: string) {
    const result = ref()
    if (!this.#keys.includes(key)) {
      this.#keys.push(key)
    }
    mediator.subscribe(key, (value) => {
      result.value = value
    })
    return result
  }

  getCache(key: string) {
    const value = this.storage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
  }

  deleteCache(key: string) {
    if (this.#keys.includes(key)) {
      this.#keys.splice(this.#keys.indexOf(key), 1)
    }
    mediator.publish(key, undefined)
    this.storage.removeItem(key)
  }

  clearCache() {
    this.#keys.map((key) => {
      mediator.publish(key, undefined)
    })
    this.#keys.length = 0
    this.storage.clear()
  }
}

const localCache = new Caches(CacheType.Local)
const sessionCache = new Caches(CacheType.Session)

export { localCache, sessionCache }
