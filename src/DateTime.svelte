<script lang="ts">
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.css";
    import { onMount } from "svelte";

    export let value = new Date();

    let innerValue = String(value);
    let element = undefined;

    $: value = new Date(innerValue);

    onMount(() => {
        flatpickr(element, {
            enableTime: true,
            time_24hr: true,
            altInput: true,
            altFormat: "H:i d.m.Y",
            dateFormat: "Z",
            minuteIncrement: 1
        });
    });
</script>

<input
    bind:value={innerValue}
    bind:this={element}
    class={"border p-2 m-2 bg-yellow-50 border-yellow-300 rounded " + $$props.class}
    id={$$props.id}
/>