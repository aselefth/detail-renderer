<script lang="ts">
	import Scene from '$lib/components/Scene.svelte';
	import { Canvas, type ThrelteContext } from '@threlte/core';
	import { Pane, Slider, Color, Button, Element } from 'svelte-tweakpane-ui';
	import { figurePosition, figureColor } from '$lib/state';
	let canvas: ThrelteContext | undefined;
	let link = '';

	const handleRender = () => {
		if (!canvas) return;
		canvas.renderer.render(canvas.scene, canvas.camera.current);
		canvas.renderer.domElement.toBlob(
			(blob) => {
				console.log(canvas);
				const url = URL.createObjectURL(blob!);
				console.log(url);
				link = url;
			},
			'image/png',
			1.0
		);
	};
</script>

<Canvas bind:ctx={canvas}><Scene /></Canvas>
<Pane title="Настройки сцены" minWidth={400}>
	<Slider
		bind:value={$figurePosition.xAxisValue}
		min={-80}
		max={80}
		format={(v) => v.toFixed()}
		label="Ось Х"
	/>
	<Slider
		bind:value={$figurePosition.yAxisValue}
		min={-80}
		max={80}
		format={(v) => v.toFixed()}
		label="Ось Y"
	/>
	<Slider
		bind:value={$figurePosition.zAxisValue}
		min={-80}
		max={80}
		format={(v) => v.toFixed()}
		label="Ось Z"
	/>
	<Color label="Цвет фигуры" bind:value={$figureColor} />
	<Button title="Запустить рендер" on:click={handleRender}></Button>
	{#if link}
		<Element>
			<a href={link} download="img.png">save</a>
		</Element>
	{/if}
</Pane>
