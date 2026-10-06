// Demo mode: this used to call the course API (react-fast-pizza-api.jonas.io).
// It now answers from a local menu and keeps orders in localStorage, with the
// same function signatures and error messages, so the app runs without a backend.
import menu from '../data/menu.json';

const ORDERS_KEY = '14-fast-react-pizza:orders';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function createOrderId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from(
    { length: 6 },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join('');
}

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export async function getMenu() {
  await wait(400);

  return menu.map((pizza) => ({
    ...pizza,
    imageUrl: `${import.meta.env.BASE_URL}${pizza.imageUrl}`,
  }));
}

export async function getOrder(id) {
  await wait(400);

  const order = loadOrders()[id];
  if (!order) throw Error(`Couldn't find order #${id}`);

  return order;
}

export async function createOrder(newOrder) {
  try {
    await wait(600);

    const orderPrice = newOrder.cart.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const order = {
      ...newOrder,
      id: createOrderId(),
      status: 'preparing',
      orderPrice,
      priorityPrice: newOrder.priority ? Math.round(orderPrice * 0.2) : 0,
      estimatedDelivery: minutesFromNow(newOrder.priority ? 20 : 45),
    };

    saveOrders({ ...loadOrders(), [order.id]: order });
    return order;
  } catch {
    throw Error('Failed creating your order');
  }
}

export async function updateOrder(id, updateObj) {
  try {
    await wait(400);

    const orders = loadOrders();
    const order = orders[id];
    if (!order) throw Error();

    const updated = { ...order, ...updateObj };
    if (updateObj.priority && !order.priority) {
      updated.priorityPrice = Math.round(order.orderPrice * 0.2);
      updated.estimatedDelivery = minutesFromNow(20);
    }

    saveOrders({ ...orders, [id]: updated });
    // We don't need the data, so we don't return anything
  } catch (err) {
    throw Error('Failed updating your order');
  }
}
