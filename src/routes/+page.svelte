<script lang="ts">
	import Scene from '$lib/components/Scene.svelte';
	import { Canvas } from '@threlte/core';
	import { Pane, Slider, Color, Button, Element, Checkbox } from 'svelte-tweakpane-ui';
	import { figurePosition, figureColor, figureDetails, renderSettings } from '$lib/state';
	let link = '';
	let sceneRef: Scene;

	const handleRender = () => {
		sceneRef.handleStart();
	};
	const handleStopRender = () => {
		sceneRef.handleStop();
	};
</script>

<Canvas><Scene bind:this={sceneRef} /></Canvas>
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
	{#if Object.keys($figureDetails).length}
		{#each Object.keys($figureDetails) as figureDetail, i (i)}
			<Checkbox label={figureDetail} bind:value={$figureDetails[figureDetail]} />
		{/each}
	{/if}
	<Slider
		bind:value={$renderSettings.frames}
		step={1}
		min={20}
		max={300}
		format={(v) => v.toFixed()}
		label="Кол-во кадров"
	/>
	<Button title="Запустить рендер" on:click={handleRender}></Button>
	<Button title="Остановить рендер" on:click={handleStopRender}></Button>
	{#if link}
		<Element>
			<a href={link} download="img.png">save</a>
		</Element>
	{/if}
</Pane>
