export enum PurchaseStatus {
  PLANNED = 'planned', // 未购买/计划中
  BOUGHT = 'bought',   // 已购买
}

export enum UsageStatus {
  NEW = 'new',           // 全新
  IN_USE = 'in_use',     // 使用中
  FINISHED = 'finished', // 已用完
  IDLE = 'idle',         // 闲置
  RETURNED = 'returned', // 已退货
}

export enum UnitCostType {
  PER_ITEM = 'per_item', // 单件
  PER_USE = 'per_use',   // 每次
  PER_DAY = 'per_day',   // 每天
  PER_GRAM = 'per_gram', // 每克/毫升
  TOTAL = 'total',       // 总价
}

export interface ShoppingItem {
  id: string;
  name: string;             // 商品名称
  category: string;         // 类别
  status: PurchaseStatus;   // 购买状态
  listPrice: number;        // 标价
  actualPrice: number;      // 实际价格
  discountRate: number;     // 折扣率 (0-100)
  purchaseDate: string;     // 购买日期 (ISO string YYYY-MM-DD)
  usageStatus: UsageStatus; // 使用状态
  unitCostType: UnitCostType; // 单位花费类型
  unitCost: number;         // 单位花费
  link: string;             // 购买链接
  notes: string;            // 备注
  createdAt: number;
}

export type ShoppingItemFormData = Omit<ShoppingItem, 'id' | 'createdAt'>;

export interface CategoryStat {
  name: string;
  value: number;
}