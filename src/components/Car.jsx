import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import useWheels from "../hooks/useWheels";
import useControls from "../hooks/useControls";
import { Quaternion, Vector3 } from "three";

// Function to load the car model
const loadCar = () => {
	// Load the GLTF model and clone the scene to avoid sharing state between instances
	const result = useLoader(GLTFLoader, "models/car.glb").scene.clone();
	console.log(result); // Logs the structure of the loaded model for debugging

	// Return individual components of the car (body and wheels) by accessing model children
	return {
		CarBody: result.children[0],
		WheelRF: result.children[1], // Right front wheel
		WheelLF: result.children[2], // Left front wheel
		WheelLB: result.children[3], // Left back wheel
		WheelRB: result.children[4], // Right back wheel
	};
};

const Car = ({ cameraView }) => {
	// Load the car model parts using useMemo to ensure it's only loaded once
	const { CarBody, WheelRF, WheelLF, WheelLB, WheelRB } = useMemo(
		() => loadCar(),
		[]
	);

	// Initial position and rotation of the car
	const position = [-10, 3, -3];
	const rotation = [0, Math.PI / 2, 0];

	// Dimensions of the chassis body (box)
	const width = 1.2;
	const height = 0.7;
	const length = 2.8;
	const wheelRadius = 0.2; // Radius of the wheels

	// Physics arguments for the chassis body
	const chassisBodyArgs = [width, height, length];

	// Create the chassis body using useBox (React-Three-Cannon hook)
	const [chassisBody, chassisApi] = useBox(
		() => ({
			allowSleep: false, // Keeps the body active even when not moving
			args: chassisBodyArgs,
			mass: 150, // Weight of the car
			rotation,
			position,
		}),
		useRef(null)
	);

	// Create the wheels and their configuration using a custom hook
	const [wheels, wheelInfos] = useWheels(width, height, length, wheelRadius);

	// Create the raycast vehicle, linking the chassis and wheels
	const [vehicle, vehicleApi] = useRaycastVehicle(
		() => ({
			chassisBody, // Chassis body reference
			wheelInfos, // Wheel configurations
			wheels, // Wheel references
		}),
		useRef(null)
	);

	// Handle controls for the vehicle using a custom hook
	useControls(vehicleApi, chassisApi);

	// Update the camera position and orientation in each frame based on cameraView
	useFrame((state) => {
		if (cameraView == 0) return; // Skip updates if no specific camera view is selected

		// Get the current position and rotation of the chassis body
		let position = new Vector3(0, 0, 0);
		position.setFromMatrixPosition(chassisBody.current.matrixWorld);

		let quaternion = new Quaternion(0, 0, 0, 0);
		quaternion.setFromRotationMatrix(chassisBody.current.matrixWorld);

		// Forward vector for camera targeting
		const forwardVector = new Vector3(0, 0.45, 0.5);
		forwardVector.applyQuaternion(quaternion);

		// Default camera offsets and target
		let delta = new Vector3(0, 0.5, 0);
		let target = position;

		// Adjust camera offset based on cameraView
		if (cameraView == 1) delta = new Vector3(0, 2, -5); // Third-person view
		if (cameraView == 2) delta = new Vector3(0, 2, 5); // Front view
		if (cameraView == 3) target = position.clone().add(forwardVector); // Driver's view

		// Apply rotation to the camera offset
		delta.applyQuaternion(quaternion);

		// Compute final camera position and update
		let cameraPosition = position.clone().add(delta.clone());
		state.camera.position.copy(cameraPosition);
		state.camera.lookAt(target); // Ensure the camera points at the target
	});

	return (
		<group ref={vehicle} name='vehicle'>
			{/* Chassis body */}
			<group ref={chassisBody} name='chassisBody'>
				<primitive
					object={CarBody}
					rotation-y={-Math.PI / 2} // Adjust rotation for proper alignment
					position={[0, -0.15, 0]} // Slight offset to match physics body
				/>
			</group>

			{/* Wheels */}
			<group ref={wheels[0]} name='WheelRF'>
				<primitive
					object={WheelRF}
					rotation-y={-Math.PI / 2}
					position={[0, 0, 0]}
				/>
			</group>
			<group ref={wheels[1]} name='WheelLF'>
				<primitive
					object={WheelLF}
					rotation-y={-Math.PI / 2}
					position={[0, 0, 0]}
				/>
			</group>
			<group ref={wheels[2]} name='WheelRB'>
				<primitive
					object={WheelRB}
					rotation-y={-Math.PI / 2}
					position={[0, 0, 0]}
				/>
			</group>
			<group ref={wheels[3]} name='WheelLB'>
				<primitive
					object={WheelLB}
					rotation-y={-Math.PI / 2}
					position={[0, 0, 0]}
				/>
			</group>
		</group>
	);
};

export default Car;
