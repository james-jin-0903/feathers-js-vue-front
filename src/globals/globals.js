import XLSX from 'xlsx';
const fs = require('fs');

export const exportExcel = ((name) => {
  const ws = XLSX.utils.table_to_sheet(document.querySelector('.voxo-table'));
  // Need to delete first column since it tries to render the icon in column A, but just leaves the column blank in the file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${name}.xlsx`);
});

export const exportCSV = ((name) => {
  let outputName = `${name}.csv`;
  // Create worksheet
  const ws = XLSX.utils.table_to_sheet(document.querySelector('.voxo-table'));
  // Convert worksheet to csv format
  let csvOutput = XLSX.utils.sheet_to_csv(ws);
  // Create new workbook and add csv sheet to workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, csvOutput, 'Data');
  console.log(wb);
  XLSX.writeFile(wb, outputName);
});

