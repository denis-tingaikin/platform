<!--
// Copyright © 2024-2025 Hardcore Engineering Inc.
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
  import { AccountRole, Ref, getCurrentAccount, hasAccountRole } from '@hcengineering/core'
  import { type Drive } from '@hcengineering/drive'
  import { createQuery } from '@hcengineering/presentation'
  import { Button, ButtonWithDropdown, IconAdd, IconDropdown, Loading, SelectPopupValueType } from '@hcengineering/ui'
  import { FileUploadOptions, getUploadMethods, UploadMethodHandler } from '@hcengineering/uploader'
  import drive from '../plugin'
  import { getFolderIdFromFragment, findFolderIdFromFragment } from '../navigation'
  import { showCreateDrivePopup, showCreateFolderPopup, uploadFilesToDrivePopup, getUploadOptions } from '../utils'
  import { getResource } from '@hcengineering/platform'

  export let currentSpace: Ref<Drive> | undefined
  export let currentFragment: string | undefined

  const myAcc = getCurrentAccount()
  const socialStrings = myAcc.socialIds

  const query = createQuery()
  const actionWithExtensionMap = new Map<string, UploadMethodHandler>()

  let loading = true
  let hasDrive = false
  query.query(
    drive.class.Drive,
    { archived: false, members: { $in: socialStrings } },
    (res) => {
      hasDrive = res.length > 0
    },
    { limit: 1, projection: { _id: 1 } }
  )

  $: parent = getFolderIdFromFragment(currentFragment ?? '') ?? drive.ids.Root

  async function handleDropdownItemSelected (res?: SelectPopupValueType['id']): Promise<void> {
    if (res === drive.string.CreateDrive) {
      await handleCreateDrive()
    } else if (res === drive.string.CreateFolder) {
      await handleCreateFolder()
    } else if (res === drive.string.UploadFile) {
      await handleUploadFile()
    } else if (typeof res === 'string' && currentSpace !== undefined) {
      const findRes = await findFolderIdFromFragment(currentFragment ?? '')
      console.log('findRes', findRes)
      const opts = await getUploadOptions(findRes.space as Ref<Drive> ?? currentSpace, findRes.folder ?? drive.ids.Root)
      const uploadFn = actionWithExtensionMap.get(res)
      if (uploadFn === undefined) {
        return
      }
      await uploadFn(opts)
    }
  }

  async function handleCreateDrive (): Promise<void> {
    await showCreateDrivePopup()
  }

  async function handleCreateFolder (): Promise<void> {
    await showCreateFolderPopup(currentSpace, parent, true)
  }

  async function handleUploadFile (): Promise<void> {
    if (currentSpace !== undefined) {
      await uploadFilesToDrivePopup(currentSpace, parent)
    }
  }

  const dropdownItems: SelectPopupValueType[] = hasAccountRole(myAcc, AccountRole.User)
    ? [
        { id: drive.string.CreateDrive, label: drive.string.CreateDrive, icon: drive.icon.Drive },
        { id: drive.string.CreateFolder, label: drive.string.CreateFolder, icon: drive.icon.Folder },
        { id: drive.string.UploadFile, label: drive.string.UploadFile, icon: drive.icon.File }
      ]
    : [
        { id: drive.string.CreateFolder, label: drive.string.CreateFolder, icon: drive.icon.Folder },
        { id: drive.string.UploadFile, label: drive.string.UploadFile, icon: drive.icon.File }
      ]

  void getUploadMethods().then(async extensions => {
    if (currentSpace === undefined) {
      return
    }
    for (const extension of extensions) {
      dropdownItems.push({ id: extension._id, text: extension.label, icon: drive.icon.File })
      const uploadMethodHandler = async (opts: FileUploadOptions): Promise<void> => {
        const fn = await getResource(extension.handler)
        await fn(opts)
      }
      actionWithExtensionMap.set(extension._id, uploadMethodHandler)
    }
  })
  loading = false

</script>

{#if loading}
  <Loading shrink />
{:else}
  <div class="antiNav-subheader">
    {#if hasDrive}
      <ButtonWithDropdown
        icon={IconAdd}
        justify={'left'}
        kind={'primary'}
        label={drive.string.UploadFile}
        mainButtonId={'new-document'}
        dropdownIcon={IconDropdown}
        {dropdownItems}
        disabled={currentSpace === undefined}
        on:click={handleUploadFile}
        on:dropdown-selected={(ev) => {
          void handleDropdownItemSelected(ev.detail)
        }}
      />
    {:else}
      <Button
        icon={IconAdd}
        label={drive.string.CreateDrive}
        justify={'left'}
        width={'100%'}
        kind={'primary'}
        gap={'large'}
        on:click={handleCreateDrive}
      />
    {/if}
  </div>
{/if}
