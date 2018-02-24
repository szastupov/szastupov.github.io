// THIS IS WORK IN PROGRESS AND LOOKS UGLY AS FUCK

const audioCtx = new AudioContext()
const analyser = audioCtx.createAnalyser()
const source = audioCtx.createBufferSource()

// Buttons
document.getElementById("play").onclick = () => audioCtx.resume()
document.getElementById("pause").onclick = () => audioCtx.suspend()

// Canvas
const canvas = document.querySelector("canvas")
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(canvas.width, canvas.height)
renderer.setClearColor(0x110011, 1)

// Scene
const camera = new THREE.PerspectiveCamera(
  45,
  canvas.width / canvas.height,
  1,
  500
)
const scene = new THREE.Scene()
scene.translateX(-70)
camera.position.set(0, 8, 100)
camera.lookAt(new THREE.Vector3(0, 0, 0))

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
sunSprite.position.set(70, 8, -1)
sunSprite.scale.set(30, 30, 1)
scene.add(sunSprite)

const COUNT = 100

// Analyzer
analyser.fftSize = 256
const bufferLength = analyser.frequencyBinCount
const dataArrays = []
for (let i = 0; i < COUNT; i++) {
  dataArrays.push(new Uint8Array(bufferLength))
}

// Geometry
const material = new THREE.LineBasicMaterial({ color: 0xd854c2 })
const lines = []
for (let i = 0; i < COUNT; i++) {
  const geometry = new THREE.Geometry()
  for (let j = 0; j < bufferLength; j++) {
    geometry.vertices.push(new THREE.Vector3(0, 0, 0))
  }
  const line = new THREE.Line(geometry, material)
  lines.push(line)
  scene.add(line)
}

function draw() {
  dataArrays.unshift(dataArrays.pop())
  analyser.getByteFrequencyData(dataArrays[0])

  for (let i = 0; i < COUNT; i++) {
    const dataArray = dataArrays[i]
    const z = i
    const line = lines[i]

    const width = 140
    const height = 30
    const geometry = line.geometry

    for (let j = 0; j < bufferLength; j++) {
      const xn = j / bufferLength
      const yn = dataArray[j] / 256
      geometry.vertices[j].set(xn * width, yn * height, z)
    }

    geometry.verticesNeedUpdate = true
  }

  renderer.render(scene, camera)

  requestAnimationFrame(draw)
}

function init() {
  fetch("test.m4a")
    .then(resp => resp.arrayBuffer())
    .then(src => audioCtx.decodeAudioData(src))
    .then(buffer => {
      source.buffer = buffer
      source.connect(analyser).connect(audioCtx.destination)
      source.start()
    })
  draw()
}

init()
