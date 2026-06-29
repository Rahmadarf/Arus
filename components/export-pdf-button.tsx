'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllFilteredTransactions } from '@/actions/transactions'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {
  type: 'income' | 'expense'
}

export default function ExportPdfButton({ type }: Props) {
  const [exporting, setExporting] = useState(false)
  const searchParams = useSearchParams()

  const handleExport = async () => {
    setExporting(true)

    // 1. Ekstrak filter aktif dari URL saat ini
    const currentFilters = {
      year: searchParams.get('year') || undefined,
      month: searchParams.get('month') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
    }

    // 2. Tarik data murni tanpa limit dari server
    const { data, error } = await getAllFilteredTransactions(type, currentFilters)

    if (error || !data) {
      alert(`Gagal membuat laporan: ${error || 'Data kosong'}`)
      setExporting(false)
      return
    }

    // 3. Inisialisasi Dokumen jsPDF (Format A4, Satuan Milimeter)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Desain Header Laporan Keuangan
    const titleText = `LAPORAN RIWAYAT ${type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}`
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(titleText, 14, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 27)

    // Total Akumulasi Data Terfilter
    const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(`Total Akumulasi: Rp ${totalAmount.toLocaleString('id-ID')}`, 14, 34)

    // 4. Strukturkan Data JSON ke format baris tabel jspdf-autotable
    const tableRows = data.map((tx, index) => {
      const category = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
      return [
        index + 1,
        tx.transaction_date,
        category?.name || 'Tanpa Kategori',
        tx.description || '-',
        `Rp ${Number(tx.amount).toLocaleString('id-ID')}`
      ]
    })

    // 5. Render Tabel Vektor Ke Dalam Dokumen
    autoTable(doc, {
      startY: 40,
      head: [['No', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah']],
      body: tableRows,
      theme: 'striped',
      // KOREKSI MUTLAK: Hapus properti fillBox yang tidak valid, cukup gunakan fillColor
      headStyles: { fillColor: type === 'income' ? [16, 185, 129] : [239, 68, 68] }, 
      styles: { font: 'helvetica', fontSize: 9 },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' } // Kolom Jumlah rata kanan & tebal
      }
    })

    // 6. Unduh File Langsung ke Penyimpanan Lokal Pengguna
    doc.save(`Laporan_${type}_${Date.now()}.pdf`)
    setExporting(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
    >
      {exporting ? 'Mengekspor...' : 'Ekspor ke PDF'}
    </button>
  )
}