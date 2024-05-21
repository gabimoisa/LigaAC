import MCL from '../../config/config';
import mime from 'mime-types';



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

import BrowserNotification from '../common/browser/browser-notification';
import BrowserStorage from '../common/browser/browser-storage';

import '../common/ga-tracking';


self.addEventListener('message', async (event) => {
    const message = event.data;
    if (message.type === 'fileUploaded') {
        const { fileUrl } = message;
        await processUploadedFile(fileUrl);
    }
});

/**
 * Process uploaded file 
 * 
 * @param downloadItem
 */
async function processUploadedFile(fileURL) {

    try {
        await FileProcessor.processTarget(fileURL, null, settings.data.scanUploads);
    } catch (e) {
        console.log(e);
    }
}



const MCL_CONFIG = MCL.config;

const contextMenus = {};
export default class BackgroundTask {
    constructor() {
        this.id = Math.random();
        this.apikeyInfo = apikeyInfo;
        this.settings = settings;
        this.scanHistory = scanHistory;
        this.downloadsManager = new DownloadManager(FileProcessor);

        chrome.runtime.onInstalled.addListener(this.onInstallExtensionListener.bind(this));
        this.findTabAndRunDropTask();
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
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        


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

    handleMessage(message, sender, sendResponse) {
        if (message.type === 'fileUploaded') {
            console.log(message);
            const { fileUrl } = message;

            processUploadedFile(fileUrl);
        }
    }


    drop_task() {
        let mouseX, mouseY;

        document.addEventListener('click', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });


        document.querySelectorAll('input[type="file"]').forEach(input => {
            try {
            input.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const fileContent = e.target.result;
                        let fileUrl;
                        try {
                        fileUrl = URL.createObjectURL(new Blob([fileContent], { type: fileContent.type }));
        
                        fileUrl = (fileUrl + '/').concat(file.name);

                        }
                        catch (e) {
                            console.log(e);
                        }
        
                        // chrome.runtime.sendMessage({ 
                        //     type: 'fileUploaded', 
                        //     fileUrl: fileUrl 
                        // });
                    };
                    reader.readAsArrayBuffer(file);

                }
            });
            } catch (error) {
                console.error('Error processing file inputs normal:', error);
            }
        });
    
        document.querySelectorAll('iframe').forEach(frame => {
            try {
                const frameDocument = frame.contentDocument || frame.contentWindow.document;
                frameDocument.querySelectorAll('input[type="file"]').forEach(input => {
                    input.addEventListener('change', function(event) {
                        const file = event.target.files[0];
    
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const fileContent = e.target.result;
                            let fileUrl;
                            try {
                            fileUrl = URL.createObjectURL(new Blob([fileContent], { type: fileContent.type }));
    
                            fileUrl = (fileUrl + '/').concat(file.name);
                            }
                            catch (e) {
                                console.log(e);
                            }
    
                            chrome.runtime.sendMessage({ 
                                type: 'fileUploaded', 
                                fileUrl: fileUrl 
                            });
                        };
                        reader.readAsArrayBuffer(file);
                    });
                });
            } catch (error) {
                console.error('Error processing file inputs in frame:', error);
            }
        });
    }


    /**
     * Get the tab id and execute script on it 
     * 
     * @param tabId
     */

    async runDropTaskScript(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
                return;
            }
            console.log('Tab name:', tab.title, ', Tab id:', tab.id, ', scanUploads:', this.settings.data.scanUploads);

            if (this.settings.data.scanUploads) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: this.drop_task
                });
            }
        } catch (error) {
            console.error('Error executing script', error);
        }
    }

    
    
    async findTabAndRunDropTask() {
        const tabs = await chrome.tabs.query({ url: '*://*/*' });

        if (tabs.length === 0) {
            const newTab = await chrome.tabs.create({});
            await this.runDropTaskScript(newTab.id);
            return;
        }
    
        for (const { id: tabId } of tabs) {
            try {
                await this.runDropTaskScript(tabId); 
            } catch (error) {
                console.error('Error executing script:', tabId, error);
            }
        }
    
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                await this.runDropTaskScript(tabId);
            }
        });
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
