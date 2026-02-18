
import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData> {
    columns: any[]
    data: TData[]
    searchable?: boolean
    searchKeys?: string[]
    pageSize?: number
    loading?: boolean
    getRowUrl?: (row: TData) => string
}

export function DataTable<TData>({
    columns,
    data,
    searchable,
    searchKeys,
    pageSize = 10,
    loading,
    getRowUrl,
}: DataTableProps<TData>) {
    const [pageIndex, setPageIndex] = React.useState(0)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery || !searchKeys) return data
        return data.filter((item: any) =>
            searchKeys.some(key =>
                String(item[key] || "").toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    }, [data, searchQuery, searchKeys])

    const paginatedData = React.useMemo(() => {
        const start = pageIndex * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, pageIndex, pageSize])

    const totalPages = Math.ceil(filteredData.length / pageSize)

    const handleRowClick = (row: TData) => {
        if (getRowUrl) {
            const url = getRowUrl(row)
            if (url) window.location.href = url
        }
    }

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value)
                            setPageIndex(0)
                        }}
                        className="max-w-sm"
                    />
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column: any) => (
                                <TableHead key={column.key || column.accessorKey}>
                                    {column.label || column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length ? (
                            paginatedData.map((row: any, rowIndex: number) => (
                                <TableRow
                                    key={rowIndex}
                                    onClick={() => handleRowClick(row)}
                                    className={getRowUrl ? "cursor-pointer hover:bg-muted/80" : ""}
                                >
                                    {columns.map((column: any) => (
                                        <TableCell key={column.key || column.accessorKey}>
                                            {column.render ? column.render(row) : row[column.key || column.accessorKey]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">
                    {filteredData.length > 0
                        ? `Showing ${Math.min(pageIndex * pageSize + 1, filteredData.length)}–${Math.min((pageIndex + 1) * pageSize, filteredData.length)} of ${filteredData.length}`
                        : "No results"}
                </span>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageIndex(old => Math.max(0, old - 1))}
                        disabled={pageIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageIndex(old => Math.min(totalPages - 1, old + 1))}
                        disabled={pageIndex >= totalPages - 1}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
