<script lang="ts">
    import { format, intervalToDuration } from "date-fns";
    import { deleteTime, updateTime } from "./store";
    import type { Time } from "./store";
    import Button from "./Button.svelte";
    import DateTime from "./DateTime.svelte";
    import ButtonLink from "./ButtonLink.svelte";

    export let time: Time;

    let editMode = false;
    let start = time.start;
    let end = time.end;
    const startId = `start-${time.id}`;
    const endId = `end-${time.id}`;

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

    const save = (start: Date, end: Date) => {
        updateTime(time.id, { start, end });
        editMode = false;
    };
</script>

<div class="mt-2">
    {#if editMode}
        <div>
            <label for={startId} class="inline-block" style="width: 2.5rem;">
                Start:
            </label>
            <DateTime bind:value={start} id={startId} />
            <br />
            <label for={endId} class="inline-block" style="width: 2.5rem;">
                End:
            </label>
            <DateTime bind:value={end} id={endId} />
            <Button text="OK" on:click={() => save(start, end)} />
        </div>
    {:else}
        <div>
            <span class="font-mono text-sm mr-4">{formatPastTime(time)}</span>
            <div class="inline-block">
                <ButtonLink
                    text="delete"
                    on:click={() => deleteTime(time.id)}
                    class="mr-2"
                />
                <ButtonLink text="edit" on:click={() => (editMode = true)} />
            </div>
        </div>
    {/if}
</div>
