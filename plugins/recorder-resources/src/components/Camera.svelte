<!--
// Copyright © 2025 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->

<script lang="ts">
  import { onDestroy } from 'svelte'
  import  Camera from './icons/Camera.svelte'
  import Close from './icons/Close.svelte'

  let showButtons = false
  let showCamera = false

  let videoElement
  let stream

  const stopCamera = () => {
    if (stream === undefined) {
      return
    }
    stream.getTracks().forEach(track => track.stop())
    videoElement.srcObject = null
    stream = undefined
    showCamera = false
  }

  const startCamera = async () => {
    stopCamera()
    showCamera = true
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoElement.srcObject = stream
    } catch (err) {
      console.log(err)
    }
  }

  onDestroy(async () => {
    stopCamera()
  })
</script>

<div class="movable"
  on:mouseenter={() => showButtons = true} 
  on:mouseleave={() => showButtons = false}>
  {#if showCamera}
    <video class="video video-container" bind:this={videoElement} autoplay muted playsinline>
    </video>
    {#if showButtons}
      <div class="camera-btn" on:click={()=>{ stopCamera() }}>
        <Close size="full"/>
      </div>
    {/if}
  {:else}
    <div class="control">
      <span class="btn" on:click={ ()=>{ startCamera() }}>
        <Camera size='small'/>
      </span>
    </div>
  {/if}

</div>

<style lang="scss">
  .video-container {
    width: 350px;
    height: 350px;
  }
  .video {
    border-radius: 50%;
    object-fit: cover;
  }
  .control {
    min-height: 2.7rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--theme-recorder-panel-bg);
    padding: 0.25rem;
    border-radius: 0.5rem;
    transition: max-width 0.4s ease-in-out, padding 0.3s ease-in-out;
    overflow: hidden;
    border: 0.5px solid var(--button-border-color);
  }
  .camera-btn {
    position: absolute;
    transform: translateY(-350px);
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    justify-content: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .btn {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    justify-content: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: var(--theme-recorder-active-button);
  }
</style>
