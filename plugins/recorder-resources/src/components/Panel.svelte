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
  import { writable } from 'svelte/store';
  import Record from './icons/Record.svelte';
  import Play from './icons/Play.svelte';
  import Stop from './icons/Stop.svelte';
  import Trash from './icons/Trash.svelte';
  import Pause from './icons/Pause.svelte';
  import Expand from './icons/Expand.svelte';
  import Collapse from './icons/Collapse.svelte';
  import { ScreenRecorder } from '@hcengineering/recorder'
  import { createEventDispatcher, onMount } from 'svelte';
  import { showPopup } from '@hcengineering/ui'
  import Countdown from './Countdown.svelte'
  import { getMetadata } from '@hcengineering/platform'
  import presentation from '@hcengineering/presentation'
  import plugin from '../plugin'

  let state = writable<"idle" | "recording" | "paused" | "playing">("idle")
  let expanded = writable(true)
  let started = false
  let time = writable("0:00")
  let timer: NodeJS.Timeout | null = null
  let recorder: ScreenRecorder | null = null
  let seconds = 0;
  let res: String = 'zalupa'

  const distpacher = createEventDispatcher()

  function formatTime(s: number): string {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onMount(async ()=>{
    recorder = await ScreenRecorder.fromNavigatorMediaDevices({
      endpoint:'http://127.0.0.1:1080/recording',
      token: getMetadata(presentation.metadata.Token) ?? '',
      workspace: getMetadata(presentation.metadata.WorkspaceId) ?? '',
      metadata: { resolution: window.screen.width + ':' + window.screen.height },
      onFinish: async (x)=>{ res=x },
      fps: 30
    })
  })

  async function startTimer() {
    showPopup(Countdown, {}, undefined, async () => {
      if (started) {
        return
      }
      started = true
      recorder?.start()
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        seconds++;
        time.set(formatTime(seconds));
      }, 1000);
    }, undefined, {
    category: 'countdown',
    overlay: true,
    fixed: true
  })
}

  function startRecording() {
    state.set("recording");
    seconds = 0;
    time.set("0:00");
    startTimer();
  }

  function pauseRecording() {
    state.set("paused");
    if (timer) clearInterval(timer);
  }

  function resumeRecording() {
    state.set("recording");
    startTimer();
  }

  async function stopRecording() {
    state.set("playing");
    if (timer) clearInterval(timer);
    await recorder?.stop()
    distpacher('close', res)
  }

  function cancelRecording() {
    distpacher('close', true)
  }

  function deleteRecording() {
    state.set("idle");
    if (timer) clearInterval(timer);
    time.set("0:00");
    started = false
  }

  function toggleExpand() {
    expanded.update(e => !e);
  }
</script>

{#if $state === "idle"}
  <div class="recording">
    <span class="btn play" on:click={startRecording}>
      <Record size='small'/> Record
    </span>
    <span class="btn" on:click={cancelRecording}>
      Cancel
    </span>
  </div>
{/if}

{#if $state === "recording" || $state === "paused"}
  <div class="recording {(!$expanded) ? 'collapsed' : ''}">
    {#if $expanded}
      <span class="btn red stop-btn" on:click={stopRecording}>
        <Stop size='medium' />
      </span>

      {#if $state === "recording"}
        <span class="btn" on:click={pauseRecording}>
          <Pause size='medium' />
        </span>
      {:else}
        <span class="btn play" on:click={resumeRecording}>
          <Play size='medium' />
        </span>
      {/if}

      <span class="btn" on:click={deleteRecording}>
        <Trash size='medium' />
      </span>
    {/if}

    <span class="timer">{$time}</span>

    <span class="btn expand-toggle" on:click={toggleExpand}>
      {#if $expanded} <Collapse size='small' /> {:else} <Expand size='small' /> {/if}
    </span>
  </div>
{/if}

<style lang="scss">
  .record-container {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    justify-content: center;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .recording {
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

  .collapsed {
    max-width: 110px;
  }

  .control {
    background: var(--theme-recorder-panel-bg);
    border: none;
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    padding: 5px;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .expand-toggle {
    margin-left: auto;
    padding-left: 0.5rem;
  }

  .red {
    color: red;
  }

  .play {
    background-color: var(--primary-button-default);
    color: white;
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
