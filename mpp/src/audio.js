export const audioCtx = new AudioContext()

export function toggle() {
  if (audioCtx.state === "running") {
    audioCtx.suspend()
  } else {
    audioCtx.resume()
  }
}

export const source = audioCtx.createBufferSource()
// Analyzer and fft buffers
export const analyser = audioCtx.createAnalyser()
analyser.fftSize = 256
export const bufferLength = analyser.frequencyBinCount

export function loadTrack() {
  fetch("test.m4a")
    .then(resp => resp.arrayBuffer())
    .then(src => audioCtx.decodeAudioData(src))
    .then(buffer => {
      source.buffer = buffer
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      source.start()
      const appearOn = Math.round((buffer.duration - 10) * 1000)
      setInterval(
        () => document.getElementById("credits").classList.remove("hidden"),
        appearOn
      )
    })
}
