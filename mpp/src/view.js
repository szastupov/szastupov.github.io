import * as THREE from "three"
import { toggle } from "./audio"
import * as screenfull from "screenfull"

const CAMERA_Y = 8

// View
const view = {
  lines: [],
  sprites: {},

  camera: new THREE.PerspectiveCamera(45, 1 / 2, 1, 500),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  scene: new THREE.Scene(),

  init() {
    this.setSize()
    window.onresize = () => this.setSize()

    // Camera
    this.camera.position.set(0, CAMERA_Y, 100)
    this.camera.lookAt(new THREE.Vector3(0, 0, -1))

    this.loadTextures()
  },

  render() {
    const { renderer, scene, camera } = this
    renderer.render(scene, camera)
  },

  setSize() {
    const { renderer, camera } = this

    const width = window.innerWidth
    const height = width / 2
    const ratio = width / height

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setViewport(0, (window.innerHeight - height) / 2, width, height)

    camera.aspect = ratio
    camera.updateProjectionMatrix()
  },

  updateCamera(factor) {
    this.camera.position.set(0, CAMERA_Y + factor * 2, 100)
    this.sprites.sun.position.set(0, CAMERA_Y + 1.5 + factor / 2, -20)
  },

  loadTextures() {
    const { scene, sprites } = this

    // Stars
    const starsTexture = new THREE.TextureLoader().load("stars.png")
    starsTexture.premultiplyAlpha = true
    starsTexture.wrapS = THREE.MirroredRepeatWrapping
    starsTexture.wrapT = THREE.MirroredRepeatWrapping
    scene.background = starsTexture

    // Sun
    const sunTexture = new THREE.TextureLoader().load("sun.png")
    const sunMaterial = new THREE.SpriteMaterial({
      map: sunTexture
    })
    sprites.sun = new THREE.Sprite(sunMaterial)
    sprites.sun.scale.set(40, 40, 1)
    scene.add(sprites.sun)
  }
}

document.body.onclick = toggle
document.onkeypress = ev => {
  switch (ev.key) {
    case "m":
      return toggle()
    case "f": {
      if (screenfull.enabled) {
        screenfull.toggle()
      }
    }
  }
}
document.body.appendChild(view.renderer.domElement)

export default view
