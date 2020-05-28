//
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
//

import contact from '.'
import core from '@anticrm/platform-core/src/__model__'
import { Ref, Class, Type } from '@anticrm/platform-core'
import ui from '@anticrm/platform-ui/src/__model__'
import { ClassUIDecorator, Form, ComponentRef } from '@anticrm/platform-ui'
import { Contact, Person } from '..'
import { Doc } from '@anticrm/platform-core'
import Builder from '@anticrm/platform-core/src/__model__/builder'

export default async (S: Builder) => {

  S.createClass(contact.class.Email, core.class.Type, {})
  S.createClass(contact.class.Phone, core.class.Type, {})

  S.createClass(contact.class.Contact, core.class.Doc, {
    email: S.newInstance(contact.class.Email, {}),
    phone: S.newInstance(contact.class.Phone, {})
  })

  S.createClass(contact.class.Person, contact.class.Contact, {
    firstName: S.newInstance(core.class.Type, {}),
    lastName: S.newInstance(core.class.Type, {}),
    birthDate: S.newInstance(core.class.Type, {}),
  })

  S.mixin(contact.class.Email, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Type<any>>>>, { icon: contact.icon.Email })
  S.mixin(contact.class.Phone, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Type<any>>>>, { icon: contact.icon.Phone })

  S.mixin(contact.class.Contact, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Contact>>>, {
    decorators: { phone: S.newInstance(ui.class.TypeUIDecorator, { placeholder: '+7 913 333 5555' as any }) }
  })

  S.mixin(contact.class.Person, ui.class.Form as Ref<Class<Form<Person>>>, {
    form: contact.form.Person as string as ComponentRef //TODO
  })

}