export interface MediatorItf {
  subscribe(topic: string, callback: (...args: unknown[]) => void): void
  publish(topic: string, ...args: unknown[]): void
}

class Mediator implements MediatorItf {
  #topics: any
  #uuid: number
  constructor() {
    this.#topics = {}
    this.#uuid = 0
  }

  static init(): MediatorItf {
    return new Mediator()
  }

  subscribe(topic: string, callback: (...args: unknown[]) => void): void {
    this.#uuid++
    if (!this.#topics[topic]) {
      this.#topics[topic] = {
        callback,
        uuid: this.#uuid
      }
    }
  }

  publish(topic: string, ...args: unknown[]): void {
    if (!this.#topics[topic]) {
      return
    }
    this.#topics[topic].callback(...args)
  }
}

export const mediator = Mediator.init()
