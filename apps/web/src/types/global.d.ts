// Global type declarations
interface Window {
  chrome?: {
    runtime?: {
      sendMessage: (
        extensionId: string | undefined,
        message: any,
        responseCallback?: (response: any) => void
      ) => void
      onMessage?: {
        addListener: (
          callback: (message: any, sender: any, sendResponse: (response: any) => void) => void
        ) => void
      }
      id?: string
    }
  }
}
