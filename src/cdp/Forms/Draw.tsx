import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Button, Input } from "../../ui";
import { parseInputFloat, isValidFloatInputNumber } from "../../utils/sink";
import { Store } from "../../store";
import CDP from "../../store/cdp";

interface Props {
  cdp: CDP;
  store?: Store;

  onRequestClose: () => void;
}

interface State {
  amountDAI: string;
  drawing: boolean;
}

export class Draw extends Component<Props, State> {
  state: State = {
    amountDAI: "",
    drawing: false
  };

  render() {
    let valid = false;
    const amountDAI = parseInputFloat(this.state.amountDAI);
    if (
      amountDAI &&
      this.props.cdp.daiAvailable.get() >= amountDAI &&
      amountDAI > 0 &&
      this.state.amountDAI !== ""
    ) {
      valid = true;
    }

    return (
      <div>
        Draw DAI
        <br />
        DAI Available: {this.props.cdp.daiAvailable.get().toString()}
        <Input
          label={"DAI to draw"}
          value={this.state.amountDAI}
          onChange={this.handleChange}
        />
        <Button disabled={!valid} onClick={this.drawDAI}>
          Draw DAI
        </Button>
        <Button red onClick={this.props.onRequestClose}>
          Cancel
        </Button>
      </div>
    );
  }

  drawDAI = async () => {
    this.setState({ drawing: true });
    await this.props.store!.drawDAI(
      parseInputFloat(this.state.amountDAI),
      this.props.cdp
    );
    this.props.onRequestClose();
  };

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountDAI: value });
  };
}

export default inject("store")(observer(Draw));
