import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import express from "express";
import { commandHandler } from "./modules/commandHandler";
import { BattleRoom } from "./rooms/BattleRoom";
import serveStatic from "serve-static";
import serveIndex from 'serve-index';
/**
 * Import your Room files
 */
import { ChatRoom } from "./rooms/ChatRoom";
import { Stuff } from "./rooms/schema/Stuff";

export default Arena({
    
    getId: () => "FNFNet Server",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('chat', ChatRoom);
        gameServer.define('battle', BattleRoom);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
         app.use('/', express.static('html'), serveIndex('html', {'icons': true}))
        
        app.get("/post", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        commandHandler.start();
        /**
         * Before before gameServer.listen() is called.
         */
    },
});