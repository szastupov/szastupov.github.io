const SMOOTHING = 1 / 512

// State
const state = {
  soundAvg: 0,
  fftBuffers: [],

  init(linesCount, bufferLength) {
    for (let i = 0; i < linesCount; i++) {
      this.fftBuffers.push(new Uint8Array(bufferLength))
    }
  },

  updateAvg(frame) {
    const avg = frame.reduce((sum, v) => sum + v, 0)
    this.soundAvg = SMOOTHING * avg + (1 - SMOOTHING) * this.soundAvg
  },

  update(analyser) {
    const { fftBuffers } = this
    fftBuffers.unshift(fftBuffers.pop())
    const frame = fftBuffers[0]
    analyser.getByteFrequencyData(frame)
    this.updateAvg(frame)
  }
}

export default state
