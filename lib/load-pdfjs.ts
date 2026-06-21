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
    transform?: number[]
  }) => { promise: Promise<void> }
}

type PdfJsLib = {
  getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<PdfDocument> }
  GlobalWorkerOptions: { workerSrc: string }
}

export interface RenderPdfOptions {
  /** When set, only render this many pages (supports decimals, e.g. 0.5 = half of page 1). */
  maxPreviewPages?: number
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

function styleCanvas(canvas: HTMLCanvasElement): void {
  canvas.className = 'mx-auto mb-4 block max-w-full shadow-sm'
  canvas.oncontextmenu = (e) => e.preventDefault()
  canvas.draggable = false
}

async function renderPageToCanvas(
  pdf: PdfDocument,
  pageNum: number,
  scale: number,
  visibleFraction = 1,
): Promise<HTMLCanvasElement | null> {
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width

  const context = canvas.getContext('2d')
  if (!context) return null

  if (visibleFraction >= 1) {
    canvas.height = viewport.height
    await page.render({ canvasContext: context, viewport }).promise
  } else {
    const visibleHeight = viewport.height * visibleFraction
    canvas.height = visibleHeight
    canvas.style.maxHeight = `${visibleHeight}px`
    canvas.style.overflow = 'hidden'
    await page.render({
      canvasContext: context,
      viewport,
      transform: [1, 0, 0, 1, 0, -(viewport.height - visibleHeight)],
    }).promise
  }

  styleCanvas(canvas)
  return canvas
}

export async function renderPdfToCanvases(
  data: ArrayBuffer,
  container: HTMLElement,
  scale = 1.35,
  options?: RenderPdfOptions,
): Promise<{ totalPages: number }> {
  const pdfjs = await loadPdfJs()
  // PDF.js transfers the buffer to its worker, detaching it — clone for re-renders (zoom).
  const pdf = await pdfjs.getDocument({ data: data.slice(0) }).promise
  container.replaceChildren()

  const maxPreview = options?.maxPreviewPages
  const totalPages = pdf.numPages

  if (maxPreview == null || maxPreview <= 0) {
    for (let pageNum = 1; pageNum <= totalPages; pageNum += 1) {
      const canvas = await renderPageToCanvas(pdf, pageNum, scale)
      if (canvas) container.appendChild(canvas)
    }
    return { totalPages }
  }

  const fullPages = Math.floor(maxPreview)
  const partialFraction = maxPreview - fullPages

  for (let pageNum = 1; pageNum <= Math.min(fullPages, totalPages); pageNum += 1) {
    const canvas = await renderPageToCanvas(pdf, pageNum, scale)
    if (canvas) container.appendChild(canvas)
  }

  if (partialFraction > 0 && fullPages < totalPages) {
    const canvas = await renderPageToCanvas(pdf, fullPages + 1, scale, partialFraction)
    if (canvas) container.appendChild(canvas)
  }

  return { totalPages }
}
