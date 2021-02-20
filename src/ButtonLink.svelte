<script lang="ts">
    export let text: string = ""
</script>

<button class={"underline cursor-pointer focus:outline-none " + $$props.class} on:click>
    {#if text}
        {text}
    {:else}
        <slot>I'm empty inside : (</slot>
    {/if}
</button>
