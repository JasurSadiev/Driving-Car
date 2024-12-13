import { useEffect } from "react";
import { useState } from "react";
import { Vector3 } from "three";

const useControls = (vehicleApi, chassisApi) => {
	// State to keep track of currently pressed keys
	let [controls, setControls] = useState({});

	// Event listeners for handling key presses
	useEffect(() => {
		// Set the corresponding key to true when pressed
		const handleKeyDown = (event) => {
			setControls((controls) => ({ ...controls, [event.code]: true }));
		};
		// Set the corresponding key to false when released
		const handleKeyUp = (event) => {
			setControls((controls) => ({ ...controls, [event.code]: false }));
		};

		// Add keydown and keyup event listeners to the window
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		// Cleanup event listeners when the component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	// Main logic for controlling the vehicle
	useEffect(() => {
		// Exit early if the APIs are not provided
		if (!vehicleApi || !chassisApi) return;

		// Determine the engine force (higher when ShiftLeft is pressed for a speed boost)
		const engineForce = controls.ShiftLeft ? 800 : 250;
		// Steering sensitivity for front and back wheels
		const frontSteering = 0.5;
		const backSteering = 0.1;

		// Move forward (KeyW) or backward (KeyS)
		if (controls.KeyW) {
			// Apply negative engine force to move forward
			vehicleApi.applyEngineForce(-engineForce, 2);
			vehicleApi.applyEngineForce(-engineForce, 3);
		} else if (controls.KeyS) {
			// Apply positive engine force to move backward
			vehicleApi.applyEngineForce(engineForce, 2);
			vehicleApi.applyEngineForce(engineForce, 3);
		} else {
			// Stop applying engine force when no movement keys are pressed
			vehicleApi.applyEngineForce(0, 2);
			vehicleApi.applyEngineForce(0, 3);
		}

		// Apply brakes when the Space key is pressed
		if (controls.Space) {
			vehicleApi.setBrake(5, 0);
			vehicleApi.setBrake(5, 1);
			vehicleApi.setBrake(5, 2);
			vehicleApi.setBrake(5, 3);
		} else {
			// Release brakes
			for (let i = 0; i < 4; i++) {
				vehicleApi.setBrake(0, i);
			}
		}

		// Steering logic: turn left (KeyA) or right (KeyD)
		if (controls.KeyA) {
			// Set steering values for left turn
			vehicleApi.setSteeringValue(frontSteering, 0);
			vehicleApi.setSteeringValue(frontSteering, 1);
			vehicleApi.setSteeringValue(-backSteering, 2);
			vehicleApi.setSteeringValue(-backSteering, 3);
		} else if (controls.KeyD) {
			// Set steering values for right turn
			vehicleApi.setSteeringValue(-frontSteering, 0);
			vehicleApi.setSteeringValue(-frontSteering, 1);
			vehicleApi.setSteeringValue(backSteering, 2);
			vehicleApi.setSteeringValue(backSteering, 3);
		} else {
			// Reset steering to default (no turn)
			for (let i = 0; i < 4; i++) {
				vehicleApi.setSteeringValue(0, i);
			}
		}

		// Reset the vehicle's position and orientation when the R key is pressed
		if (controls.KeyR) {
			// Reset position, velocity, and rotation
			chassisApi.position.set(-10, 1, -3);
			chassisApi.velocity.set(0, 0, 0);
			chassisApi.angularVelocity.set(0, 0, 0);
			chassisApi.rotation.set(0, Math.PI / 2, 0);
		}

		// Apply local impulses for additional movement effects (using arrow keys)
		if (controls.ArrowRight) {
			// Impulse applied to the right side of the chassis
			chassisApi.applyLocalImpulse([-0.6, -6, 0], [-0.6, 0, 0]);
		}
		if (controls.ArrowDown) {
			// Impulse applied downward and backward
			chassisApi.applyLocalImpulse([0, -6, -1.4], [0, 0, -1.4]);
		}
		if (controls.ArrowLeft) {
			// Impulse applied to the left side of the chassis
			chassisApi.applyLocalImpulse([0.6, -6, 0], [0.6, 0, 0]);
		}
		if (controls.ArrowUp) {
			// Impulse applied forward
			chassisApi.applyLocalImpulse([0, -6, 1.4], [0, 0, 1.4]);
		}
	}, [controls, vehicleApi, chassisApi]); // Dependencies for the effect
};

export default useControls;
