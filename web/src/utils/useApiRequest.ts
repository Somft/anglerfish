import { useEffect, useState } from 'react';
import { getMessageFromException } from './getMessageFromException';
import { CancellationToken } from './CancellationToken';

type Error = {
    message: string;
    exception: unknown;
}

type Return<T> = {
    isLoading: boolean,
    error: Error | null,
    data: Readonly<T> | null,
    reload: (data?: T) => void,
}

export function useApiRequest<T>(action: () => Promise<T>, dependencies?: unknown[]) : Return<T> {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const reload = (data?: T) => {
        if (data != null) {
            setData(data);
            return () => {};
        }

        setIsLoading(true);
        setError(null);

        const token = new CancellationToken();

        action().then((r) => {
            if (token.continue()) {
                setData(r);
                setIsLoading(false);
            }
        }).catch((ex: unknown) => {
            getMessageFromException(ex).then((msg) => {
                if (token.continue()) {
                    setError({
                        message: msg,
                        exception: ex,
                    });
                    setIsLoading(false);
                }
            });
        });

        return () => token.cancel();
    };

    useEffect(() => reload(), dependencies ?? []);

    return {
        isLoading,
        data,
        error,
        reload,
    };
}
