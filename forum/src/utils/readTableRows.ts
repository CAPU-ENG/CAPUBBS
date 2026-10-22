export async function readTableRows(file: File): Promise<unknown[][]> {
  const extension = file.name.toLocaleLowerCase().split('.').pop();
  if (extension === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser');
    return readSheet(file);
  }
  if (extension === 'csv' || extension === 'tsv') return readDelimitedRows(file, extension === 'tsv' ? '\t' : '');
  throw new Error('请选择 XLSX、CSV 或 TSV 表格。');
}

async function readDelimitedRows(file: File, delimiter: string): Promise<unknown[][]> {
  const { default: Papa } = await import('papaparse');
  return new Promise((resolve, reject) => {
    Papa.parse<unknown[]>(file, {
      complete: (result) => {
        const fatalError = result.errors.find((parseError) => parseError.type !== 'Delimiter');
        if (fatalError) {
          reject(new Error(`表格读取失败：${fatalError.message}`));
          return;
        }
        resolve(result.data);
      },
      delimiter,
      error: () => reject(new Error('表格读取失败。')),
      skipEmptyLines: 'greedy',
    });
  });
}
