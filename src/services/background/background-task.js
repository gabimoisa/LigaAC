
import MCL from '../../config/config';

import { settings } from '../common/persistent/settings';
import { apikeyInfo } from '../common/persistent/apikey-info';
import { scanHistory } from '../common/persistent/scan-history';

import CoreClient from '../common/core-client';
import MetascanClient from '../common/metascan-client';
import FileProcessor from '../common/file-processor';
import cookieManager from './cookie-manager';
import DownloadManager from './download-manager';
import { goToTab } from './navigation';
import SafeUrl from './safe-url';
import { generateHTML,generateSTYLES } from '../../pages/block-websites/BlockWebsites-styles.js';
import BrowserNotification from '../common/browser/browser-notification';
import BrowserStorage from '../common/browser/browser-storage';
import BlockWebsites from '../../components/popup/BlockWebsites.js'
import React, { useState, useEffect } from 'react';

import '../common/ga-tracking';

const MCL_CONFIG = MCL.config;
const blockDomain = (tabId) => {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
            const style = document.createElement('style');
           style.innerHTML = `
            @import url(https://fonts.googleapis.com/css?family=Roboto:500);
  body {
    background: #ffffff;
    color: #000a12;
    font-family: "Roboto", sans-serif;
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
  .header {
    background-color:  #111f42;
    height: 120px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 35px;
  }
  .header .logo img {
    display: block;
    width: 170px;
    height: 110px;
    margin-top: -5px;
  }
  .c {
    text-align: center;
    display: block;
    position: relative;
    width: 80%;
    margin: 100px auto;
  }
  ._1 {
    font-size: 36px;
    position: relative;
    display: inline-block;
    z-index: 2;
    height: 100px;
    letter-spacing: 2px;
    margin-top: 50px;
  }
  ._2 {
    text-align: center;
    display: block;
    position: relative;
    font-size: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .button {
   border: none;
   color: #ffffff;
   padding: 16px 32px;
   text-align: center;
   text-decoration: none;
   display: inline-block;
   font-size: 16px;
   margin: 4px 2px;
   transition-duration: 0.4s;
   cursor: pointer;
  }
  .button1{
    background-color: #007bff;
    color: #ffffff;
    border: 2px solid #007bff;
  }
  .button1:hover {
  background-color: #0069d9;
  color: #ffffff;
}

            `;
            document.head.appendChild(style);
            document.body.innerHTML = `
            <div class='header'>
            <div class='logo'>
            <img src="https://lh3.googleusercontent.com/kgmeZcO0chRzB9sQ_CL4613e_C3OkwalErXoQEZngmpoflY7DUa7cKJXWSnZdbzUyG4pUd_C9auq5DJazmcbhWp91c8" alt='OPSWAT Logo'>
            </div>
            </div>
            <div class='c'>
              <br>
              <div class='_1'>Access Denied!</div>
              <br>
              <button class='button button1' onclick="window.history.back()">GO BACK</button>    
            </div>
            `;
        }
    });
};



const contextMenus = {};
export default class BackgroundTask {
    constructor() {
        this.id = Math.random();
        this.apikeyInfo = apikeyInfo;
        this.settings = settings;
        this.scanHistory = scanHistory;
        this.downloadsManager = new DownloadManager(FileProcessor);

        chrome.runtime.onInstalled.addListener(this.onInstallExtensionListener.bind(this));
        chrome.tabs.onCreated.addListener(this.blockTab.bind(this));
        
    }
    
