/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PdfDocument {
  numPages: number
  getPage: (n: number) => Promise<PdfPage>
}

export interface PdfPage {
  getViewport: (opts: { scale: number }) => { width: number; height: number }
  render: (ctx: {
    canvasContext: CanvasRenderingContext2D
    viewport: { width: number; height: number }
  }) => { promise: Promise<void> }
}

type PdfJsLib = {
  getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<PdfDocument> }
  GlobalWorkerOptions: { workerSrc: string }
}

let pdfJsPromise: Promise<PdfJsLib> | null = null

export function loadPdfJs(): Promise<PdfJsLib> {
  if (pdfJsPromise) return pdfJsPromise

  pdfJsPromise = new Promise((resolve, reject) => {
    const w = window as Window & { pdfjsLib?: PdfJsLib }
    if (w.pdfjsLib) {
      resolve(w.pdfjsLib)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    script.onload = () => {
      const lib = w.pdfjsLib
      if (!lib) {
        reject(new Error('PDF viewer failed to initialize'))
        return
      }
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(lib)
    }
    script.onerror = () => reject(new Error('Failed to load PDF viewer'))
    document.head.appendChild(script)
  })

  return pdfJsPromise
}

export async function renderPdfToCanvases(
  data: ArrayBuffer,
  container: HTMLElement,
  scale = 1.35,
): Promise<void> {
  const pdfjs = await loadPdfJs()
  const pdf = await pdfjs.getDocument({ data }).promise
  container.replaceChildren()

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.className = 'mx-auto mb-4 block max-w-full shadow-sm'
    canvas.oncontextmenu = (e) => e.preventDefault()
    const context = canvas.getContext('2d')
    if (!context) continue
    await page.render({ canvasContext: context, viewport }).promise
    container.appendChild(canvas)
  }
}
