<script lang="ts">
    export let text: string = ""
</script>

<button class={"border-yellow-400 bg-yellow-300 text-yellow-900  border rounded px-2 py-1 " + $$props.class} on:click>
    {#if text}
        {text}
    {:else}
        <slot>I'm empty inside : (</slot>
    {/if}
</button>
