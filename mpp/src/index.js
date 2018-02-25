// THIS IS WORK IN PROGRESS AND LOOKS UGLY AS FUCK
import * as THREE from "three"

const debugNode = document.querySelector("#debug")
const audioCtx = new AudioContext()

function debug(...args) {
  debugNode.textContent = args.join(" ")
}

// Canvas
const canvas = document.querySelector("canvas")
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

const width = canvas.width
const height = width / 2

// Constants
const LINE_COUNT = 110
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
camera.lookAt(new THREE.Vector3(0, 0, -1))
let sunSprite

// Scene
function initLines(scene, bufferLength) {
  const material = new THREE.LineBasicMaterial({ color: 0xd854c2 })
  const lines = []

  for (let i = 0; i < LINE_COUNT; i++) {
    const geometry = new THREE.Geometry()
    for (let j = 0; j < bufferLength; j++) {
      geometry.vertices.push(new THREE.Vector3(0, 0, 0))
    }
    geometry.vertices.push(new THREE.Vector3(0, 0, 0))
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
  sunSprite = new THREE.Sprite(sunMaterial)
  sunSprite.scale.set(40, 40, 1)
  scene.add(sunSprite)
}

// Geometry
let lines
let soundAvg = 0
const weight = 1 / 512

function render(scene) {
  dataArrays.unshift(dataArrays.pop())
  analyser.getByteFrequencyData(dataArrays[0])

  const avg = dataArrays[0].reduce((sum, v) => sum + v, 0)
  soundAvg = weight * avg + (1 - weight) * soundAvg
  const factor = soundAvg / 1000
  // debug(factor)

  camera.position.set(0, CAMERA_Y + factor * 2, 100)
  sunSprite.position.set(0, CAMERA_Y + 1.5 + factor / 2, -20)

  for (let i = 0; i < LINE_COUNT; i++) {
    const dataArray = dataArrays[i]
    const z = i - 30
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
    geometry.vertices[bufferLength].set(width, 0, z)

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
