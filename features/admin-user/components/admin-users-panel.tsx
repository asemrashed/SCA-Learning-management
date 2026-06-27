"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Role } from "@/types/api"
import {
  useCreateAdminUserMutation,
  useListAdminUsersQuery,
  useUpdateAdminUserMutation,
} from "@/features/admin-user/api"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"

export function AdminUsersPanel() {
  const { data, isLoading, error } = useListAdminUsersQuery({
    pageSize: 50,
    role: Role.ADMIN,
  })
  const [createUser, { isLoading: creating }] = useCreateAdminUserMutation()
  const [updateUser] = useUpdateAdminUserMutation()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+880")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const users = data?.data ?? []

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await createUser({ name, phone, password, role: Role.ADMIN }).unwrap()
      setName("")
      setPhone("+880")
      setPassword("")
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string } } }
      setFormError(apiErr.data?.error?.message ?? "Could not create admin")
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleCreate} className="max-w-lg space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Create admin</h2>
        <div className="space-y-2">
          <Label htmlFor="admin-name">Name</Label>
          <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-phone">Phone</Label>
          <Input
            id="admin-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        <Button type="submit" disabled={creating}>
          {creating ? "Creating…" : "Create admin"}
        </Button>
      </form>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Admin accounts</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-destructive">Could not load admins.</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground">No admin accounts yet.</p>
        ) : (
          <DashboardTable>
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <TableRowActions
                        actions={[
                          {
                            label: user.isActive ? "Deactivate" : "Activate",
                            onClick: () => {
                              void updateUser({
                                id: user.id,
                                body: { isActive: !user.isActive },
                              })
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTable>
        )}
      </div>
    </div>
  )
}
