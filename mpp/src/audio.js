export const audioCtx = new AudioContext()

export function toggle() {
  if (audioCtx.state === "running") {
    audioCtx.suspend()
  } else {
    audioCtx.resume()
  }
}

// Analyzer and fft buffers
export const analyser = audioCtx.createAnalyser()
analyser.fftSize = 256
export const bufferLength = analyser.frequencyBinCount

export function loadTrack() {
  fetch("test.m4a")
    .then(resp => resp.arrayBuffer())
    .then(src => audioCtx.decodeAudioData(src))
    .then(buffer => {
      const source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      source.start()
    })
}
