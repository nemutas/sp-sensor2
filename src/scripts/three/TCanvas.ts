import * as THREE from 'three';
import { sensorState } from '../store';
import { publicPath } from '../utils';
import planeFrag from './shader/planeFrag.glsl';
import planeVert from './shader/planeVert.glsl';
import { Assets, TCanvasBase } from './TCanvasBase';

export class TCanvas extends TCanvasBase {
	private material?: THREE.ShaderMaterial

	private assets: Assets = {
		image1: { path: publicPath('/assets/wlop1.jpg') },
		image2: { path: publicPath('/assets/wlop2.jpg') },
		noise: { path: publicPath('/assets/noise.jpg') }
	}

	constructor(parentNode: ParentNode) {
		super(parentNode)

		this.loadAssets(this.assets).then(() => {
			this.setScene()
			this.setModel()
			this.setResizeCallback()
			this.addEvent()
			this.setDispose()
			this.animate(this.update)
		})
	}

	private setScene = () => {
		this.setOrthographicCamera(-1, 1, 1, -1, 0, 10)
		this.camera.position.z = 1
	}

	private setResizeCallback = () => {
		this.resizeCallback = () => {
			if (this.material) {
				const aspect = this.size.aspect
				const _calcCoveredTextureScale = (uniformName: string) => {
					const textureData = this.material!.uniforms[uniformName].value
					this.calcCoveredTextureScale(textureData.texture, aspect, textureData.scale)
				}
				_calcCoveredTextureScale('u_image1')
				_calcCoveredTextureScale('u_image2')
				_calcCoveredTextureScale('u_noise')
			}
		}
	}

	private setModel = () => {
		const getMirroredRepeatTexture = (name: string) => {
			const texture = this.assets[name].data as THREE.Texture
			texture.wrapS = THREE.MirroredRepeatWrapping
			texture.wrapT = THREE.MirroredRepeatWrapping
			return texture
		}
		const image1 = getMirroredRepeatTexture('image1')
		const image2 = getMirroredRepeatTexture('image2')
		const noise = getMirroredRepeatTexture('noise')

		const geometry = new THREE.PlaneGeometry(2, 2)
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				u_image1: { value: { texture: image1, scale: this.calcCoveredTextureScale(image1, this.size.aspect) } },
				u_image2: { value: { texture: image2, scale: this.calcCoveredTextureScale(image2, this.size.aspect) } },
				u_noise: { value: { texture: noise, scale: this.calcCoveredTextureScale(noise, this.size.aspect) } },
				u_progress: { value: 0 },
				u_tilt: { value: 0 }
			},
			vertexShader: planeVert,
			fragmentShader: planeFrag,
			side: THREE.DoubleSide
		})
		const mesh = new THREE.Mesh(geometry, this.material)
		this.scene.add(mesh)

		// this.gui.add(this.material!.uniforms.u_progress, 'value', 0, 1, 0.01).name('progress')
	}

	private addEvent = () => {
		window.addEventListener('deviceorientation', this.handleOrientationchange)
	}

	private handleOrientationchange = () => {
		const aspect = this.size.aspect
		const _calcCoveredTextureScale = (uniformName: string) => {
			const textureData = this.material!.uniforms[uniformName].value
			this.calcCoveredTextureScale(textureData.texture, aspect, textureData.scale)
		}
		_calcCoveredTextureScale('u_image1')
		_calcCoveredTextureScale('u_image2')
		_calcCoveredTextureScale('u_noise')
	}

	private setDispose = () => {
		this.disposeCallback = () => {
			window.removeEventListener('deviceorientation', this.handleOrientationchange)
		}
	}

	private update = () => {
		// snsor angle constraints
		// https://developer.mozilla.org/ja/docs/Web/Events/Orientation_and_motion_data_explained
		let tiltX = sensorState.angle.y / 90
		tiltX = THREE.MathUtils.clamp(tiltX, -1, 1)
		this.material!.uniforms.u_tilt.value = THREE.MathUtils.lerp(this.material!.uniforms.u_tilt.value, tiltX, 0.05)
	}
}
