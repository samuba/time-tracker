<script lang="ts">
    import { allTimes, currentTime } from "./store";
    import { currentUser } from "./userStore";
    import { format, intervalToDuration, isToday } from "date-fns";
    import { onDestroy } from "svelte";
    import type { Time } from "./store";
    import TimeEntry from "./TimeEntry.svelte";
    import Button from "./Button.svelte";

    let since = "";
    let overall = "";

    $: pastTimes = $allTimes.filter((x) => x.end != null);

    const calculateOverall = (times: Time[]) => {
        if (!times.length) return "";
        const accumulatedTimes = times
            .map((x) => Number(x.end || new Date()) - Number(x.start))
            .reduce((p, c, index, arr) => p + c);
        return formatDuration(accumulatedTimes);
    };

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

    const interval = setInterval(() => {
        since = formatDuration(Number(new Date()) - Number($currentTime.start));
        overall = calculateOverall($allTimes);
    }, 1000);
    onDestroy(() => clearInterval(interval));
</script>

<div class="w-full flex justify-between p-4">
    <div class="text-2xl">Time-Tracker</div>
    <Button on:click={currentUser.logout} text="Logout" />
</div>

<div class="flex justify-center pt-8">
    <div class="max-w-md">
        {#if !$currentTime.start}
            <Button text="Start Timer" on:click={currentTime.start} />
        {:else}
            <p>
                Current Time: {since} (since {isToday($currentTime.start)
                    ? "today " + format($currentTime.start, "HH:mm")
                    : format($currentTime.start, "dd.MM.yyyy HH:mm")})
            </p>
            <Button text="Stop Timer" on:click={currentTime.stop} />
        {/if}

        {#if pastTimes.length > 0}
            <div class="mt-10">
                <h2 class="text-lg">All times (overall: {overall})</h2>

                {#each pastTimes as time (time.start)}
                    <TimeEntry {time} />
                {/each}
            </div>
        {/if}
    </div>
</div>
