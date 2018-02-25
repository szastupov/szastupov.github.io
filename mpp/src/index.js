// THIS IS WORK IN PROGRESS AND LOOKS UGLY AS FUCK
import * as THREE from "three"

const audioCtx = new AudioContext()

// Canvas
const canvas = document.querySelector("canvas")
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

const width = canvas.width
const height = width / 2

// Constants
const LINE_COUNT = 100
const CAMERA_Y = 8

// Analyzer and fft buffers
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 256
const bufferLength = analyser.frequencyBinCount
const dataArrays = []
for (let i = 0; i < LINE_COUNT; i++) {
  dataArrays.push(new Uint8Array(bufferLength))
}

// Renderer
const ratio = width / height
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setViewport(0, (canvas.height - height) / 2, width, height)
// Camera
const camera = new THREE.PerspectiveCamera(45, ratio, 1, 500)
camera.position.set(0, CAMERA_Y, 100)
camera.lookAt(new THREE.Vector3(0, 0, 0))

// Scene
function initLines(scene, bufferLength) {
  const material = new THREE.LineBasicMaterial({ color: 0xd854c2 })
  const lines = []

  for (let i = 0; i < LINE_COUNT; i++) {
    const geometry = new THREE.Geometry()
    for (let j = 0; j < bufferLength; j++) {
      geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    }
    const line = new THREE.Line(geometry, material)
    lines.push(line)
    scene.add(line)
  }

  return lines
}

function loadTextures(scene) {
  // Stars
  const starsTexture = new THREE.TextureLoader().load("stars.png")
  starsTexture.premultiplyAlpha = true
  scene.background = starsTexture

  // Sun
  const sunTexture = new THREE.TextureLoader().load("sun.png")
  const sunMaterial = new THREE.SpriteMaterial({
    map: sunTexture
  })
  const sunSprite = new THREE.Sprite(sunMaterial)
  sunSprite.position.set(0, CAMERA_Y, -1)
  sunSprite.scale.set(30, 30, 1)
  scene.add(sunSprite)
}

// Geometry
let lines

function render(scene) {
  dataArrays.unshift(dataArrays.pop())
  analyser.getByteFrequencyData(dataArrays[0])

  for (let i = 0; i < LINE_COUNT; i++) {
    const dataArray = dataArrays[i]
    const z = i
    const line = lines[i]

    const xoff = 60
    const width = 140
    const height = 30
    const geometry = line.geometry

    for (let j = 0; j < bufferLength; j++) {
      const xn = j / bufferLength
      const yn = dataArray[j] / 256
      geometry.vertices[j].set(xn * width - xoff, yn * height, z)
    }

    geometry.verticesNeedUpdate = true
  }

  renderer.render(scene, camera)

  requestAnimationFrame(() => render(scene))
}

function init() {
  const scene = new THREE.Scene()
  loadTextures(scene)
  lines = initLines(scene, bufferLength)
  render(scene)

  fetch("test.m4a")
    .then(resp => resp.arrayBuffer())
    .then(src => audioCtx.decodeAudioData(src))
    .then(buffer => {
      const source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(analyser).connect(audioCtx.destination)
      source.start()
    })
}

// Buttons
document.getElementById("play").onclick = () => audioCtx.resume()
document.getElementById("pause").onclick = () => audioCtx.suspend()

init()
