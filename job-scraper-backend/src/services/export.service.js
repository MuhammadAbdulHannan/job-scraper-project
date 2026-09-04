import ExcelJS from 'exceljs';
import { EXPORT_COLUMNS, HEADER_FILL, EXPORT_FONT } from '../constants/exportConstants.js';

export const generateXlsxBuffer = async (rows, meta = {}) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lead Generator';
    workbook.created = new Date();

    // --- Contacts sheet ---
    const sheet = workbook.addWorksheet('Contacts', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = EXPORT_COLUMNS.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { name: EXPORT_FONT, bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER_FILL}` } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.height = 22;

    rows.forEach((row) => {
        const added = sheet.addRow(row);
        added.font = { name: EXPORT_FONT, size: 10 };
        added.alignment = { vertical: 'top' };
    });

    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: EXPORT_COLUMNS.length },
    };

    // --- Run Summary sheet ---
    const summary = workbook.addWorksheet('Run Summary');
    summary.columns = [
        { key: 'label', width: 32 },
        { key: 'value', width: 70 },
    ];

    const addSummary = (label, value) => {
        const row = summary.addRow({ label, value });
        row.getCell(1).font = { name: EXPORT_FONT, bold: true, size: 10 };
        row.getCell(2).font = { name: EXPORT_FONT, size: 10 };
        row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    };

    addSummary('Keywords', (meta.keywords || []).join(', '));
    addSummary('Location', meta.location || '');
    addSummary('Platforms', (meta.platforms || []).join(', '));
    addSummary('Jobs per keyword', meta.jobsPerKeyword ?? '');
    addSummary('Employee count range', `${meta.employeeCountMin ?? ''} – ${meta.employeeCountMax ?? ''}`);
    addSummary('Persona titles', (meta.personaTitles || []).join(', '));
    addSummary('', '');
    addSummary('Jobs scraped', meta.scrapedCount ?? 0);
    addSummary('Passed filters', meta.filteredCount ?? 0);
    addSummary('Companies after agency removal', meta.companiesCount ?? 0);
    addSummary('Contacts found', rows.length);
    addSummary('Emails found', rows.filter((r) => r.email).length);
    addSummary('Phone numbers found', rows.filter((r) => r.mobilePhone).length);
    addSummary('Generated', new Date().toISOString().split('T')[0]);

    return workbook.xlsx.writeBuffer();
};

export const generateCsvBuffer = (rows) => {
    const escape = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value).replace(/"/g, '""');
        return /[",\n\r]/.test(str) ? `"${str}"` : str;
    };

    const header = EXPORT_COLUMNS.map((col) => escape(col.header)).join(',');
    const body = rows.map((row) =>
        EXPORT_COLUMNS.map((col) => escape(row[col.key])).join(',')
    );

    // BOM so Excel opens UTF-8 correctly
    return Buffer.from('\uFEFF' + [header, ...body].join('\n'), 'utf8');
};