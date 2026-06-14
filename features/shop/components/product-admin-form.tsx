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
import { slugifyTitle, PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
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
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [type, setType] = useState<ProductType>(ProductType.BOOK)
  const [priceMajor, setPriceMajor] = useState("")
  const [stock, setStock] = useState("")
  const [digitalUrl, setDigitalUrl] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!existing?.data) return
    const product = existing.data
    setTitle(product.title)
    setSlug(product.slug)
    setSlugTouched(true)
    setDescription(product.description ?? "")
    setThumbnail(product.thumbnail ?? "")
    setType(product.type)
    setPriceMajor(product.priceMinor === 0 ? "" : String(product.priceMinor / 100))
    setStock(product.stock != null ? String(product.stock) : "")
    setDigitalUrl(product.digitalUrl ?? "")
    setIsPublished(product.isPublished)
  }, [existing])

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugifyTitle(title))
    }
  }, [title, slugTouched])

  const saving = creating || updating

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const priceMinor = priceMajor ? Math.round(parseFloat(priceMajor) * 100) : 0
    if (Number.isNaN(priceMinor) || priceMinor < 0) {
      setError("Enter a valid price.")
      return
    }

    const payload: CreateProductInput = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      type,
      priceMinor,
      stock: stock.trim() ? parseInt(stock, 10) : null,
      digitalUrl: digitalUrl.trim() || null,
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
    } catch {
      setError("Could not save product.")
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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
          required
        />
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

      <div className="space-y-2">
        <Label htmlFor="digitalUrl">Digital download URL (optional)</Label>
        <Input
          id="digitalUrl"
          type="url"
          value={digitalUrl}
          onChange={(e) => setDigitalUrl(e.target.value)}
          placeholder="https://…"
        />
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
