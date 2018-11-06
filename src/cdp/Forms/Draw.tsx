import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Button, Form } from "../../ui";
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
      <div />
      // <Modal open closeIcon onClose={this.props.onRequestClose}>
      //   <Header>Draw DAI</Header>
      //   <Header
      //     as="h5"
      //     style={{
      //       color: "gray",
      //       display: "inline",
      //       paddingBottom: "0"
      //     }}
      //   >
      //     DAI Available: {this.props.cdp.daiAvailable.get().toString()}
      //   </Header>
      //   {/* <Modal.Content>
      //     <Form>
      //       <Form.Input
      //         name={"amountDAI"}
      //         label={"DAI to draw"}
      //         placeholder="DAI to draw"
      //         value={this.state.amountDAI}
      //         onChange={this.handleChange}
      //       />
      //     </Form>
      //   </Modal.Content>
      //   <Modal.Actions>
      //     <Button
      //       primary
      //       loading={this.state.drawing}
      //       disabled={!valid}
      //       onClick={this.drawDAI}
      //     >
      //       Draw DAI
      //     </Button>
      //     <Button color="red" onClick={this.props.onRequestClose}>
      //       Cancel
      //     </Button>
      //   </Modal.Actions> */}
      // </Modal>
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

  handleChange = (_e: any, { value }: { value: string }) => {
    if (!isValidFloatInputNumber(value)) {
      return;
    }
    this.setState({ amountDAI: value });
  };
}

export default inject("store")(observer(Draw));