export function calculateSaleTotals(input: {
  totalPrice: number;
  extraFees?: number;
  discount?: number;
  paidAmount?: number;
  projectCost?: number;
}) {
  const totalPrice = input.totalPrice || 0;
  const extraFees = input.extraFees || 0;
  const discount = input.discount || 0;
  const paidAmount = input.paidAmount || 0;
  const projectCost = input.projectCost || 0;
  const finalTotal = totalPrice + extraFees - discount;

  return {
    finalTotal,
    remainingAmount: finalTotal - paidAmount,
    netProfit: finalTotal - projectCost
  };
}
