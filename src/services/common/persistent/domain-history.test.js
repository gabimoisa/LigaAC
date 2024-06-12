import { domainHistory } from './domain-history';
import BrowserStorage from '../browser/browser-storage';

describe('domain-history', () => {
    const BrowserStorageGetSpy = jest.spyOn(BrowserStorage, 'get');
    const BrowserStorageSetSpy = jest.spyOn(BrowserStorage, 'set');
    const mergeSpy = jest.spyOn(domainHistory, 'merge');

    const key = '/* @echo storageKey.domainHistory */';
    const mockData = {
        domains: [
            'mock.com', 'mock2.com'
        ]
    };
    const newDomain = 'mock3.com';

    beforeEach(() => {
        BrowserStorageGetSpy.mockClear();
        BrowserStorageSetSpy.mockClear();
        mergeSpy.mockClear();
        // domainHistory.domains = [...mockData.domains];
    });

    it('should init with save', async () => {
        BrowserStorageGetSpy.mockResolvedValueOnce({});

        await domainHistory.init();

        expect(BrowserStorageGetSpy).toHaveBeenCalledWith(key);
        expect(BrowserStorageSetSpy).toHaveBeenCalledWith({ [key]: { domains: [] } });
    });

    it('should add a new domain', async () => {
        await domainHistory.addDomain(newDomain);
        await domainHistory.addDomain(newDomain);

        expect(domainHistory.domains).toHaveLength(4);
        expect(domainHistory.domains).toContain(newDomain);
    });

    it('should save the current domains to BrowserStorage', async () => {
        await domainHistory.save();

        expect(BrowserStorageSetSpy).toHaveBeenCalledWith({
            [key]: { domains: mockData.domains }
        });
    });

    it('should load domains from BrowserStorage and merge them', async () => {
        BrowserStorageGetSpy.mockResolvedValueOnce({ [key]: mockData });

        const result = await domainHistory.load();

        expect(BrowserStorageGetSpy).toHaveBeenCalledWith(key);
        expect(mergeSpy).toHaveBeenCalledWith(mockData);
        expect(result).toEqual(mockData);
    });
});
