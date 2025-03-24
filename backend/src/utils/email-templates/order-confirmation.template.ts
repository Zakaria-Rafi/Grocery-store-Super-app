export function generateOrderConfirmationEmailTemplate({
  customerName,
  orderDate,
  invoiceNumber,
  paymentMethod,
  items,
  totalPrice,
  coupon,
  subtotal
}: {
  customerName: string;
  orderDate: string;
  invoiceNumber: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  coupon?: boolean;
  subtotal?: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #6e8efb, #4a6cf7);
      color: white;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
    }
    .order-info {
      background-color: #f5f7ff;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .info-row {
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      color: #4a6cf7;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f5f7ff;
      color: #4a6cf7;
      text-align: left;
      padding: 10px;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .total {
      text-align: right;
      font-weight: bold;
      font-size: 18px;
      color: #4a6cf7;
      margin-top: 20px;
    }
    .footer {
      background-color: #f5f7ff;
      padding: 15px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    
    <div class="content">
      <p>Hello ${customerName},</p>
      <p>Thank you for your purchase! Your payment has been successfully processed.</p>
      
      <div class="order-info">
        <div class="info-row"><span class="info-label">Order Date:</span> ${orderDate}</div>
        <div class="info-row"><span class="info-label">Invoice Number:</span> #${invoiceNumber}</div>
        <div class="info-row"><span class="info-label">Payment Method:</span> ${paymentMethod}</div>
      </div>
      
      <h3>Order Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${Number(item.price).toFixed(2)}</td>
              <td>$${(Number(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${coupon ? `
        <div style="text-align: right; margin-top: 10px;">
          <div>Subtotal: $${subtotal.toFixed(2)}</div>
          <div>Discount: -$${(subtotal - totalPrice).toFixed(2)}</div>
        </div>
      ` : ''}
      
      <div class="total">Total: $${totalPrice}</div>
      
      <p>A copy of your invoice is attached to this email. Thank you for shopping with us!</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} T-DEV. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}