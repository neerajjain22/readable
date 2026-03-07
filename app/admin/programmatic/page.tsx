import Link from "next/link"
import { revalidatePath } from "next/cache"
import { PAGE_STATUS, type PageStatus } from "../../../lib/programmatic/constants"
import { getProgrammaticPagesForAdmin, updateGeneratedPageStatus } from "../../../lib/programmatic/repository"
import styles from "../../../components/programmatic/programmatic.module.css"

export const dynamic = "force-dynamic"

async function updateStatusAction(formData: FormData) {
  "use server"

  const pageId = String(formData.get("pageId") || "")
  const status = String(formData.get("status") || "") as PageStatus

  if (!pageId || !status) {
    return
  }

  await updateGeneratedPageStatus(pageId, status)
  revalidatePath("/admin/programmatic")
  revalidatePath("/guides")
}

export default async function ProgrammaticAdminPage() {
  const pages = await getProgrammaticPagesForAdmin()

  return (
    <main className={styles.adminPage}>
      <h1>Programmatic SEO Moderation</h1>
      <p>Moderate generated pages through draft, review, published, and rejected states.</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Template</th>
              <th>Entity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.slug}</td>
                <td>
                  <span className={styles.tag}>{page.status}</span>
                </td>
                <td>{page.template.name}</td>
                <td>{page.entity.name}</td>
                <td>
                  <div className={styles.actions}>
                    <Link className="btn btn-secondary" href={`/admin/programmatic/${page.id}`}>
                      Edit
                    </Link>
                    <Link className="btn btn-secondary" href={`/admin/programmatic/${page.id}`}>
                      Preview
                    </Link>
                    <form action={updateStatusAction} className={styles.inlineForm}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <input type="hidden" name="status" value={PAGE_STATUS.PUBLISHED} />
                      <button className="btn btn-primary" type="submit">
                        Publish
                      </button>
                    </form>
                    <form action={updateStatusAction} className={styles.inlineForm}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <input type="hidden" name="status" value={PAGE_STATUS.REJECTED} />
                      <button className="btn btn-secondary" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
