import { sensorState } from './store';
import { TCanvas } from './three/TCanvas';

class App {
	private canvas: TCanvas
	private clickElement: HTMLDivElement
	// private debugElement: HTMLDivElement

	constructor() {
		const parentNode = document.querySelector('body')!
		this.canvas = new TCanvas(parentNode)

		this.clickElement = document.querySelector<HTMLDivElement>('.orientation-permission')!
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
		// const orientation = navigator.userAgent.match(/(iPhone|iPod|iPad)/) ? window.orientation : screen.orientation.angle
		const orientation = screen.orientation ? screen.orientation.angle : window.orientation
		if (orientation === 0) {
			sensorState.angle = { x: e.beta ?? 0, y: e.gamma ?? 0, z: e.alpha ?? 0 }
		} else if (orientation === 90) {
			sensorState.angle = { x: e.gamma ?? 0, y: (e.alpha ?? 0) - 90, z: e.beta ?? 0 }
		} else if (orientation === -90 || orientation === 270) {
			sensorState.angle = { x: e.gamma ?? 0, y: (e.alpha ?? 0) - 264, z: e.beta ?? 0 }
		}
		// this.debugElement.innerText = sensorState.angle.y.toString()
	}

	private dispose = () => {
		this.canvas.dispose()
		window.removeEventListener('deviceorientation', this.handleDeviceorientation)
	}
}

new App()