    blockTab(tab) {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === "complete") {
                chrome.storage.local.get(['blockedWebsites'], (result) => {
                    const blockedWebsites = result.blockedWebsites || [];
    
                    const url = new URL(tab.url);
    
                    if (blockedWebsites.includes(url.hostname)) {
                        blockDomain(tabId);
                    }
                });
            }
        });
    }
    
    
    async init() {
        try {
            await this.settings.init();
            await this.apikeyInfo.init();
            await this.scanHistory.init();
            await this.scanHistory.cleanPendingFiles();
            await SafeUrl.init();
        } catch (error) {
            console.warn(error);
        }

        MetascanClient
            .configure({
                pollingIncrementor: MCL_CONFIG.scanResults.incrementor,
                pollingMaxInterval: MCL_CONFIG.scanResults.maxInterval
            })
            .setHost(MCL_CONFIG.metadefenderDomain)
            .setVersion(MCL_CONFIG.metadefenderVersion);

        CoreClient.configure({
            apikey: this.settings.data.coreApikey,
            endpoint: this.settings.data.coreUrl,
            pollingIncrementor: MCL_CONFIG.scanResults.incrementor,
            pollingMaxInterval: MCL_CONFIG.scanResults.maxInterval,
        });

        cookieManager.onChange(({ cookie, removed }) => {
            if (!MCL_CONFIG.mclDomain.endsWith(cookie.domain) || MCL_CONFIG.authCookieName !== cookie.name || removed) {
                return;
            }

            this.setApikey(cookie.value);
        });
        
        chrome.contextMenus.onClicked.addListener(this.handleContextMenuClicks.bind(this));
        chrome.notifications.onClicked.addListener(this.handleNotificationClicks.bind(this));
        chrome.notifications.onClosed.addListener(() => { });
        
        chrome.downloads.onCreated.addListener(this.downloadsManager.trackInProgressDownloads.bind(this.downloadsManager));
        chrome.downloads.onChanged.addListener(this.downloadsManager.updateActiveDownloads.bind(this.downloadsManager));
        chrome.downloads.onChanged.addListener(this.downloadsManager.processCompleteDownloads.bind(this.downloadsManager));

        BrowserStorage.addListener(this.browserStorageListener.bind(this));

        this.setupContextMenu(this.settings.data.saveCleanFiles);

        async function getAuthCookie() {
            const cookie = await cookieManager.get();

            if (cookie) {
                this.setApikey(cookie.value);
            } else {
                setTimeout(getAuthCookie.bind(this), 300);
            }
        }
        getAuthCookie.call(this);

        SafeUrl.toggle(this.settings.data.safeUrl);
    }

    /**
     * contexts: ['all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'launcher', 'browser_action', 'page_action']
     * @param saveCleanFiles
     */
    setupContextMenu(saveCleanFiles) {
        const title = (saveCleanFiles) ? 'contextMenuScanAndDownloadTitle' : 'contextMenuScanTitle';
        return chrome.contextMenus.removeAll(() => {
            const menuId = chrome.contextMenus.create({
                id: MCL_CONFIG.contextMenu.scanId,
                title: chrome.i18n.getMessage(title),
                contexts: ['link', 'image', 'video', 'audio']
            });
            contextMenus[menuId] = menuId;
        });
    }

    /**
     * Updates extension authentication info
     *  
     * @param {string} cookieValue
     */
    async setApikey(cookieValue) {
        let cookieData = decodeURIComponent(cookieValue);

        try {
            cookieData = JSON.parse(cookieData);
        } catch (error) {
            BrowserNotification.create(error, 'info');
            _gaq.push(['exception', { exDescription: 'background-task:setApikey' + JSON.stringify(error) }]);
        }

        if (this.apikeyInfo.data.apikey === cookieData.apikey && this.apikeyInfo.data.loggedIn === cookieData.loggedIn) {
            return;
        }

        try {
            const response = await MetascanClient.apikey.info(cookieData.apikey);

            if (response?.error) {
                BrowserNotification.create(response.error.messages.join(', '));
                return;
            }

            this.apikeyInfo.data.apikey = cookieData.apikey;
            this.apikeyInfo.data.loggedIn = cookieData.loggedIn;
            this.apikeyInfo.parseMclInfo(response);
            await this.apikeyInfo.save();

            this.settings.data.shareResults = this.settings.data.shareResults || !this.apikeyInfo.data.paidUser;
            await this.settings.save();
        } catch (error) {
            console.warn(error);
        }
    }

    onInstallExtensionListener(details) {
        if (details.reason === 'install') {
            chrome.tabs.create({
                url: `${MCL_CONFIG.mclDomain}/extension/get-apikey`
            });

            chrome.tabs.create({
                url: 'index.html#/about'
            });
            
        } else if (details.reason === 'update') {
            this.updateExtensionFrom(details.previousVersion);
        }
    }

    async handleContextMenuClicks(info) {
        if (info.menuItemId !== MCL_CONFIG.contextMenu.scanId) {
            return;
        }
        
        const target = info.srcUrl || info.linkUrl || info.pageUrl;
        
        await this.processTarget(target);        
    }

    /**
     * Process context menu event targets.
     * 
     * @param linkUrl
     * @param downloadItem
     * @returns {Promise.<void>}
     */
    async processTarget(linkUrl, downloadItem) {
        await this.downloadsManager.processTarget(linkUrl, downloadItem);
    }

    /**
     * Extension updates handler.
     * 
     * @param previousVersion
     * @returns {Promise<void>}
     */
    updateExtensionFrom(previousVersion) {
        if (previousVersion === chrome.runtime.getManifest().version) {
            return;
        }

        chrome.tabs.create({
            url: `${MCL_CONFIG.mclDomain}/extension/get-apikey`
        });
    }

    /**
     * Extension notifications click event handler
     */
    handleNotificationClicks(notificationId) {
        if (notificationId == 'info') {
            return;
        }
        goToTab('history');
    }

    /**
     * Update extension items in context menu.
     */
    updateContextMenu(saveCleanFiles) {
        const title = (saveCleanFiles) ? 'contextMenuScanAndDownloadTitle' : 'contextMenuScanTitle';
        if (contextMenus[MCL_CONFIG.contextMenu.scanId]) {
            chrome.contextMenus.update(MCL_CONFIG.contextMenu.scanId, {
                title: chrome.i18n.getMessage(title)
            }); 
        }
    }

    /**
     * Handle browser messages.
     * 
     * @param message
     * @returns {Promise.<void>}
     */
    async browserStorageListener(data) {
        for (const key of Object.keys(data)) {
            switch (key) {
                case MCL_CONFIG.storageKey.apikeyInfo:
                    await this.apikeyInfo.load();
                    break;
                case MCL_CONFIG.storageKey.settings:
                    const settingsData = await this.settings.load();

                    this.updateContextMenu(settingsData.saveCleanFiles);
                    SafeUrl.toggle(settingsData.safeUrl);
                    CoreClient.configure({
                        apikey: settingsData.coreApikey,
                        endpoint: settingsData.coreUrl,
                    });
                    break;
                case MCL_CONFIG.storageKey.scanHistory: {
                    await this.scanHistory.load();
                    break;
                }
                default:
                    break;
            }
        }
    }
    
}

export const Task = new BackgroundTask();