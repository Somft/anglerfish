import React from 'react';
import "antd/dist/antd.css";
import {LigthSettingsComponent} from './views/light-settings/LightSettingsComponent';

export class App extends React.Component {
    render() {
        return (
            <LigthSettingsComponent />
        );
    }
}