<script lang="ts">
    import { format, intervalToDuration } from "date-fns";
    import { deleteTime, updateTime } from "./store";
    import type { Time } from "./store";
    import flatpickr from "flatpickr";
    import "flatpickr/dist/flatpickr.css";
    import type { BaseOptions } from "flatpickr/dist/types/options";
    import { tick } from "svelte";
    import Button from "./Button.svelte";

    export let time: Time;

    let editMode = false;
    let start = String(time.start);
    let end = String(time.end);

    $: if (editMode) tick().then(() => initPickers());

    const initPickers = () => {
        const options = {
            enableTime: true,
            time_24hr: true,
            altInput: true,
            altFormat: "H:i d.m.Y",
            dateFormat: "Z",
        } as BaseOptions;
        flatpickr("#start-" + time.id, options);
        flatpickr("#end-" + time.id, options);
    };

    function formatPastTime(time: Time) {
        if (!time.start) return;
        if (!time.end) return "no end";
        const duration = Number(time.end) - Number(time.start);
        const timeFormat = (date: Date) => format(date, "HH:mm");
        return `${timeFormat(time.start)} - ${
            time.end && timeFormat(time.end)
        }  (${formatDuration(duration)})`;
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

    const save = async (start: string, end: string) => {
        editMode = false;
        await updateTime(time.id, {
            start: new Date(start),
            end: new Date(end),
        });
    };
</script>

<div class="mt-2">
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
        <Button text="Save" on:click={() => save(start, end)} />
    {:else}
        <div>
            <span class="font-mono text-sm mr-4">{formatPastTime(time)}</span>
            <div class="inline-block">
                <button
                    on:click={() => deleteTime(time.id)}
                    class="mr-2 underline cursor-pointer">delete</button
                >
                <button
                    on:click={() => (editMode = true)}
                    class="underline cursor-pointer">edit</button
                >
            </div>
        </div>
    {/if}
</div>
