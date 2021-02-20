<script lang="ts">
    import { allTimes, currentTime } from "./store";
    import { currentUser } from "./userStore";
    import { format, intervalToDuration, isToday } from "date-fns";
    import { onDestroy } from "svelte";
    import type { Time } from "./store";
    import TimeEntry from "./TimeEntry.svelte";
    import Button from "./Button.svelte";
    import DateTime from "./DateTime.svelte";
    import ButtonLink from "./ButtonLink.svelte";

    let since = "00:00:00";
    let alternativeStartTime = undefined;

    $: pastTimes = $allTimes.filter((x) => x.end != null);
    $: days = getDays(pastTimes);
    $: overall = calculateOverall($allTimes);

    const formatDay = (date: Date) => {
        return isToday(date) ? "Today" : format(date, "dd.MM.yyyy");
    };

    const getDays = (times) => {
        const days: Day[] = [];
        times.forEach((time) => {
            const day = days.filter(
                (x) => x.text === formatDay(time.start)
            )?.[0];
            const overallMs = Number(time.end) - Number(time.start);
            if (day) {
                day.times.push(time);
                day.overallMs += overallMs;
                day.overall = formatDuration(day.overallMs);
            } else {
                days.push({
                    text: formatDay(time.start),
                    times: [time],
                    overallMs,
                    overall: formatDuration(overallMs),
                });
            }
        });
        return days;
    };

    const calculateOverall = (times: Time[]) => {
        if (!times.length) return "";
        const accumulatedTimes = times
            .map((x) => Number(x.end || new Date()) - Number(x.start))
            .reduce((p, c) => p + c);
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
        if (!$currentTime.start) {
            since = "00:00:00";
            return;
        }
        since = formatDuration(Number(new Date()) - Number($currentTime.start));
        overall = calculateOverall($allTimes);
    }, 1000);
    onDestroy(() => clearInterval(interval));

    type Day = {
        text: string;
        overall: string;
        overallMs: number;
        times: Time[];
    };

    type Week = {
        text: String;
        days: Day[];
    };

    type Month = {
        text: String;
        weeks: Week[];
    };
</script>

<div class="w-full flex justify-between p-4">
    <div class="text-2xl">Trackerle</div>
    <Button on:click={currentUser.logout} text="Logout" />
</div>

<div class="flex justify-center pt-4 pb-4">
    <div class="max-w-md">
        <div class="flex flex-wrap justify-center  flex-col">
            <div class="mb-4 font-mono text-center text-5xl">{since}</div>
            {#if !$currentTime.start}
                <Button
                    text="Start Timer"
                    on:click={() => currentTime.start(alternativeStartTime)}
                    class="text-3xl py-4"
                />
                <div class="mt-4 text-center">
                    {#if alternativeStartTime}
                        <label for="past-time-start-input" class="mr-2"
                            >Start Time:</label
                        >
                        <DateTime
                            bind:value={alternativeStartTime}
                            id="past-time-start-input"
                        />
                    {:else}
                        <ButtonLink
                            text="Start from the past"
                            on:click={() => (alternativeStartTime = new Date())}
                        />
                    {/if}
                </div>
            {:else}
                <Button
                    text="Stop Timer"
                    on:click={() => {
                        currentTime.stop();
                        alternativeStartTime = undefined;
                    }}
                    class="text-3xl py-4"
                />
            {/if}
        </div>

        {#if pastTimes.length > 0}
            <div class="mt-10">
                <h2 class="text-xl">
                    Overall: <span class="font-mono">{overall}</span>
                </h2>

                {#each days as day}
                    <div class="bg-gray-50 border mt-4 p-4">
                        <div class="text-lg flex justify-between font-mono">
                            <span class="font-semibold">{day.text}</span>
                            {day.overall}
                        </div>
                        <div>
                            {#each day.times as time (time.start)}
                                <TimeEntry {time} />
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
