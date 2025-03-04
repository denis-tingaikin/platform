import { Recorder } from './recorder'
import { TusUploader, Uploader, Options } from './uploader'

export class ScreenRecorder {
  private readonly recorder: Recorder
  private readonly uploader: Uploader

  constructor (recorder: Recorder, uploader: Uploader) {
    this.recorder = recorder
    this.uploader = uploader
  }

  static async fromNavigatorMediaDevices (opts: Options): Promise<ScreenRecorder> {
    let width = 0
    let height = 0
    const combinedStream = new MediaStream()
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: opts.fps ?? 30 }, audio: true })
    const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    displayStream.getVideoTracks().forEach(track => { combinedStream.addTrack(track); width = Math.max(track.getSettings().width ?? width, width); height = Math.max(track.getSettings().height ?? height, height) })
    displayStream.getAudioTracks().forEach(track => { combinedStream.addTrack(track) })
    microphoneStream.getAudioTracks().forEach(track => { combinedStream.addTrack(track) })
    const recorder = new Recorder(combinedStream)

    const uploader = new TusUploader(recorder.asStream(), { ...opts, metadata: { resolution: width + ':' + height } })

    return new ScreenRecorder(recorder, uploader)
  }

  public start (): void {
    this.uploader.start()
    this.recorder.start()
  }

  public pause (): void {
    this.recorder.pause()
  }

  public resume (): void {
    this.recorder.resume()
  }

  public async stop (): Promise<void> {
    this.recorder.stop()
    await this.uploader.wait()
  }

  public async cancel (): Promise<void> {
    this.recorder.stop()
    await this.uploader.cancel()
  }
}
