import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import * as paypal from '@paypal/checkout-server-sdk';
import { plainToClass } from 'class-transformer';
import { createTransport } from 'nodemailer';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Coupon } from '../coupons/coupon.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { generateOrderConfirmationEmailTemplate } from '../utils/email-templates/order-confirmation.template';
import { MailService } from '../utils/mail.service';
import { CartItem } from './cart-item.entity';
import { Cart } from './cart.entity';
import { CartDto } from './dto/cartdto.dto';

@Injectable()
export class CartService {
  private paypalClient: paypal.core.PayPalHttpClient;
  private stripe: Stripe;

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly invoicesService: InvoicesService,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly mailService: MailService,

    private readonly authService: AuthService,
    private readonly esService: ElasticsearchService,
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    ); // Set up the PayPal environment

    this.paypalClient = new paypal.core.PayPalHttpClient(environment); // Create a PayPal client

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    }); // Create a Stripe client
  }
  // get all cart items for a internal usage only
  async getCart(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'user',
        'items',
        'items.product',
        'coupon',
        'items.product.categories',
      ],
    });

    if (!cart) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "GET" "/cart" responded 404`,
          content: `Cart not found for user with ID ${userId}`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new NotFoundException(`Cart not found for user with ID ${userId}`);
    }

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "GET" "/cart" responded 200`,
        content: `Cart found for user with ID ${userId}`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return cart;
  }

  //get cart for user using dto so less data is returned
  async getCart_user(userId: number): Promise<CartDto> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'user',
        'items',
        'items.product',
        'items.product.categories',
        'coupon',
      ],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        items: [],
        totalPrice: 0,
        status: 'PENDING',
      });
      await this.cartRepository.save(cart);
    }

    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "GET" "/cart" responded 200`,
        content: `Cart found for user with ID ${userId}`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return plainToClass(CartDto, cart, { excludeExtraneousValues: true });
  }

  //add item to cart
  async addItemToCart(
    productId: number,
    quantity: number,
    authUser: User,
  ): Promise<CartDto> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: authUser.id } },
      relations: [
        'user',
        'items',
        'items.product',
        'items.product.categories',
        'coupon',
      ],
    });
    // Create a new cart if one doesn't exist
    if (!cart) {
      cart = this.cartRepository.create({
        user: authUser,
        items: [],
        totalPrice: 0,
        status: 'PENDING',
      });
      await this.cartRepository.save(cart);
    }

    // Check if the product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart" responded 404`,
          content: `Product not found for ID ${productId}`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new NotFoundException('Product not found');
    }
    if (product.stock < quantity) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart" responded 400`,
          content: `Product ${product.name} not found in stock`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new BadRequestException(
        `Cannot add ${quantity} of product "${product.name}" to cart. Only ${product.stock} left in stock.`,
      );
    }
    // Check if the product is already in the cart
    let cartItem = cart.items.find((item) => item.product.id === productId);
    // Update the quantity and total price if the product is already in the cart
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * product.price;
      await this.cartItemRepository.save(cartItem);
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart" responded 200`,
          content: `Product ${product.name} added to cart`,
          level: 'Information',
          timestamp: new Date(),
        },
      });
    } else {
      // Create a new cart item if the product is not in the cart
      cartItem = this.cartItemRepository.create({
        product,
        quantity,
        totalPrice: quantity * product.price,
        cart,
      });
      await this.cartItemRepository.save(cartItem);
      cart.items.push(cartItem);
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart" responded 200`,
          content: `Product ${product.name} added to cart`,
          level: 'Information',
          timestamp: new Date(),
        },
      });
    }
    // Update the cart total price
    cart.totalPrice = parseFloat(
      cart.items
        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
        .toFixed(2),
    );
    await this.cartRepository.save(cart);
    // return the updated cart
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/cart" responded 200`,
        content: `Cart updated`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return plainToClass(CartDto, cart, { excludeExtraneousValues: true });
  }

  //apply coupon
  async applyCoupon(userId: number, couponCode: string): Promise<CartDto> {
    // Get cart and coupon with relations
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'user', 'coupon'],
    });
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode },
      relations: ['users', 'products'],
    });
    // Validate coupon
    if (!coupon) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart/apply-coupon" responded 404`,
          content: `Coupon with code "${couponCode}" not found.`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new NotFoundException(
        `Coupon with code "${couponCode}" not found.`,
      );
    }
    // Check if coupon is expired or reached usage limit
    if (new Date() > new Date(coupon.expiryDate)) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart/apply-coupon" responded 400`,
          content: `Coupon with code "${couponCode}" has expired.`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new BadRequestException('This coupon has expired.');
    }
    // Check if coupon has reached usage limit
    if (coupon.usageLimit <= 0) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart/apply-coupon" responded 400`,
          content: `Coupon with code "${couponCode}" has reached its usage limit.`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new BadRequestException('This coupon has reached its usage limit.');
    }
    // Check user authorization for non-global coupons
    if (!coupon.isGlobal) {
      const canUseCoupon = coupon.users?.some((user) => user.id === userId);
      if (!canUseCoupon) {
        this.esService.index({
          index: 'logs',
          body: {
            message: `HTTP "POST" "/cart/apply-coupon" responded 400`,
            content: `Coupon with code "${couponCode}" is not authorized for user with ID ${userId}.`,
            level: 'Error',
            timestamp: new Date(),
          },
        });
        throw new BadRequestException(
          'You are not authorized to use this coupon',
        );
      }
    }
    if (cart.coupon) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart/apply-coupon" responded 400`,
          content: `A coupon is already applied to this cart`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new BadRequestException('A coupon is already applied to this cart');
    }
    // Apply discount to eligible items
    for (const item of cart.items) {
      const isEligible =
        coupon.isGlobal ||
        coupon.products.some((p) => p.id === item.product.id);
      // Apply discount only if the product is eligible
      if (isEligible) {
        item.priceBeforeDiscount = item.totalPrice;
        item.couponDiscountPer = Number(coupon.discountValue);

        let discountAmount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount =
            (item.totalPrice * parseFloat(coupon.discountValue.toString())) /
            100;
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = Math.min(
            Number(coupon.discountValue),
            item.totalPrice,
          );
        }
        item.discountAmount = discountAmount;
        item.appliedCouponCode = coupon.code;
        item.totalPrice = Math.max(
          0,
          parseFloat((item.totalPrice - discountAmount).toFixed(2)),
        );
      }
    }

    // Update cart total price
    cart.totalPrice = parseFloat(
      cart.items
        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
        .toFixed(2),
    );
    cart.coupon = coupon;

    await this.couponRepository.save(coupon);

    // Save cart with updated items
    const savedCart = await this.cartRepository.save(cart);
    this.esService.index({
      index: 'logs',
      body: {
        message: `HTTP "POST" "/cart/apply-coupon" responded 200`,
        content: `Cart updated`,
        level: 'Information',
        timestamp: new Date(),
      },
    });
    return plainToClass(CartDto, savedCart, { excludeExtraneousValues: true });
  }

  async removeCoupon(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'user', 'coupon'],
    });
    // Check if cart exists
    if (!cart) {
      this.esService.index({
        index: 'logs',
        body: {
          message: `HTTP "POST" "/cart/remove-coupon" responded 404`,
          content: `Cart not found for user with ID ${userId}`,
          level: 'Error',
          timestamp: new Date(),
        },
      });
      throw new NotFoundException('Cart not found');
    }
    // Check if a coupon is applied
    if (!cart.coupon) {
      throw new BadRequestException('No coupon applied to remove');
    }

    // Reset items that had coupon applied
    for (const item of cart.items) {
      if (item.appliedCouponCode) {
        item.totalPrice = item.priceBeforeDiscount;
        item.discountAmount = null;
        item.appliedCouponCode = null;
        item.priceBeforeDiscount = null;
        item.couponDiscountPer = null;
      }
    }
    // Recalculate cart total
    cart.totalPrice = parseFloat(
      cart.items
        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
        .toFixed(2),
    );

    // Remove coupon reference
    cart.coupon = null;

    return this.cartRepository.save(cart);
  }
  //calculate discount
  private calculateDiscount(cart: Cart, coupon: Coupon): number {
    if (coupon.discountType === 'PERCENTAGE') {
      return (
        (cart.items.reduce((sum, item) => sum + item.totalPrice, 0) *
          coupon.discountValue) /
        100
      );
    } else if (coupon.discountType === 'FIXED') {
      return coupon.discountValue;
    }
    return 0;
  }
  //update item quantity
  async updateItemQuantity(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    // Récupérer le panier avec toutes les relations nécessaires, y compris le coupon
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'coupon'],
    });

    if (!cart) {
      throw new NotFoundException('Panier non trouvé');
    }

    // Trouver l'article à mettre à jour
    const cartItem = cart.items.find((item) => item.product.id === productId);

    if (!cartItem) {
      throw new NotFoundException('Article non trouvé dans le panier');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    // Vérifier que la quantité demandée ne dépasse pas le stock disponible
    if (quantity > product.stock) {
      throw new BadRequestException(
        `La quantité demandée (${quantity}) dépasse le stock disponible (${product.stock})`,
      );
    }

    // Sauvegarder le prix avant remise si un coupon est appliqué
    const hasCoupon = !!cart.coupon;

    // Mettre à jour la quantité et le prix total
    cartItem.quantity = quantity;

    // Si un coupon était appliqué, on conserve le prix original avant application du coupon
    if (hasCoupon) {
      cartItem.priceBeforeDiscount = product.price * quantity;
    } else {
      cartItem.totalPrice = product.price * quantity;
    }

    await this.cartItemRepository.save(cartItem);

    // Si un coupon est appliqué, on le réapplique correctement
    if (hasCoupon) {
      // Réappliquer le coupon pour recalculer correctement les remises
      await this.removeCoupon(userId); // D'abord retirer le coupon
      await this.applyCoupon(userId, cart.coupon.code); // Puis le réappliquer
      return this.getCart(userId); // Retourner le panier mis à jour
    } else {
      // Recalculer simplement le total du panier
      cart.totalPrice = parseFloat(
        cart.items
          .reduce((total, item) => total + Number(item.totalPrice), 0)
          .toFixed(2),
      );

      return this.cartRepository.save(cart);
    }
  }

  async removeItemFromCart(userId: number, productId: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find((item) => {
      return String(item.product?.id) === String(productId);
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in the cart`,
      );
    }
    // Remove the cart item
    await this.cartItemRepository.remove(cartItem);
    // Update the cart total price
    cart.items = cart.items.filter((item) => item.id !== cartItem.id);

    cart.totalPrice = parseFloat(
      cart.items
        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
        .toFixed(2),
    );

    return this.cartRepository.save(cart);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCart(userId);

    await Promise.all(
      cart.items.map(async (item) => {
        await this.cartItemRepository.remove(item);
      }),
    );
    // Clear the cart items and update the total price
    cart.items = [];
    cart.totalPrice = 0;
    cart.coupon = null;

    await this.cartRepository.save(cart);
  }

  //checkout cart
  async checkout(
    userId: number, // user id
    paymentMethod: 'paypal' | 'stripe' | 'cash', // avaliable payment methods
    cashPaid?: number, // cash paid by user
  ): Promise<any> {
    const cart = await this.getCart(userId);
    // Check if the cart is empty
    if (!cart.items.length) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    // Validate stock for each item in the cart
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`,
        );
      }
    }
    // Calculate the total price of all items in the cart
    const itemTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.product.price);
      if (isNaN(price)) {
        throw new BadRequestException(
          `Invalid price for product: ${item.product.name}`,
        );
      }
      return sum + price * item.quantity;
    }, 0);

    // Calculer la réduction et s'assurer que c'est un nombre
    const rawDiscount = cart.coupon
      ? this.calculateDiscount(cart, cart.coupon)
      : 0;
    const discount = parseFloat(rawDiscount.toString()) || 0;

    // Calculer le prix total
    const totalPrice = Math.max(
      0,
      parseFloat((itemTotal - discount).toFixed(2)),
    );

    if (paymentMethod === 'paypal') {
      const purchaseUnits = [
        {
          amount: {
            currency_code: 'EUR',
            value: totalPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: itemTotal.toFixed(2),
              },
              discount: {
                currency_code: 'EUR',
                value: discount.toFixed(2),
              },
              tax_total: {
                currency_code: 'EUR',
                value: '0.00',
              },
              shipping: {
                currency_code: 'EUR',
                value: '0.00',
              },
            },
          },
          items: cart.items.map((item) => ({
            name: item.product.name,
            description: item.product.description || 'No description available',
            unit_amount: {
              currency_code: 'EUR',
              value: Number(item.product.price).toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
          description: `Invoice for cart ${cart.id}`,
          custom_id: JSON.stringify({ userId, cartId: cart.id }),
        },
      ];

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits,
        application_context: {
          return_url: process.env.PAYPAL_RETURN_URL,
          cancel_url: process.env.PAYPAL_CANCEL_URL,
        },
      });

      const order = await this.paypalClient.execute(request);
      const approvalUrl = order.result.links.find(
        (link) => link.rel === 'approve',
      )?.href;
      if (!approvalUrl) {
        throw new BadRequestException('Unable to generate PayPal approval URL');
      }
      return { approvalUrl };
    } else if (paymentMethod === 'stripe') {
      const lineItems = cart.items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product.name,
            description: item.product.description || 'No description available',
            images: item.product.imagesUrl ? item.product.imagesUrl : [],
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        metadata: {
          userId: userId.toString(),
          cartId: cart.id.toString(),
        },
        success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
      });

      if (!session.url) {
        throw new BadRequestException('Unable to generate Stripe checkout URL');
      }

      return { checkoutUrl: session.url };
    } else if (paymentMethod === 'cash') {
      if (cashPaid === undefined || cashPaid === null) {
        throw new BadRequestException(
          'Cash amount must be provided for cash payment.',
        );
      }

      if (cashPaid < totalPrice) {
        const additionalNeeded = parseFloat((totalPrice - cashPaid).toFixed(2));
        throw new BadRequestException(
          `Insufficient cash provided. Additional $${additionalNeeded} is required.`,
        );
      }

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${item.product.name}`,
          );
        }
        item.product.stock -= item.quantity;
        await this.productRepository.save(item.product);
      }
      if (cart && cart.coupon) {
        cart.coupon.usageLimit -= 1;
        await this.couponRepository.save(cart.coupon);
      }

      const products = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const invoice = await this.invoicesService.createInvoice(
        userId,
        products,
        'PAID',
        cart.totalPrice,
        cart.coupon,
        'cash',
      );

      await this.cartItemRepository.delete({ cart: { id: cart.id } });
      cart.items = [];
      cart.totalPrice = 0;
      cart.coupon = null;
      await this.cartRepository.save(cart);

      const change = parseFloat((cashPaid - totalPrice).toFixed(2));

      return {
        invoice,
        message: 'Cash payment processed successfully.',
        change,
      };
    } else {
      throw new BadRequestException(
        'Invalid payment method. Choose either "paypal" or "stripe".',
      );
    }
  }

  async capturePaypalPayment(orderId: string): Promise<any> {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId); // Fetch order details
      const orderDetails = await this.paypalClient.execute(request);

      if (orderDetails.result.status !== 'APPROVED') {
        console.warn(
          `Order not approved. Status: ${orderDetails.result.status}`,
        );
        return {
          message: `Order is not approved. Status: ${orderDetails.result.status}`,
        };
      }

      const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
      captureRequest.requestBody({});
      const capture = await this.paypalClient.execute(captureRequest);

      if (capture.result.status !== 'COMPLETED') {
        throw new BadRequestException(
          `Payment not completed. Status: ${capture.result.status}`,
        );
      }

      const captures = capture.result.purchase_units?.[0]?.payments?.captures;
      if (!captures || captures.length === 0) {
        throw new BadRequestException('No captures found in PayPal response.');
      }

      const captureId = captures[0]?.id;
      if (!captureId) {
        throw new BadRequestException(
          'Capture ID not found in PayPal response.',
        );
      }

      const customId = captures[0]?.custom_id;
      if (!customId) {
        throw new BadRequestException(
          'Custom ID not found in PayPal capture response.',
        );
      }

      const { userId, cartId } = JSON.parse(customId);

      if (!userId || !cartId) {
        throw new BadRequestException('Invalid custom ID in payment data.');
      }

      const cart = await this.getCart(userId);
      if (!cart || cart.id !== cartId) {
        throw new NotFoundException('Cart not found or mismatched cart ID.');
      }

      if (!cart.items.length) {
        throw new BadRequestException('Cannot process an empty cart.');
      }

      if (cart && cart.coupon) {
        cart.coupon.usageLimit -= 1;
        await this.couponRepository.save(cart.coupon);
      }

      for (const item of cart.items) {
        const product = item.product;
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}`,
          );
        }
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }

      const products = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const invoice = await this.invoicesService.createInvoice(
        userId,
        products,
        'PAID',
        cart.totalPrice,
        cart.coupon,
        'PAYPAL',
        captureId,
      );
      // Generate PDF invoice
      const pdfBuffer = await this.invoicesService.generateInvoicePDF(
        invoice.id,
      );

      // Retrieve user to get email
      const user = await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Format order date
      const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Create HTML content for email

      const htmlContent = generateOrderConfirmationEmailTemplate({
        customerName: user.firstName || user.email.split('@')[0],
        orderDate: orderDate,
        invoiceNumber: invoice.id,
        paymentMethod: 'PayPal',
        items: cart.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
        totalPrice: cart.totalPrice,
        coupon: !!cart.coupon,
        subtotal: cart.items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0,
        ),
      });
      // Send email with PDF attachment and HTML content
      await this.sendOrderConfirmationEmail(
        user.email,
        'Stripe Order Confirmation',
        `Thank you for your purchase! Your card payment of $${cart.totalPrice} has been successfully processed.`,
        pdfBuffer.buffer,
        htmlContent,
      );

      await this.cartItemRepository.delete({ cart: { id: cart.id } });
      cart.items = [];
      cart.totalPrice = 0;
      cart.coupon = null;
      await this.cartRepository.save(cart);

      return {
        invoice,
        message: 'Payment captured and invoice created successfully.',
      };
    } catch (error) {
      console.error('Error in capturePayment:', error);

      if (
        error?.statusCode === 422 &&
        error.details?.[0]?.issue === 'ORDER_NOT_APPROVED'
      ) {
        return {
          message:
            'Payment capture skipped because the order was not approved.',
        };
      }

      throw new InternalServerErrorException('Failed to capture payment.');
    }
  }

  async captureStripePayment(sessionId: string): Promise<any> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== 'paid') {
        throw new BadRequestException('Payment not completed.');
      }

      const userId = session.metadata?.userId;
      const cartId = session.metadata?.cartId;
      if (!userId || !cartId) {
        throw new BadRequestException('Missing metadata in Stripe session.');
      }

      const cart = await this.getCart(Number(userId));
      if (!cart || cart.id !== Number(cartId)) {
        throw new NotFoundException('Cart not found or mismatched cart ID.');
      }

      if (!cart.items.length) {
        throw new BadRequestException('Cannot process an empty cart.');
      }

      for (const item of cart.items) {
        const product = item.product;
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}`,
          );
        }
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }

      if (cart && cart.coupon) {
        cart.coupon.usageLimit -= 1;
        await this.couponRepository.save(cart.coupon);
      }

      const products = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const invoice = await this.invoicesService.createInvoice(
        Number(userId),
        products,
        'PAID',
        cart.totalPrice,
        cart.coupon,
        'STRIPE',
        session.payment_intent as string,
      );
      // In the captureStripePayment method, before calling sendOrderConfirmationEmail:

      // Generate PDF invoice
      const pdfBuffer = await this.invoicesService.generateInvoicePDF(
        invoice.id,
      );

      // Retrieve user to get email
      const user = await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Format order date
      const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Create HTML content for email
      const htmlContent = generateOrderConfirmationEmailTemplate({
        customerName: user.firstName || user.email.split('@')[0],
        orderDate: orderDate,
        invoiceNumber: invoice.id,
        paymentMethod: 'Stripe',
        items: cart.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
        totalPrice: cart.totalPrice,
        coupon: !!cart.coupon,
        subtotal: cart.items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0,
        ),
      });
      // Send email with PDF attachment and HTML content
      await this.sendOrderConfirmationEmail(
        user.email,
        'Stripe Order Confirmation',
        `Thank you for your purchase! Your card payment of $${cart.totalPrice} has been successfully processed.`,
        pdfBuffer.buffer,
        htmlContent,
      );
      await this.cartItemRepository.delete({ cart: { id: cart.id } });
      cart.items = [];
      cart.totalPrice = 0;
      cart.coupon = null;
      await this.cartRepository.save(cart);

      return {
        invoice,
        message: 'Stripe payment captured and invoice created successfully.',
      };
    } catch (error) {
      console.error('Error capturing Stripe payment:', error);

      if (error.raw && error.raw.message) {
        throw new BadRequestException(
          `Error capturing Stripe payment: ${error.raw.message}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to capture Stripe payment.',
      );
    }
  }

  private async sendOrderConfirmationEmail(
    email: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
    html?: string, // Add optional html parameter
  ): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      // Use Nodemailer with Mailhog for development
      const transporter = createTransport({
        host: 'mailhog',
        port: 1025,
      });

      await transporter.sendMail({
        from: 'orders@example.com',
        to: email,
        subject: subject,
        text: text,
        html: html, // Use the html parameter if provided
        attachments: [
          {
            filename: 'invoice.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } else {
      // Use mail service for production
      await this.mailService.sendOrderConfirmationEmail(
        email,
        subject,
        text,
        pdfBuffer,
        html, // Pass the html parameter to the mail service
      );
    }
  }

  async getCartById(cartId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product', 'user'],
    });
    return cart;
  }

  async verifyCartId(cartId: number, jwt: string): Promise<boolean> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['user'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartUser = await this.userRepository.findOne({
      where: { id: cart.user.id },
    });

    if (!cartUser) {
      throw new NotFoundException(
        'The cart is not associated with any existing user',
      );
    }

    const userJWT = await this.authService.decodeJWT(jwt);
    if (userJWT === null) {
      throw new NotFoundException('The JWT is not valid');
    }
    if (userJWT.sub !== cartUser.id) {
      throw new NotFoundException(
        'The cart is not associated with the user given in the JWT',
      );
    }

    return true;
  }
}
