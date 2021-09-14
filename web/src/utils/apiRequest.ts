import { delay } from './delay';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiRequestOptions = {
    method: HttpMethod,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | null | undefined>,
    minDelay?: number,
    mediaType?: string
};

type RequestOptions = ApiRequestOptions & {
    mediaType: string,
}

async function request(options: RequestOptions) {
    let query = '';

    if (options.query != null) {
        Object.keys(options.query)
            // eslint-disable-next-line no-param-reassign
            .forEach(key => (options.query![key] == null ? delete options.query![key] : {}));
        query = `?${new URLSearchParams(options.query as any).toString()}`;
    }

    const responsePromise = fetch(options.path + query, {
        method: options.method,
        body: options.body != null ? JSON.stringify(options.body) : undefined,
        headers: {
            'Content-Type': options.mediaType,
        },
    });

    const response: Response = options.minDelay != null
        ? (await Promise.all([responsePromise, delay(options.minDelay)]))[0]
        : await responsePromise;

    if (response.status < 200 || response.status >= 300) {
        throw response;
    }

    return response;
}

async function apiRequest<TResponse>({ mediaType, ...options }: ApiRequestOptions) : Promise<TResponse> {
    const response = await request({
        mediaType: mediaType ?? 'application/json',
        ...options,
    });

    const responseText = await response.text();
    if (responseText !== '') {
        return JSON.parse(responseText);
    }

    return undefined as unknown as TResponse;
}

export {
    request,
    apiRequest,
};
