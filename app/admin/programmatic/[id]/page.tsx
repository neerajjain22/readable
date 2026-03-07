import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import MdxRenderer from "../../../../components/programmatic/MdxRenderer"
import styles from "../../../../components/programmatic/programmatic.module.css"
import { PAGE_STATUS } from "../../../../lib/programmatic/constants"
import {
  getGeneratedPageById,
  saveGeneratedPageContent,
  updateGeneratedPageStatus,
} from "../../../../lib/programmatic/repository"
import type { PageStatus } from "../../../../lib/programmatic/constants"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Programmatic Preview",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

type RouteParams = {
  params: { id: string }
}

async function saveContentAction(formData: FormData) {
  "use server"

  const pageId = String(formData.get("pageId") || "")
  const content = String(formData.get("content") || "")

  if (!pageId || !content) {
    return
  }

  await saveGeneratedPageContent(pageId, content, PAGE_STATUS.REVIEW)
  revalidatePath(`/admin/programmatic/${pageId}`)
  revalidatePath("/admin/programmatic")
}

async function transitionStatusAction(formData: FormData) {
  "use server"

  const pageId = String(formData.get("pageId") || "")
  const status = String(formData.get("status") || "")

  if (!pageId || !status) {
    return
  }

  const allowedStatuses = new Set<PageStatus>(Object.values(PAGE_STATUS))
  if (!allowedStatuses.has(status as PageStatus)) {
    return
  }

  await updateGeneratedPageStatus(pageId, status as PageStatus)
  revalidatePath(`/admin/programmatic/${pageId}`)
  revalidatePath("/admin/programmatic")
}

export default async function ProgrammaticPreviewPage({ params }: RouteParams) {
  const page = await getGeneratedPageById(params.id)

  if (!page) {
    notFound()
  }

  return (
    <main className={styles.adminPage}>
      <p>
        <Link href="/admin/programmatic">← Back to moderation table</Link>
      </p>
      <h1>{page.title}</h1>
      <div className={styles.metaRow}>
        <span className={styles.tag}>{page.status}</span>
        <span className={styles.tag}>Slug: {page.slug}</span>
      </div>

      <form action={saveContentAction}>
        <input type="hidden" name="pageId" value={page.id} />
        <label htmlFor="content">Editable MDX Content</label>
        <textarea id="content" name="content" defaultValue={page.content} className={styles.previewArea} />
        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary">
            Save to Review
          </button>
        </div>
      </form>

      <div className={styles.actions} style={{ marginTop: 14 }}>
        <form action={transitionStatusAction} className={styles.inlineForm}>
          <input type="hidden" name="pageId" value={page.id} />
          <input type="hidden" name="status" value={PAGE_STATUS.DRAFT} />
          <button type="submit" className="btn btn-secondary">
            Move to Draft
          </button>
        </form>
        <form action={transitionStatusAction} className={styles.inlineForm}>
          <input type="hidden" name="pageId" value={page.id} />
          <input type="hidden" name="status" value={PAGE_STATUS.PUBLISHED} />
          <button type="submit" className="btn btn-primary">
            Publish
          </button>
        </form>
        <form action={transitionStatusAction} className={styles.inlineForm}>
          <input type="hidden" name="pageId" value={page.id} />
          <input type="hidden" name="status" value={PAGE_STATUS.REJECTED} />
          <button type="submit" className="btn btn-secondary">
            Reject
          </button>
        </form>
      </div>

      <hr style={{ margin: "24px 0" }} />
      <h2>Rendered Preview (Always Noindex)</h2>
      <article className={styles.article}>
        <MdxRenderer source={page.content} />
      </article>
    </main>
  )
}
