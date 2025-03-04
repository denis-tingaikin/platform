<!--
// Copyright © 2025 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License")
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
  import { writable } from 'svelte/store'
  import Record from './icons/Record.svelte'
  import Play from './icons/Play.svelte'
  import Stop from './icons/Stop.svelte'
  import Trash from './icons/Trash.svelte'
  import Pause from './icons/Pause.svelte'
  import Expand from './icons/Expand.svelte'
  import Collapse from './icons/Collapse.svelte'
  import { ScreenRecorder } from '@hcengineering/recorder'
  import { createEventDispatcher } from 'svelte'
  import { showPopup } from '@hcengineering/ui'
  import Countdown from './Countdown.svelte'
  import { getMetadata } from '@hcengineering/platform'
  import presentation from '@hcengineering/presentation'
  import plugin from '../plugin'

  let state = writable<"recording" | "paused" | "playing" | "idle" >("idle")
  let expanded = writable(true)
  let time = writable('0:00')
  let timer: NodeJS.Timeout | null = null
  let recorder: ScreenRecorder | null = null
  let seconds = 0
  let recordingId: string | null = null

  const distpacher = createEventDispatcher()

  function formatTime(s: number): string {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  async function createScreenRecorder(): Promise<void> {
    try {
      recorder = await ScreenRecorder.fromNavigatorMediaDevices({
        endpoint: getMetadata(plugin.metadata.StreamUrl) ?? '',
        token: getMetadata(presentation.metadata.Token) ?? '',
        workspace: getMetadata(presentation.metadata.WorkspaceId) ?? '',
        onFinish: async (x) => { recordingId = x + "_master.m3u8" },
        fps: 30
      })
    } catch (err) {
      console.log(err)
      distpacher('close', true)
    }
  }

  async function showCountdown(): Promise<void> {
    const showPopupPromise = new Promise<void>((resolve) => {
      showPopup(Countdown, {}, undefined, async () => {
        resolve()
      }, undefined, {
        category: 'countdown',
        overlay: true,
        fixed: true
      })
    })
    await showPopupPromise
  }

async function startRecording(): Promise<void> {
    if ($state === 'recording') {
      return
    }
    if ($state === 'idle') {
      await createScreenRecorder()
      await showCountdown()
      recorder?.start()
    } else {
      recorder?.resume()
    }
    timer = setInterval(() => {
      seconds++
      time.set(formatTime(seconds))
    }, 1000)
    $state = 'recording'
    console.log($state)
  }

  function pauseRecording(): void {
    state.set("paused")
    clearInterval(timer)
    recorder?.pause()
  }

  async function stopRecording(): Promise<void> {
    state.set("paused")
    clearInterval(timer)
    await recorder?.stop()
    distpacher('close', recordingId)
  }

  async function cancelRecording(): Promise<void> {
    await recorder?.cancel()
    distpacher('close', true)
  }

  async function deleteRecording(): Promise<void> {
    state.set("idle")
    await recorder?.cancel()
    clearInterval(timer)
    time.set("0:00")
    seconds=0
  }

  function toggleExpand(): void {
    expanded.update(e => !e)
  }
</script>

{#if $state === 'idle'}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="control-panel">
    <span class="control-button play" on:click={startRecording}>
      <Record size='medium'/> Record
    </span>
    <span class="control-button" on:click={cancelRecording}>
      Cancel
    </span>
  </div>
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="control-panel {(!$expanded) ? 'collapsed' : ''}">
    {#if $expanded}
      <span class="control-button {$state === 'recording' ? 'stop' : ''}" on:click={stopRecording}>
        <Stop size='small' />
      </span>

      {#if $state === "recording"}
        <span class="control-button" on:click={pauseRecording}>
          <Pause size='medium' />
        </span>
      {:else}
      <span class="control-button play" on:click={startRecording}>
        <Play size='small' />
      </span>
      {/if}
    {/if}

    <span class="timer">{$time}</span>
    {#if $expanded}
      <span class="control-button" on:click={deleteRecording}>
        <Trash size='medium' />
      </span>
    {/if}

    <span class="control-button expand-toggle" on:click={toggleExpand}>
      {#if $expanded} <Collapse size='small' /> {:else} <Expand size='small' /> {/if}
    </span>
  </div>
{/if}


<style lang="scss">
  .record-container {
    display: flex;
    gap: 0.5rem;
  }

  .control-button {
    padding: 0.5rem 0.5rem;
    border-left: 0.5px solid var(--button-border-color);
    color: var(--theme-text-primary-color);
    cursor: pointer;
    justify-content: center;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .control-panel {
    min-height: 2.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--theme-recorder-panel-bg);
    padding: 0.25rem;
    border-radius: 0.5rem;
    transition: max-width 0.4s ease-in-out, padding 0.3s ease-in-out;
    overflow: hidden;
    border: 0.5px solid var(--button-border-color);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .collapsed {
    max-width: 7.5rem;
  }

  .control {
    background: var(--theme-recorder-panel-bg);
    border: none;
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    padding: 5px;
  }

  .expand-toggle {
    margin-left: auto;
    padding-left: 0.5rem;
  }

  .stop {
    border-radius: 0.5rem;
    background-color: red;
    color: #ffffffff;
  }

  .play {
    border-radius: 0.5rem;
    background-color: var(--primary-button-default);
    color: #ffffffff;
  }

  .timer {
    min-width: 0.4rem;
    text-align: center;
  }

  .recording.collapsed .control:not(.expand-toggle) {
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
  }
</style>

