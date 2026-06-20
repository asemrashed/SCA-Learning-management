"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaSourceField } from "@/components/media-source-field"
import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/features/shop/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import { ProductType, type CreateProductInput } from "@/types/api"

interface ProductAdminFormProps {
  productId?: string
}

export function ProductAdminForm({ productId }: ProductAdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(productId)
  const { data: existing, isLoading: loadingExisting } = useGetProductQuery(productId!, {
    skip: !productId,
  })
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [type, setType] = useState<ProductType>(ProductType.BOOK)
  const [priceMajor, setPriceMajor] = useState("")
  const [stock, setStock] = useState("")
  const [digitalUrl, setDigitalUrl] = useState("")
  const [freePreviewPages, setFreePreviewPages] = useState("0.5")
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!existing?.data) return
    const product = existing.data
    setTitle(product.title)
    setDescription(product.description ?? "")
    setThumbnail(product.thumbnail ?? "")
    setType(product.type)
    setPriceMajor(product.priceMinor === 0 ? "" : String(product.priceMinor / 100))
    setStock(product.stock != null ? String(product.stock) : "")
    setDigitalUrl(product.digitalUrl ?? "")
    setFreePreviewPages(String(product.freePreviewPages ?? 0.5))
    setIsPublished(product.isPublished)
  }, [existing])

  const saving = creating || updating

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const priceMinor = priceMajor ? Math.round(parseFloat(priceMajor) * 100) : 0
    if (Number.isNaN(priceMinor) || priceMinor < 0) {
      setError("Enter a valid price.")
      return
    }

    const previewPages = freePreviewPages.trim() ? parseFloat(freePreviewPages) : 0.5
    if (Number.isNaN(previewPages) || previewPages < 0 || previewPages > 100) {
      setError("Enter a valid free preview page count (0–100, e.g. 0.5 for half a page).")
      return
    }

    const trimmedDigitalUrl = digitalUrl.trim()
    if (isPublished && priceMinor > 0 && !trimmedDigitalUrl) {
      setError("Upload a PDF or paste a link before publishing a paid product.")
      return
    }

    const payload: CreateProductInput = {
      title: title.trim(),
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      type,
      priceMinor,
      stock: stock.trim() ? parseInt(stock, 10) : null,
      digitalUrl: trimmedDigitalUrl || null,
      freePreviewPages: previewPages,
      isPublished,
    }

    try {
      if (isEdit && productId) {
        await updateProduct({ id: productId, body: payload }).unwrap()
        router.push("/admin/products")
      } else {
        await createProduct(payload).unwrap()
        router.push("/admin/products")
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string } } }
      setError(apiErr.data?.error?.message ?? "Could not save product.")
    }
  }

  if (isEdit && loadingExisting) {
    return <p className="p-8 text-muted-foreground">Loading product…</p>
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">{isEdit ? "Edit product" : "New product"}</h1>
        <p className="text-sm text-muted-foreground">Books, notes, and question banks for the shop.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ProductType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ProductType).map((value) => (
              <SelectItem key={value} value={value}>
                {PRODUCT_TYPE_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (৳)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            placeholder="500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock (optional)</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <MediaSourceField label="Thumbnail" value={thumbnail} onChange={setThumbnail} />

      <MediaSourceField
        label="Digital PDF file"
        value={digitalUrl}
        onChange={setDigitalUrl}
        folder="documents"
        accept=".pdf,application/pdf"
        placeholder="https://… or upload from your device"
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        Upload a PDF from your device or paste a link. Students read it in a secure in-browser viewer
        only — copy and download are disabled. Screenshots cannot be fully blocked on the web.
      </p>

      <div className="space-y-2">
        <Label htmlFor="freePreviewPages">Show free (pages)</Label>
        <Input
          id="freePreviewPages"
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={freePreviewPages}
          onChange={(e) => setFreePreviewPages(e.target.value)}
          placeholder="0.5"
        />
        <p className="text-xs text-muted-foreground">
          How many pages visitors can read before purchase. Use 0.5 for half a page, 1 for one full
          page, etc.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="published"
          checked={isPublished}
          onCheckedChange={(checked) => setIsPublished(checked === true)}
        />
        <Label htmlFor="published">Published in shop</Label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
