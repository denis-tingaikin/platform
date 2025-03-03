export interface ChunkReadResult { done: boolean, value: Blob | undefined }

export class ChunkReader {
  private readonly chunks: Blob[] = []
  private done: boolean = false
  private awaitingResolve: ((val: ChunkReadResult | PromiseLike<ChunkReadResult>) => void) | null = null

  public read (): Promise<ChunkReadResult> {
    if (this.done && this.chunks.length === 0) {
      return Promise.resolve({ done: true, value: undefined })
    }
    if (this.chunks.length === 0) {
      return new Promise((resolve) => {
        this.awaitingResolve = resolve
      })
    }
    return Promise.resolve({ done: false, value: this.chunks.shift() })
  }

  public push (blob: Blob): void {
    console.log('pushed')
    this.chunks.push(blob)
    console.log(this.awaitingResolve)
    if (this.awaitingResolve !== null) {
      this.awaitingResolve(this.read())
      this.awaitingResolve = null
    }
  }

  public close (): void {
    this.done = true
    if (this.awaitingResolve !== null) {
      this.awaitingResolve(this.read())
      this.awaitingResolve = null
    }
  }
}
