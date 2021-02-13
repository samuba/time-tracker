<script lang="ts">
    export let text: string = ""
</script>

<button class={"border-gray-300 border rounded px-2 py-1 " + $$props.class} on:click>
    {#if text}
        {text}
    {:else}
        <slot>I'm empty inside : (</slot>
    {/if}
</button>
