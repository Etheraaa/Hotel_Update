export const roomBucketOrder = ["尊贵豪华房", "小型套房", "更高套房", "特色房型"] as const;

export const tierOrderByGroup: Record<string, string[]> = {
  万豪: ["万豪金卡", "万豪白金卡", "万豪钛金卡", "万豪大使"],
  希尔顿: ["希尔顿金卡", "希尔顿钻卡", "希尔顿耀钻"],
  凯悦: ["凯悦探索者", "凯悦冒险家", "凯悦环球客"]
};

export const preferredTierOrder = [
  "无会员",
  ...tierOrderByGroup.万豪,
  ...tierOrderByGroup.希尔顿,
  ...tierOrderByGroup.凯悦
];

export function sortByPreferredOrder(values: string[], order: readonly string[]) {
  const indexMap = new Map(order.map((value, index) => [value, index]));

  return [...values].sort((left, right) => {
    const leftIndex = indexMap.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = indexMap.get(right) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right, "zh-Hans-CN");
  });
}
