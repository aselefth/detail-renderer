<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Gear from './Gear.svelte';
	import { figurePosition, figureRotation, figureDetails, renderSettings } from '$lib/state';
	import { injectLookAtPlugin } from '$lib/plugins/lookAt';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { Color } from 'three';
	injectLookAtPlugin();
	let rendersDone = 0;
	const MIN_DELTA = 0.75;
	let delta = 0;
	let isGridShown = true;
	const { renderer, camera, scene } = useThrelte();
	let lightXPos = Math.random();
	let lightYPos = Math.random();
	let lightZPos = Math.random();

	scene.background = new Color('rgb(4, 4, 4)');

	const { start, stop, task } = useTask(
		(d) => {
			if (delta < MIN_DELTA) {
				delta += d;
				return;
			}
			const form = new FormData();
			if (rendersDone >= $renderSettings.frames / 3) {
				form.append('trainOnly', 'true');
			}
			$figureRotation.x = Math.random() * 2 * Math.PI;
			$figureRotation.z = Math.random() * 2 * Math.PI;
			$figureRotation.y = Math.random() * 2 * Math.PI;
			lightXPos = Math.random();
			lightYPos = Math.random();
			lightZPos = Math.random();
			renderer.render(scene, $camera);
			renderer.domElement.toBlob(
				(blob) => {
					if (!blob) return;
					const fileName = Object.entries($figureDetails)
						.filter(([_, enabled]) => enabled === true)
						.map(([name, _]) => name)
						.join('_');
					const file = new File([blob], `${fileName}~${rendersDone}.jpg`);
					form.append('file', file);
					fetch('/api/upload', { method: 'POST', body: form });
				},
				'image/jpeg',
				1
			);
			rendersDone += 1;
			delta = 0;
		},
		{ autoStart: false }
	);

	export function handleStart() {
		start();
		isGridShown = false;
	}

	export function handleStop() {
		stop();
		isGridShown = true;
		rendersDone = 0;
		delta = 0;
	}

	$: if (rendersDone >= $renderSettings.frames) {
		handleStop();
	}
</script>

<T.PerspectiveCamera
	position={[0, 5, 10]}
	makeDefault
	lookAt={[5, 2, 0]}
	on:create={({ ref }) => {
		ref.lookAt(0, 2, 0);
	}}
>
	<OrbitControls maxPolarAngle={DEG2RAD * 360} />
</T.PerspectiveCamera>

{#if isGridShown}
	<T.AxesHelper />
	<T.GridHelper args={[15, 15]} />
{/if}

<T.AmbientLight color={'white'} intensity={0.2} />
<T.DirectionalLight
	color={'white'}
	intensity={2}
	position.y={14 * lightYPos}
	position.x={4 * lightXPos}
	position.z={4 * lightZPos}
	castShadow
/>
<T.DirectionalLight
	color={'white'}
	intensity={2}
	position.y={14 * lightYPos}
	position.x={-4 * lightXPos}
	position.z={4 * lightZPos}
	castShadow
/>
<T.DirectionalLight
	color={'white'}
	intensity={2 * lightXPos}
	position.y={14 * lightYPos}
	position.x={-4 * lightXPos}
	position.z={-4 * lightZPos}
	castShadow
/>

<Gear
	position={[$figurePosition.xAxisValue, $figurePosition.yAxisValue, $figurePosition.zAxisValue]}
	rotation.y={$figureRotation.y}
	rotation.z={$figureRotation.z}
	rotation.x={$figureRotation.x}
/>
