export const runMiddlewares = (middlewares: Function[], req: any, res: any) => {
    const execute = (index: number) => {
        if (index >= middlewares.length) return;

        const middleware = middlewares[index];
        middleware(req, res, () => execute(index + 1));
    };

    execute(0);
};
