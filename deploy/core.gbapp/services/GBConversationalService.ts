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

const UrlJoin = require("url-join");
const gBuilder = require("botbuilder");
const logger = require("../../../src/logger");

import { GBConfigService } from "./GBConfigService";
import { GBCoreService } from "./GBCoreService";
import { GBService, GBServiceCallback, IGBConversationalService } from "botlib";
import { GBError } from "botlib";
import { GBERROR_TYPE } from "botlib";
import { GBMinInstance } from "botlib";
import { LuisRecognizer } from "botbuilder-ai";

export class GBConversationalService implements IGBConversationalService {

    coreService: GBCoreService;

    constructor(coreService: GBCoreService) {
        this.coreService = coreService;
    }

    sendEvent(dc: any, name: string, value: any) {
        var msg = new gBuilder.Message();
        msg.data.type = "event";
        msg.data.name = name;
        msg.data.value = value;
        dc.context.sendActivity(msg);
    }

    async runNLP(
        dc: any,
        min: GBMinInstance,
        text: string,
        cb: GBServiceCallback<any>
    ) {

        const model = new LuisRecognizer({
            appId: min.instance.nlpAppId,
            subscriptionKey: min.instance.nlpSubscriptionKey,
            serviceEndpoint: min.instance.nlpServerUrl
        });

        await model.recognize(dc).then(res => {

            // Resolve intents returned from LUIS
            let topIntent = LuisRecognizer.topIntent(res);

            if (topIntent) {
                var intent = topIntent;
                var entity =
                    res.entities && res.entities.length > 0
                        ? res.entities[0].entity.toUpperCase()
                        : null;
                logger.trace(
                    "luis: intent: [" + intent + "] entity: [" + entity + "]"
                );

                try {
                    dc.replace("/" + intent);
                } catch (error) {
                    logger.trace("error: intent: [" + intent + "] error: [" + error + "]");
                    
                    dc.context.sendActivity("Desculpe-me, não encontrei nada a respeito...");
                    dc.replace("/ask", { isReturning: true });
                }

                cb({ intent, entities: res.entities }, null);
            } else {
                
                dc.context.sendActivity("Lamento, não achei nada a respeito...");
                dc.replace("/ask", { isReturning: true });
                cb(null, null);
            }
        }
        ).catch(err => {
            cb(null, new GBError(err, GBERROR_TYPE.nlpGeneralError));
        });
    }
}
