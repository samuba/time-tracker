<script lang="ts">
    import { format, intervalToDuration } from "date-fns";
    import { deleteTime, updateTime } from "./store";
    import type { Time } from "./store";
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.css";
    import { tick } from "svelte";
    import type { Instance } from "flatpickr/dist/types/instance";
    import type { BaseOptions } from "flatpickr/dist/types/options";

    export let time: Time;

    let editMode = false;
    let start = new Date(time.start.getTime());
    let end = new Date(time.end.getTime());

    $: if (editMode) tick().then(() => initPickers());

    const initPickers = () => {
        const options = {
            enableTime: true,
            time_24hr: true,
            altInput: true,
            altFormat: "H:i d.m.Y",
            dateFormat: "Z",
        } as BaseOptions;
        const startPicker = flatpickr("#start-" + time.id, options);
        const endPicker = flatpickr("#end-" + time.id, options);
        startPicker.setDate(time.start);
        endPicker.setDate(time.end);
    };

    function formatPastTime(time: Time) {
        if (!time.start) return;
        if (!time.end) return "no end";
        const duration = Number(time.end) - Number(time.start);
        const timeFormat = (date: Date) => format(date, "HH:mm dd.MM.yyyy");
        return `${formatDuration(duration)} (${timeFormat(time.start)} - ${
            time.end && timeFormat(time.end)
        })`;
    }

    const formatDuration = (milliseconds) => {
        const normalize = (time) => (time < 10 ? `0${time}` : time);
        let { seconds, minutes, hours, days, months } = intervalToDuration({
            start: 0,
            end: milliseconds,
        });
        days += months ? Math.round(months * 30) : 0;
        hours += days ? Math.round(days * 24) : 0;
        return `${normalize(hours)}:${normalize(minutes)}:${normalize(
            seconds
        )}`;
    };

    const save = async (start: Date, end: Date) => {
        editMode = false;
        await updateTime(time.id, { start, end });
    };
</script>

<div class="bg-gray-100 p-2 px-4 mb-4">
    {#if editMode}
        <div>
            <label for={"start-" + time.id}>Start</label>
            <input
                bind:value={start}
                class="border p-2 m-2"
                id={"start-" + time.id}
            /><br />
            <label for={"end-" + time.id}>End</label>
            <input
                bind:value={end}
                class="border p-2 m-2"
                id={"end-" + time.id}
            />
        </div>
        <button
            on:click={() => save(new Date(start), new Date(end))}
            class="border-gray-300 border rounded p-2"
        >
            Save
        </button>
    {:else}
        <div>{formatPastTime(time)}</div>
        <button
            class="border-gray-300 border rounded p-2"
            on:click={() => deleteTime(time.id)}
        >
            delete
        </button>
        <button
            on:click={() => (editMode = true)}
            class="border-gray-300 border rounded p-2"
        >
            edit
        </button>
    {/if}
</div>
