import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import type {
  CompetitorVisibilityRow,
  PositioningRow,
  QueryRow,
  ResponseSample,
} from "../../lib/ai-visibility/view-model"

type PdfReportTemplateProps = {
  companyName: string
  companySlug: string
  category: string | null
  visibilityScore: number | null
  generatedAt: string
  logoDataUri?: string
  insights: string[]
  opportunities: string[]
  recommendations: string[]
  buyerQueries: QueryRow[]
  comparisonQueries: QueryRow[]
  responseSamples: ResponseSample[]
  competitorVisibility: CompetitorVisibilityRow[]
  positioningRows: PositioningRow[]
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 84,
    paddingBottom: 64,
    paddingHorizontal: 42,
    fontSize: 10.5,
    lineHeight: 1.45,
    color: "#13203b",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e2ef",
    paddingBottom: 10,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 18,
    height: 18,
  },
  brandName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#243fdf",
  },
  headerTitle: {
    fontSize: 10,
    color: "#52607a",
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#d9e2ef",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#52607a",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  subtitle: {
    color: "#52607a",
    marginBottom: 18,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: "#13203b",
  },
  scoreCard: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f7f9fc",
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 6,
    color: "#13203b",
  },
  muted: {
    color: "#52607a",
  },
  list: {
    marginTop: 2,
    gap: 4,
  },
  listItem: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  bullet: {
    width: 10,
    fontWeight: 700,
  },
  listText: {
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  tableChunk: {
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7edf7",
  },
  rowHeader: {
    backgroundColor: "#edf2fb",
  },
  cell: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRightWidth: 1,
    borderRightColor: "#e7edf7",
    fontSize: 9.5,
    flexGrow: 1,
    flexBasis: 0,
  },
  cellWide: {
    flexGrow: 2,
    flexBasis: 0,
  },
  cellAttribute: {
    flexGrow: 1.5,
    flexBasis: 0,
  },
  noBorderRight: {
    borderRightWidth: 0,
  },
  small: {
    fontSize: 9.5,
  },
})

function toDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
}

function formatYesNo(value: boolean) {
  return value ? "Yes" : "No"
}

function displayText(value: string | null | undefined, fallback = "N/A") {
  const normalized = typeof value === "string" ? value.trim() : ""
  return normalized.length ? normalized : fallback
}

function chunkRows<T>(rows: T[], chunkSize: number) {
  if (chunkSize <= 0) {
    return [rows]
  }

  const chunks: T[][] = []
  for (let index = 0; index < rows.length; index += chunkSize) {
    chunks.push(rows.slice(index, index + chunkSize))
  }
  return chunks.length ? chunks : [[]]
}

