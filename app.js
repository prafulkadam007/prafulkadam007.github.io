document.getElementById('receiptForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value;

  // Populate receipt div
  document.getElementById('customerName').textContent = `Customer Name: ${name}`;
  document.getElementById('paymentAmount').textContent = `Amount Paid: $${amount}`;
  document.getElementById('paymentDate').textContent = `Payment Date: ${date}`;
  document.getElementById('receipt').style.display = 'block';

  // Generate PDF from the receipt div using html2canvas and jsPDF
  const receipt = document.getElementById('receipt');
  const { jsPDF } = window.jspdf;

  html2canvas(receipt).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190; // Fit image within the page margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // Save PDF
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], 'Payment_Receipt.pdf', { type: 'application/pdf' });

    // Show Share button
    const shareBtn = document.getElementById('sharePdf');
    shareBtn.style.display = 'block';

    shareBtn.addEventListener('click', async () => {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Payment Receipt',
            text: 'Here is your payment receipt.',
            files: [file]
          });
        } catch (err) {
          console.error('Error sharing the PDF:', err);
        }
      } else {
        alert('Sharing not supported on this device.');
      }
    });

    // Automatically download the PDF after generating
    pdf.save('Payment_Receipt.pdf');
  });
});
