import React, {Props, useRef} from 'react';
import {
    Card, Col, Row, Tabs,
} from 'antd';
import { Graph } from '../../ui/Graph';
import { websocketRelativeUrl } from '../../../utils/websocketRelativeUrl';
import { useApiRequest } from '../../../utils/useApiRequest';
import { apiRequest } from '../../../utils/apiRequest';
import {ChannelResponse, LightingResponse} from '../../../dto';

type ChannelSettingsProps = {
    webSocket: WebSocket;
    channel: ChannelResponse;
}

function ChannelSettings(props: ChannelSettingsProps) {
    return (
        <Card bordered={false}>
            Hello world
            {' '}
            {props.channel.name}
            <Graph
                channel={props.channel}
                webSocket={props.webSocket}
            />
        </Card>
    );
}

export default function LightSettingsComponent() {
    const webSocket = useRef<WebSocket | null>(null!);
    if (webSocket.current == null) {
        webSocket.current = new WebSocket(websocketRelativeUrl('/v1/api/ws/control'));
    }

    const { data } = useApiRequest(() => apiRequest<LightingResponse>({
        method: 'GET',
        path: '/v1/api/rest/lighting',
    }));

    return (
        <Tabs defaultActiveKey="0" tabPosition="left">
            {data?.channels.map(channel => (
                <Tabs.TabPane tab={channel.name} key={`${channel.id}`}>
                    <ChannelSettings
                        channel={channel}
                        webSocket={webSocket.current!}
                    />
                </Tabs.TabPane>
            ))}
        </Tabs>
    );
}
