"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MediaSourceField } from "@/components/media-source-field"
import {
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "@/features/category/api"
import { slugifyTitle } from "@/features/category/utils"
import type { CreateCategoryInput } from "@/types/api"

interface CategoryAdminFormProps {
  categoryId?: string
}

export function CategoryAdminForm({ categoryId }: CategoryAdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(categoryId)
  const { data: existing, isLoading: loadingExisting } = useGetCategoryQuery(categoryId!, {
    skip: !categoryId,
  })
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [shortIntro, setShortIntro] = useState("")
  const [image, setImage] = useState("")
  const [order, setOrder] = useState("0")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!existing?.data) return
    const category = existing.data
    setTitle(category.title)
    setSlug(category.slug)
    setSlugTouched(true)
    setShortIntro(category.shortIntro ?? "")
    setImage(category.image ?? "")
    setOrder(String(category.order))
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

    const orderNum = parseInt(order, 10)
    if (Number.isNaN(orderNum) || orderNum < 0) {
      setError("Enter a valid display order.")
      return
    }

    const payload: CreateCategoryInput = {
      title: title.trim(),
      slug: slug.trim(),
      shortIntro: shortIntro.trim() || null,
      image: image.trim() || null,
      order: orderNum,
    }

    try {
      if (isEdit && categoryId) {
        await updateCategory({ id: categoryId, body: payload }).unwrap()
        router.push("/admin/categories")
      } else {
        await createCategory(payload).unwrap()
        router.push("/admin/categories")
      }
    } catch {
      setError("Could not save category.")
    }
  }

  if (isEdit && loadingExisting) {
    return <p className="p-8 text-muted-foreground">Loading category…</p>
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">{isEdit ? "Edit category" : "New category"}</h1>
        <p className="text-sm text-muted-foreground">
          Categories appear on the homepage and help students browse programs.
        </p>
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
        <Label htmlFor="shortIntro">Short intro</Label>
        <Textarea
          id="shortIntro"
          value={shortIntro}
          onChange={(e) => setShortIntro(e.target.value)}
          rows={3}
          placeholder="Brief description shown on the category card"
        />
      </div>

      <MediaSourceField
        label="Image"
        value={image}
        onChange={setImage}
        folder="images"
        accept="image/*"
        placeholder="https://…"
      />

      <div className="space-y-2">
        <Label htmlFor="order">Display order</Label>
        <Input
          id="order"
          type="number"
          min="0"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
