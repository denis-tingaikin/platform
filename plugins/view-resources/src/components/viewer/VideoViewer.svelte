<script lang='ts'>
  import { onMount, onDestroy } from 'svelte'
  import videojs from 'video.js'
  import 'video.js/dist/video-js.css'
  import 'videojs-hls-quality-selector'
  import { type Blob, type Ref } from '@hcengineering/core'
  import { getFileUrl, getVideoMeta, type BlobMetadata } from '@hcengineering/presentation'
  import { HlsVideo, Video } from '@hcengineering/ui'

  export let value: Ref<Blob>
  export let name: string
  export let metadata: BlobMetadata | undefined
  export let fit: boolean = false

  $: aspectRatio =
    metadata?.originalWidth && metadata?.originalHeight
      ? `${metadata.originalWidth} / ${metadata.originalHeight}`
      : '16 / 9'
  $: maxWidth = metadata?.originalWidth ? `min(${metadata.originalWidth}px, 100%)` : undefined
  $: maxHeight = metadata?.originalHeight ? `min(${metadata.originalHeight}px, 80vh)` : undefined
</script>

<div
  style:aspect-ratio={aspectRatio}
  style:max-width={fit ? '100%' : maxWidth}
  style:max-height={fit ? '100%' : maxHeight}
>
  {#await getVideoMeta(value, name) then meta}
    {@const src = getFileUrl(value, name)}

    {#if meta && meta.status === 'ready'}
      <HlsVideo {src} {name} hlsSrc={meta.hls} hlsThumbnail={meta.thumbnail} />
    {:else}
      <Video {src} {name} />
    {/if}
  {/await}
</div>
