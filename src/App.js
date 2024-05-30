import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { SettingsProvider } from './providers/SettingsProvider';
import { ScanHistoryProvider } from './providers/ScanHistoryProvider';

import Popup from './components/popup/Popup';
import About from './pages/about/About';
import ScanHistory from './pages/scan-history/ScanHistory';
import Settings from './pages/settings/Settings';
import BlockWebsites from './components/popup/BlockWebsites';
import BlockedWebsitesPage from './pages/block-websites/BlockWebsites-page';
import Blocker from './pages/block-websites/blocking';

import './App.scss';


/**
 * Returns a Switch with defined routes for each component/page. 
 * Popup is the default location, while the others are for the settings page
 */
function App () {    
    return (
        <Routes>
            <Route 
                path='/settings'
                element={
                    <SettingsProvider>
                        <Settings />
                    </SettingsProvider>
                }
            />
            <Route 
                path='/about'
                element={
                    <About />
                }
            />
            <Route
                path='/block'
                element={
                    <BlockedWebsitesPage />
                }
            />
            <Route
                path='/block'
                element={
                    <Blocker />
                }
            />
            <Route 
                path='/history'
                element={
                    <ScanHistoryProvider>
                        <ScanHistory />
                    </ScanHistoryProvider>
                }
            />
            <Route
                path='/block-websites'
                element={<BlockWebsites />}
            />
            <Route 
                path='/'
                element={
                    <ScanHistoryProvider>
                        <Popup />
                    </ScanHistoryProvider>
                }
            />
        </Routes>
    );
};

export default App;