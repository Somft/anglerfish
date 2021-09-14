/* eslint-disable no-console */
const APPLICATION_ERROR_MESSAGE = 'application error';
const NETWORK_ERROR_MESSAGE = 'network error';
const VALIDATION_ERROR_MESSAGE = 'validation error';
const UNAUTHORIZED_ERROR_MESSAGE = 'unauthorized';
const SERVER_ERROR_MESSAGE = 'server error';
const UNKNOWN_ERROR_MESSAGE = 'unknown error';

const DEV_BACKEND_ERROR_MESSAGE = 'Backend server is turned off';

async function getMessageFromResponse(response: Response): Promise<string> {
    if (response.status === 0) {
        return NETWORK_ERROR_MESSAGE;
    }

    const responseText = await response.text();

    try {
        const response = JSON.parse(responseText);
        // if (response.errorCode === ErrorType.Validation) {
        //     return VALIDATION_ERROR_MESSAGE;
        // }

        if (typeof response.message === 'string') {
            return response.message;
        }
        // eslint-disable-next-line no-empty
    } catch {
    }

    if (response.status === 500) {
        if (responseText != null && responseText !== '' && responseText.startsWith('Proxy error')) {
            return DEV_BACKEND_ERROR_MESSAGE;
        }

        return SERVER_ERROR_MESSAGE;
    }

    if (response.status === 401) {
        return UNAUTHORIZED_ERROR_MESSAGE;
    }

    return UNKNOWN_ERROR_MESSAGE;
}

export async function getMessageFromException(ex: unknown): Promise<string> {
    try {
        if (ex instanceof Error) {
            if (ex.name === 'NetworkError') {
                return NETWORK_ERROR_MESSAGE;
            }

            console.error(ex);
            return APPLICATION_ERROR_MESSAGE;
        }

        if (ex instanceof Response) {
            return getMessageFromResponse(ex);
        }
    } catch (e) {
        console.error(e);
        return APPLICATION_ERROR_MESSAGE;
    }

    return UNKNOWN_ERROR_MESSAGE;
}
