export function Retry(maxAttempt = 3, delayMs = 5000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalFn = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any) {
      let lastError: Error = new Error('Unknowm error');

      for (let attempt = 1; attempt <= maxAttempt; attempt++) {
        try {
          const result: unknown = await originalFn.apply(this, args);
          return result;
        } catch (error) {
          lastError = error as Error;

          console.log(
            `Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s`,
          );

          if (attempt < maxAttempt) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      throw lastError;
    };
  };
}
