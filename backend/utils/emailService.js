// Mock Email Service for Order Confirmation
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const orderDate = new Date(order.createdAt).toLocaleString();
    let productsList = '';
    order.products.forEach((item, index) => {
      const productName = item.productId?.name || 'Product';
      productsList += `${index + 1}. ${productName} - Qty: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    const emailContent = `Dear ${user.name},

Thank you for your order! Order ID: ${order.orderId}

Order Date: ${orderDate}
Total Amount: $${order.totalAmount.toFixed(2)}

Products:
${productsList}

Shipping Address:
${order.shippingAddress.name}
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.pincode}

We'll notify you once your order ships!

Best regards,
E-Commerce Team`;
    
    console.log('\n========================================');
    console.log('ORDER CONFIRMATION EMAIL (MOCK)');
    console.log('========================================');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Order Confirmation - ${order.orderId}`);
    console.log('----------------------------------------');
    console.log(emailContent);
    console.log('========================================\n');
    
    return { success: true, message: 'Email sent (mock)', emailContent };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };

