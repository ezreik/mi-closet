/**
 * Las fotos del móvil pesan varios MB. Antes de guardarlas las reducimos:
 * si no, el teléfono se queda sin espacio a las pocas decenas de prendas.
 */

function cargarImagen(archivo: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

function dibujar(img: HTMLImageElement, ladoMax: number): HTMLCanvasElement {
  const escala = Math.min(1, ladoMax / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * escala)
  canvas.height = Math.round(img.height * escala)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function comprimir(archivo: File, ladoMax = 1400, calidad = 0.78): Promise<Blob> {
  const img = await cargarImagen(archivo)
  const canvas = dibujar(img, ladoMax)
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? archivo), 'image/jpeg', calidad),
  )
}

export async function miniatura(archivo: Blob, lado = 260): Promise<string> {
  const img = await cargarImagen(archivo)
  return dibujar(img, lado).toDataURL('image/jpeg', 0.65)
}

export function urlDe(blob: Blob): string {
  return URL.createObjectURL(blob)
}
