const timeout = (duration: number) => {
    return new Promise(res => {
        setTimeout(res, duration);
    })
}

// Request wrapper with exponential-backoff retries
export default async function Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {

    let r: Response;

    let loopActive = true;
    let duration = 1000;

    do {
        try {
            r = await fetch(input, init);
            loopActive = false;
        } catch (e) {
            await timeout(duration);
            duration *= 1.2;
        }
    } while (loopActive);


    // With the following return, Typescript says "Variable 'r' is used before being assigned." However, the above implementation will always assign some kind of response object to variable r. It's safe to ignore this warning, as the issue seems to be with Typescript validating a try...catch within a do...while.

    // @ts-ignore
    return r;
    

}
