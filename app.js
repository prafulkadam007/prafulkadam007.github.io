function convertNumberToWords(amount) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (amount === 0) return "Zero";

    function convertToWords(num) {
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
        if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convertToWords(num % 100) : "");
        if (num < 100000) return convertToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convertToWords(num % 1000) : "");
        if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convertToWords(num % 100000) : "");
        return convertToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convertToWords(num % 10000000) : "");
    }

    return "INR " + convertToWords(Math.floor(amount)) + " Only.";
}

document.getElementById('receiptForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Wait for logo to load before generating PDF
    const logoImg = document.getElementById('orgLogo');
    await new Promise((resolve) => {
        if (logoImg.complete) {
            resolve();
        } else {
            logoImg.onload = resolve;
        }
    });

    const formData = {
        receiptNo: document.getElementById('receiptNo').value,
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        idType: document.getElementById('idType').value,
        idNumber: document.getElementById('idNumber').value,
        amount: document.getElementById('amount').value,
        towards: 'Donation',
        paymentMode: document.getElementById('paymentMode').value,
        transactionDetails: document.getElementById('paymentMode').value === 'Online' 
            ? document.getElementById('transactionDetails').value 
            : '',
        remarks: document.getElementById('remarks').value,
        date: new Date(document.getElementById('date').value).toLocaleDateString('en-IN')
    };

    // Populate receipt div
    document.getElementById('displayReceiptNo').textContent = formData.receiptNo;
    document.getElementById('displayDate').textContent = formData.date;
    document.getElementById('displayName').textContent = formData.name;
    document.getElementById('displayAddress').textContent = formData.address;
    document.getElementById('displayIdType').textContent = formData.idType;
    document.getElementById('displayIdNumber').textContent = formData.idNumber;
    document.getElementById('displayAmount').textContent = formData.amount;
    document.getElementById('displayAmountWords').textContent = convertNumberToWords(parseFloat(formData.amount));
    document.getElementById('displayTowards').textContent = formData.towards;
    document.getElementById('displayPaymentMode').textContent = formData.paymentMode;
    document.getElementById('displayTransactionDetails').textContent = formData.transactionDetails;
    document.getElementById('displayRemarks').textContent = formData.remarks;
    
    document.getElementById('receipt').style.display = 'block';

    // Generate PDF with optimized settings
    const receipt = document.getElementById('receipt');
    const { jsPDF } = window.jspdf;

    html2canvas(receipt, {
        useCORS: true,
        scale: 1.5,         // Reduced from 2 to 1.5
        logging: false,
        imageTimeout: 0,
        windowWidth: 800,
        windowHeight: 1123,
        backgroundColor: '#ffffff',
        removeContainer: true,
        letterRendering: true,
        allowTaint: false,
        quality: 0.95,      // Slightly reduced quality
        compress: true      // Enable compression
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.8); // Changed to JPEG with 0.8 quality
        const pdf = new jsPDF({
            format: 'a4',
            unit: 'mm',
            compress: true
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate dimensions to fit page while maintaining aspect ratio
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If image height is greater than page height, scale down
        if (imgHeight > pageHeight - 20) {
            const scale = (pageHeight - 20) / imgHeight;
            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth * scale, pageHeight - 20, undefined, 'FAST');
        } else {
            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
        }
        
        // Save PDF with compression
        const pdfBlob = pdf.output('blob', {
            compress: true
        });
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

        // Automatically download the PDF
        pdf.save('Payment_Receipt.pdf');
    });
});

document.getElementById('paymentMode').addEventListener('change', function() {
    const transactionDetailsGroup = document.getElementById('transactionDetailsGroup');
    if (this.value === 'Online') {
        transactionDetailsGroup.style.display = 'block';
        document.getElementById('transactionDetails').required = true;
    } else {
        transactionDetailsGroup.style.display = 'none';
        document.getElementById('transactionDetails').required = false;
        document.getElementById('transactionDetails').value = '';
    }
});
