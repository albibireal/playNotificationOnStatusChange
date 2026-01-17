/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { makeRange, OptionType } from "@utils/types";




const settings = definePluginSettings({
    userID: {
        description: "Enter the Discord user ID to monitor",
        type: OptionType.STRING,
    },
    volume: {
        description: "The percentage volume of the notification",
        type: OptionType.SLIDER,
        markers: makeRange(0, 100, 5),
        default: 100,
    },
    desktop: {
        description: "Check for desktop status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    web: {
        description: "Check for web status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    mobile: {
        description: "Check for mobile status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    console: {
        description: "Check for console status change",
        type: OptionType.BOOLEAN,
        default: true
    },
    getsOnline: {
        description: "Trigger when user goes from offline to anything else.",
        type: OptionType.BOOLEAN,
        default: true
    },
    online: {
        description: "Trigger on online status",
        type: OptionType.BOOLEAN,
        default: false
    },
    offline: {
        description: "Trigger on offline status",
        type: OptionType.BOOLEAN,
        default: false
    },
    dnd: {
        description: "Trigger on do not disturb status",
        type: OptionType.BOOLEAN,
        default: false
    },
    idle: {
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

// Only way i could figure out how to set a sound without either esbuild or vencord screaming at me
const notificationSound = new Audio("https://canary.discord.com/assets/badc42c2a9063b4a962c.mp3");

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

    if (settings.store.getsOnline && lastUserData.status === "offline" && lastUserData.status !== newStatus) { }
    else if (settings.store.online && newStatus === "online") { }
    else if (settings.store.offline && newStatus === "offline") { }
    else if (settings.store.dnd && newStatus === "dnd") { }
    else if (settings.store.idle && newStatus === "idle") { }
    else {
        lastUserData = userData;
        return;
    }

    // Play sound
    notificationSound.volume = settings.store.volume / 100;
    notificationSound.play();


    lastUserData = userData;
}

export default definePlugin({
    name: "notificationOnOnlineStatusChange",
    description: "Plays a sound when selected players go online",
    authors: [{ name: "albibi", id: 316320262658457601n }],
    settings,

    start() {
        lastUserData.status = "offline";
    },

    flux: {
        PRESENCE_UPDATES({ updates }: { updates: PresenceUpdate[]; }) {
            updates.forEach(CheckUser);
        }
    }
});
