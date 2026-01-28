#!/usr/bin/env node

/**
 * Shopee order sync (simplificado)
 * - Usa credenciais do .env
 * - Busca lista de pedidos recentes e salva em Supabase (orders, order_items, shipments)
 * - Evita duplicidade via upsert order_sn
 */

import 'dotenv/config';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL = process.env.VITE_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SHOPEE_PARTNER_ID = process.env.VITE_SHOPEE_PARTNER_ID,
  SHOPEE_PARTNER_KEY = process.env.VITE_SHOPEE_PARTNER_KEY,
  SHOPEE_SHOP_ID,
  SHOPEE_ACCESS_TOKEN,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase creds missing');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const sign = (path, body = '') => {
  const timestamp = Math.floor(Date.now() / 1000);
  const base = `${SHOPEE_PARTNER_ID}${path}${timestamp}${SHOPEE_ACCESS_TOKEN || ''}${SHOPEE_SHOP_ID || ''}`;
  const sign = crypto.createHmac('sha256', SHOPEE_PARTNER_KEY).update(base).digest('hex');
  return { timestamp, sign };
};

const shopeeRequest = async (path, payload) => {
  const { timestamp, sign } = sign(path, payload);
  const url = `https://partner.shopeemobile.com/api/v2${path}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${SHOPEE_SHOP_ID}&access_token=${SHOPEE_ACCESS_TOKEN}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  const data = await resp.json();
  if (!resp.ok || data.error) throw new Error(data.message || data.error || 'Shopee error');
  return data;
};

async function fetchOrders() {
  // last 7 days
  const time_from = Math.floor((Date.now() - 7 * 24 * 3600 * 1000) / 1000);
  const data = await shopeeRequest('/order/get_order_list', {
    time_range_field: 'create_time',
    time_from,
    time_to: Math.floor(Date.now() / 1000),
    page_size: 50
  });
  return data.response?.order_list || [];
}

async function fetchOrderDetail(order_sn_list) {
  const data = await shopeeRequest('/order/get_order_detail', {
    order_sn_list,
    response_optional_fields: ['order_status', 'buyer_user_id', 'item_list', 'pay_time', 'ship_by_date']
  });
  return data.response?.order_list || [];
}

async function upsertOrders(orderDetails) {
  for (const order of orderDetails) {
    const { order_sn, order_status, buyer_user_id, item_list, total_amount, escrow_amount, currency, ship_by_date, pay_time } = order;
    const { data: orderRow, error } = await supabase
      .from('orders')
      .upsert({
        order_sn,
        status: order_status,
        buyer_id: buyer_user_id,
        shop_id: SHOPEE_SHOP_ID,
        total_amount,
        commission_amount: escrow_amount,
        currency: currency || 'BRL',
        est_delivery_at: ship_by_date ? new Date(ship_by_date * 1000).toISOString() : null,
        created_at: pay_time ? new Date(pay_time * 1000).toISOString() : new Date().toISOString()
      }, { onConflict: 'order_sn' })
      .select()
      .single();
    if (error) {
      console.error('order upsert error', order_sn, error.message);
      continue;
    }

    if (item_list?.length) {
      const rows = item_list.map(it => ({
        order_id: orderRow.id,
        product_id: it.item_id?.toString(),
        sku: it.model_sku,
        name: it.item_name,
        quantity: it.model_quantity_purchased,
        price: it.model_original_price || it.model_discounted_price,
        currency: currency || 'BRL',
        commission_amount: it.commission_fee
      }));
      const { error: itemsErr } = await supabase.from('order_items').upsert(rows);
      if (itemsErr) console.error('items upsert error', itemsErr.message);
    }
  }
}

async function main() {
  try {
    if (!SHOPEE_PARTNER_ID || !SHOPEE_PARTNER_KEY || !SHOPEE_SHOP_ID || !SHOPEE_ACCESS_TOKEN) {
      throw new Error('Shopee credentials missing');
    }
    const orderList = await fetchOrders();
    if (!orderList.length) {
      console.log('Nenhum pedido novo.');
      return;
    }
    const detail = await fetchOrderDetail(orderList.map(o => o.order_sn));
    await upsertOrders(detail);
    console.log(`Sincronizados ${detail.length} pedidos.`);
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