export default function PdfReportTemplate(props: PdfReportTemplateProps) {
  const {
    companyName,
    companySlug,
    category,
    visibilityScore,
    generatedAt,
    logoDataUri,
    insights,
    opportunities,
    recommendations,
    buyerQueries,
    comparisonQueries,
    responseSamples,
    competitorVisibility,
    positioningRows,
  } = props

  const displayPositioningRows = (
    positioningRows.length ? positioningRows : [{ attribute: "No data", brands: [] }]
  ).map((row) => ({
    attribute: displayText(row.attribute),
    brands: row.brands.map((brand) => ({
      brand: displayText(brand.brand, "Unknown"),
      label: displayText(brand.label, "Not available"),
    })),
  }))

  const displayBuyerQueries = buyerQueries
    .map((row) => ({
      ...row,
      query: displayText(row.query, ""),
    }))
    .filter((row) => row.query.length > 0)

  const displayComparisonQueries = comparisonQueries
    .map((row) => ({
      ...row,
      query: displayText(row.query, ""),
    }))
    .filter((row) => row.query.length > 0)

  const displayCompetitorVisibility = (
    competitorVisibility.length ? competitorVisibility : [{ brand: "No data", visibilityPercent: 0 }]
  ).map((row) => ({
    brand: displayText(row.brand),
    visibilityPercent: Number.isFinite(row.visibilityPercent) ? row.visibilityPercent : 0,
  }))

  const positioningBrands = Array.from(
    new Set(
      displayPositioningRows.flatMap((row) =>
        row.brands.map((brand) => displayText(brand.brand, "Unknown")),
      ),
    ),
  )

  const positioningBrandColumns = positioningBrands.length ? positioningBrands : ["Brand"]

  const positioningMatrixRows = displayPositioningRows.map((row) => {
    const ratingsByBrand = new Map<string, string>()
    for (const brand of row.brands) {
      ratingsByBrand.set(displayText(brand.brand, "Unknown"), displayText(brand.label, "No evidence"))
    }
    return {
      attribute: row.attribute,
      ratingsByBrand,
    }
  })

  const positioningChunks = chunkRows(positioningMatrixRows, 8)
  const buyerQueryChunks = chunkRows(
    displayBuyerQueries.length
      ? displayBuyerQueries
      : [{ query: "No buyer queries available", querySlug: "", brandMentioned: false }],
    6,
  )
  const comparisonQueryChunks = chunkRows(
    displayComparisonQueries.length
      ? displayComparisonQueries
      : [{ query: "No comparison queries available", querySlug: "", brandMentioned: false }],
    6,
  )
  const competitorVisibilityChunks = chunkRows(displayCompetitorVisibility, 10)

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.headerBrand}>
            {logoDataUri ? <Image src={logoDataUri} style={styles.logo} /> : null}
            <Text style={styles.brandName}>Readable</Text>
          </View>
          <Text style={styles.headerTitle}>AI Visibility Report</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by Readable</Text>
          <Text>www.tryreadable.ai</Text>
        </View>

        <Text style={styles.title}>AI visibility report for {companyName}</Text>
        <Text style={styles.subtitle}>
          Company slug: {companySlug}{"\n"}
          Category: {category || "Uncategorized"}{"\n"}
          Generated: {toDateLabel(generatedAt)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Visibility Score</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{typeof visibilityScore === "number" ? visibilityScore : 0}/100</Text>
            <Text style={styles.muted}>
              This score indicates how often AI assistants are likely to recommend or describe the brand in category
              conversations.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.list}>
            {(insights.length ? insights : ["No insights available."]).map((item, index) => (
              <View style={styles.listItem} key={`insight-${index}`}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Category Positioning Evidence</Text>
          {positioningChunks.map((tableRows, chunkIndex) => (
            <View
              style={chunkIndex > 0 ? [styles.table, styles.tableChunk] : styles.table}
              key={`position-table-${chunkIndex}`}
              wrap={false}
            >
              <View style={[styles.row, styles.rowHeader]}>
                <Text style={[styles.cell, styles.cellAttribute]}>Attribute</Text>
                {positioningBrandColumns.map((brandName, brandIndex) => (
                  <Text
                    key={`position-header-${brandName}-${brandIndex}`}
                    style={
                      brandIndex === positioningBrandColumns.length - 1
                        ? [styles.cell, styles.noBorderRight]
                        : styles.cell
                    }
                  >
                    {brandName}
                  </Text>
                ))}
              </View>
              {tableRows.map((row, index) => (
                <View style={styles.row} key={`position-${chunkIndex}-${index}`} wrap={false}>
                  <Text style={[styles.cell, styles.cellAttribute]}>{row.attribute}</Text>
                  {positioningBrandColumns.map((brandName, brandIndex) => (
                    <Text
                      key={`position-cell-${chunkIndex}-${index}-${brandName}-${brandIndex}`}
                      style={
                        brandIndex === positioningBrandColumns.length - 1
                          ? [styles.cell, styles.noBorderRight]
                          : styles.cell
                      }
                    >
                      {row.ratingsByBrand.get(brandName) || "No evidence"}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Query Analysis</Text>
          {buyerQueryChunks.map((tableRows, chunkIndex) => (
            <View
              style={chunkIndex > 0 ? [styles.table, styles.tableChunk] : styles.table}
              key={`buyer-table-${chunkIndex}`}
              wrap={false}
            >
              <View style={[styles.row, styles.rowHeader]}>
                <Text style={[styles.cell, styles.cellWide]}>Buyer Query</Text>
                <Text style={[styles.cell, styles.noBorderRight]}>Brand Mentioned</Text>
              </View>
              {tableRows.map((row, index) => (
                <View style={styles.row} key={`buyer-${chunkIndex}-${index}`} wrap={false}>
                  <Text style={[styles.cell, styles.cellWide]}>{displayText(row.query)}</Text>
                  <Text style={[styles.cell, styles.noBorderRight]}>{formatYesNo(Boolean(row.brandMentioned))}</Text>
                </View>
              ))}
            </View>
          ))}

          {comparisonQueryChunks.map((tableRows, chunkIndex) => (
            <View
              style={chunkIndex > 0 ? [styles.table, styles.tableChunk] : styles.table}
              key={`comparison-table-${chunkIndex}`}
              wrap={false}
            >
              <View style={[styles.row, styles.rowHeader]}>
                <Text style={[styles.cell, styles.cellWide]}>Comparison Query</Text>
                <Text style={[styles.cell, styles.noBorderRight]}>Brand Mentioned</Text>
              </View>
              {tableRows.map((row, index) => (
                <View style={styles.row} key={`comparison-${chunkIndex}-${index}`} wrap={false}>
                  <Text style={[styles.cell, styles.cellWide]}>{displayText(row.query)}</Text>
                  <Text style={[styles.cell, styles.noBorderRight]}>{formatYesNo(Boolean(row.brandMentioned))}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Response Samples</Text>
          <View style={styles.list}>
            {(responseSamples.length ? responseSamples : [{ query: "No response samples available", excerpt: "" }]).map(
              (sample, index) => (
                <View style={styles.listItem} key={`sample-${index}`}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    <Text style={styles.small}>{sample.query}: </Text>
                    {sample.excerpt || "No excerpt"}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competitor Visibility</Text>
          {competitorVisibilityChunks.map((tableRows, chunkIndex) => (
            <View
              style={chunkIndex > 0 ? [styles.table, styles.tableChunk] : styles.table}
              key={`competitor-table-${chunkIndex}`}
              wrap={false}
            >
              <View style={[styles.row, styles.rowHeader]}>
                <Text style={[styles.cell, styles.cellWide]}>Brand</Text>
                <Text style={[styles.cell, styles.noBorderRight]}>Visibility %</Text>
              </View>
              {tableRows.map((row, index) => (
                <View style={styles.row} key={`competitor-${chunkIndex}-${index}`} wrap={false}>
                  <Text style={[styles.cell, styles.cellWide]}>{row.brand}</Text>
                  <Text style={[styles.cell, styles.noBorderRight]}>{Math.round(row.visibilityPercent)}%</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility Opportunities</Text>
          <View style={styles.list}>
            {(opportunities.length ? opportunities : ["No opportunities available."]).map((item, index) => (
              <View style={styles.listItem} key={`opportunity-${index}`}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.list}>
            {(recommendations.length ? recommendations : ["No recommendations available."]).map((item, index) => (
              <View style={styles.listItem} key={`recommendation-${index}`}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
