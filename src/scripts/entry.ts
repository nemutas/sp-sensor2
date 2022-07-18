import { sensorState } from './store';
import { TCanvas } from './three/TCanvas';

class App {
	private canvas: TCanvas

	constructor() {
		const parentNode = document.querySelector('body')!
		this.canvas = new TCanvas(parentNode)
		this.addEvents()
	}

	private addEvents = () => {
		window.addEventListener('beforeunload', () => {
			this.dispose()
		})
		this.requestDeviceOrientation()
	}

	private requestDeviceOrientation = () => {
		// https://developer.apple.com/forums/thread/128376
		const doe = DeviceOrientationEvent as any
		if (doe && doe.requestPermission && typeof doe.requestPermission === 'function') {
			// after ios13
			doe
				.requestPermission()
				.then((response: any) => {
					if (response === 'granted') {
						window.addEventListener('deviceorientation', this.handleDeviceorientation)
					}
				})
				.catch(console.error)
		} else {
			// another
			window.addEventListener('deviceorientation', this.handleDeviceorientation)
		}
	}

	private handleDeviceorientation = (e: DeviceOrientationEvent) => {
		const pi2 = Math.PI * 2
		sensorState.angle = { x: (e.beta ?? 0) / pi2, y: (e.gamma ?? 0) / pi2, z: (e.alpha ?? 0) / pi2 }
		// console.log(e.beta, e.gamma, e.alpha)
	}

	private dispose = () => {
		this.canvas.dispose()
		window.removeEventListener('deviceorientation', this.handleDeviceorientation)
	}
}

new App()
