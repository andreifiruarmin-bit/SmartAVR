import { SavingType } from '../types';

export const getAssetAttributes = (type: SavingType) => {
  switch (type) {
    case SavingType.CASH_RESERVE:
      return { liquidity: 'Lichid', risk: 'Scăzut', horizon: 'Sub 1 an' };
    case SavingType.DEPOSIT:
      return { liquidity: 'Semi-lichid', risk: 'Scăzut', horizon: 'Sub 1 an' };
    case SavingType.BONDS:
      return { liquidity: 'Blocat', risk: 'Scăzut', horizon: '1-3 ani' };
    case SavingType.STOCKS:
    case SavingType.ETF:
      return { liquidity: 'Lichid', risk: 'Ridicat', horizon: 'Peste 3 ani' };
    case SavingType.GOLD:
      return { liquidity: 'Lichid', risk: 'Mediu', horizon: 'Peste 3 ani' };
    case SavingType.RENT:
      return { liquidity: 'Blocat', risk: 'Mediu', horizon: 'Peste 3 ani' };
    default:
      return { liquidity: 'Lichid', risk: 'Scăzut', horizon: 'Sub 1 an' };
  }
};
