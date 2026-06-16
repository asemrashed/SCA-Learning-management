"use client"

import { useRef, useState } from "react"
import { Pencil, User } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { useUpdateMeMutation } from "@/features/auth/api"
import { useUploadFileMutation } from "@/features/upload/api"
import { setCredentials } from "@/features/auth/authSlice"
import { useAuthQuerySkip } from "@/features/auth/hooks"
import { formatStudentId } from "@/lib/student-id"
import type { RootState } from "@/store/rootReducer"
import { StudentPageShell } from "@/components/student/student-page-shell"

export function StudentProfileView() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const skipAuth = useAuthQuerySkip()
  const { data: enrollmentsData } = useListEnrollmentsQuery(undefined, { skip: skipAuth })

  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const rollNumber = enrollmentsData?.data?.find((e) => e.rollNumber)?.rollNumber ?? null
  const studentId = user ? formatStudentId(rollNumber, user.id) : "—"

  const openEdit = () => {
    if (!user) return
    setName(user.name)
    setEmail(user.email ?? "")
    setAvatarPreview(user.avatarUrl)
    setAvatarUrl(user.avatarUrl)
    setEditOpen(true)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)

    try {
      const result = await uploadFile({ file, folder: "images" }).unwrap()
      setAvatarUrl(result.data.url)
    } catch {
      setAvatarPreview(user?.avatarUrl ?? null)
      setAvatarUrl(user?.avatarUrl ?? null)
    }
  }

  const handleSave = async () => {
    if (!user || !accessToken) return

    try {
      const result = await updateMe({
        name: name.trim(),
        email: email.trim() || null,
        avatarUrl,
      }).unwrap()

      dispatch(
        setCredentials({
          user: result.data,
          accessToken,
        }),
      )
      setEditOpen(false)
    } catch {
      // Error surfaced by RTK; keep modal open
    }
  }

  if (!user) {
    return (
      <StudentPageShell title="My Profile">
        <p className="text-muted-foreground">Loading profile…</p>
      </StudentPageShell>
    )
  }

  return (
    <>
      <StudentPageShell title="My Profile">
        <div className="mb-6 flex justify-end">
          <Button onClick={openEdit} className="rounded-xl bg-primary text-secondary hover:bg-primary/90">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <th className="w-36 bg-muted/40 px-4 py-4 text-left font-medium text-muted-foreground">
                  ID
                </th>
                <td className="px-4 py-4 font-medium">{studentId}</td>
              </tr>
              <tr className="border-b">
                <th className="bg-muted/40 px-4 py-4 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <td className="px-4 py-4">{user.name}</td>
              </tr>
              <tr className="border-b">
                <th className="bg-muted/40 px-4 py-4 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <td className="px-4 py-4">{user.email ?? "—"}</td>
              </tr>
              <tr>
                <th className="bg-muted/40 px-4 py-4 text-left font-medium text-muted-foreground">
                  Phone
                </th>
                <td className="px-4 py-4">{user.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </StudentPageShell>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-muted transition-colors hover:border-primary"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-center text-xs text-muted-foreground">
                Tap image to change · JPG/PNG/WebP
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input id="student-id" value={studentId} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input id="profile-phone" value={user.phone} disabled />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving || isUploading ? "Saving…" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
