// THIS IS WORK IN PROGRESS AND LOOKS UGLY AS FUCK

import "@mohayonao/web-audio-api-shim/light"
import * as THREE from "three"
import { loadTrack, bufferLength, analyser } from "./audio"
import state from "./state"
import view from "./view"

// Constants
const LINE_COUNT = 110

loadTrack()
state.init(LINE_COUNT, bufferLength)
view.init()
initLines()
requestAnimationFrame(render)

function render() {
  state.update(analyser)
  view.updateCamera(state.soundAvg / 1000)

  view.scene.background.rotation = state.skyRotation

  for (let i = 0; i < LINE_COUNT; i++) {
    const fft = state.fftBuffers[i]
    const z = i - 30
    const line = view.lines[i]

    const xoff = 60
    const width = 140
    const height = 30
    const geometry = line.geometry

    for (let j = 0; j < bufferLength; j++) {
      const xn = j / bufferLength
      const yn = fft[j] / 256
      geometry.vertices[j].set(xn * width - xoff, yn * height, z)
    }
    geometry.vertices[bufferLength].set(width, 0, z)

    geometry.verticesNeedUpdate = true
  }

  view.render()

  requestAnimationFrame(render)
}

function initLines() {
  const material = new THREE.LineBasicMaterial({ color: 0xd854c2 })

  for (let i = 0; i < LINE_COUNT; i++) {
    const geometry = new THREE.Geometry()
    for (let j = 0; j < bufferLength; j++) {
      geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    }
    geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    const line = new THREE.Line(geometry, material)
    view.lines.push(line)
    view.scene.add(line)
  }
}
