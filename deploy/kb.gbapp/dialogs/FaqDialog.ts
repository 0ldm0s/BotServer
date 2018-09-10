/*****************************************************************************\
|                                               ( )_  _                       |
|    _ _    _ __   _ _    __    ___ ___     _ _ | ,_)(_)  ___   ___     _     |
|   ( '_`\ ( '__)/'_` ) /'_ `\/' _ ` _ `\ /'_` )| |  | |/',__)/' _ `\ /'_`\   |
|   | (_) )| |  ( (_| |( (_) || ( ) ( ) |( (_| || |_ | |\__, \| ( ) |( (_) )  |
|   | ,__/'(_)  `\__,_)`\__  |(_) (_) (_)`\__,_)`\__)(_)(____/(_) (_)`\___/'  |
|   | |                ( )_) |                                                |
|   (_)                 \___/'                                                |
|                                                                             |
| General Bots Copyright (c) Pragmatismo.io. All rights reserved.             |
| Licensed under the AGPL-3.0.                                                |
|                                                                             | 
| According to our dual licensing model, this program can be used either      |
| under the terms of the GNU Affero General Public License, version 3,        |
| or under a proprietary license.                                             |
|                                                                             |
| The texts of the GNU Affero General Public License with an additional       |
| permission and of our proprietary license can be found at and               |
| in the LICENSE file you have received along with this program.              |
|                                                                             |
| This program is distributed in the hope that it will be useful,             |
| but WITHOUT ANY WARRANTY; without even the implied warranty of              |
| MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                |
| GNU Affero General Public License for more details.                         |
|                                                                             |
| "General Bots" is a registered trademark of Pragmatismo.io.                 |
| The licensing of the program under the AGPLv3 does not imply a              |
| trademark license. Therefore any rights, title and interest in              |
| our trademarks remain entirely with us.                                     |
|                                                                             |
\*****************************************************************************/

"use strict";

import { KBService } from './../services/KBService';
import { IGBDialog } from "botlib";
import { BotAdapter } from "botbuilder";
import { GBMinInstance } from "botlib";

export class FaqDialog extends IGBDialog {
  /**
   * Setup dialogs flows and define services call.
   * 
   * @param bot The bot adapter.
   * @param min The minimal bot instance data.
   */
  static setup(bot: BotAdapter, min: GBMinInstance) {

    const service = new KBService();

    min.dialogs.add("/faq", [
      async (dc, args) => {
        let data = await service.getFaqBySubjectArray("faq", null);
        if (data) {
          await min.conversationalService.sendEvent(dc, "play", {
            playerType: "bullet",
            data: data.slice(0, 10)
          })

          let messages = [
            "Veja algumas perguntas mais frequentes logo na tela. Clique numa delas para eu responder.",
            "Você pode clicar em alguma destas perguntas da tela que eu te respondo de imediato.",
            "Veja a lista que eu preparei logo aí na tela..."
          ]

          await dc.context.sendActivity(messages[0]); // TODO: RND messages.
          await dc.endAll();
        }
      }
    ]);
  }
}
