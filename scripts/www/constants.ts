import { PurchaseStatus, UsageStatus, UnitCostType } from './types';

export const CATEGORIES = [
  '数码/电器',
  '服饰/鞋包',
  '美妆/护肤',
  '食品/饮料',
  '家居/日用',
  '图书/文具',
  '运动/户外',
  '虚拟/服务',
  '其他'
];

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  [PurchaseStatus.PLANNED]: '待购买',
  [PurchaseStatus.BOUGHT]: '已购买',
};

export const USAGE_STATUS_LABELS: Record<UsageStatus, string> = {
  [UsageStatus.NEW]: '全新',
  [UsageStatus.IN_USE]: '使用中',
  [UsageStatus.FINISHED]: '已用完',
  [UsageStatus.IDLE]: '闲置',
  [UsageStatus.RETURNED]: '已退货',
};

export const UNIT_COST_TYPE_LABELS: Record<UnitCostType, string> = {
  [UnitCostType.PER_ITEM]: '每件',
  [UnitCostType.PER_USE]: '每次',
  [UnitCostType.PER_DAY]: '每天',
  [UnitCostType.PER_GRAM]: '每单位(g/ml)',
  [UnitCostType.TOTAL]: '总计',
};

export const DEFAULT_FORM_DATA = {
  name: '',
  category: '其他',
  status: PurchaseStatus.PLANNED,
  listPrice: 0,
  actualPrice: 0,
  discountRate: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  usageStatus: UsageStatus.NEW,
  unitCostType: UnitCostType.PER_ITEM,
  unitCost: 0,
  link: '',
  notes: '',
};