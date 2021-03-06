import { observable, IObservableValue, computed, action } from "mobx";
import Maker, { Currency } from "@makerdao/dai";

import MkrSettings from "./mkrSettings";
import Prices from "./prices";

const { DAI, PETH } = Maker;

export interface RawCDP {
  ink: number;
  art: number;
  id: number;
  deleted: boolean;
  lad: string;
}

export default class CDP {
  id: number;
  pethLocked: IObservableValue<Currency>;
  daiDebt: IObservableValue<Currency>;

  prices: IObservableValue<Prices>;
  mkrSettings: IObservableValue<MkrSettings>;
  lad: string;

  constructor(
    id: number,
    pethLocked: number,
    daiDebt: number,
    prices: IObservableValue<Prices>,
    mkrSettings: IObservableValue<MkrSettings>,
    lad: string
  ) {
    this.id = id;
    this.pethLocked = observable.box(PETH(pethLocked));
    this.daiDebt = observable.box(DAI(daiDebt));
    this.prices = prices;
    this.mkrSettings = mkrSettings;
    this.lad = lad;
  }

  ethLocked = computed(() => {
    return this.pethLocked.get().toNumber() * this.prices.get().wethToPeth;
  });

  ethAvailable = computed(() => {
    return (
      this.ethLocked.get() / this.mkrSettings.get().liquidationRatio -
      this.daiDebt.get().toNumber() / this.prices.get().ethPrice.toNumber()
    );
  });

  daiLocked = computed(() => {
    return (
      this.pethLocked.get().toNumber() *
      this.prices.get().wethToPeth *
      this.prices.get().ethPrice.toNumber()
    );
  });

  daiAvailable = computed(() => {
    return (
      this.daiLocked.get() / this.mkrSettings.get().liquidationRatio -
      this.daiDebt.get().toNumber()
    );
  });

  collateralization = computed(() => {
    return (this.daiLocked.get() / this.daiDebt.get().toNumber()) * 100;
  });

  liquidationPrice = computed(
    () =>
      this.daiLocked.get() && this.daiDebt.get()
        ? (
            (this.daiDebt.get().toNumber() *
              this.mkrSettings.get()!.liquidationRatio) /
            this.ethLocked.get()
          ).toFixed(2)
        : null
  );

  update = action((ethLocked: number, daiDebt: number) => {
    this.pethLocked.set(PETH(ethLocked / this.prices.get().wethToPeth));
    this.daiDebt.set(DAI(daiDebt));
  });

  clone = () => {
    return new CDP(
      this.id,
      this.pethLocked.get().toNumber(),
      this.daiDebt.get().toNumber(),
      this.prices,
      this.mkrSettings,
      this.lad
    );
  };
}
