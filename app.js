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

    // Wait for logo to load
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

    // Generate PDF
    const receipt = document.getElementById('receipt');
    const { jsPDF } = window.jspdf;

    try {
        const canvas = await html2canvas(receipt, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 595, // A4 width in pixels at 72 DPI
            height: 842, // A4 height in pixels at 72 DPI
            windowWidth: 595,
            windowHeight: 842
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Use entire A4 page with small margins
        const margin = 10;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(
            imgData, 
            'JPEG', 
            margin, // x
            margin, // y
            pdfWidth - (margin * 2), // width
            pdfHeight - (margin * 2), // height
            undefined, 
            'FAST'
        );

        pdf.save('Payment_Receipt.pdf');

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Failed to generate PDF. Please try again.');
    }
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
