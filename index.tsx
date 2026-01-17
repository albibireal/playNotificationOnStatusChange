/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

import notisSound from "./notificationSound.mp3";



const settings = definePluginSettings({
    userID: {
        id: "userId",
        name: "User ID",
        description: "Enter the Discord user ID to monitor",
        type: OptionType.STRING,
    },
    desktop: {
        id: "desktop",
        name: "Desktop",
        description: "Check for desktop status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    web: {
        id: "web",
        name: "Web",
        description: "Check for web status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    mobile: {
        id: "mobile",
        name: "Mobile",
        description: "Check for mobile status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    console: {
        id: "console",
        name: "Console",
        description: "Check for console status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    getsOnline: {
        id: "getsOnline",
        name: "GetsOnline",
        description: "TriggerWhen user goes online only. Disables all other triggers.",
        type: OptionType.BOOLEAN,
        default: true
    },
    online: {
        id: "online",
        name: "Online",
        description: "Trigger on online status",
        type: OptionType.BOOLEAN,
        default: false
    },
    offline: {
        id: "offline",
        name: "Offline",
        description: "Trigger on offline status",
        type: OptionType.BOOLEAN,
        default: false
    },
    dnd: {
        id: "dnd",
        name: "DoNotDisturb",
        description: "Trigger on do not disturb status",
        type: OptionType.BOOLEAN,
        default: false
    },
    idle: {
        id: "idle",
        name: "Idle",
        description: "Trigger on idle status",
        type: OptionType.BOOLEAN,
        default: false
    },
});

interface PresenceUpdate {
    user: {
        id: string;
        username?: string;
        global_name?: string;
    };
    clientStatus: {
        desktop?: string;
        web?: string;
        mobile?: string;
        console?: string;
    };
    guildId?: string;
    status: string;
    broadcast?: any;
    activities: Array<{
        session_id: string;
        created_at: number;
        id: string;
        name: string;
        details?: string;
        type: number;
    }>;
}

var lastUserData;
var notificationSound = new Audio(notisSound);
// new Audio("https://canary.discord.com/assets/0950a7ea4f1dd037870b.mp3");

function CheckUser(userData) {
    if (userData.user.id !== settings.store.userID) return;

    if (!lastUserData) {
        lastUserData = userData;
        return;
    }

    var newStatus = "none";
    if (settings.store.desktop && userData.clientStatus.desktop) newStatus = userData.clientStatus.deskktop;
    else if (settings.store.mobile && userData.clientStatus.mobile) newStatus = userData.clientStatus.mobile;
    else if (settings.store.web && userData.clientStatus.web) newStatus = userData.clientStatus.web;
    else if (settings.store.console && userData.clientStatus.console) newStatus = userData.clientStatus.console;
    else if (userData.status === "offline") newStatus = userData.status;
    if (newStatus === "none") return;

    if (settings.store.getsOnline && lastUserData.status === "offline") { }
    else if (settings.store.online && newStatus === "online") { }
    else if (settings.store.offline && newStatus === "offline") { }
    else if (settings.store.dnd && newStatus === "dnd") { }
    else if (settings.store.idle && newStatus === "idle") { }
    else {
        lastUserData = userData;
        return;
    }

    // Play sound
    notificationSound.play();


    lastUserData = userData;
}

export default definePlugin({
    name: "notificationOnOnlineStatusChange",
    description: "Plays a sound when selected players go online",
    authors: [{ name: "albibi", id: 316320262658457601n }],
    settings,

    flux: {
        PRESENCE_UPDATES({ updates }: { updates: PresenceUpdate[]; }) {
            updates.forEach(CheckUser);
        }
    }
});
