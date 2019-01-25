class LockService {
  constructor () {
    this.locks = {}
    this.uniqueProcesses = {}
  }

  setDoing (key) {
    this.locks[key] = true
  }
  isDoing (key) {
    return this.locks[key] !== undefined
  }
  setDone (key) {
    delete this.locks[key]
  }
  lock (key, process) {
    if (this.isDoing(key)) {
      console.log(`lock: already ${key}`)
      return
    }
    this.setDoing(key)
    try {
      process()
    } finally {
      this.setDone(key)
    }
  }
  lockPromise (key, process) {
    if (this.isDoing(key)) {
      console.log(`lock: already ${key}`)
      return Promise.reject(new Error('already processing...'))
    }
    this.setDoing(key)
    const promise = process()
    promise.finally(() => this.setDone(key))
    return promise
  }
  uniqueProcess (key, process) {
    if (this.uniqueProcesses[key] === undefined) {
      this.uniqueProcesses[key] = process().then(result => {
        this.uniqueProcesses[key] = undefined
        return result
      })
    }
    return this.uniqueProcesses[key]
  }
}

const lockService = new LockService()
export default lockService
