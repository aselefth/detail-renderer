<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Gear from './Gear.svelte';
	import { figurePosition } from '$lib/state';
	import { injectLookAtPlugin } from '$lib/plugins/lookAt';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import type { PerspectiveCamera } from 'three';
	injectLookAtPlugin();

	let persperctiveCamera: PerspectiveCamera | undefined;

	// $: if (persperctiveCamera)
	// 	persperctiveCamera.lookAt(
	// 		$figurePosition.xAxisValue,
	// 		$figurePosition.yAxisValue,
	// 		$figurePosition.zAxisValue
	// 	);
</script>

<T.PerspectiveCamera
	bind:ref={persperctiveCamera}
	position={[0, 5, 10]}
	makeDefault
	lookAt={[5, 2, 0]}
	on:create={({ ref }) => {
		ref.lookAt(0, 2, 0);
	}}
>
	<OrbitControls maxPolarAngle={DEG2RAD * 360} />
</T.PerspectiveCamera>

<T.AxesHelper />

<T.AmbientLight color={'white'} intensity={1} />
<T.DirectionalLight color={'white'} intensity={1} position.y={2} />
<T.GridHelper args={[15, 15]} />

<Gear
	position={[$figurePosition.xAxisValue, $figurePosition.yAxisValue, $figurePosition.zAxisValue]}
/>
