<!--
// Copyright © 2020 Anticrm Platform Contributors.
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
<script lang='ts'>
  import { CORE_CLASS_SPACE, Space, SpaceUser } from '@anticrm/domains'
  import { createEventDispatcher } from 'svelte'
  import { getPresentationService, _getCoreService, getCoreService, getUIService } from '../../../utils'
  import { getSpaceName, getCurrentUserSpace } from './utils'
  import { onDestroy } from 'svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { Doc, Property, Ref, StringProperty } from '@anticrm/core'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  import { leaveSpace, joinSpace, archivedSpaceUpdate } from './utils'

  import CreateSpace from './CreateSpace.svelte'

  const dispatch = createEventDispatcher()

  const uiService = getUIService()

  let spaces: Space[ ] = []
  let filter: string
  let hoverSpace: Ref<Doc>

  const coreService = _getCoreService()
  const presentationService = getPresentationService()

  const curentUser = coreService.getUserId()
  coreService.subscribe(CORE_CLASS_SPACE, {}, (docs) => {
    spaces = docs
  }, onDestroy)


</script>

<div class="space-browse-view">
  <div class="header">
    <div class="caption-1">Навигатор пространств</div>
    <a href="/" on:click|preventDefault={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button="true" />
    </a>
  </div>

  <div class="content">
    <div>
      <Button kind="transparent"
              on:click={ () => {
          uiService.showModal(CreateSpace, {})
        } }
      >
        <Icon icon={workbench.icon.Add} button="true" />
        <span style="padding-left:.5em">Новое пространство</span>
      </Button>
    </div>
    <div class="separator"></div>
    <ScrollView height="165px">
      {#each spaces as s (s._id)}
        <div class="space" on:mouseover={() => (hoverSpace = s._id)}>
          <div class="info">
            <div class="caption-2">{getSpaceName(s)}</div>
            Members:
            {s.users !== undefined ? s.users.length : 0}
            |
            {getCurrentUserSpace(curentUser, s) ? 'Joined' : ''}
            {s.archived ? 'Archived' : ''}
          </div>
          <div class="actions">
            {#if hoverSpace === s._id}
              {#if getCurrentUserSpace(curentUser, s)}
                {#if s.isPublic || !getCurrentUserSpace(curentUser, s).owner  }
                  <Button width="100px" on:click={() => leaveSpace(coreService, s)}>Leave</Button>
                {:else}
                  <Button width="100px" on:click={() => archivedSpaceUpdate(coreService, s, !s.archived)}>
                    {s.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                {/if}
              {:else}
                <Button width="100px" on:click={() =>  joinSpace(coreService, s)}>
                  Join
                </Button>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </ScrollView>
</div>
</div>

<style lang='scss'>
  .space-browse-view {
    width: 412px;
    padding: 24px;
    position: relative;

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .separator {
      margin-top: 20px;
      margin-bottom: 4px;
      height: 1px;
      background-color: var(--theme-bg-accent-hover);
    }

    .content {
      // width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;

      .space {
        display: flex;
        flex-direction: row;
        margin-top: 4px;
        padding: 8px 8px;
        border-radius: 4px;
        color: var(--theme-content-color);

        .info {
          flex-grow: 1;
          font-size: 11px;
          color: var(--theme-content-color);

          .caption-2 {
            margin-bottom: 4px;
            font-size: 14px;
            font-weight: 500;
            color: var(--theme-userlink-color)
          }
        }

        .actions {
          display: flex;
          align-items: center;
        }

        &:first-child {
          margin-top: 0px;
        }
      }

      .space:hover {
        color: var(--theme-doclink-color);
        background-color: var(--theme-bg-accent-hover);
      }
    }
  }
</style>
