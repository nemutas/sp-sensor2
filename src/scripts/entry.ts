import { sensorState } from './store';
import { TCanvas } from './three/TCanvas';

class App {
	private canvas: TCanvas
	private clickElement: HTMLDivElement
	private canvasContainerElement: HTMLDivElement
	// private debugElement: HTMLDivElement
	private offsetAngle = { x: 0, y: 0, z: 0 }
	private prevOrientation = -1

	constructor() {
		const parentNode = document.querySelector('body')!
		this.canvas = new TCanvas(parentNode)

		this.clickElement = document.querySelector<HTMLDivElement>('.orientation-permission')!
		this.canvasContainerElement = document.querySelector<HTMLDivElement>('.three-container')!
		// this.debugElement = document.querySelector<HTMLDivElement>('.debug')!

		this.addEvents()
	}

	private addEvents = () => {
		window.addEventListener('beforeunload', () => {
			this.dispose()
		})
		this.clickElement.onclick = () => {
			this.requestDeviceOrientation()
		}
		this.canvasContainerElement.onclick = () => {
			sensorState.updateOffsetAngle = true
		}
	}

	private requestDeviceOrientation = () => {
		// https://developer.apple.com/forums/thread/128376
		// https://www.w3.org/TR/orientation-event/#description
		const doe = DeviceOrientationEvent as any
		if (doe && doe.requestPermission && typeof doe.requestPermission === 'function') {
			// after ios13
			;(doe.requestPermission() as Promise<PermissionState>)
				.then(response => {
					if (response === 'granted') {
						this.clickElement.style.zIndex = '-10'
						window.addEventListener('deviceorientation', this.handleDeviceorientation)
					}
				})
				.catch(console.error)
		} else {
			// another
			this.clickElement.style.zIndex = '-10'
			window.addEventListener('deviceorientation', this.handleDeviceorientation)
		}
	}

	private handleDeviceorientation = (e: DeviceOrientationEvent) => {
		const [alpha, beta, gamma] = [e.alpha ?? 0, e.beta ?? 0, e.gamma ?? 0]
		// const orientation = navigator.userAgent.match(/(iPhone|iPod|iPad)/) ? window.orientation : screen.orientation.angle
		const orientation = screen.orientation ? screen.orientation.angle : window.orientation
		if (!sensorState.updateOffsetAngle) {
			sensorState.updateOffsetAngle = orientation !== this.prevOrientation
		}

		if (orientation === 0) {
			sensorState.updateOffsetAngle && (this.offsetAngle = { x: beta, y: gamma, z: alpha })
			sensorState.angle = { x: beta, y: gamma, z: alpha }
		} else if (orientation === 90) {
			sensorState.updateOffsetAngle && (this.offsetAngle = { x: gamma, y: alpha, z: beta })
			sensorState.angle = { x: gamma, y: alpha, z: beta }
		} else if (orientation === -90 || orientation === 270) {
			sensorState.updateOffsetAngle && (this.offsetAngle = { x: gamma, y: alpha, z: beta })
			sensorState.angle = { x: gamma, y: alpha, z: beta }
		}

		sensorState.angle.x -= this.offsetAngle.x
		sensorState.angle.y -= this.offsetAngle.y
		sensorState.angle.z -= this.offsetAngle.z

		sensorState.updateOffsetAngle = false
		this.prevOrientation = orientation
		// this.debugElement.innerText = sensorState.angle.y.toString()
	}

	private dispose = () => {
		this.canvas.dispose()
		window.removeEventListener('deviceorientation', this.handleDeviceorientation)
	}
}

new App()
