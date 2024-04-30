<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Gear from './Gear.svelte';
	import { figurePosition, figureRotation, figureDetails, renderSettings } from '$lib/state';
	import { injectLookAtPlugin } from '$lib/plugins/lookAt';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	injectLookAtPlugin();
	$: RENDERS_COUNT = $renderSettings.framePerAxis ** 3;
	$: ROT_DEG = (2 * Math.PI) / $renderSettings.framePerAxis;
	let rendersDone = 0;
	const MIN_DELTA = 0.7;
	let delta = 0;
	let isGridShown = true;
	const { renderer, camera, scene } = useThrelte();

	const { start, stop } = useTask(
		(d) => {
			if (delta < MIN_DELTA) {
				delta += d;
				return;
			}
			$figureRotation.z += ROT_DEG;
			if (rendersDone % $renderSettings.framePerAxis ** 2 === 0) {
				$figureRotation.y += ROT_DEG;
			}
			if (rendersDone % $renderSettings.framePerAxis === 0) {
				$figureRotation.x += ROT_DEG;
			}
			renderer.render(scene, $camera);
			renderer.domElement.toBlob(
				(blob) => {
					if (!blob) return;
					const form = new FormData();
					const fileName = Object.entries($figureDetails)
						.filter(([_, enabled]) => enabled === true)
						.map(([name, _]) => name)
						.join('_');
					const file = new File([blob], `render_${fileName}_${rendersDone}.jpg`);
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

	$: if (rendersDone >= RENDERS_COUNT) {
		stop();
		rendersDone = 0;
		isGridShown = true;
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

<T.AmbientLight color={'white'} intensity={1} />
<T.DirectionalLight color={'white'} intensity={1} position.y={2} />

<Gear
	position={[$figurePosition.xAxisValue, $figurePosition.yAxisValue, $figurePosition.zAxisValue]}
	rotation.y={$figureRotation.y}
	rotation.z={$figureRotation.z}
	rotation.x={$figureRotation.x}
/>
