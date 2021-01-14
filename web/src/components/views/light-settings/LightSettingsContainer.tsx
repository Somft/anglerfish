import React from 'react';
import { websocketRelativeUrl } from '../../../utils/websocketRelativeUrl';

class LightSettingsContainer extends React.Component {
    connection = new WebSocket(websocketRelativeUrl("/v1/api/ws/control"));

    componentDidMount = ()  => {
        this.connection.onmessage = this.onWsMessage;
    };

    componentWillUnmount = () => {
        this.connection.close();
    };

    onWsMessage = () => {

    }

    render() {
        return <LightSettingsContainer 

        />;
    }
}