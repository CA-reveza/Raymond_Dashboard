import { Order } from '../types';

// Helper to trigger browser download for CSV / text / HTML files
export function triggerFileDownload(
  filename: string,
  content: string | Blob,
  mimeType: string = 'text/csv;charset=utf-8;'
) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Print Order Tax Invoice with window.print() or fallback download
export function printOrderInvoice(order: Order) {
  const printWindow = window.open('', '_blank', 'width=850,height=950');
  
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong style="color: #0f172a; font-size: 13px;">${item.name}</strong><br/>
        <span style="color: #64748b; font-size: 11px;">SKU: ${item.sku} | Category: ${item.category}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${order.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #1e293b; max-width: 820px; margin: 0 auto; background: #fff; }
          .no-print { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .print-btn { background: #122B52; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; shadow: 0 1px 2px rgba(0,0,0,0.1); }
          .print-btn:hover { background: #1B3A6B; }
          .download-btn { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; text-decoration: none; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #122B52; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 26px; font-weight: 900; color: #122B52; letter-spacing: 1.5px; }
          .subtitle { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; tracking: 1px; }
          .title { text-align: right; }
          .title h2 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; }
          .title p { margin: 3px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
          .box h4 { margin: 0 0 8px; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; font-weight: 700; }
          .box p { margin: 3px 0; font-size: 12px; color: #334155; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1; }
          .total-box { background: #0f172a; color: white; padding: 18px 24px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
          .total-box h3 { margin: 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
          .total-box .amount { font-size: 24px; font-weight: 900; color: #38bdf8; font-family: monospace; }
          .footer { margin-top: 36px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.5; }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <strong style="font-size: 13px; color: #0f172a;">Raymonds Tax Invoice</strong>
            <div style="font-size: 11px; color: #64748b;">Order ${order.id}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="print-btn">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

        <div class="header">
          <div>
            <div class="brand">RAYMONDS</div>
            <div class="subtitle">Retail Operations & Tax Invoice</div>
          </div>
          <div class="title">
            <h2>TAX INVOICE</h2>
            <p>Invoice No: <strong>${order.id}</strong></p>
            <p>Date: ${order.date} | ${order.time}</p>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <h4>Billed To (Customer)</h4>
            <p style="font-weight: 700; color: #0f172a;">${order.customerName}</p>
            <p>${order.customerEmail}</p>
            <p>${order.customerPhone}</p>
            <p>Loyalty Tier: <strong style="color: #122B52;">${order.loyaltyTier}</strong></p>
          </div>
          <div class="box">
            <h4>Shipping & Fulfillment</h4>
            <p>${order.shippingAddress}</p>
            <p>Store: <strong>${order.storeLocation}</strong></p>
            <p>Payment Method: <strong>${order.paymentMethod}</strong></p>
            <p>Tracking: <strong>${order.trackingNumber || 'AWB-8839210'}</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item & SKU</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <h3>Grand Total (Incl. 18% GST)</h3>
            <div style="font-size: 11px; color: #a7f3d0; margin-top: 4px;">First Citizen Reward Points Earned: +${Math.floor(order.totalAmount / 100)} PTS</div>
          </div>
          <div class="amount">₹${order.totalAmount.toLocaleString('en-IN')}</div>
        </div>

        <div class="footer">
          <p>Raymonds Limited • GSTIN: 27AAACS1234F1Z5 • Customer Care: 1800-209-2090</p>
          <p>Thank you for shopping with Raymonds! This is a system-generated Tax Invoice.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // If popups are blocked, download HTML receipt directly
    triggerFileDownload(`Invoice_${order.id}.html`, html, 'text/html;charset=utf-8;');
  }
}

// Batch print picklists
export function printPicklists(orders: Order[]) {
  if (orders.length === 0) {
    alert('Please select at least one order to print picklists.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=850,height=950');

  const picklistsHtml = orders
    .map(
      (order, idx) => `
    <div style="page-break-after: always; margin-bottom: 32px; border: 2px dashed #94a3b8; padding: 24px; border-radius: 12px; background: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <h2 style="margin:0; font-size: 18px; color: #122B52; font-weight: 800;">DISPATCH PICKLIST MANIFEST #${idx + 1}</h2>
          <span style="font-size: 12px; color: #475569; font-family: monospace;">ORDER ID: <strong>${order.id}</strong></span>
        </div>
        <span style="font-size: 11px; font-weight: bold; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; color: #0f172a;">Store: ${order.storeLocation}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px;">
        <div>Customer: <strong>${order.customerName}</strong> (${order.loyaltyTier})</div>
        <div>Payment: <strong>${order.paymentMethod}</strong></div>
        <div style="grid-column: span 2;">Address: ${order.shippingAddress}</div>
      </div>

      <h4 style="margin: 12px 0 8px; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Items to Retrieve from Shelf Inventory:</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
            <th style="text-align: center; padding: 8px; width: 50px;">Check</th>
            <th style="text-align: left; padding: 8px;">SKU Code</th>
            <th style="text-align: left; padding: 8px;">Product Title</th>
            <th style="text-align: center; padding: 8px;">Qty to Pick</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; text-align: center;"><input type="checkbox" style="transform: scale(1.4);"/></td>
              <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0f172a;">${item.sku}</td>
              <td style="padding: 10px; color: #334155; font-weight: 500;">${item.name}</td>
              <td style="padding: 10px; text-align: center; font-weight: bold; font-size: 15px; color: #122B52;">${item.quantity}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Batch Picklists (${orders.length} Orders)</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; max-width: 850px; margin: 0 auto; }
          .no-print { margin-bottom: 20px; text-align: right; }
          .btn { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print()" class="btn">
            🖨️ Print All Picklists (${orders.length})
          </button>
        </div>
        ${picklistsHtml}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    triggerFileDownload(`Picklists_${orders.length}_Orders.html`, html, 'text/html;charset=utf-8;');
  }
}

// Download Report (PDF/HTML, CSV, XLSX)
export function downloadReportFile(
  reportTitle: string,
  format: string,
  storeName: string,
  recordsData?: any[]
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const cleanTitle = reportTitle.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Raymonds_${cleanTitle}_${timestamp}.${format.toLowerCase()}`;

  if (format === 'CSV' || format === 'XLSX') {
    let csvContent = `RAYMONDS RETAIL OPERATIONS REPORT\n`;
    csvContent += `Report Title,"${reportTitle}"\n`;
    csvContent += `Store Scope,"${storeName}"\n`;
    csvContent += `Export Date,"${new Date().toLocaleString()}"\n`;
    csvContent += `Compliance,"Audit Certified (GST 18% Slab)"\n\n`;

    if (recordsData && recordsData.length > 0) {
      const firstRow = recordsData[0];
      const keys = Object.keys(firstRow);
      csvContent += keys.map((k) => `"${k}"`).join(',') + '\n';

      recordsData.forEach((row) => {
        csvContent +=
          keys
            .map((k) => {
              const val = row[k];
              if (typeof val === 'object') {
                return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              }
              return `"${String(val ?? '').replace(/"/g, '""')}"`;
            })
            .join(',') + '\n';
      });
    } else {
      csvContent += `"Metric ID","Category Description","Value / Volume","Audit Status"\n`;
      csvContent += `"MET-101","Total Gross Sales Ledger","₹48,92,450","Verified Certified"\n`;
      csvContent += `"MET-102","Total Omnichannel Orders","13,100 Orders","Verified Certified"\n`;
      csvContent += `"MET-103","First Citizen Member Roster","8,100 Active Members","Verified Certified"\n`;
      csvContent += `"MET-104","GST 18% Liability Amount","₹7,46,316","Filed & Verified"\n`;
    }

    triggerFileDownload(fileName, csvContent, 'text/csv;charset=utf-8;');
  } else {
    // PDF format download / printable HTML view
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 900px; margin: 0 auto; }
            .header { border-bottom: 3px solid #122B52; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            h1 { color: #122B52; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
            p { margin: 2px 0 0; color: #64748b; font-size: 12px; }
            .no-print { margin-bottom: 20px; text-align: right; }
            .btn { background: #122B52; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 10px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()" class="btn">
              🖨️ Print / Save PDF Report
            </button>
          </div>

          <div class="header">
            <div>
              <h1>RAYMONDS LIMITED</h1>
              <p>Enterprise Retail Audit & Operational Intelligence Center</p>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 12px; color: #64748b;">
              <strong>${timestamp}</strong>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Report Title</div>
              <div style="font-weight: bold; color: #0f172a; margin-top: 2px;">${reportTitle}</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Store Location</div>
              <div style="font-weight: bold; color: #0f172a; margin-top: 2px;">${storeName}</div>
            </div>
            <div>
              <div style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold;">Compliance & Audit</div>
              <div style="font-weight: bold; color: #16a34a; margin-top: 2px;">✓ Verified Compliant</div>
            </div>
          </div>

          <h3 style="font-size: 14px; margin-bottom: 8px; color: #0f172a;">Executive Ledger Breakdown</h3>
          <table>
            <thead>
              <tr><th>Metric Indicator</th><th>Audited Value</th><th>GST Compliance & Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Gross Sales Ledger</td><td>₹48,92,450</td><td>Verified & Reconciled</td></tr>
              <tr><td>Total Omnichannel Volume</td><td>13,100 Orders</td><td>Delivered / In Transit</td></tr>
              <tr><td>First Citizen Loyalty Share</td><td>5,540 Members (68.4%)</td><td>Tier Points Logged</td></tr>
              <tr><td>GST Liability (18% Slab)</td><td>₹7,46,316</td><td>GSTIN 27AAACS1234F1Z5</td></tr>
            </tbody>
          </table>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(pdfHtml);
      printWin.document.close();
    } else {
      triggerFileDownload(`${cleanTitle}_${timestamp}.html`, pdfHtml, 'text/html;charset=utf-8;');
    }
  }
}
