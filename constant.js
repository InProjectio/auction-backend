module.exports = {
  // 1. Mã Linh kiện - LK10001
  // 2. Mã xe(cũ) - XC10001
  // 3. Mã xe(mới) - XM10001
  // 4. Mã cửa hàng (Thiết lập salon) - DV10001
  // 5. Mã cửa hàng (Thêm đơn vị) - DV10001
  // 6.Mã đơn hàng: 12 số và chữ ngẫu nhiên
  // 7.Mã kho: KHO100001
  // 8.Mã nhân viên: NV10001
  // 9.Mã khách hàng: KH10001
  OBJ_GEN_CODE_DEFAULT: {
    'ACCESSORY': { key: 'LK', value: 'LK10000' },
    'ITEM': { key: 'KHO', value: 'KHO10000' },
    'CAR_OLD': { key: 'XC', value: 'XC10000' },
    'CAR_NEW': { key: 'XM', value: 'XM10000' },
    'UNIT': { key: 'DV', value: 'DV10000' },
    'MNG': { key: 'QL', value: 'QL10000' },
    'STAFF': { key: 'NV', value: 'NV10000' },
    'CUSTOMER': { key: 'KH', value: 'KH10000' },
  }

}