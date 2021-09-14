export type LightingResponse = {
    channels: ChannelResponse[];
}

export type ChannelResponse = {
    id: string;
    name: string;
    values: number[];
}


export const _ = '';
