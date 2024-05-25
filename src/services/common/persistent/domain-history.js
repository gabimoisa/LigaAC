'use strict';

import MCL from '../../../config/config';
import BrowserStorage from './../browser/browser-storage';

const storageKey = MCL.config.storageKey.domainHistory;

/**
 *
 * @returns {{domains: Array, init: init, save: save, load: load, merge: merge, addDomain: addDomain, removeDomain: removeDomain, clear: clear}}
 * @constructor
 */
function DomainHistory() {
    return {
        domains: [],

        //methods
        init,
        load,
        save,
        merge,
        updateDomainById,
        updateDomainByDataId,
        addDomain,
        removeDomain,
        clear
    }
}

export const domainHistory = DomainHistory();

/**
 *
 * @returns {Promise.<*>}
 */
async function init() {
    try {
        const { [storageKey]: domainData } = await BrowserStorage.get(storageKey);
        if (!domainData) {
            await this.save();
        } else {
            this.merge(domainData);
        }
    } catch (error) {
        console.error('Error initializing domain history:', error);
    }
}

/**
 * Load domain history from browser storage
 * @returns {Promise} { domains: [] }
 */
async function load() {
    const { [storageKey]: domainData } = await BrowserStorage.get(storageKey);
    this.merge(domainData);

    return domainData;
}

/**
 *
 * @param newData
 */
function merge(newData) {
    for (let key in newData) {
        if (Object.prototype.hasOwnProperty.call(newData, key)) {
            this[key] = newData[key];
        }
    }
}

/**
 * Add a domain to domain history
 * @param domain
 * @returns {Promise<void>}
 */
async function save() {
    try {
        await BrowserStorage.set({
            [storageKey]: {
                domains: this.domains
            }
        });
    } catch (error) {
        console.error('Error saving domain history:', error);
    }
}

async function addDomain(domain) {
    this.domains.push(domain);
    await this.save();
    console.log('Current domains after adding:', this.domains);

}

async function updateDomainById(id, data) {
    const domainIndex = this.domains.findIndex(domain => domain?.id === id);
    if (domainIndex === -1) {
        return;
    }
    this.domains[domainIndex] = { ...this.domains[domainIndex], ...data };
    this.save();
}

async function updateDomainByDataId(dataId, data) {
    const domainIndex = this.domains.findIndex(domain => domain?.dataId === dataId);
    if (domainIndex === -1) {
        return;
    }
    this.domains[domainIndex] = { ...this.domains[domainIndex], ...data };
    this.save();
}

/**
 * Remove a domain from domain history
 * @param domain
 * @returns {Promise<void>}
 */
async function removeDomain(id) {
    this.domains = this.domains.filter((domain) => domain.id !== id);
    await this.save();
}

/**
 * Remove all domains from domain history
 * @returns {Promise<void>}
 */
async function clear() {
    this.domains = [];
    this.save();
}