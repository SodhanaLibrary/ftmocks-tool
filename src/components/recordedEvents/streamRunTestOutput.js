/** POST /api/v1/code/runTest and stream chunks into appendOutput (setState updater). */
export async function streamRunTestOutput(requestBody, appendOutput) {
  try {
    const response = await fetch(`/api/v1/code/runTest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        appendOutput((prev) => prev + chunk);
      }
    } catch (streamError) {
      console.error('Error reading stream:', streamError);
      appendOutput(
        (prev) => prev + `\nError reading stream: ${streamError.message}`
      );
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}
