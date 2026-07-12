/** POST /api/v1/code/runTest and stream chunks into appendOutput (setState updater).
 * Pass an AbortController's signal so callers can cancel the request (e.g. on unmount). */
export async function streamRunTestOutput(requestBody, appendOutput, signal) {
  try {
    const response = await fetch(`/api/v1/code/runTest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        if (signal?.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        appendOutput((prev) => prev + chunk);
      }
    } catch (streamError) {
      if (signal?.aborted) return;
      console.error('Error reading stream:', streamError);
      appendOutput(
        (prev) => prev + `\nError reading stream: ${streamError.message}`
      );
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (signal?.aborted) return;
    console.error('Error running test:', error);
  }
}
